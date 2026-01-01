import {NextRequest, NextResponse} from "next/server";
import path from "path";
import {streamFile} from "@/lib/localFileHandler";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string }>}) {
  const { path: pathname } = await params
  const filePath = path.join(process.cwd(), 'avatars', pathname)
  console.log(`Requested file: ${filePath}`)
  try {
    const file = await streamFile(filePath, null)
    if (!file) return new NextResponse("File not found", { status: 404 })
    const {stream, fileSize, contentType} = file
    return new NextResponse(stream, {
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
      },
    })
  }  catch (e) {
    console.error("Error serving file:", e)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}