import * as z from 'zod'

export const LogInFormSchema = z.object({
  username: z
      .string()
      .min(4, {error: 'Tên đăng nhập ít nhất 4 chữ cái'})
      .trim(),
  password: z
      .string()
      .min(8, { error: 'Mật khẩu dài ít nhất 8 chữ cái'})
      .regex(/[a-zA-Z]/, { error: 'Chứa ít nhất 1 chữ cái.' })
      .regex(/[0-9]/, { error: 'Chứa ít nhất 1 số.' })
      .trim()
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { error: 'Vui lòng nhập mật khẩu hiện tại' }),
  newPassword: z
      .string()
      .min(8, { error: 'Mật khẩu mới dài ít nhất 8 chữ cái'})
      .regex(/[a-zA-Z]/, { error: 'Chứa ít nhất 1 chữ cái.' })
      .regex(/[0-9]/, { error: 'Chứa ít nhất 1 số.' })
      .trim(),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const ChangeEmailSchema = z.object({
  email: z.string().email({ error: 'Email không hợp lệ' }).trim()
})

export type FormState = | {
  errors?: {
    username?: string[],
    password?: string[]
  }
  message?: string
} | undefined

export type CreateFolderState = {
  success?: boolean,
  error?: string
} | undefined

export type ChangePasswordState = {
  errors?: {
    currentPassword?: string[],
    newPassword?: string[],
    confirmPassword?: string[]
  }
  message?: string
  success?: boolean
} | undefined

export type ChangeEmailState = {
  errors?: {
    email?: string[]
  }
  message?: string
  success?: boolean
} | undefined

export type User = {
  id: number
  username: string
  name: string
  email: string
  role: string
  avatarUrl?: string | null
  files: File[]
  folders: Folder[]
  loves: Love[]
}

export type File = {
  id: number
  filename: string
  extension: string
  driveId: string
  cloudinaryPublicId: string
  cloudinaryUrl: string
  posterUrl?: string
  mimeType: string
  authorId: number
  author: User
  parentId: number
  parent?: Folder
  createdTime: string
  loves: Love[]
  comments: Comment[]
}

export type Love = {
  id: number
  userId: number
  user: User
  fileId?: number | null
  file?: File
  folderId?: number | null
  folder?: Folder
}

export type Comment = {
  id: number
  content: string
  authorId: number
  author: User
  createdAt: Date
  fileId?: number | null
  folderId?: number | null
}

export type Folder = {
  // Folder structure
  id: number
  driveId: string
  name: string
  authorId: number
  createdTime: Date
  parentId: number | null
  parent?: Folder
  subfolders?: Folder[]
  files?: File[]
  loves: Love[]
  comments: Comment[]
}