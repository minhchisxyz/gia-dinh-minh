'use client'

import Image from "next/image";
import Link from "next/link";
import {logOut} from "@/lib/actions/auth";
import {Button} from "@/components/ui/button";
import {LogOut} from "lucide-react";
import {usePathname} from "next/navigation";

export default function Navbar() {
  const links = [
    {
      href: '/',
      label: 'Trang chính'
    },
    {
      href: '/account',
      label: 'Tài khoản'
    }
  ]
  const pathname = usePathname()
  const isActive = (p: string) => pathname === p
  return (
      <nav className={'flex items-center justify-between px-4 py-2 border-b backdrop-blur-2xl sticky top-0'}>
         <Link href={`/`}>
           <Image loading={`eager`} src={`/logo.png`} alt={`Mchisxyz`} width={50} height={50}/>
         </Link>

        <div className={`flex gap-4`}>
          {
            links.map(link => (
                <Link className={isActive(link.href) ? 'border-b-2 border-b-blue-400' : ''} key={link.href} href={link.href}>
                  { link.label }
                </Link>
            ))
          }
        </div>

        <div>
          <form action={logOut}>
            <Button variant={`outline`} className={`hover:cursor-pointer`}>
              <LogOut/>
            </Button>
          </form>
        </div>
      </nav>
  )
}
