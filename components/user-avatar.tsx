import Image from "next/image"
import {cn} from "@/lib/utils"
export default function UserAvatar({
  url,
  alt,
  className
}: {
  url?: string | null,
  alt?: string,
  className?: string
}) {
  return (
    <div className={cn("relative w-full h-full rounded-full overflow-hidden", className)}>
      <Image
        src={url || "/default-avatar.png"}
        alt={alt || "User Avatar"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        unoptimized
      />
    </div>
  )
}

