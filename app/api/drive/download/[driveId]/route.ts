import {NextRequest, NextResponse} from "next/server";
import drive from "@/lib/googleDrive";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ driveId: string }> }
) {
  try {
    const {driveId} = await params
    const { data: metadata } = await drive.files.get({
      fileId: driveId,
      fields: "name, mimeType",
    })
    const response = await drive.files.get(
        {fileId: driveId, alt: "media"},
        {responseType: 'stream'}
    )
    const stream = new ReadableStream({
      start(controller) {
        (response.data as any).on("data", (chunk: any) => controller.enqueue(chunk));
        (response.data as any).on("end", () => controller.close());
        (response.data as any).on("error", (err: any) => controller.error(err));
      },
    })
    return new NextResponse(stream, {
      headers: {
        "Content-Disposition": `attachment; filename="${metadata.name}"`,
        "Content-Type": metadata.mimeType || "application/octet-stream",
      },
    })
  } catch (e) {
    console.error("Download error:", e)
    return NextResponse.json({error: e}, {status: 500})
  }
}