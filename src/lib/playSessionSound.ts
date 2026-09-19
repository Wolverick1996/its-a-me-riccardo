import { useVolumeStore } from "@/store/useVolumeStore";

/** Plays one of the session flow's chimes (login/logon/startup/shutdown) at the tray's current volume. `onEnded` fires once the chime actually finishes playing; `onUnplayed` fires instead, immediately, whenever there's no chime to wait for at all (muted, volume at 0, or the browser blocking autoplay) — callers that need to know "nothing is going to finish playing" (e.g. to clear a busy cursor that would otherwise wait forever for an `ended` event that will never come) hook into that rather than `onEnded`. */
export function playSessionSound(
  src: string,
  {
    onEnded,
    onUnplayed,
  }: { onEnded?: () => void; onUnplayed?: () => void } = {},
) {
  const { volume, muted } = useVolumeStore.getState();
  if (muted || volume <= 0) {
    onUnplayed?.();
    return;
  }
  const audio = new Audio(src);
  audio.volume = volume / 100;
  if (onEnded) audio.addEventListener("ended", onEnded, { once: true });
  void audio.play().catch(() => {
    onUnplayed?.();
  });
}
