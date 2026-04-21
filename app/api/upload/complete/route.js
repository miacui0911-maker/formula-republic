import { ref, getBytes, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileId, fileName, totalChunks, fileType } = body;

    if (!fileId || !fileName || !totalChunks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 获取所有分块并合并
    const chunks = [];
    for (let i = 0; i < totalChunks; i++) {
      try {
        const chunkRef = ref(storage, `temp/${fileId}/chunk-${i}`);
        const chunkBytes = await getBytes(chunkRef);
        chunks.push(new Uint8Array(chunkBytes));
      } catch (error) {
        console.error(`Failed to retrieve chunk ${i}:`, error);
        throw new Error(`Missing chunk ${i}`);
      }
    }

    // 合并所有分块
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const mergedArray = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      mergedArray.set(chunk, offset);
      offset += chunk.length;
    }

    // 上传合并后的文件到最终位置
    const finalPath = `images/${Date.now()}-${fileName}`;
    const finalRef = ref(storage, finalPath);
    await uploadBytes(finalRef, mergedArray, {
      contentType: fileType,
    });

    // 获取下载 URL
    const downloadUrl = await getDownloadURL(finalRef);

    // 清理临时分块
    for (let i = 0; i < totalChunks; i++) {
      try {
        const chunkRef = ref(storage, `temp/${fileId}/chunk-${i}`);
        await deleteObject(chunkRef);
      } catch (error) {
        console.warn(`Failed to delete temp chunk ${i}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      url: downloadUrl,
      message: "Upload completed successfully",
    });
  } catch (error) {
    console.error("Completion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete upload" },
      { status: 500 }
    );
  }
}
