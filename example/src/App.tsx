import React, { useEffect, useState } from "react"
import subtitles from "./subtitles.json"
import { GiDrumKit, GiGuitarBassHead, GiChopsticks } from "react-icons/gi"
import { getURLParam } from "./utils"
import * as UI from "./UI"
import TrackInterface from "./TrackInterface"
import CaptionViewer from "./CaptionViewer"
import AudiotrackManager, { useAudiotracks } from "."
import Checkbox from "./Checkbox"

const NUMBER_OF_TRACKS = 3

// This is not systematic. Only for demo purposes.
const MAX_NUMBER_OF_TRACKS = 24

function App() {
  const state = useAudiotracks()
  const [targetTrackIdx, setTargetTrackIdx] = useState(0)
  const [globalAutoPlay, setGlobalAutoPlay] = useState(false)
  const [globalLoop, setGlobalLoop] = useState(false)
  const [globalAllowDuplicates, setGlobalAllowDuplicates] = useState(false)

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
    const mylocale = Intl.DateTimeFormat()
    .resolvedOptions()
    .locale.split("-")[0]!
    AudiotrackManager.initialize({
      debug: import.meta.env.DEV || getURLParam("debug") === "true",
      subtitlesJSON: subtitles,
      trackLength: track_length,
      masterVolume: 0.5,
      defaultAudioOptions: {
        locale: mylocale,
      },
      fallbackLocale: "en",
      supportedLocales: ["en", "fr", "ko"],
    })
    AudiotrackManager.updateAllTracks({ autoPlay: true, allowDuplicates: true })
  }, [])

  useEffect(() => {
    /* state.tracks.forEach((track) => {
      console.log(track)
    }) */
    const _globalAutoPlay = state.tracks.every((track) => track.autoPlay)
    if (globalAutoPlay !== _globalAutoPlay) {
      setGlobalAutoPlay(_globalAutoPlay)
    }
    const _globalAllowDuplicates = state.tracks.every(
      (track) => track.allowDuplicates
    )
    if (globalAllowDuplicates !== _globalAllowDuplicates) {
      setGlobalAllowDuplicates(_globalAllowDuplicates)
    }
    const _globalLoop = state.tracks.every((track) => track.loop)
    if (globalLoop !== _globalLoop) {
      setGlobalLoop(_globalLoop)
    }
    console.log(state)
  }, [state])

  const playDemo = (src: string) => {
    AudiotrackManager.registerAudio(src, {
      trackIdx: targetTrackIdx,
      onPlay: () => console.log(`onPlay ${src}`),
      onPause: () => console.log(`onPause ${src}`),
      onEnd: () => console.log(`onEnd ${src}`),
    })
  }

  return (
    <UI.Wrapper>
      <UI.Container>
        <UI.Title>React-Audio-Tracks Controller</UI.Title>
        <div style={{ display: "flex", alignSelf: "center", gap: "1rem" }}>
          <Checkbox
            checked={globalAutoPlay}
            label={"Auto Play"}
            onChange={(checked) =>
              AudiotrackManager.updateAllTracks({ autoPlay: checked })
            }
          />
          <Checkbox
            checked={state.globalMuted}
            label={"Global Muted"}
            onChange={AudiotrackManager.toggleGlobalMute}
          />
          <Checkbox
            checked={globalLoop}
            label={"Global Loop"}
            onChange={(checked) =>
              AudiotrackManager.updateAllTracks({ loop: checked })
            }
          />
          <Checkbox
            checked={globalAllowDuplicates}
            label={"Allow Duplicates"}
            onChange={(checked) =>
              AudiotrackManager.updateAllTracks({ allowDuplicates: checked })
            }
          />
        </div>
        <div style={{ display: "flex", alignSelf: "center", gap: "1rem" }}>
          <div
            style={{
              marginBottom: "1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <input
              type="range"
              value={state.masterVolume}
              min={0}
              max={1}
              step={0.05}
              onChange={(e) =>
                AudiotrackManager.setMasterVolume(e.target.valueAsNumber)
              }
            />
            <label htmlFor="checkbox">Global Volume</label>
          </div>
        </div>
        <UI.Title>Demo Inputs</UI.Title>
        <select
          name="track #"
          id="track-select"
          style={{
            width: "min-width",
            alignSelf: "center",
          }}
          onChange={(e) =>
            setTargetTrackIdx(
              isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)
            )
          }
        >
          {state.tracks.map((track, idx) => {
            return (
              <option value={`${idx}`} key={`option-${track.id}`}>
                Track #{idx}
              </option>
            )
          })}
        </select>
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
        <UI.Title>Controller</UI.Title>
        <UI.TrackLineInterface>
          <UI.TrackIndex>Track #</UI.TrackIndex>
          <UI.TrackQueue>Queued</UI.TrackQueue>
          <UI.TrackMute>Muted</UI.TrackMute>
          <UI.Width70>Vol</UI.Width70>
          <UI.Width70>Looping</UI.Width70>
          <UI.Width70>AutoPlay</UI.Width70>
          <UI.TrackPlayState>State</UI.TrackPlayState>
          <UI.Width70>Skip</UI.Width70>
          <UI.Width120>Currently Playing</UI.Width120>
          <UI.Width120>Next Playing</UI.Width120>
          <UI.UserInputItem isLastChild>User Inputs</UI.UserInputItem>
        </UI.TrackLineInterface>
        {state.tracks.map((track, idx) => {
          return (
            <TrackInterface
              inheritState={track}
              key={`controller-${track.id}#${idx}`}
              index={idx}
            />
          )
        })}
        <UI.Title>Captions</UI.Title>
        <UI.TrackLineInterface style={{ width: "100%" }}>
          <UI.TrackIndex>Track #</UI.TrackIndex>
          <UI.CaptionNarrator>Narrator</UI.CaptionNarrator>
          <UI.CaptionDescription>Description</UI.CaptionDescription>
          <UI.CaptionText>Text</UI.CaptionText>
        </UI.TrackLineInterface>
        {state.tracks.map((track, idx) => {
          return (
            <CaptionViewer
              inheritState={track}
              key={`state-${track.id}#${idx}`}
              index={idx}
            />
          )
        })}
        <UI.GlitchedSpan
          style={{
            alignSelf: "center",
            marginTop: "0.75rem",
          }}
        >
          V1.0.7 MIT © 2023{" "}
          <a href="https://github.com/AndyLeezard" target="_blank">
            Andy Lee 🔗
          </a>
        </UI.GlitchedSpan>
        <UI.GlitchedSpan
          style={{
            alignSelf: "center",
          }}
        >
          React-audio-track is licensed under the MIT License.
        </UI.GlitchedSpan>
      </UI.Container>
    </UI.Wrapper>
  )
}

export default App
