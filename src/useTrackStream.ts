import { useState, useEffect } from "react"
import AudiotrackManager from "./AudiotrackManager"
import type * as T from "./types"
import Track from "./Track"

/**
 *
 * @param trackIdx target track index
 * @param options (Optional, but recommended to provide) This helps updating the hook when the track is expected to be instantiated only after the initial render.
 * @returns [TrackStream | null, Track | null]
 */
function useTrackStream(
  trackIdx: number,
  options?: T.StreamOptions
): [T.TrackStream | null, Track | null] {
  const [stream, setStream] = useState<T.TrackStream | null>(
    AudiotrackManager.getTrack(trackIdx)?.getStream() ?? null
  )
  const [track, setTrack] = useState<Track | null>(
    AudiotrackManager.getTrack(trackIdx) ?? null
  )

  useEffect(() => {
    const disabled = Boolean(options?.disabled)
    let stream_unsubscribe = () => {}
    if (disabled) {
      setStream(null)
      setTrack(null)
    } else {
      const track = AudiotrackManager.getTrack(trackIdx)
      if (track) {
        setStream(track.getStream())
        stream_unsubscribe = track.onStreamChange(setStream)
      }
      setTrack(track)
    }
    return () => {
      stream_unsubscribe()
    }
  }, [trackIdx, options?.key, options?.trackLength, options?.disabled])

  return [stream, track]
}

export default useTrackStream
