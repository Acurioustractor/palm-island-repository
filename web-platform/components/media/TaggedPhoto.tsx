import Image from 'next/image';
import type { ELPhoto } from '@/lib/media/el-photos';

/**
 * Consent-aware photo for the PICC web platform. Matches the React PDF
 * TaggedPhoto contract. Any ELPhoto passed in has already cleared
 * elder_approved + consent_obtained server-side in EL v2. When no photo is
 * available for the slot, renders a neutral placeholder — never substitutes
 * an unapproved image.
 */

interface TaggedPhotoProps {
  photo: ELPhoto | null;
  className?: string;
  mode?: 'cultural' | 'editorial' | 'operational';
  sizes?: string;
  priority?: boolean;
  fallbackLabel?: string;
}

export function TaggedPhoto({
  photo,
  className = '',
  mode = 'editorial',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  fallbackLabel = 'Photo pending cultural approval',
}: TaggedPhotoProps) {
  if (!photo?.url) {
    return (
      <figure
        className={`flex items-center justify-center bg-[#F7F6F4] border border-dashed border-[#E8E6E3] aspect-[3/2] ${mode === 'operational' ? 'rounded-lg' : ''} ${className}`}
      >
        <span className="text-xs uppercase tracking-widest text-[#A39E99]">
          {fallbackLabel}
        </span>
      </figure>
    );
  }

  const caption = photo.caption ?? photo.alt_text ?? null;
  const rounded = mode === 'operational' ? 'rounded-lg' : '';

  return (
    <figure className={className}>
      <div className={`relative aspect-[3/2] overflow-hidden ${rounded}`}>
        <Image
          src={photo.url}
          alt={photo.alt_text ?? caption ?? ''}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
      {mode === 'editorial' && (caption || photo.attribution) && (
        <figcaption className="mt-2 text-sm italic text-[#6B6560]">
          {caption}
          {photo.attribution && <span> — {photo.attribution}</span>}
        </figcaption>
      )}
    </figure>
  );
}
