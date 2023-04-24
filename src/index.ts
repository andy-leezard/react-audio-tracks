import useAudiotracks from "./useAudiotracks"
import useTrackStream from "./useTrackStream"
import AudiotrackManager from "./AudiotrackManager"
import type {
  SubtitlesJSON,
  Subtitle,
  AudioCallbacks,
  AudioOptions,
  CaptionState,
  PlayRequestConstructor,
  PlayRequest,
  AudioManagerState,
  AudiotrackManagerSettings,
  MutTrackState,
  TrackState,
  AudioItemState,
  InnerAudioState,
  TrackStream,
} from "./types"

export default AudiotrackManager
export { useAudiotracks, useTrackStream }
export type {
  SubtitlesJSON,
  Subtitle,
  AudioCallbacks,
  AudioOptions,
  CaptionState,
  PlayRequestConstructor,
  PlayRequest,
  AudioManagerState,
  AudiotrackManagerSettings,
  MutTrackState,
  TrackState,
  AudioItemState,
  InnerAudioState,
  TrackStream,
}
