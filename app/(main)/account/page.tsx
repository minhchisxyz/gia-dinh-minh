import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import AvatarUploader from "@/components/avatar-uploader"
import ChangePasswordForm from "@/components/change-password-form"
import ChangeEmailForm from "@/components/change-email-form"
import { Separator } from "@/components/ui/separator"
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
          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ChangeEmailForm currentEmail={user.email} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Vai trò</label>
                <p className="text-sm py-2">{user.role}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col items-center w-full">
            <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}