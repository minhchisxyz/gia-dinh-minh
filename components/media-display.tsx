import {File} from "@/lib/definitions"

export default function MediaDisplay({ file }: {
  file: File
}) {
  const isVideo = file.mimeType.startsWith('video/')
  return (
      <div className={`flex-1 items-center justify-center`}>
        {isVideo ? (
            <video
                controls
                className="max-h-[90vh] max-w-[80vw] lg:max-h-none lg:max-w-none lg:w-full lg:h-full rounded-lg shadow-2xl"
                autoPlay
            >
              <source src={file.url} type={file.mimeType} />
            </video>
        ) : (
            <img
                src={file.url}
                alt={file.filename}
                className="max-h-[90vh] max-w-[80vw] lg:max-h-none lg:max-w-none lg:w-full lg:h-full object-contain rounded-lg shadow-2xl"
            />
        )}
      </div>
  )
}
