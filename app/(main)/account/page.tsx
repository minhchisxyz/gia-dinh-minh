import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import AvatarUploader from "@/components/avatar-uploader"
import ChangePasswordForm from "@/components/change-password-form"
import ChangeEmailForm from "@/components/change-email-form"
import { Separator } from "@/components/ui/separator"
import {logOut} from "@/lib/actions/auth";
import {Button} from "@/components/ui/button";
import {LogOut} from "lucide-react";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
  })
  if (!user) return null
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <AvatarUploader url={user.avatarUrl} />
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">@{user.username}</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center w-full">
            <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
            <ChangeEmailForm currentEmail={user.email} />
          </div>

          <Separator />

          <div className="flex flex-col items-center w-full">
            <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>
            <ChangePasswordForm />
          </div>

          <Separator />

          <div className={'flex justify-center items-center w-full'}>
            <Dialog>
              <form action={logOut}>
                <DialogTrigger asChild>
                  <Button variant={`destructive`} size="sm" type={`button`} className={`text-white hover:text-red-600 hover:bg-red-50`}>
                    <LogOut className="h-5 w-5"/>
                    Đăng xuất
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Chắc chắn muốn đăng xuất?
                    </DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type={`button`} variant={`outline`}>
                        Chưa chắc âu
                      </Button>
                    </DialogClose>
                    <Button variant={`destructive`} type={`submit`}>
                      Chắc chắn
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}