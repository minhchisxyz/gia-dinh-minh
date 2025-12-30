import {Folder} from "@/lib/definitions";
import Link from "next/link";
import {EllipsisVertical, Folder as FolderIcon, Trash2} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {deleteFolder} from "@/lib/actions/files";

export default function FolderCard(
    { folder }: {
      folder: Folder
    }
) {
  return (

      <div className={`flex w-64 items-center bg-gray-100 rounded-md p-3 hover:bg-gray-200 cursor-pointer`}>
        <Link className={`flex-1 flex`} href={`/folders/${folder?.id}`}>
          <FolderIcon/>
          <span className={`ml-2 flex-1`}>{folder?.name}</span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisVertical className={`hover:bg-gray-300 rounded-full p-1`}/>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={`w-36`} align={`start`} side={`right`}>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={async () => await deleteFolder(folder?.id || -1)}>
                Xoá
                <DropdownMenuShortcut>
                  <Trash2/>
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
  )
}