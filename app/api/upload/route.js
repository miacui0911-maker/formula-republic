import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { NextResponse } from "next/server";

// 配置 API 路由以支持大文件上传
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "500mb", // 支持最大 500MB 单文件
    },
  },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const chunkIndex = formData.get("chunkIndex");
    const totalChunks = formData.get("totalChunks");
    const fileId = formData.get("fileId");

    if (!file || chunkIndex === null || totalChunks === null || !fileId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 验证文件大小（单个块不超过 100MB）
    const maxChunkSize = 100 * 1024 * 1024;
    if (file.size > maxChunkSize) {
      return NextResponse.json(
        { error: `Chunk too large. Max: ${maxChunkSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 将文件转换为 Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成临时路径（用于分块存储）
    const chunkPath = `temp/${fileId}/chunk-${chunkIndex}`;
    const storageRef = ref(storage, chunkPath);

    // 上传分块
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
      metadata: {
        chunkIndex: String(chunkIndex),
        totalChunks: String(totalChunks),
        originalName: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      chunkIndex: parseInt(chunkIndex),
      totalChunks: parseInt(totalChunks),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
