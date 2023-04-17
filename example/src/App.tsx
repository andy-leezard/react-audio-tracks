import React, { ChangeEvent, useEffect, useCallback, useState } from "react"
import { AudioOptions, AudiotrackManager, useAudiotracks } from "react-audio-tracks"
import styled, { keyframes } from "styled-components"
import subtitles from "./subtitles.json"
import {
  BsVolumeMuteFill,
  BsVolumeUpFill,
  BsVolumeDownFill,
  BsPlayFill,
  BsFillPauseFill,
  BsFillSkipForwardFill,
} from "react-icons/bs"
import { TfiLoop } from "react-icons/tfi"
import { GiDrumKit, GiGuitarBassHead, GiChopsticks } from "react-icons/gi"
import { MdQueueMusic } from "react-icons/md"
import { getFileName, getURLParam } from "./utils"

const NUMBER_OF_TRACKS = 3

// This is not systematic. Only for demo purposes.
const MAX_NUMBER_OF_TRACKS = 24

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0px;
  align-items: center;
  background: linear-gradient(#141e30, #243b55);
  overflow: auto;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0rem 1rem 1rem 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  min-width: max(550px, 80dvw);
  margin-top: 2rem;
  margin-bottom: 2rem;
`

const glitch = keyframes`
  40% {
    text-shadow: -0.03rem 0px 2px red, 0.03em 0px 2px cyan;
  }

  42.5% {
    text-shadow: -0.06rem 0px 2px red, 0.06em 0px 2px cyan;
  }

  45% {
    text-shadow: -0.09rem 0px 2px red, 0.09em 0px 2px cyan;
  }

  47.5% {
    text-shadow: -0.012rem 0px 2px red, 0.012em 0px 2px cyan;
  }

  50% {
    text-shadow: 0.09rem 0px 2px red, -0.09em 0px 2px cyan;
  }

  75.5% {
    text-shadow: -0.06rem 0px 2px red, 0.06em 0px 2px cyan;
  }

  100% {
    text-shadow: -0.025rem 0px 2px red, 0.025em 0px 2px cyan;
  }
`

const GlitchedSpan = styled.span`
  text-shadow: -0.03rem 0px 2px red, 0.03em 0px 2px cyan;
  animation: ${glitch} 2s infinite;
  -webkit-animation: ${glitch} 2s infinite;
`

const Title = styled(GlitchedSpan)`
  font-size: 1.5rem;
  align-self: center;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`

const StateViewer = styled.div`
  margin-top: 1rem;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
`

const TrackLineInterface = styled.div`
  align-self: center;
  display: flex;
  padding: 0.5rem;
  border-radius: 8px;
  gap: 0.5rem;
  align-items: center;
  min-height: 3.25rem;
`

const TrackLineContainer = styled(TrackLineInterface)`
  background-color: #333333;
  margin-bottom: 0.5rem;
  text-overflow: ellipsis;
`

interface TrackLineItemProps {
  isLastChild?: boolean
}

const TrackLineItem = styled.div<TrackLineItemProps>`
  display: flex;
  flex-shrink: 0;
  padding-right: 0.5rem;
  border-right: ${(props) => (props.isLastChild ? "0" : "1")}px solid #858585;
  justify-content: center;
  text-align: center;
`

const TrackIndex = styled(TrackLineItem)`
  width: 55px;
`

const Width120 = styled(TrackLineItem)`
  width: 117px;
`

const UserInputItem = styled(TrackLineItem)`
  width: 320px;
`

const TrackMute = styled(TrackLineItem)`
  width: 45px;
`

const TrackMuteInteractable = styled(TrackMute)`
  opacity: 0.75;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

const Width70 = styled(TrackLineItem)`
  width: 70px;
`

const Width70Interactable = styled(Width70)`
  opacity: 0.75;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

const TrackQueue = styled(TrackLineItem)`
  width: 60px;
`

const TrackPlayState = styled(TrackLineItem)`
  width: 60px;
`

const TrackPlayStateInteractable = styled(TrackPlayState)`
  opacity: 0.75;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

const CaptionNarrator = styled(TrackLineItem)`
  width: 80px;
`

const CaptionDescription = styled(TrackLineItem)`
  width: 200px;
`

const CaptionText = styled(TrackLineItem)`
  flex: 1;
  min-width: 200px;
`

const Ellipsis = styled.span`
  max-width: 100%;
  max-height: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

function App() {
  const state = useAudiotracks()
  const [targetTrackIdx, setTargetTrackIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [audioUrls, setAudioUrls] = useState<
    Array<
      AudioOptions & {
        src: string
        filename: string
      }
    >
  >(
    new Array(NUMBER_OF_TRACKS).fill(null).map((_, i) => ({
      trackIdx: i,
      filename: "",
      src: "",
    }))
  )

  useEffect(() => {
    let track_length = getURLParam("t") || NUMBER_OF_TRACKS
    if (typeof track_length === "string") {
      track_length = Number(track_length)
      if (isNaN(track_length)) {
        console.log(
          `invalid track length detected from URL (${getURLParam("t")})`
        )
        track_length = NUMBER_OF_TRACKS
        console.log(
          `setting track length to fallback value (${NUMBER_OF_TRACKS})...`
        )
      } else {
        track_length = Math.min(Math.max(0, track_length), MAX_NUMBER_OF_TRACKS)
        console.log(`track length detected from URL (${track_length})`)
      }
    } else {
      console.log(`Using default track length(${track_length})...`)
    }
    if (isNaN(track_length)) {
      track_length = NUMBER_OF_TRACKS
    } else {
      console.log(`track length detected from URL (${track_length})`)
    }

    AudiotrackManager.initialize({
      debug: import.meta.env.DEV || getURLParam("debug") === "true",
      subtitlesJSON: subtitles,
      number_of_tracks: track_length,
      defaultVolume: 0.5,
      defaultAudioOptions: {
        locale: Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0]!,
      },
      fallbackLocale: "en",
      supportedLocales: ["en", "fr", "ko"],
    })
  }, [])

  useEffect(() => {
    console.log(
      JSON.stringify(
        state.tracks[0].queue.length ? state.tracks[0].queue[0].filename : "--"
      )
    )
  }, [state])

  const handleFileUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>, trackIdx: number) => {
      const file = event.target.files && event.target.files[0]
      if (file && file.type.match("audio.*")) {
        const audioURL = URL.createObjectURL(file)
        setAudioUrls((prev) => {
          const newState = [...prev]
          newState[trackIdx] = {
            ...newState[trackIdx],
            src: audioURL,
            originalFilename: getFileName(file.name),
            onStart: () => console.log(`onStart ${file.name}}`),
            onEnd: () => console.log(`onEnd ${file.name}`),
          }
          return newState
        })
      }
    },
    []
  )

  const playDemo = (src: string) => {
    AudiotrackManager.registerAudio(src, {
      trackIdx: targetTrackIdx,
      autoPlay: autoPlay || state.tracks[targetTrackIdx]?.autoPlay,
    })
  }

  return (
    <Wrapper>
      <Container>
        <Title>React-Audio-Tracks Controller</Title>
        <div
          style={{
            alignSelf: "center",
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            id="checkbox"
            style={{ width: "1.5rem", height: "1.5rem" }}
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
          />
          <label htmlFor="checkbox">Force Autoplay</label>
        </div>
        <select
          name="track #"
          id="track-select"
          style={{ width: "min-width", alignSelf: "center" }}
          onChange={(e) =>
            setTargetTrackIdx(
              isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)
            )
          }
        >
          {state.tracks.map((track, idx) => {
            return (
              <option value={`${idx}`} key={`option-${idx}`}>
                Track #{idx}
              </option>
            )
          })}
        </select>
        <Title>Demo Inputs</Title>
        <div
          style={{
            display: "flex",
            padding: "1rem",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "grid", placeItems: "center" }}>
            <button
              type="button"
              style={{ padding: "0.25rem" }}
              onClick={() => playDemo("/audiosrc/intro.mp3")}
            >
              <GiChopsticks size={36} />
            </button>
            <span>Drumsticks</span>
          </div>
          <div style={{ display: "grid", placeItems: "center" }}>
            <button
              type="button"
              style={{ padding: "0.25rem" }}
              onClick={() => playDemo("/audiosrc/drumbeat_90bpm.wav")}
            >
              <GiDrumKit size={36} />
            </button>
            <span>Drum 1</span>
          </div>
          <div style={{ display: "grid", placeItems: "center" }}>
            <button
              type="button"
              style={{ padding: "0.25rem" }}
              onClick={() => playDemo("/audiosrc/drumbeat2_90bpm.wav")}
            >
              <GiDrumKit size={36} />
            </button>
            <span>Drum 2</span>
          </div>
          <div style={{ display: "grid", placeItems: "center" }}>
            <button
              type="button"
              style={{ padding: "0.25rem" }}
              onClick={() =>
                playDemo("/audiosrc/bass_loop_90bpm_got_to_be_real.mp3")
              }
            >
              <GiGuitarBassHead size={36} />
            </button>
            <span>Bass 1</span>
          </div>
        </div>
        <Title>Controller</Title>
        <TrackLineInterface>
          <TrackIndex>Track #</TrackIndex>
          <TrackQueue>Queued</TrackQueue>
          <TrackMute>Muted</TrackMute>
          <Width70>Vol</Width70>
          <Width70>Looping</Width70>
          <Width70>AutoPlay</Width70>
          <TrackPlayState>State</TrackPlayState>
          <Width70>Skip</Width70>
          <Width120>Currently Playing</Width120>
          <Width120>Next Playing</Width120>
          <UserInputItem isLastChild>User Inputs</UserInputItem>
        </TrackLineInterface>
        {state.tracks.map((track, idx) => {
          return (
            <TrackLineContainer key={`controller-${idx}`}>
              <TrackIndex>#{idx}</TrackIndex>
              <TrackQueue>{track.queue.length}</TrackQueue>
              <TrackMuteInteractable
                onClick={() => {
                  AudiotrackManager.updateTrack(idx, {
                    muted: !track.muted,
                  })
                }}
              >
                {track.muted ? (
                  <BsVolumeMuteFill size={24} style={{ color: "#ff6464" }} />
                ) : track.volume > 0.5 ? (
                  <BsVolumeUpFill size={24} />
                ) : (
                  <BsVolumeDownFill size={24} />
                )}
              </TrackMuteInteractable>
              <Width70>
                <input
                  type="range"
                  style={{ width: "60px" }}
                  value={track.volume}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(e) => {
                    AudiotrackManager.updateTrack(idx, {
                      volume: e.target.valueAsNumber,
                    })
                  }}
                />
              </Width70>
              <Width70Interactable
                onClick={() => {
                  AudiotrackManager.updateTrack(idx, {
                    loop: !track.loop,
                  })
                }}
              >
                <TfiLoop
                  size={24}
                  color={!track.loop ? "#858585" : "#1b9fff"}
                  strokeWidth={track.loop ? 1 : 0}
                />
              </Width70Interactable>
              <Width70Interactable
                onClick={() => {
                  AudiotrackManager.updateTrack(idx, {
                    autoPlay: !track.autoPlay,
                  })
                }}
              >
                <MdQueueMusic
                  size={24}
                  color={!track.autoPlay ? "#858585" : "#1b9fff"}
                />
              </Width70Interactable>
              <TrackPlayStateInteractable
                style={{ pointerEvents: track.queue.length ? "auto" : "none" }}
                onClick={() => {
                  if (track.queue.length) {
                    AudiotrackManager.togglePlayTrack(idx)
                  }
                }}
              >
                {!track.queue.length ||
                !track.isPlaying /* track.queue[0].audio?.paused */ ? (
                  <BsPlayFill
                    size={24}
                    style={{ color: track.queue.length ? "#44c9b0" : "" }}
                  />
                ) : (
                  <BsFillPauseFill size={24} style={{ color: "#ff6464" }} />
                )}
              </TrackPlayStateInteractable>
              <Width70Interactable
                style={{ pointerEvents: track.currentAudio ? "auto" : "none" }}
                onClick={() => {
                  AudiotrackManager.skipAudio(idx)
                }}
              >
                <BsFillSkipForwardFill
                  size={24}
                  color={!track.currentAudio ? "#858585" : "#CCCCCC"}
                />
              </Width70Interactable>
              <Width120>
                <Ellipsis>
                  {getFileName((track.currentAudio?.filename ?? "") || "-")}
                </Ellipsis>
              </Width120>
              <Width120>
                <Ellipsis>
                  {track.queue.length < 1
                    ? "-"
                    : getFileName(
                        track.currentAudio?.filename && track.queue[1]?.filename
                          ? track.queue[1]?.filename
                          : !track.currentAudio?.filename &&
                            track.queue[0]?.filename
                          ? track.queue[0]?.filename
                          : "-"
                      )}
                </Ellipsis>
              </Width120>
              <div
                style={{
                  alignSelf: "center",
                  display: "flex",
                  gap: "1rem",
                  width: "320px",
                }}
              >
                <input
                  style={{ alignSelf: "center" }}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, idx)}
                />
                <button
                  type="button"
                  disabled={!audioUrls[idx].src}
                  onClick={() => {
                    if (audioUrls[idx]) {
                      const { src, ...rest } = audioUrls[idx]
                      AudiotrackManager.registerAudio(audioUrls[idx].src, rest)
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </TrackLineContainer>
          )
        })}
        <Title>Captions</Title>
        <TrackLineInterface style={{ width: "100%" }}>
          <TrackIndex>Track #</TrackIndex>
          <CaptionNarrator>Narrator</CaptionNarrator>
          <CaptionDescription>Description</CaptionDescription>
          <CaptionText>Text</CaptionText>
        </TrackLineInterface>
        {state.tracks.map((track, idx) => {
          return (
            <TrackLineContainer style={{ width: "100%" }} key={`state-${idx}`}>
              <TrackIndex>#{idx}</TrackIndex>
              <CaptionNarrator>
                {(track.caption?.narrator ?? "") || "-"}
              </CaptionNarrator>
              <CaptionDescription>
                {(track.caption?.description ?? "") || "-"}
              </CaptionDescription>
              <CaptionText>{(track.caption?.text ?? "") || "-"}</CaptionText>
            </TrackLineContainer>
          )
        })}
        <StateViewer>
          <GlitchedSpan style={{ marginBottom: "0.5rem" }}>
            State Viewer
          </GlitchedSpan>
          <div
            style={{
              display: "flex",
              flex: 1,
              width: "100%",
              flexDirection: "row",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingRight: "0.25rem",
                flex: 1,
                textAlign: "right",
              }}
            >
              <span>Global Muted:</span>
              <span>Global Volume:</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "0.25rem",
                flex: 1,
              }}
            >
              <span>{JSON.stringify(state.globalMuted)}</span>
              <span>{JSON.stringify(state.globalVolume)}</span>
            </div>
          </div>
        </StateViewer>
        <GlitchedSpan
          style={{
            alignSelf: "center",
            marginTop: "0.75rem",
          }}
        >
          V0.10.0 MIT © 2023{" "}
          <a href="https://github.com/AndyLeezard" target="_blank">
            Andy Lee 🔗
          </a>
        </GlitchedSpan>
        <GlitchedSpan
          style={{
            alignSelf: "center",
          }}
        >
          React-audio-track is licensed under the MIT License.
        </GlitchedSpan>
      </Container>
    </Wrapper>
  )
}

export default App
