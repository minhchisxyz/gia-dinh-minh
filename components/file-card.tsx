'use client'

import {File} from "@/lib/definitions";
import Image from "next/image";
import {Check, Clapperboard, Download, EllipsisVertical, Heart, Image as ImageIcon, MessageCircle, Trash2} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {deleteFile} from "@/lib/actions/files";
import {Dispatch, SetStateAction} from "react";
import {Checkbox} from "@/components/ui/checkbox";
import UserAvatar from "@/components/user-avatar";
import {toggleLove} from "@/lib/actions/interactions";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {useState} from "react";
import CommentSection from "@/components/comment-section";

export default function FileCard(
    { file, isSelected, hasSelection, setSelectedFilesAction, currentUserId }: {
      file: File,
      isSelected: boolean,
      hasSelection: boolean,
      setSelectedFilesAction: Dispatch<SetStateAction<number[]>>,
      currentUserId?: number
    }
) {
  const isVideo = file.mimeType.startsWith('video/')
  const pathname = usePathname()
  const isLoved = file.loves?.some(love => love.userId === currentUserId)
  const [isCommentOpen, setIsCommentOpen] = useState(false)

  const onCheck = () => {
    if (isSelected) setSelectedFilesAction((prev) => prev.filter(id => id !== file.id))
    else setSelectedFilesAction((prev) => [...prev, file.id])
  }

  const handleLove = async () => {
    await toggleLove(file.id, undefined, pathname)
  }

  return (
      <div className={`w-full h-72 md:w-64 md:h-64 flex flex-col bg-blue-50 hover:bg-[#e7f0ff] rounded-md p-3 cursor-pointer`}>
        <div className={`h-8 flex items-center`}>
          {
            isVideo ? <Clapperboard className={`text-red-500 fill-red-200`}/> : <ImageIcon className={`text-red-500 fill-red-200`}/>
          }
          <div className={`ml-2 flex-1 truncate min-w-0`}>
            {file.filename}
          </div>
          {hasSelection && <Checkbox checked={isSelected} onCheckedChange={onCheck}/>}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical className={`hover:bg-blue-200 rounded-full p-1`}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`w-36`} align={`start`} side={`right`}>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onCheck}>
                  Chọn
                  <DropdownMenuShortcut>
                    <Check/>
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <Link href={`/api/drive/download/${file.driveId}`} prefetch={false}>
                  <DropdownMenuItem>
                    Tải xuống
                    <DropdownMenuShortcut>
                      <Download/>
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={async () => await deleteFile(file.id)}>
                  Xoá
                  <DropdownMenuShortcut>
                    <Trash2/>
                  </DropdownMenuShortcut>
                </DropdownMenuItem>

              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative flex-1 w-full overflow-hidden rounded-sm bg-gray-300">
          <Dialog>
            <DialogTrigger>
              <Image
                  src={isVideo ? file.posterUrl || '/' : file.cloudinaryUrl}
                  fill
                  alt={file.filename}
                  className="object-cover" // This keeps the aspect ratio while filling the box
                  sizes="256px"
              />
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="max-w-[80vw] w-full h-[80vh] p-0 border-none shadow-none bg-transparent flex items-center justify-center">
              <DialogHeader className="hidden">
                <DialogTitle />
              </DialogHeader>
              {isVideo ? (
                  <video
                      controls
                      className="max-h-full max-w-full rounded-lg shadow-2xl"
                      autoPlay
                  >
                    <source src={file.cloudinaryUrl} type={file.mimeType} />
                  </video>
              ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                        src={file.cloudinaryUrl}
                        fill
                        alt={file.filename}
                        className="object-contain"
                        sizes="100vw"
                    />
                  </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-6 h-6">
            <UserAvatar url={file.author?.avatarUrl} />
          </div>
          <span className="text-xs text-gray-600 truncate flex-1">{file.author?.name}</span>
          <div className="flex items-center gap-2 text-gray-500">
            <button onClick={handleLove} className="hover:text-red-500 transition-colors flex items-center gap-1">
              <Heart className={cn("w-4 h-4", isLoved && "fill-red-500 text-red-500")} />
              <span className="text-xs">{file.loves?.length || 0}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsCommentOpen(true)
              }}
              className="hover:text-blue-500 transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{file.comments?.length || 0}</span>
            </button>
            <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
              <DialogContent className="sm:max-w-125 h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b">
                  <DialogTitle>Bình luận cho {file.filename}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden">
                  <CommentSection comments={file.comments || []} fileId={file.id} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
  )
}