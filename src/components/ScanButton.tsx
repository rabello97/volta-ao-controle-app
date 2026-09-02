import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useScanImage } from "@/hooks/useAI";
import { prepareImageForUpload } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { ScanResult } from "@/api/types";

interface ScanButtonProps {
  onScanned: (result: ScanResult) => void;
  className?: string;
  label?: string;
}

/** Foto do cupom ou print da notificação do banco. `capture="environment"` faz
 *  o iOS abrir a câmera direto; na galeria o usuário escolhe o print. */
export function ScanButton({ onScanned, className, label = "Escanear nota ou print" }: ScanButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const scan = useScanImage();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { base64, mediaType } = await prepareImageForUpload(file);
      const result = await scan.mutateAsync({ imageBase64: base64, mediaType });
      if (!result.encontrou) {
        toast.error(result.observacao || "Não achei uma compra nessa imagem.");
        return;
      }
      onScanned(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não consegui ler essa imagem.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={cn(
          "flex flex-none items-center gap-2 whitespace-nowrap rounded-[10px] border border-divider bg-surface px-3 py-2 text-[13px] text-text-3 transition-colors hover:text-text disabled:opacity-60",
          className,
        )}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        {busy ? "Lendo..." : label}
      </button>
    </>
  );
}
