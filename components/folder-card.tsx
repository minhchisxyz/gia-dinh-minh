import {Folder} from "@/lib/definitions";
import Link from "next/link";
import {Check, EllipsisVertical, Folder as FolderIcon, Trash2} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {deleteFolder} from "@/lib/actions/files";
import {Dispatch, SetStateAction} from "react";
import {Checkbox} from "@/components/ui/checkbox";

export default function FolderCard(
    { folder, isSelected, hasSelection, setSelectedFoldersAction }: {
      folder: Folder,
      isSelected: boolean,
      hasSelection: boolean,
      setSelectedFoldersAction: Dispatch<SetStateAction<number[]>>
    }
) {
  const onCheck = () => {
    if (isSelected) setSelectedFoldersAction((prev) => prev.filter(id => id !== folder.id))
    else setSelectedFoldersAction((prev) => [...prev, folder.id])
  }
  return (

      <div className={`flex w-64 items-center bg-blue-50 hover:bg-[#e7f0ff] rounded-md p-3 cursor-pointer`}>
        <Link className={`flex-1 flex`} href={`/folders/${folder?.id}`}>
          <FolderIcon/>
          <span className={`ml-2 flex-1`}>{folder?.name}</span>
        </Link>
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