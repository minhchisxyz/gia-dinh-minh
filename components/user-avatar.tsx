import Image from "next/image";

export default function UserAvatar({
  url
}: {
  url?: string | null
}) {
  return (
    <div className="relative w-full h-full rounded-full overflow-hidden">
      <Image
        src={url || "/default-avatar.png"}
        alt="Gia Đình mình"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

