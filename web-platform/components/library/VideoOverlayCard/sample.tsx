import { VideoOverlayCard } from './web'

export default function Sample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg w-full">
      <VideoOverlayCard
        eyebrow="Cover loop"
        caption="Many tribes, one people."
        subcaption="60-90s loop · 16:9 · auto-mute"
        surface="shell"
        captionPosition="below"
        tint="education"
      />
      <VideoOverlayCard
        eyebrow="Bwgcolman break"
        caption="What we did this year."
        subcaption="5-8s · 16:9 · text overlay"
        surface="midnight"
        captionPosition="below"
        tint="governance"
      />
      <VideoOverlayCard
        eyebrow="Elder voice"
        caption="On Country, our young people stand straighter."
        subcaption="Aunty Iris May Whitey"
        surface="shell"
        captionPosition="overlay-bottom"
        tint="family"
      />
    </div>
  )
}
