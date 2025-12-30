'use server'

import drive from "@/lib/googleDrive";
import {revalidatePath} from "next/cache";
import {auth} from "@/auth";
import prisma from "@/lib/prisma";
import {CreateFolderState, Folder} from "@/lib/definitions";
import {Readable} from "stream";
import cloudinary from "@/lib/cloudinary";
import {UploadApiResponse} from "cloudinary";

export async function getFolder(id?: number): Promise<Folder | null> {
  const includeOptions = {
    subfolders: true,
    parent: true,
    author: true,
    files: {
      include: {
        author: true,
        parent: true
      }
    }
  }
  const folder = id ? await prisma.folder.findUnique({
    where: {id},
    include: includeOptions
  }) : await prisma.folder.findUnique({
    where: {
      driveId: process.env.DRIVE_FOLDER_ID
    },
    include: includeOptions
  })
  if (!folder) return null
  const getCloudinaryUrl = (mimeType: string, publicId: string) => `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${mimeType.split('/')[0]}/upload/f_auto,q_auto/${publicId}`
  folder.files = folder.files.map(file => ({
    ...file,
    cloudinaryUrl: getCloudinaryUrl(file.mimeType, file.cloudinaryPublicId),
    ...(file.mimeType.startsWith('video/') && {
      posterUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto,so_0/${file.cloudinaryPublicId}.jpg`
    })
  }))
  return folder as unknown as Folder
}

export async function getFolderPath(folderId?: number) {
  const path = []
  let current
  if (!folderId) {
    current = await prisma.folder.findUnique({
      where: {
        driveId: process.env.DRIVE_FOLDER_ID
      }
    })
    return current ? [{name: current.name, href: '/'}] : []
  } else {
    current = await prisma.folder.findUnique({where: {id: folderId}})
    if (!current) return []
    path.unshift({name: current.name, href: `/folders/${current.id}`})
  }
  while (current?.parentId) {
    current = await prisma.folder.findUnique({where: {id: current.parentId}})
    if (current) {
      if (current.driveId === process.env.DRIVE_FOLDER_ID) path.unshift({name: current.name, href: '/'})
      else path.unshift({name: current.name, href: `/folders/${current.id}`})
    }
  }
  return path
}

async function uploadToCloudinary(file: File, buffer: Buffer) {
  console.log(`Uploading ${file.name} to Cloudinary...`)
  const isVideo = file.type.startsWith('video/')
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'gia-dinh-minh',
        transformation: [{
          quality: 'auto',
          fetch_format: 'auto',
          ...(isVideo && {
            eager: [{
              width: 1280,
              height: 720,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto" }],
            eager_async: true,
          })
        }]
      },
      (error, result) => {
        if (error) {
          console.error(`Failed to upload ${file.name} to Cloudinary:`, error)
          reject(error)
        }
        else if (result) {
          console.log(`Finished uploading ${file.name} to Cloudinary`)
          resolve(result)
        }
        else reject(new Error('Cloudinary upload failed'))
      }
    )
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)
    stream.pipe(uploadStream)
  })
}

async function uploadToDrive(file: File, buffer: Buffer, driveParentId: string | undefined) {
  console.log(`Uploading ${file.name} to Google Drive...`)
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)

  const result = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: driveParentId ? [driveParentId] : [],
    },
    media: {
      mimeType: file.type,
      body: stream,
    },
    fields: 'id, name',
    supportsAllDrives: true,
  })
  console.log(`Finished uploading ${file.name} to Google Drive`)
  return result
}

export async function uploadFile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Chưa đăng nhập' }

  const file = formData.get('file') as File
  const parentIdStr = formData.get('parentId') as string
  let driveParentId = process.env.DRIVE_FOLDER_ID
  let dbParentId: number | null = null

  if (parentIdStr) {
    dbParentId = parseInt(parentIdStr)
    const parentFolder = await prisma.folder.findUnique({ where: { id: dbParentId } })
    if (parentFolder) {
      driveParentId = parentFolder.driveId
    }
  } else {
    const mainFolder = await prisma.folder.findUnique({
      where: {
        driveId: process.env.DRIVE_FOLDER_ID
      }
    })
    if (!mainFolder) {
      console.error('Main folder not found.')
      return {
        success: false,
        error: 'Chưa có thư mục chính, liên hệ Minh Chí ngay'
      }
    }
    dbParentId = mainFolder.id
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const results = await Promise.allSettled([
      uploadToCloudinary(file, buffer),
      uploadToDrive(file, buffer, driveParentId)
    ])

    const cloudinaryResult = results[0]
    const driveResult = results[1]

    if (cloudinaryResult.status === 'fulfilled' && driveResult.status === 'fulfilled') {
      const cRes = cloudinaryResult.value
      const dRes = driveResult.value

      if (!dRes.data.id) {
        console.log('Removing file from Cloudinary...')
        await deleteByCloudinaryPublicId(cRes.public_id)
        console.error('Drive upload failed to return ID')
        return { success: false, error: 'Drive upload failed' }
      }
      await prisma.file.create({
        data: {
          filename: file.name,
          extension: file.name.split('.').pop() || '',
          mimeType: file.type,
          driveId: dRes.data.id,
          cloudinaryPublicId: cRes.public_id,
          authorId: parseInt(session.user.id),
          parentId: dbParentId
        }
      })

      revalidatePath('/')
      if (dbParentId) revalidatePath(`/folders/${dbParentId}`)
      return { success: true }
    } else {
      if (cloudinaryResult.status === 'fulfilled') {
        console.log('Removing file from Cloudinary...')
        await deleteByCloudinaryPublicId(cloudinaryResult.value.public_id)
      }
      if (driveResult.status === 'fulfilled' && driveResult.value.data.id) {
        console.log('Removing file from Google Drive...')
        await deleteByDriveId(driveResult.value.data.id)
      }
      const errors = results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason)
      console.error('One or both uploads failed', errors)
      return { success: false, error: 'Upload failed' }
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteFile(id: number) {
  const file = await prisma.file.findUnique({where: {id}})
  if (!file) {
    console.error(`File ${id} not found`)
    return
  }
  const parentId = file.parentId
  await Promise.all([
      drive.files.delete({fileId: file.driveId}),
      cloudinary.uploader.destroy(file.cloudinaryPublicId, {
        resource_type: file.mimeType.startsWith('video/') ? 'video' : 'image'
      }),
      prisma.file.delete({where: {id}})
  ])
  revalidatePath('/')
  revalidatePath(`/folders/${parentId}`)
}

async function getAllFilesInFolder(id: number) {
  const folder = await prisma.folder.findUnique({
    where: {id},
    include: {files: true, subfolders: true}
  })
  if (!folder) return []
  let files = [...folder.files]
  const subfolderFiles = await Promise.all(folder.subfolders.map(sub => getAllFilesInFolder(sub.id)))
  for (const sf of subfolderFiles) {
    files = files.concat(sf)
  }
  return files
}

export async function getFilesForDownload(fileIds: number[], folderIds: number[]) {
  const files = await prisma.file.findMany({
    where: { id: { in: fileIds } },
    select: { driveId: true, filename: true }
  })

  const folderFilesResults = await Promise.all(folderIds.map(id => getAllFilesInFolder(id)))
  const folderFiles = folderFilesResults.flat().map(f => ({ driveId: f.driveId, filename: f.filename }))

  return [...files, ...folderFiles]
}

export async function deleteFolder(id: number) {
  try {
    const folder = await prisma.folder.findUnique({
      where: {id},
      include: {files: true, subfolders: true}
    })
    if (!folder) {
      console.error(`Folder ${id} not found`)
      return
    }
    const files = await getAllFilesInFolder(id)
    const imagePublicIds = files.filter(file => file.mimeType.startsWith('image/')).map(file => file.cloudinaryPublicId)
    const videoPublicIds = files.filter(file => file.mimeType.startsWith('video/')).map(file => file.cloudinaryPublicId)
    await Promise.all([
      imagePublicIds.length > 0
          ? cloudinary.api.delete_resources(imagePublicIds, { resource_type: 'image' })
          : null,
      videoPublicIds.length > 0
          ? cloudinary.api.delete_resources(videoPublicIds, { resource_type: 'video' })
          : null,
    ].filter(Boolean))
    const parentId = folder.parentId
    await Promise.all([
      prisma.folder.delete({where: {id}}),
      drive.files.delete({
        fileId: folder.driveId
      })
    ])
    revalidatePath('/')
    if (parentId) revalidatePath(`/folders/${parentId}`)
  } catch (e) {
    console.error(e)
  }
}

export async function createFolder(dbParentId: number | undefined, prevState: CreateFolderState, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Chưa đăng nhập' }
  // Find parent ID
  let parentId = dbParentId
  let driveParentId
  // if parentId is not specified, use main folder as parent
  if (!parentId) {
    const mainFolder = await prisma.folder.findUnique({
      where: {
        driveId: process.env.DRIVE_FOLDER_ID
      }
    })
    if (!mainFolder) {
      console.error('Main folder not found.')
      return {
        success: false,
        error: 'Chưa có thư mục chính, liên hệ Minh Chí ngay'
      }
    }
    parentId = mainFolder.id
    driveParentId = mainFolder.driveId
  } else {
    const parentFolder = await prisma.folder.findUnique({
      where: {id: parentId}
    })
    if (parentFolder) driveParentId = parentFolder.driveId
  }

  // Find folder name
  const baseFolderName = formData.get('folder-name') as string || 'Thư mục chưa đặt tên'
  let folderName = baseFolderName
  let counter = 1
  let existingFolder = await prisma.folder.findFirst({
    where: {
      parentId: parentId,
      name: baseFolderName
    }
  })
  while (existingFolder) {
    folderName = `${baseFolderName} ${counter++}`
    existingFolder = await prisma.folder.findFirst({
      where: {
        parentId: parentId,
        name: folderName
      }
    })
  }

  try {
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: driveParentId ? [driveParentId] : [],
      },
      fields: 'id, name',
      supportsAllDrives: true,
    })
    const folder = response.data
    if (folder && folder.id) {
      await prisma.folder.create({
        data: {
          name: folderName,
          driveId: folder.id,
          authorId: Number.parseInt(session?.user.id),
          parentId: parentId
        }
      })
    }
    const path = dbParentId ? `/folders/${parentId}` : '/'
    revalidatePath(path)
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: `Lỗi tạo thư mục, lưu lại lỗi sau và liên hệ Minh Chí ngay: ${error}. `
    }
  }
}

export async function deleteByCloudinaryPublicId(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return { success: false, error }
  }
}

export async function deleteByDriveId(driveId: string) {
  try {
    await drive.files.delete({ fileId: driveId })
    return { success: true }
  } catch (error) {
    console.error('Error deleting from Drive:', error)
    return { success: false, error }
  }
}

export async function deleteItems(fileIds: number[], folderIds: number[]) {
  try {
    await Promise.all([
      ...fileIds.map(id => deleteFile(id)),
      ...folderIds.map(id => deleteFolder(id))
    ])
    return { success: true }
  } catch (error) {
    console.error('Error deleting items:', error)
    return { success: false, error: 'Failed to delete items' }
  }
}
