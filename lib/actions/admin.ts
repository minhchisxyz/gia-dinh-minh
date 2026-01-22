'use server'

import path from "path";
import {auth} from "@/auth";
import Logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import {generateImageThumbnail, generateVideoThumbnail} from "@/lib/localFileHandler";
import fs from "fs/promises";

const LOGGER = new Logger('LOGGER')

export async function runScript() {
  const session = await auth()
  if (!session?.user?.id && session?.user.role !== 'ADMIN') {
    LOGGER.error('NOT ADMIN')
    return
  }

  const files = await prisma.file.findMany({
    include: {
      parent: true
    }
  })
  for (const file of files) {
    const thumbnailUrl = path.join(file.parent.path, 'thumbnails').replace(/\\/g, '/')
    const thumbnailPath = path.join(process.cwd(), thumbnailUrl)
    const filePath = path.join(process.cwd(), file.url)
    const thumbnailFilename = path.basename(file.filename, path.extname(file.filename)) + '.webp'

    if (file.mimeType.startsWith('video/')) {
      const {blurDataUrl} = await generateVideoThumbnail(filePath, thumbnailPath, thumbnailFilename)
      await prisma.file.update({
        where: {id: file.id},
        data: {
          thumbnailUrl: path.join(thumbnailUrl, thumbnailFilename).replace(/\\/g, '/'),
          blurDataUrl
        }
      })
    } else {
      const buffer = await fs.readFile(filePath)
      const {blurDataUrl} = await generateImageThumbnail(buffer, thumbnailPath, thumbnailFilename)
      await prisma.file.update({
        where: {id: file.id},
        data: {
          thumbnailUrl: path.join(thumbnailUrl, thumbnailFilename).replace(/\\/g, '/'),
          blurDataUrl
        }
      })
    }
    LOGGER.info(`Generated thumbnail and blur data URl for ${file.url}`)
  }
  LOGGER.info('Finished generating thumbnails')
}