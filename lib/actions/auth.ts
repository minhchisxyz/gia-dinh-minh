'use server'

import {FormState, LogInFormSchema} from "@/lib/definitions";
import {signIn, signOut} from "@/auth";
import { AuthError } from "next-auth";
import {z} from "zod";

export async function authenticate(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = LogInFormSchema.safeParse(Object.fromEntries(formData))

    if (!validatedFields.success) {
      const errors = z.treeifyError(validatedFields.error)
      return {
        errors: {
          username: errors.properties?.username?.errors,
          password: errors.properties?.password?.errors
        },
        message: 'Vui lòng điền đúng định dạng.'
      };
    }
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Tên đăng nhập hoặc mật khẩu không đúng.' }
        default:
          return { message: 'An unexpected error occurred.' }
      }
    }
    throw error
  }
}

export async function logOut() {
  await signOut()
}