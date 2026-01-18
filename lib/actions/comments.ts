'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Logger from "@/lib/logger";

const LOGGER = new Logger('COMMENTS')

export async function createComment(content: string, folderId?: number, fileId?: number, path?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Bạn chưa đăng nhập' }
  }

  if (!content.trim()) {
    return { success: false, message: 'Nội dung bình luận không được để trống' }
  }

  try {
    await prisma.comment.create({
      data: {
        content,
        authorId: parseInt(session.user.id),
        folderId: folderId || null,
        fileId: fileId || null
      }
    })

    if (path) {
      revalidatePath(path)
    }

    return { success: true }
  } catch (error) {
    LOGGER.error(`Error creating comment: ${error}`)
    return { success: false, message: 'Có lỗi xảy ra khi bình luận' }
  }
}

export async function getComments(folderId?: number, fileId?: number) {
  try {
    return await prisma.comment.findMany({
      where: {
        folderId: folderId || null,
        fileId: fileId || null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    LOGGER.error(`Error fetching comments: ${error}`)
    return []
  }
}

