'use server'

import {revalidatePath} from "next/cache"
import {auth} from "@/auth"
import prisma from "@/lib/prisma"
import {CreateFolderState, Folder} from "@/lib/definitions"
import {
  createLocalFolder,
  deleteLocalFile,
  deleteLocalFolder,
  ensureUploadsDir,
  saveFile
} from "@/lib/localFileHandler"
export async function getFolder(id?: number): Promise<Folder | null> {
  await ensureUploadsDir()
  const includeOptions = {
    subfolders: {
      include: {
        loves: true
      }
    },
    parent: true,
    author: true,
    files: {
      include: {
        author: true,
        parent: true,
        loves: true,
        comments: {
          include: {
            author: true
          },
          orderBy: {
            createdAt: 'desc' as const
          }
        }
      }
    },
    loves: true,
    comments: {
      include: {
        author: true
      },
      orderBy: {
        createdAt: 'desc' as const
      }
    }
  }

  let folder
  if (id) {
    folder = await prisma.folder.findUnique({
      where: {id},
      include: includeOptions
    })
  } else {
    // Find root folder
    folder = await prisma.folder.findFirst({
      where: {
        parentId: null
      },
      include: includeOptions
    })

    if (!folder) {
        const session = await auth()
        if (session?.user?.id) {
             folder = await prisma.folder.create({
                data: {
                    name: 'Root',
                    path: '/uploads',
                    authorId: parseInt(session.user.id),
                    parentId: null
                },
                include: includeOptions
             })
        }
    }
  }

  if (!folder) return null

  return folder as unknown as Folder
}

export async function getFolderPath(folderId?: number) {
  const path = []
  let current
  if (!folderId) {
     const rootFolder = await prisma.folder.findFirst({
       where: { parentId: null }
     })
     return [{name: rootFolder?.name || 'Root', href: '/'}]
  } else {
    current = await prisma.folder.findUnique({where: {id: folderId}})
    if (!current) return []
    path.unshift({name: current.name, href: `/folders/${current.id}`})
  }
  while (current?.parentId) {
    current = await prisma.folder.findUnique({where: {id: current.parentId}})
    if (current) {
      if (current.parentId === null) path.unshift({name: current.name, href: '/'})
      else path.unshift({name: current.name, href: `/folders/${current.id}`})
    }
  }
  return path
}

export async function uploadFile(formData: FormData) {
  console.log('Uploading file...')
  const session = await auth()
  if (!session?.user?.id) {
    console.log('User not authenticated')
    return { success: false, error: 'Chưa đăng nhập' }
  }

  const file = formData.get('file') as File
  if (!file) {
    console.error('No file received in formData')
    return { success: false, error: 'No file received' }
  }

  const parentIdStr = formData.get('parentId') as string
  let dbParentId: number | null
  let parentPath = ''
  if (parentIdStr) {
    dbParentId = parseInt(parentIdStr)
    const parentFolder = await prisma.folder.findUnique({ where: { id: dbParentId } })
    if (parentFolder) {
      parentPath = parentFolder.path
    } else {
        return { success: false, error: 'Parent folder not found' }
    }
  } else {
    const rootFolder = await prisma.folder.findFirst({
        where: { parentId: null }
    })
    if (!rootFolder) {
         const newRoot = await prisma.folder.create({
            data: {
                name: 'Root',
                path: '/uploads',
                authorId: parseInt(session.user.id),
                parentId: null
            }
         })
         dbParentId = newRoot.id
         parentPath = '/uploads'
    } else {
        dbParentId = rootFolder.id
        parentPath = rootFolder.path
    }
  }

  try {
    const { url, posterUrl, filename, size } = await saveFile(file, parentPath)
    let mimeType = file.type
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    if (ext === 'jpg' || ext === 'jpeg') {
        if (mimeType === 'image/heic' || mimeType === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
            mimeType = 'image/jpeg'
        }
    }

    await prisma.file.create({
        data: {
          filename: filename,
          extension: ext,
          mimeType: mimeType,
          url: url,
          posterUrl: posterUrl,
          size: size,
          authorId: parseInt(session.user.id),
          parentId: dbParentId!
        }
    })

    revalidatePath('/')
    if (dbParentId) revalidatePath(`/folders/${dbParentId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Upload failed' }
  }
}

export async function deleteFile(id: number) {
  console.log(`Deleting file ${id}...`)
  const file = await prisma.file.findUnique({where: {id}})
  if (!file) {
    console.error(`File ${id} not found`)
    return
  }
  const parentId = file.parentId

  await deleteLocalFile(file.url, file.posterUrl)
  await prisma.file.delete({where: {id}})

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

export async function getFilesForDownload(fileIds: number[], folderIds: number[]): Promise<{url: string, filename: string}[]> {
  const files = await prisma.file.findMany({
    where: { id: { in: fileIds } },
    select: { url: true, filename: true }
  })

  const folderFilesResults = await Promise.all(folderIds.map(id => getAllFilesInFolder(id)))
  const folderFiles = folderFilesResults.flat().map(f => ({ url: f.url, filename: f.filename }))

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

    await deleteLocalFolder(folder.path)
    await prisma.folder.delete({where: {id}})

    const parentId = folder.parentId
    revalidatePath('/')
    if (parentId) revalidatePath(`/folders/${parentId}`)
  } catch (e) {
    console.error(e)
  }
}

export async function createFolder(dbParentId: number | undefined, prevState: CreateFolderState, formData: FormData) {
  console.log('Creating folder...')
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Chưa đăng nhập' }

  let parentId = dbParentId
  let parentPath = ''

  if (!parentId) {
    const rootFolder = await prisma.folder.findFirst({
        where: { parentId: null }
    })
    if (!rootFolder) {
         const newRoot = await prisma.folder.create({
            data: {
                name: 'Root',
                path: '/uploads',
                authorId: parseInt(session.user.id),
                parentId: null
            }
         })
         parentId = newRoot.id
         parentPath = '/uploads'
    } else {
        parentId = rootFolder.id
        parentPath = rootFolder.path
    }
  } else {
    const parentFolder = await prisma.folder.findUnique({
      where: {id: parentId}
    })
    if (parentFolder) {
        parentPath = parentFolder.path
    } else {
        return { success: false, error: 'Parent folder not found' }
    }
  }

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
    const newFolderPath = parentPath ? `${parentPath}/${folderName}` : folderName
    await createLocalFolder(newFolderPath)
    await prisma.folder.create({
        data: {
          name: folderName,
          path: newFolderPath,
          authorId: Number.parseInt(session?.user.id),
          parentId: parentId
        }
    })

    const path = dbParentId ? `/folders/${parentId}` : '/'
    revalidatePath(path)
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: `Lỗi tạo thư mục: ${error}`
    }
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
