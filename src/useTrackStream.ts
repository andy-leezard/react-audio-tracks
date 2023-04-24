import { useState, useEffect } from "react"
import AudiotrackManager from "./AudiotrackManager"
import type { TrackStream } from "./types"
import Track from "./Track"

/**
 *
 * @param trackIdx
 * @returns [TrackStream | null, Track | null]
 */
function useTrackStream(trackIdx: number): [TrackStream | null, Track | null] {
  const [stream, setStream] = useState<TrackStream | null>(
    AudiotrackManager.getTrack(trackIdx)?.getStream() ?? null
  )
  const [track, setTrack] = useState<Track | null>(null)

  useEffect(() => {
    const track = AudiotrackManager.getTrack(trackIdx)
    let stream_unsubscribe = () => {}
    if (track) {
      stream_unsubscribe = track.onStreamChange(setStream)
    }
    setTrack(track)
    return () => {
      stream_unsubscribe()
    }
  }, [trackIdx])

  return [stream, track]
}

export default useTrackStream
