'use client'

import {FileUp, FolderPlus} from "lucide-react"
import {Button} from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {createFolder, uploadFile} from "@/lib/actions/files"
import {usePathname, useRouter} from "next/navigation"
import {ChangeEvent, startTransition, useActionState, useRef} from "react"
import {FieldError, FieldGroup, FieldSet} from "@/components/ui/field"
import {Spinner} from "@/components/ui/spinner"
import {Separator} from "@/components/ui/separator"
import {toast} from "sonner"
import {Progress} from "@/components/ui/progress"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip"
import CommentSection from "@/components/comment-section"
import {Comment} from "@/lib/definitions"

export function SidebarContent({ comments, folderId }: { comments?: Comment[], folderId?: number }) {
  const pathname = usePathname()
  const router = useRouter()

  let parentId = folderId
  if (!parentId && pathname && pathname.includes('folders')) {
    parentId = Number.parseInt(pathname.split('/')[2])
  }
  const createFolderWithParentId = createFolder.bind(null, parentId)
  const [state, formAction, isPending] = useActionState(createFolderWithParentId, undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleFileUploadButtonClick = () => {
    fileInputRef.current?.click()
  }
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const toastId = toast.loading('Đang chuẩn bị tải lên...', {
        description: <Progress value={0} />
      })

      try {
        let count = 0
        for (const file of files) {
          toast.loading(`Đang tải ${file.name} lên...`, {
            id: toastId,
            description: <Progress value={Math.round((count / files.length) * 100)} />
          })

          const formData = new FormData()
          formData.append('file', file)
          if (parentId) {
            formData.append('parentId', parentId.toString())
          }

          const result = await uploadFile(formData)
          if (!result.success) {
            throw new Error(result.error || 'Upload failed')
          }
          startTransition(() => {
            router.refresh()
          })

          count++
          const percent = Math.round((count / files.length) * 100)

          toast.loading(`Đang tải lên... ${count}/${files.length}`, {
            id: toastId,
            description: <Progress value={percent} />
          })
        }

        toast.success('Đã tải tất cả tệp lên thành công!', {
          id: toastId,
          description: null
        })

      } catch (e) {
        console.error(e)
        toast.error('Có lỗi xảy ra khi tải lên', { id: toastId })
      } finally {
        e.target.value = ''
      }
    }
  }

  return (
      <div className={`h-full flex flex-col`}>
        <div className={`flex items-center justify-center p-2 gap-5`}>
          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                <Button variant={`outline`}>
                  <FolderPlus/>
                </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tạo thư mục mới</p>
              </TooltipContent>
            </Tooltip>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Tạo thư mục mới
                </DialogTitle>
                <DialogDescription>
                  Đặt tên cho thư mục mới
                </DialogDescription>
              </DialogHeader>
              <form action={formAction}>
                <FieldSet>
                  <FieldGroup>
                    {state?.error && (
                        <FieldError>
                          {state.error}
                        </FieldError>
                    )}
                    <Input type={`text`} name={`folder-name`}/>
                  </FieldGroup>
                </FieldSet>
                <DialogFooter className={`mt-2`}>
                  <Button variant={`outline`} className={`hover:cursor-pointer`}>
                    {
                      isPending ? <Spinner/> : <span>Tạo</span>
                    }
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleFileUploadButtonClick} variant={`outline`}>
                <FileUp/>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Tải file lên
              </p>
            </TooltipContent>
          </Tooltip>
          <Input multiple={true} onChange={handleFileChange} accept="image/*,video/*,.heic,.HEIC" type="file" ref={fileInputRef} hidden/>
        </div>
        <Separator/>
        {comments && (
          <div className="flex-1 overflow-hidden">
            <CommentSection comments={comments} folderId={parentId} />
          </div>
        )}
      </div>
  )
}

export default function Sidebar({ comments, folderId }: { comments?: Comment[], folderId?: number }) {
  return (
      <aside className={`hidden md:block w-64 border-r bg-gray-50 overflow-y-auto h-full`}>
        <SidebarContent comments={comments} folderId={folderId}/>
      </aside>
  )
}