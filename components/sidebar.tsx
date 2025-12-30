'use client'

import {FileUp, FolderPlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {createFolder, uploadFile} from "@/lib/actions/files";
import {usePathname} from "next/navigation";
import {ChangeEvent, useActionState, useRef} from "react";
import {FieldError, FieldGroup, FieldSet} from "@/components/ui/field";
import {Spinner} from "@/components/ui/spinner";
import {Separator} from "@/components/ui/separator";
import {toast} from "sonner";
import {Progress} from "@/components/ui/progress";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export default function Sidebar() {
  const pathname = usePathname()
  let parentId = undefined
  if (pathname && pathname.includes('folders')) {
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
          const formData = new FormData()
          formData.append('file', file)
          if (parentId) {
            formData.append('parentId', parentId.toString())
          }

          toast.loading(`Đang tải ${file.name} lên...`, {
            id: toastId,
            description: <Progress value={Math.round((count / files.length) * 100)} />
          })

          await uploadFile(formData)

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
      <aside className={`w-64 border-r bg-gray-50 overflow-y-auto`}>
        <div className={`flex items-center justify-start p-2 gap-2`}>
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

          <Input multiple={true} onChange={handleFileChange} accept={`image/*,video/*`} type={`file`} ref={fileInputRef} hidden/>
        </div>
        <Separator/>
      </aside>
  )
}