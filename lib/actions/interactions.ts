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
    // Actually, Prisma handles nulls in unique constraints differently depending on DB.
    // But here we have @@unique([userId, fileId, folderId]).
    // If fileId is Int?, it can be null.
    // Let's use findFirst instead to be safe or construct where properly.

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
