import {File} from "@/lib/definitions";
import Image from "next/image";
import {Clapperboard, Download, EllipsisVertical, Image as ImageIcon, Trash2} from "lucide-react";
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

export default function FileCard(
    { file }: {
      file: File
    }
) {
  const isVideo = file.mimeType.startsWith('video/')
  return (
      <div className={`w-64 h-56 flex flex-col bg-gray-100 rounded-md p-3 hover:bg-gray-200 cursor-pointer`}>
        <div className={`h-8 flex items-center`}>

          {
            isVideo ? <Clapperboard className={`text-red-500 fill-red-200`}/> : <ImageIcon className={`text-red-500 fill-red-200`}/>
          }
          <div className={`ml-2 flex-1`}>
            {file.filename}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical className={`hover:bg-gray-300 rounded-full p-1`}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`w-36`} align={`start`} side={`right`}>
              <DropdownMenuGroup>
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
            <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 border-none shadow-none bg-transparent flex items-center justify-center">
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
                        className="object-contain" // Use object-contain to see the whole image
                        sizes="95vw"
                        priority
                    />
                  </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
        <div className={`h-8 flex items-center`}>
          fasd
        </div>
      </div>
  )
}