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

export type User = {
  id: number
  username: string
  name: string
  email: string
  role: string
  files: File[]
  folders: Folder[]
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
} | null