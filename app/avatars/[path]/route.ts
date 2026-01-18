import {NextRequest, NextResponse} from "next/server";
import path from "path";
import {streamFile} from "@/lib/localFileHandler";
import Logger from "@/lib/logger";

const LOGGER = new Logger('AVATARS ROUTE')

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string }>}) {
  const { path: pathname } = await params
  const filePath = path.join(process.cwd(), 'avatars', pathname)
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
  } catch (e) {
    LOGGER.error(`Error serving file: ${e}`)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}