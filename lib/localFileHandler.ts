import fsPromise from 'fs/promises'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import heicConvert from "heic-convert"
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
const BASE_DIR = process.cwd()

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
      console.log(`File not found: ${filePath}`)
      return null
    }

    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.gif') contentType = 'image/gif'
    else if (ext === '.mp4') contentType = 'video/mp4'
    else if (ext === '.pdf') contentType = 'application/pdf'
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
            console.error(`Error sending chunk to client: ${e}`)
            file.destroy()
          }
        })
        file.on('end', () => {
          try {
            controller.close()
          } catch (e) {
            console.error(`Error closing stream: ${e}`)
          }
        })
        file.on('error', (err) => {
          try {
            controller.error(err)
          } catch (e) {
            console.error(`Error sending stream error to client: ${e}`)
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

export async function saveFile(file: File, folderPath: string): Promise<{ url: string, posterUrl?: string, filename: string, size: number }> {
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
      console.error('Failed to convert HEIC to JPEG', e)
    }
  }
  const now = new Date()
  const filename = `${now.toISOString().replace(/([:\-.TZ])/g, '')}${extension.toLowerCase()}`
  console.log(filename)
  const relativeFolderPath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath
  const fullFolderPath = path.join(BASE_DIR, relativeFolderPath)
  await fsPromise.mkdir(fullFolderPath, { recursive: true })
  const fullPath = path.join(fullFolderPath, filename)
  await fsPromise.writeFile(fullPath, buffer)
  const urlPath = path.join(folderPath, filename).replace(/\\/g, '/')
  const url = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
  let posterUrl: string | undefined
  if (file.type.startsWith('video/')) {
    const posterFilename = `${path.basename(filename, extension)}-poster.jpg`
    console.log(posterFilename)

    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(fullPath)
          .screenshots({
            count: 1,
            folder: fullFolderPath,
            filename: posterFilename,
            // size: '100%'
          })
          .on('end', () => resolve())
          .on('error', (err: Error) => reject(err))
      })
      const posterUrlPath = path.join(folderPath, posterFilename).replace(/\\/g, '/')
      posterUrl = posterUrlPath.startsWith('/') ? posterUrlPath : `/${posterUrlPath}`
    } catch (e) {
      console.error('Failed to generate poster', e)
    }
  }

  return {
    url,
    posterUrl,
    filename,
    size: buffer.length
  }
}

export async function deleteLocalFile(url: string, posterUrl?: string | null) {
    const deletePath = async (p: string) => {
        const relativePath = p.startsWith('/') ? p.slice(1) : p
        const fullPath = path.join(BASE_DIR, relativePath)
        try {
            await fsPromise.unlink(fullPath)
        } catch (e) {
            console.error(`Failed to delete file ${fullPath}`, e)
        }
    }
    await deletePath(url)
    if (posterUrl) {
        await deletePath(posterUrl)
    }
}

export async function deleteLocalFolder(folderPath: string) {
    const relativePath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath
    const fullPath = path.join(BASE_DIR, relativePath)
    try {
        await fsPromise.rm(fullPath, { recursive: true, force: true })
    } catch (e) {
        console.error(`Failed to delete folder ${fullPath}`, e)
    }
}
