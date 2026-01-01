'use client'

import {useActionState} from "react"
import {changePassword} from "@/lib/actions/user"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {toast} from "sonner"
import {useEffect, useRef} from "react"
export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
      formRef.current?.reset()
    } else if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-4 max-w-md w-full">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
        {state?.errors?.currentPassword && (
          <p className="text-sm text-red-500">{state.errors.currentPassword[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
        {state?.errors?.newPassword && (
          <p className="text-sm text-red-500">{state.errors.newPassword[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
        {state?.errors?.confirmPassword && (
          <p className="text-sm text-red-500">{state.errors.confirmPassword[0]}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
      </Button>
    </form>
  )
}
