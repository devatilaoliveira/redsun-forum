export class ImageHandler {
  static async resizeAndCompress(
    file: File,
    maxW = 200,
    maxH = 200,
    maxBytes = 2 * 1024 * 1024,
    mime = "image/jpeg"
  ): Promise<File> {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("canvas ctx");

    try {
      const scale = Math.min(maxW / width, maxH / height, 1);
      const outW = Math.floor(width * scale);
      const outH = Math.floor(height * scale);

      canvas.width = outW;
      canvas.height = outH;
      ctx.drawImage(bitmap, 0, 0, outW, outH);

      let quality = 0.92;
      let blob = await new Promise<Blob>((res) =>
        canvas.toBlob(b => res(b as Blob), mime, quality)
      );

      while (blob.size > maxBytes && quality > 0.3) {
        quality = Math.max(0.3, quality - 0.08);
        blob = await new Promise<Blob>((res) =>
          canvas.toBlob(b => res(b as Blob), mime, quality)
        );
      }

      if (blob.size > maxBytes) {
        const s2 = Math.sqrt(maxBytes / blob.size);
        const w2 = Math.max(1, Math.floor(outW * s2));
        const h2 = Math.max(1, Math.floor(outH * s2));
        canvas.width = w2;
        canvas.height = h2;
        ctx.drawImage(bitmap, 0, 0, w2, h2);
        blob = await new Promise<Blob>((res) =>
          canvas.toBlob(b => res(b as Blob), mime, quality)
        );
      }

      return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    } finally {
      bitmap.close();
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}
