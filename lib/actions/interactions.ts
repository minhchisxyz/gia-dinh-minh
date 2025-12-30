'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleLove(fileId: number | undefined, folderId: number | undefined, path: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Bạn chưa đăng nhập' }
  }

  const userId = parseInt(session.user.id)

  try {
    const existingLove = await prisma.love.findFirst({
      where: {
        userId,
        fileId: fileId || null,
        folderId: folderId || null
      }
    })

    if (existingLove) {
      await prisma.love.delete({
        where: {
          id: existingLove.id
        }
      })
      revalidatePath(path)
      return { success: true, loved: false }
    } else {
      await prisma.love.create({
        data: {
          userId,
          fileId: fileId || null,
          folderId: folderId || null
        }
      })
      revalidatePath(path)
      return { success: true, loved: true }
    }
  } catch (error) {
    console.error('Error toggling love:', error)
    return { success: false, message: 'Có lỗi xảy ra' }
  }
}
