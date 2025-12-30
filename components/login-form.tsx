'use client'

import {Field, FieldError, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {authenticate} from "@/lib/actions/auth";
import {useActionState} from "react";
import {Spinner} from "@/components/ui/spinner";
import {useSearchParams} from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [state, formAction, isPending] = useActionState(
      authenticate,
      undefined,
  )
  return (
      <form action={formAction} className={`w-64`}>
        <FieldSet>
          <FieldGroup>
            {state?.message && (
                <FieldError>
                  {state.message}
                </FieldError>
            )}
            <Field>
              <FieldLabel>Tên đăng nhập</FieldLabel>
              <Input id={`username`} name={`username`} type={`text`} placeholder={`diepminhchi`}/>
              {state?.errors?.username && state.errors.username.map((e, i) => (
                  <FieldError key={i}>{e}</FieldError>
              ))}
            </Field>
            <Field>
              <FieldLabel>Mật khẩu</FieldLabel>
              <Input id={`password`} name={`password`} type={`password`} placeholder={`********`}/>
              {state?.errors?.password && state.errors.password.map((e, i) => (
                  <FieldError key={i}>{e}</FieldError>
              ))}
            </Field>
          </FieldGroup>
          <Input type={`hidden`} name={`redirectTo`} value={callbackUrl}/>
          <Button type={`submit`} variant={`outline`}>
            {
              isPending ? <Spinner/> : <span>Đăng nhập</span>
            }
          </Button>
        </FieldSet>
      </form>
  )
}