export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_INPUT_BYTES = 10 * 1024 * 1024;

/** يتحقق من الملف قبل الرفع. يرجع رسالة خطأ بالعربية أو null إن كان سليماً. */
export function validateReceipt(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "الصيغة غير مدعومة. ارفع صورة بصيغة JPG أو PNG أو WebP.";
  if (file.size > MAX_INPUT_BYTES) return "حجم الصورة كبير (أكثر من 10 ميجابايت). اختر صورة أصغر.";
  return null;
}

/**
 * يصغّر الصورة (حتى 1600px) ويحوّلها JPEG لتخفيف الحجم قبل الرفع.
 * إن فشل التصغير نرفع الملف الأصلي كما هو.
 */
export async function compressImage(file: File, maxSide = 1600, quality = 0.85): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
