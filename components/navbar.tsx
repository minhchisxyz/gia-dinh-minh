import Image from "next/image"
import Link from "next/link"
import {User} from "lucide-react"


export default function Navbar() {
  return (
      <nav className={'flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50'}>
         <Link href={`/`}>
           <Image loading={`eager`} src={`/logo.png`} alt={`Mchisxyz`} width={50} height={50} className="w-10 h-10 md:w-12.5 md:h-12.5"/>
         </Link>

        <Link
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-gray-100 text-gray-600`}
            href={'/account'}
        >
          <User className="h-5 w-5" />
        </Link>
      </nav>
  )
}
