import fsPromise from 'fs/promises'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import heicConvert from "heic-convert"
import Logger from "@/lib/logger";
import {PassThrough} from "stream";
import sharp from "sharp";

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
const BASE_DIR = process.cwd()
const LOGGER = new Logger('LOCAL FILE HANDLER')
const BLUR_SIZE = 10
const THUMBNAIL_QUALITY = 75
const THUMBNAIL_SIZE = 600

export async function ensureUploadsDir() {
  try {
    await fsPromise.access(UPLOADS_DIR)
  } catch {
    await fsPromise.mkdir(UPLOADS_DIR, { recursive: true })
  }
}

export async function streamFile(filePath: string, range: string | null): Promise<{
  stream: ReadableStream,
  fileSize: number,
  contentType: string,
  start?: number,
  end?: number,
  chunksize?: number
} | null> {
  try {
    if (!fs.existsSync(filePath)) {
      LOGGER.error(`File not found: ${filePath}`)
      return null
    }

    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.mp4') contentType = 'video/mp4'
    const parts = range ? range.replace(/bytes=/, "").split("-") : []
    const start = range ? parseInt(parts[0], 10) : 0
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunksize = (end - start) + 1
    const file = fs.createReadStream(filePath, { start, end })
    // Convert fsPromise stream to Web ReadableStream
    const stream = new ReadableStream({
      start(controller) {
        file.on('data', (chunk) => {
          try {
            controller.enqueue(chunk)
          } catch (e) {
            LOGGER.error(`Error sending chunk to client: ${e}`)
            file.destroy()
          }
        })
        file.on('end', () => {
          try {
            controller.close()
          } catch (e) {
            LOGGER.error(`Error closing stream: ${e}`)
          }
        })
        file.on('error', (err) => {
          try {
            controller.error(err)
          } catch (e) {
            LOGGER.error(`Error sending stream error to client: ${e}`)
          }
        })
      },
      cancel() {
        file.destroy()
      }
    })
    return {stream, fileSize, contentType, start, end, chunksize}

  } catch (e) {
    throw e
  }
}


export async function createLocalFolder(folderPath: string) {
  const relativePath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath
  const fullPath = path.join(BASE_DIR, relativePath)
  await fsPromise.mkdir(fullPath, { recursive: true })
}


export async function generateVideoThumbnail(videoPath: string, folderPath: string, thumbnailFilename: string): Promise<{blurDataUrl: string}> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const stream = new PassThrough()

    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', (err) => reject(err))
    stream.on('end', async () => {
      try {
        await fsPromise.mkdir(folderPath, { recursive: true })

        const fullBuffer = Buffer.concat(chunks)

        const [thumbnailBuffer, blurDataUrl] = await Promise.all([
          sharp(fullBuffer)
              .resize(THUMBNAIL_SIZE)
              .webp({quality: THUMBNAIL_QUALITY})
              .toBuffer(),
          sharp(fullBuffer)
              .resize(BLUR_SIZE)
              .toBuffer()
              .then(b => `data:image/webp;base64,${b.toString('base64')}`)
        ])

        await fsPromise.writeFile(path.join(folderPath, thumbnailFilename), thumbnailBuffer)

        resolve({blurDataUrl})
      } catch (e) {
        reject(e)
      }
    })
    ffmpeg(videoPath)
        .inputOptions('-ss 00:00:01')
        .outputOptions('-vframes 1')
        .outputFormat('image2')
        .pipe(stream)
  })
}


export async function generateImageThumbnail(imageBuffer: Buffer, folderPath: string, thumbnailFilename: string): Promise<{blurDataUrl: string}> {
  await fsPromise.mkdir(folderPath, { recursive: true })

  const thumbnailPath = path.join(folderPath, thumbnailFilename)

  const [blurDataUrl] = await Promise.all([
      sharp(imageBuffer, { failOn: 'none'})
          .resize(BLUR_SIZE)
          .toBuffer()
          .then(b => `data:image/webp;base64,${b.toString('base64')}`),
      sharp(imageBuffer, { failOn: 'none'})
          .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'inside', withoutEnlargement: true })
          .webp({quality: THUMBNAIL_QUALITY})
          .toFile(thumbnailPath)
  ])

  return {blurDataUrl}
}


export async function saveFile(file: File, folderPath: string): Promise<{ url: string, thumbnailUrl: string, blurDataUrl: string, filename: string, size: number }> {
  let buffer = Buffer.from(await file.arrayBuffer())
  let extension = path.extname(file.name)
  if (!extension) {
    throw new Error('File extension not found')
  }

  if (extension.toLowerCase() === '.heic') {
    try {
      const outputBuffer = await heicConvert({
        buffer: buffer as any,
        format: 'JPEG',
        quality: 1
      })
      buffer = Buffer.from(outputBuffer)
      extension = '.jpg'
    } catch (e) {
      LOGGER.error(`Failed to convert HEIC to JPEG: ${e}`)
    }
  }
  const now = new Date()
  const filename = `${now.toISOString().replace(/([:\-.TZ])/g, '')}${extension.toLowerCase()}`
  const relativeFolderPath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath
  const fullFolderPath = path.join(BASE_DIR, relativeFolderPath)

  await fsPromise.mkdir(fullFolderPath, { recursive: true })
  const fullPath = path.join(fullFolderPath, filename)
  await fsPromise.writeFile(fullPath, buffer)

  const urlPath = path.join(folderPath, filename).replace(/\\/g, '/')
  const url = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
  const thumbnailFilename = `${path.basename(filename, extension)}.webp`
  const thumbnailFolderPath = path.join(fullFolderPath, 'thumbnails')
  try {
    const {blurDataUrl} = file.type.startsWith('video/') ?
        await generateVideoThumbnail(fullPath, thumbnailFolderPath, thumbnailFilename) :
        await generateImageThumbnail(buffer, thumbnailFolderPath, thumbnailFilename)
    const thumbnailUrlPath = path.join(folderPath, 'thumbnails', thumbnailFilename).replace(/\\/g, '/')
    const thumbnailUrl = thumbnailUrlPath.startsWith('/') ? thumbnailUrlPath : `/${thumbnailUrlPath}`

    return {
      url,
      thumbnailUrl,
      blurDataUrl,
      filename,
      size: buffer.length
    }
  } catch (e) {
    throw e
  }
}

export async function deleteLocalFile(url: string, thumbnailUrl?: string | null | undefined) {
    const deletePath = async (p: string) => {
        const relativePath = p.startsWith('/') ? p.slice(1) : p
        const fullPath = path.join(BASE_DIR, relativePath)
        try {
            await fsPromise.unlink(fullPath)
        } catch (e) {
            LOGGER.error(`Failed to delete file ${fullPath}: ${e}`)
        }
    }
    await deletePath(url)
    if (thumbnailUrl) {
        await deletePath(thumbnailUrl)
    }
}

export async function deleteLocalFolder(folderPath: string) {
    const relativePath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath
    const fullPath = path.join(BASE_DIR, relativePath)
    try {
        await fsPromise.rm(fullPath, { recursive: true, force: true })
    } catch (e) {
        LOGGER.error(`Failed to delete folder ${fullPath}: ${e}`)
    }
}
