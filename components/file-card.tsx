'use client'

import {File} from "@/lib/definitions"
import Image from "next/image"
import {Check, Clapperboard, Download, EllipsisVertical, Heart, Image as ImageIcon, MessageCircle, Trash2} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {deleteFile} from "@/lib/actions/files"
import {Dispatch, SetStateAction} from "react"
import {Checkbox} from "@/components/ui/checkbox"
import UserAvatar from "@/components/user-avatar"
import {toggleLove} from "@/lib/actions/interactions"
import {usePathname} from "next/navigation"
import {cn} from "@/lib/utils"
import {useEffect, useState} from "react"
import CommentSection from "@/components/comment-section"
import useLongPress from "@/hooks/use-long-press"
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

  const [isLoved, setIsLoved] = useState(file.loves?.some(love => love.userId === currentUserId))
  const [loveCount, setLoveCount] = useState(file.loves?.length || 0)

  useEffect(() => {
    const loved = file.loves?.some(love => love.userId === currentUserId)
    const count = file.loves?.length || 0
    setIsLoved(loved)
    setLoveCount(count)
  }, [file.loves, currentUserId])

  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const onCheck = () => {
    if (isSelected) setSelectedFilesAction((prev) => prev.filter(id => id !== file.id))
    else setSelectedFilesAction((prev) => [...prev, file.id])
  }

  const handleLove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newIsLoved = !isLoved
    setIsLoved(newIsLoved)
    setLoveCount(prev => newIsLoved ? prev + 1 : prev - 1)

    try {
      await toggleLove(file.id, undefined, pathname)
    } catch (error) {
      setIsLoved(!newIsLoved)
      setLoveCount(prev => !newIsLoved ? prev + 1 : prev - 1)
      console.error(error)
    }
  }

  const longPressProps = useLongPress(() => {
    if (!isSelected) {
      setSelectedFilesAction((prev) => [...prev, file.id])
    }
  })

  return (
      <div
        {...longPressProps}
        className={`w-full h-72 md:w-64 md:h-64 flex flex-col bg-blue-50 hover:bg-[#e7f0ff] rounded-md p-3 cursor-pointer`}
      >
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
                <a href={file.url} download={file.filename}>
                  <DropdownMenuItem>
                    Tải xuống
                    <DropdownMenuShortcut>
                      <Download/>
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </a>
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
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Image
                  src={isVideo ? file.posterUrl || '/' : file.url}
                  fill
                  alt={file.filename}
                  className="object-cover cursor-pointer" // This keeps the aspect ratio while filling the box
                  sizes="256px"
                  onClick={() => setIsPreviewOpen(true)}
                  unoptimized
              />
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="w-auto h-auto max-w-none max-h-none p-0 border-none shadow-none bg-transparent flex items-center justify-center outline-none"
            >
              <DialogHeader className="hidden">
                <DialogTitle />
              </DialogHeader>
              {isVideo ? (
                  <video
                      controls
                      className="max-h-[80vh] max-w-[80vw] rounded-lg shadow-2xl"
                      autoPlay
                  >
                    <source src={file.url} type={file.mimeType} />
                  </video>
              ) : (
                  <img
                      src={file.url}
                      alt={file.filename}
                      className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg shadow-2xl"
                  />
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
              <Heart className={cn("w-5 h-5", isLoved && "fill-red-500 text-red-500")} />
              <span className="text-xs">{loveCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsCommentOpen(true)
              }}
              className="hover:text-blue-500 transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-5 h-5" />
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