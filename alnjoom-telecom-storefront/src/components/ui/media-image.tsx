import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { isAllowedRemoteImage } from "@/lib/images/media";

export function MediaImage({ src, alt, sizes, priority = false, className = "object-contain" }: { src: string | null | undefined; alt: string; sizes: string; priority?: boolean; className?: string }) {
  if (!isAllowedRemoteImage(src)) {
    return <span className="grid size-full place-items-center bg-surface text-muted"><ImageIcon className="size-9" aria-hidden="true" /><span className="sr-only">{alt}</span></span>;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
}
