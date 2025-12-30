'use server'

import {ChangePasswordSchema, ChangePasswordState, ChangeEmailSchema, ChangeEmailState} from "@/lib/definitions";
import {auth} from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import {revalidatePath} from "next/cache";
import cloudinary from "@/lib/cloudinary";
import {UploadApiResponse} from "cloudinary";

export async function changePassword(prevState: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const validatedFields = ChangePasswordSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Vui lòng kiểm tra lại thông tin.'
    }
  }

  const { currentPassword, newPassword } = validatedFields.data
  const session = await auth()

  if (!session?.user?.id) {
    return {
      message: 'Bạn chưa đăng nhập.'
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) }
  })

  if (!user) {
    return {
      message: 'Người dùng không tồn tại.'
    }
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password)

  if (!passwordMatch) {
    return {
      errors: {
        currentPassword: ['Mật khẩu hiện tại không đúng.']
      },
      message: 'Mật khẩu hiện tại không đúng.'
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  })

  return {
    success: true,
    message: 'Đổi mật khẩu thành công.'
  }
}

export async function changeEmail(prevState: ChangeEmailState, formData: FormData): Promise<ChangeEmailState> {
  const validatedFields = ChangeEmailSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Vui lòng kiểm tra lại thông tin.'
    }
  }

  const { email } = validatedFields.data
  const session = await auth()

  if (!session?.user?.id) {
    return {
      message: 'Bạn chưa đăng nhập.'
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) }
  })

  if (!user) {
    return {
      message: 'Người dùng không tồn tại.'
    }
  }

  // Check if email is already taken by another user
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser && existingUser.id !== user.id) {
    return {
      errors: {
        email: ['Email này đã được sử dụng.']
      },
      message: 'Email này đã được sử dụng.'
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email }
  })

  revalidatePath('/account')

  return {
    success: true,
    message: 'Cập nhật email thành công.'
  }
}

export async function updateAvatar(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Bạn chưa đăng nhập.' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { success: false, message: 'Không tìm thấy file.' }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'gia-dinh-minh/avatars',
          public_id: `avatar_${session.user?.id}`,
          overwrite: true,
          transformation: [{
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face"
          }]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result!)
        }
      )
      uploadStream.end(buffer)
    })

    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { avatarUrl: result.secure_url }
    })

    revalidatePath('/account')
    return { success: true, message: 'Cập nhật ảnh đại diện thành công.' }
  } catch (error) {
    console.error('Avatar upload error:', error)
    return { success: false, message: 'Có lỗi xảy ra khi tải ảnh lên.' }
  }
}
