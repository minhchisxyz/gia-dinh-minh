import { NextRequest, NextResponse } from "next/server"
import path from "path"
import {streamFile} from "@/lib/localFileHandler";
import Logger from "@/lib/logger";

const LOGGER = new Logger('UPLOADS ROUTE')

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: pathSegments } = await params
    const filePath = path.join(process.cwd(), 'uploads', ...pathSegments)
    try {
        const range = req.headers.get("range")
        if (range) {
            const file = await streamFile(filePath, range)
            if (!file) return new NextResponse("File not found", { status: 404 })
            const {stream, fileSize, contentType, start, end, chunksize} = file
            return new NextResponse(stream, {
                status: 206,
                headers: {
                    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize?.toString() || '',
                    "Content-Type": contentType,
                },
            })
        } else {
            const file = await streamFile(filePath, null)
            if (!file) return new NextResponse("File not found", { status: 404 })
            const {stream, fileSize, contentType} = file
            return new NextResponse(stream, {
                headers: {
                    "Content-Length": fileSize.toString(),
                    "Content-Type": contentType,
                },
            })
        }
    } catch (e) {
        LOGGER.error(`Error serving file: ${e}`)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

