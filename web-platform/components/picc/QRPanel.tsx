/**
 * QR code panel — renders a printable / projectable QR for a public URL.
 *
 * Uses api.qrserver.com (no install, no JS — just an <img>). If the
 * service is unreachable, the typed URL stays visible underneath so
 * the audience can still type it in on their phone.
 *
 * Designed for the leader meeting: project this beside /sign-the-vision
 * and Elders + community members can scan and sign from their own
 * phones, in parallel, instead of passing one tablet around.
 */

interface Props {
  url: string
  /** What to call this QR target. */
  label?: string
  /** Pixel size of the QR image. Default 240. */
  size?: number
  /** Foreground colour (hex without #). */
  fg?: string
  /** Background colour. */
  bg?: string
}

export default function QRPanel({
  url,
  label = 'Scan to open',
  size = 240,
  fg = '0B4F6C',
  bg = 'FBF8EE',
}: Props) {
  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?` +
    `data=${encodeURIComponent(url)}&size=${size}x${size}` +
    `&color=${fg}&bgcolor=${bg}&margin=8&qzone=2`

  return (
    <div
      className="rounded-xl border-2 p-5 inline-flex flex-col items-center gap-3"
      style={{ borderColor: '#E8E6E3', backgroundColor: '#fff', width: 'fit-content' }}
    >
      <div
        className="text-[11px] font-bold uppercase tracking-[0.3em]"
        style={{ color: '#8B1A1A' }}
      >
        {label}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrUrl}
        alt={`QR code for ${url}`}
        width={size}
        height={size}
        style={{ display: 'block' }}
      />
      <div className="text-xs font-mono break-all max-w-[240px] text-center" style={{ color: '#6B6560' }}>
        {url}
      </div>
    </div>
  )
}
