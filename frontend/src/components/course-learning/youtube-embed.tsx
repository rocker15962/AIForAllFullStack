'use client'

import { useEffect, useRef } from 'react'
import { hasReachedStartThreshold } from '@/lib/learning-rules'

interface YouTubeEmbedProps {
  videoId: string
  /** Video length in seconds from the course; the player's own length is used when 0. */
  durationSeconds?: number
  /** Called once when playback reaches 10% of the video (BR-17). */
  onStartThresholdReached?: () => void
}

// Minimal typing for the YouTube IFrame Player API (https://developers.google.com/youtube/iframe_api_reference)
interface YTPlayer {
  getCurrentTime(): number
  getDuration(): number
}
interface YTNamespace {
  Player: new (
    element: HTMLIFrameElement,
    options: { events?: { onStateChange?: (event: { data: number }) => void } },
  ) => YTPlayer
  PlayerState: { PLAYING: number }
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YTNamespace> | null = null

function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT) resolve(window.YT)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)
  })
  return apiPromise
}

export function YouTubeEmbed({
  videoId,
  durationSeconds = 0,
  onStartThresholdReached,
}: YouTubeEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const callbackRef = useRef(onStartThresholdReached)
  const durationRef = useRef(durationSeconds)

  useEffect(() => {
    callbackRef.current = onStartThresholdReached
    durationRef.current = durationSeconds
  }, [onStartThresholdReached, durationSeconds])

  // Track playback position to detect the 10% start threshold.
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setInterval> | undefined
    let fired = false

    function stopPolling() {
      if (timer) clearInterval(timer)
      timer = undefined
    }

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !iframeRef.current) return
        const player: YTPlayer = new YT.Player(iframeRef.current, {
          events: {
            onStateChange: (event) => {
              if (fired || event.data !== YT.PlayerState.PLAYING) {
                stopPolling()
                return
              }
              if (timer) return
              timer = setInterval(() => {
                const length = durationRef.current || player.getDuration()
                if (hasReachedStartThreshold(player.getCurrentTime(), length)) {
                  fired = true
                  stopPolling()
                  callbackRef.current?.()
                }
              }, 1000)
            },
          },
        })
      })
      .catch(() => {
        // Without the API the video still plays; only the start tracking is skipped.
      })

    return () => {
      cancelled = true
      stopPolling()
    }
  }, [videoId])

  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-zinc-900">
      <iframe
        key={videoId}
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
        title="YouTube 影片播放器"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  )
}
