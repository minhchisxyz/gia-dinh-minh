'use client'

import {useActionState} from "react";
import {changeEmail} from "@/lib/actions/user";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {useEffect, useRef} from "react";

export default function ChangeEmailForm({ currentEmail }: { currentEmail?: string | null }) {
  const [state, formAction, isPending] = useActionState(changeEmail, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
    } else if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="flex gap-2">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={currentEmail || ''}
            placeholder="Nhập email của bạn"
            required
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
        {state?.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email[0]}</p>
        )}
      </div>
    </form>
  )
}

