'use client'

import FolderCard from "@/components/folder-card";
import Sidebar from "@/components/sidebar";
import {Folder} from "@/lib/definitions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Fragment} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import FileCard from "@/components/file-card";

export default function FolderPage(
    { folder, folderPath }: {
      folder: Folder,
      folderPath: { name: string, href: string}[]
    }
) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href
  return (
      <div className={`flex h-screen overflow-hidden`}>
        <Sidebar/>
        <div className={`flex-1 overflow-y-auto p-6 bg-white`}>
          <div className={`flex flex-col gap-5`}>
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
            <div className={`flex gap-4 items-center flex-wrap`}>
              {
                folder?.subfolders?.map((folder, index) => (
                    <FolderCard key={index} folder={folder}/>
                ))
              }
            </div>
            <div className={`flex gap-4 items-center flex-wrap`}>
              {
                folder?.files?.map((file, index) => (
                    <FileCard key={index} file={file}/>
                ))
              }
            </div>
          </div>
        </div>
      </div>
  )
}