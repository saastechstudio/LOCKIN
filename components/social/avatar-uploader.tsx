"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { removeAvatar, updateAvatar } from "@/lib/actions/avatar";

const SIZE = 512;
const ACCEPT = "image/jpeg,image/png,image/webp";

/** Recadre au carré (centre) et réduit à 512 px en JPEG : photo légère, envoi rapide. */
async function toSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    SIZE,
    SIZE,
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/jpeg", 0.85),
  );
}

/** Photo de profil : choisir, recadrer automatiquement, envoyer ; ou retirer. Effet immédiat. */
export function AvatarUploader({
  name,
  avatarUrl,
}: {
  name: string | null;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const blob = await toSquareJpeg(file);
        const formData = new FormData();
        formData.set("avatar", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
        const result = await updateAvatar(formData);
        if (!result.ok) return setError(result.error);
        setCurrent(result.data.avatarUrl);
        router.refresh();
      } catch {
        setError("Impossible de lire cette image. Essaie un autre fichier.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  function onRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeAvatar();
      if (!result.ok) return setError(result.error);
      setCurrent(null);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-5">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-lk-line bg-lk-mist text-2xl font-medium text-lk-black shadow-sm">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- photo hébergée par Clerk, cf. components/ui/avatar.tsx
          <img src={current} alt="Ta photo de profil" className="size-full object-cover" />
        ) : (
          (name ?? "?").charAt(0).toUpperCase()
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Camera /> {isPending ? "Envoi…" : current ? "Changer la photo" : "Ajouter une photo"}
          </Button>
          {current ? (
            <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={onRemove}>
              <Trash2 /> Retirer
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-lk-stone-3">JPEG, PNG ou WebP. Recadrée en carré automatiquement.</p>
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        aria-label="Choisir une photo de profil"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
    </div>
  );
}
