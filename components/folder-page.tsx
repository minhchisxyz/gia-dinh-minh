'use client'

import FolderCard from "@/components/folder-card";
import Sidebar, {SidebarContent} from "@/components/sidebar";
import {Folder} from "@/lib/definitions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Fragment, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import FileCard from "@/components/file-card";
import {CheckSquare, Download, EllipsisVertical, Menu, Trash2, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {getFilesForDownload, deleteItems} from "@/lib/actions/files";
import {toast} from "sonner";
import {useIsMobile} from "@/hooks/use-mobile";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer";

export default function FolderPage(
    { folder, folderPath }: {
      folder: Folder,
      folderPath: { name: string, href: string}[]
    }
) {
  const pathname = usePathname()
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])
  const [selectedFolders, setSelectedFolders] = useState<number[]>([])
  const isActive = (href: string) => pathname === href
  const hasSelection = selectedFiles.length > 0 || selectedFolders.length > 0
  const isMobile = useIsMobile()

  const clearSelection = () => {
    setSelectedFiles([])
    setSelectedFolders([])
  }

  const selectAll = () => {
    setSelectedFiles(folder?.files?.map(file => file.id) || [])
    setSelectedFolders(folder?.subfolders?.map(folder => folder.id) || [])
  }

  const handleDownload = async () => {
    const toastId = toast.loading('Đang chuẩn bị tải xuống...')
    try {
      const files = await getFilesForDownload(selectedFiles, selectedFolders)

      if (isMobile) {
        let count = 0
        for (const file of files) {
          toast.loading(`Đang tải ${count + 1}/${files.length}: ${file.filename}`, { id: toastId })
          const link = document.createElement('a')
          link.href = `/api/drive/download/${file.driveId}`
          link.download = file.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          await new Promise(resolve => setTimeout(resolve, 1000))
          count++
        }
        toast.success('Đã tải xuống tất cả tệp tin', { id: toastId })
      } else {
        toast.loading('Đang nén tệp tin...', { id: toastId })
        const response = await fetch('/api/drive/download-zip', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ files })
        })

        if (!response.ok) throw new Error('Download failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'download.zip'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success('Đã tải xuống tệp nén', { id: toastId })
      }

      clearSelection()
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi tải xuống', { id: toastId })
    }
  }

  const handleDelete = async () => {
    const toastId = toast.loading('Đang xoá...')
    try {
      const result = await deleteItems(selectedFiles, selectedFolders)
      if (result.success) {
        toast.success('Đã xoá thành công', { id: toastId })
        clearSelection()
      } else {
        toast.error('Có lỗi xảy ra khi xoá', { id: toastId })
      }
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi xoá', { id: toastId })
    }
  }

  return (
      <div className={`flex h-full`}>
        <Sidebar/>
        <div className={`flex-1 overflow-y-auto p-6 bg-white`}>
          <div className={`flex flex-col gap-5`}>
            <div className="flex items-center gap-2">
              {isMobile && (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="icon" className="md:hidden shrink-0 mr-2">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-[80vh]">
                      <DrawerHeader>
                        <DrawerTitle>Menu</DrawerTitle>
                      </DrawerHeader>
                      <SidebarContent />
                    </DrawerContent>
                  </Drawer>
              )}
              <Breadcrumb>
                <BreadcrumbList>
                  {
                    folderPath.map((folder, index) => (
                        <Fragment key={index}>
                          <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                              <Link className={isActive(folder.href) ? 'text-gray-800' : ''} href={folder.href}>
                                { folder.name }
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index < folderPath.length - 1 && (<BreadcrumbSeparator/>)}
                      </Fragment>
                    ))
                  }
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className={`h-10`}>
              {hasSelection && (
                  <div className={`h-full w-fit bg-blue-100 rounded-3xl flex gap-2 items-center p-2 pr-4`}>
                    <Button onClick={clearSelection} variant={`outline`} className={`rounded-full bg-transparent border-none shadow-none hover:bg-blue-200 h-8 w-8 p-0`}>
                      <X size={18}/>
                    </Button>
                    <div className="text-sm font-medium text-blue-900">Đã chọn {selectedFiles.length + selectedFolders.length}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <EllipsisVertical className={`hover:bg-blue-200 rounded-full p-1`}/>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className={`w-36`} align={`start`} side={`right`}>
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={selectAll}>
                            Chọn tất cả
                            <DropdownMenuShortcut>
                              <CheckSquare/>
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleDownload}>
                            Tải xuống
                            <DropdownMenuShortcut>
                              <Download/>
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator/>
                          <DropdownMenuItem onClick={handleDelete}>
                            Xoá
                            <DropdownMenuShortcut>
                              <Trash2/>
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
              )}
            </div>
            <div className={`flex gap-4 items-center flex-wrap`}>
              {
                folder?.subfolders?.map((folder, index) => (
                    <FolderCard
                        key={index}
                        folder={folder}
                        isSelected={selectedFolders.includes(folder.id)}
                        hasSelection={hasSelection}
                        setSelectedFoldersAction={setSelectedFolders}
                    />
                ))
              }
            </div>
            <div className={`flex gap-4 items-center flex-wrap`}>
              {
                folder?.files?.map((file, index) => (
                    <FileCard
                        key={index}
                        file={file}
                        isSelected={selectedFiles.includes(file.id)}
                        hasSelection={hasSelection}
                        setSelectedFilesAction={setSelectedFiles}
                    />
                ))
              }
            </div>
          </div>
        </div>
      </div>
  )
}