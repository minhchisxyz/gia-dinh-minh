'use client'

import Sidebar, {SidebarContent} from "@/components/sidebar";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer";
import {Button} from "@/components/ui/button";
import {
  EllipsisVertical,
  Folder as FolderIcon,
  Heart, Image as ImageIcon,
  Menu, MessageCircle,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {useIsMobile} from "@/lib/hooks/use-mobile";
import UserAvatar from "@/components/user-avatar";

function FolderCardSkeleton() {
  return (
      <div
          className={`flex w-full md:w-64 items-center bg-blue-50 hover:bg-[#e7f0ff] rounded-md p-3 cursor-pointer group`}
      >
        <Link className={`flex-1 flex items-center`} href={`/`}>
          <FolderIcon/>
          <span className={`ml-2 flex-1`}>Đại gia đình</span>
        </Link>
        <EllipsisVertical className={`hover:bg-blue-200 rounded-full p-1`}/>
      </div>
  )
}

function FileCardSkeleton() {
  const year = new Date().getFullYear()
  return (
      <div
          className={`w-full h-72 md:w-64 md:h-64 flex flex-col bg-blue-50 hover:bg-[#e7f0ff] rounded-md p-3 cursor-pointer`}
      >
        <div className={`h-8 flex items-center`}>
          <ImageIcon className={`text-blue-500 fill-blue-50`}/>
          <div className={`ml-2 flex-1 truncate min-w-0`}>
            { year }.luv
          </div>
          <EllipsisVertical className={`hover:bg-blue-200 rounded-full p-1`}/>
        </div>
        <div className="relative flex-1 w-full overflow-hidden rounded-sm bg-gray-300 animate-pulse"/>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-6 h-6">
            <UserAvatar url={`/default-avatar.png`} />
          </div>
          <span className="text-xs text-gray-600 truncate flex-1">luv luv luv</span>
          <div className="flex items-center gap-2 text-gray-500">
            <button className="hover:text-red-500 transition-colors flex items-center gap-1">
              <Heart className={cn("w-5 h-5", "fill-red-500 text-red-500")} />
              <span className="text-xs">{year}</span>
            </button>
            <button
                className="hover:text-blue-500 transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">{year}</span>
            </button>
          </div>
        </div>
      </div>
  )
}

export default function LoadingFolderPage() {
  const isMobile = useIsMobile()
  const year = new Date().getFullYear()
  return (
      <div className={`flex h-full`}>
        <Sidebar comments={[]} folderId={1}/>
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
                      <SidebarContent comments={[]} folderId={1} />
                    </DrawerContent>
                  </Drawer>
              )}
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500 hover:text-red-500 px-2">
                <Heart className={cn("w-4 h-4", "fill-red-500 text-red-500")} />
                <span>{year}</span>
              </Button>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link className={'text-gray-800'} href={'/'}>
                        Đại gia đình
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className={`h-10`}/>
            <div className={`w-full flex gap-4 items-center flex-wrap justify-center md:justify-start`}>
              {
                Array.from({ length: 3 }).map((_, index) => (
                    <FolderCardSkeleton key={index} />
                ))
              }
            </div>
            <div className={`w-full flex gap-4 items-center flex-wrap justify-center md:justify-start`}>
              {
                Array.from({ length: 3 }).map((_, index) => (
                    <FileCardSkeleton key={index} />
                ))
              }
            </div>
          </div>
        </div>
      </div>
  )
}