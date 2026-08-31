/** Maior lado da imagem enviada para a IA. Uma nota fiscal continua legível
 *  nesse tamanho e o upload cabe folgado no limite do servidor. */
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.82;

/** Tira o cabeçalho "data:image/jpeg;base64," que o canvas devolve. */
export function stripDataUrlPrefix(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
}

export function fitWithin(width: number, height: number, maxSide = MAX_SIDE): { width: number; height: number } {
  const largest = Math.max(width, height);
  if (largest <= maxSide) return { width, height };
  const ratio = maxSide / largest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

export interface PreparedImage {
  base64: string;
  mediaType: string;
}

/** Reduz a foto no próprio celular antes de subir: foto de iPhone tem uns 4 MB
 *  e subir isso em rede móvel é lento (e o servidor recusa). */
export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Não foi possível processar a imagem neste navegador.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return {
    base64: stripDataUrlPrefix(canvas.toDataURL("image/jpeg", JPEG_QUALITY)),
    mediaType: "image/jpeg",
  };
}
