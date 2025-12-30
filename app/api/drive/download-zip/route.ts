import {NextRequest, NextResponse} from "next/server";
import drive from "@/lib/googleDrive";
import archiver from "archiver";
import {PassThrough, Readable} from "stream";

export async function POST(req: NextRequest) {
    try {
        const { files } = await req.json() as { files: { driveId: string, filename: string }[] };

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        const archive = archiver('zip', {
            zlib: { level: 5 } // Compression level
        });

        const stream = new PassThrough();

        archive.pipe(stream);

        (async () => {
            for (const file of files) {
                try {
                    const response = await drive.files.get(
                        { fileId: file.driveId, alt: "media" },
                        { responseType: "stream" }
                    );

                    archive.append(response.data as Readable, { name: file.filename });
                } catch (e) {
                    console.error(`Failed to download file ${file.filename}`, e);
                    archive.append(Buffer.from(`Failed to download: ${e}`), { name: `${file.filename}.error.txt` });
                }
            }
            await archive.finalize();
        })().catch(err => {
             console.error("Archiver error", err);
             archive.abort();
        });

        const readableStream = new ReadableStream({
            start(controller) {
                stream.on('data', chunk => controller.enqueue(chunk));
                stream.on('end', () => controller.close());
                stream.on('error', err => controller.error(err));
            }
        });

        return new NextResponse(readableStream, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": 'attachment; filename="download.zip"'
            }
        });

    } catch (e) {
        console.error("Zip download error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
