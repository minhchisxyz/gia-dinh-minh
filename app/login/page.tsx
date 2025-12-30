import LoginForm from "@/components/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
      <div className={'flex justify-center items-center h-screen'}>
        <Suspense>
          <LoginForm/>
        </Suspense>
      </div>
  )
}