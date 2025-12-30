'use client'

import Image from "next/image";
import Link from "next/link";
import {logOut} from "@/lib/actions/auth";
import {Button} from "@/components/ui/button";
import {LogOut, Home, User} from "lucide-react";
import {usePathname} from "next/navigation";

export default function Navbar() {
  const links = [
    {
      href: '/',
      label: 'Trang chính',
      icon: Home
    },
    {
      href: '/account',
      label: 'Tài khoản',
      icon: User
    }
  ]
  const pathname = usePathname()
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname?.startsWith('/folders')
    return pathname?.startsWith(href)
  }
  return (
      <nav className={'flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50'}>
         <Link href={`/`}>
           <Image loading={`eager`} src={`/logo.png`} alt={`Mchisxyz`} width={50} height={50} className="w-10 h-10 md:w-[50px] md:h-[50px]"/>
         </Link>

        <div className={`flex gap-2 md:gap-4`}>
          {
            links.map(link => {
                const Icon = link.icon
                return (
                    <Link
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive(link.href) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        key={link.href}
                        href={link.href}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="hidden md:block font-medium text-sm">{ link.label }</span>
                    </Link>
                )
            })
          }
        </div>

        <div>
          <form action={logOut}>
            <Button variant={`ghost`} size="icon" className={`text-gray-500 hover:text-red-600 hover:bg-red-50`}>
              <LogOut className="h-5 w-5"/>
            </Button>
          </form>
        </div>
      </nav>
  )
}
