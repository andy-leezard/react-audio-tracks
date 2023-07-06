import useAudiotracks from "./useAudiotracks"
import useTrackStream from "./useTrackStream"
import type {
  SubtitlesJSON,
  Subtitle,
  AudioCallbacks,
  AudioOptions,
  CaptionState,
  PlayRequestConstructor,
  PlayRequest,
  AudiotrackManagerState,
  AudiotrackManagerSettings,
  MutTrackState,
  TrackState,
  AudioItemState,
  InnerAudioState,
  TrackStream,
} from "./types"

export { default as RATM } from "./AudiotrackManager"
export { useAudiotracks, useTrackStream }
export type {
  SubtitlesJSON,
  Subtitle,
  AudioCallbacks,
  AudioOptions,
  CaptionState,
  PlayRequestConstructor,
  PlayRequest,
  AudiotrackManagerState,
  AudiotrackManagerSettings,
  MutTrackState,
  TrackState,
  AudioItemState,
  InnerAudioState,
  TrackStream,
}
