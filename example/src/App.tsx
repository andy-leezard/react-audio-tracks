import React, { useEffect, useState } from "react"

// Util
import { getFileName, getURLParam } from "./utils"

// Module
import { RATM, useAudiotracks } from "."
// Module customization
import subtitles from "./subtitles.json"

// UI & Components
import * as Styled from "./UI"
import TrackInterface from "./TrackInterface"
import CaptionViewer from "./CaptionViewer"
import Checkbox from "./Checkbox"
import Footer from "./Footer"

// react-icons
import { GiDrumKit, GiGuitarBassHead, GiChopsticks } from "react-icons/gi"
import AudioRequestHandler from "./audio-request-handler"

const NUMBER_OF_TRACKS = 3

// This is not systematic. Only for demo purposes.
const MAX_NUMBER_OF_TRACKS = 24

function App() {
  const state = useAudiotracks()
  const [targetTrackIdx, setTargetTrackIdx] = useState(0)
  const [globalAutoPlay, setGlobalAutoPlay] = useState(false)
  const [requestMode, setRequestMode] = useState(false)
  const [globalLoop, setGlobalLoop] = useState(false)
  const [globalAllowDuplicates, setGlobalAllowDuplicates] = useState(false)

  useEffect(() => {
    let trackLength = getURLParam("t") || NUMBER_OF_TRACKS
    if (typeof trackLength === "string") {
      trackLength = Number(trackLength)
      if (isNaN(trackLength)) {
        console.log(
          `invalid track length detected from URL (${getURLParam("t")})`
        )
        trackLength = NUMBER_OF_TRACKS
        console.log(
          `setting track length to fallback value (${NUMBER_OF_TRACKS})...`
        )
      } else {
        trackLength = Math.min(Math.max(0, trackLength), MAX_NUMBER_OF_TRACKS)
        console.log(`track length detected from URL (${trackLength})`)
      }
    } else {
      console.log(`Using default track length(${trackLength})...`)
    }
    if (isNaN(trackLength)) {
      trackLength = NUMBER_OF_TRACKS
    } else {
      console.log(`track length detected from URL (${trackLength})`)
    }
    const mylocale = Intl.DateTimeFormat()
      .resolvedOptions()
      .locale.split("-")[0]!
    RATM.initialize({
      debug: import.meta.env.DEV || getURLParam("debug") === "true",
      subtitlesJSON: subtitles,
      trackLength,
      masterVolume: 0.5,
      defaultAudioOptions: {
        locale: mylocale,
      },
      fallbackLocale: "en",
      supportedLocales: ["en", "fr", "ko"],
    })
    RATM.updateAllTracks({ autoPlay: true, allowDuplicates: true })
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
    if (requestMode) {
      RATM.registerPlayRequests([
        {
          src: src,
          trackIdx: targetTrackIdx,
          audioCallbacks: {
            onPlay: () => console.log(`onPlay ${src}`),
            onPause: () => console.log(`onPause ${src}`),
            onEnd: () => console.log(`onEnd ${src}`),
          },
          /**
           * Arbitrary Metadata that can be used to render a custom modal dialog
           */
          metadata: {
            title: getFileName(src),
            description: `Do you want to play ${getFileName(
              src
            )} on the track number ${targetTrackIdx}?`,
            imgsrc: "image",
          },
        },
      ])
    } else {
      RATM.registerAudio(src, {
        trackIdx: targetTrackIdx,
        onPlay: () => console.log(`onPlay ${src}`),
        onPause: () => console.log(`onPause ${src}`),
        onEnd: () => console.log(`onEnd ${src}`),
      })
      /*
       * Feature: Add multiple audios at once
       * RATM.registerAudios([
        [
          src,
          {
            trackIdx: targetTrackIdx,
            onPlay: () => console.log(`onPlay1`),
            onPause: () => console.log(`onPause1`),
            onEnd: () => console.log(`onEnd1`),
          },
        ],
        [
          src,
          {
            trackIdx: targetTrackIdx,
            onPlay: () => console.log(`onPlay2`),
            onPause: () => console.log(`onPause2`),
            onEnd: () => console.log(`onEnd2`),
          },
        ],
      ]) */
    }
  }

  return (
    <Styled.Wrapper>
      <Styled.Container>
        <Styled.Title>React-Audio-Tracks Controller</Styled.Title>
        <div style={{ display: "flex", alignSelf: "center", gap: "1rem" }}>
          <Checkbox
            checked={globalAutoPlay}
            label={"Auto Play"}
            onChange={(checked) => RATM.updateAllTracks({ autoPlay: checked })}
          />
          <Checkbox
            checked={state.globalMuted}
            label={"Global Muted"}
            onChange={RATM.toggleGlobalMute}
          />
          <Checkbox
            checked={globalLoop}
            label={"Global Loop"}
            onChange={(checked) => RATM.updateAllTracks({ loop: checked })}
          />
          <Checkbox
            checked={globalAllowDuplicates}
            label={"Allow Duplicates"}
            onChange={(checked) =>
              RATM.updateAllTracks({ allowDuplicates: checked })
            }
          />
          <Checkbox
            checked={requestMode}
            label={"Request mode"}
            onChange={(checked) => setRequestMode(checked)}
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
              onChange={(e) => RATM.setMasterVolume(e.target.valueAsNumber)}
            />
            <label htmlFor="checkbox">Global Volume</label>
          </div>
        </div>
        <Styled.Title>Demo Inputs</Styled.Title>
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
        <Styled.Title>Controller</Styled.Title>
        <Styled.TrackLineInterface>
          <Styled.TrackIndex>Track #</Styled.TrackIndex>
          <Styled.TrackQueue>Queued</Styled.TrackQueue>
          <Styled.TrackMute>Muted</Styled.TrackMute>
          <Styled.Width70>Vol</Styled.Width70>
          <Styled.Width70>Looping</Styled.Width70>
          <Styled.Width70>AutoPlay</Styled.Width70>
          <Styled.TrackPlayState>State</Styled.TrackPlayState>
          <Styled.Width70>Skip</Styled.Width70>
          <Styled.Width120>Currently Playing</Styled.Width120>
          <Styled.Width120>Next Playing</Styled.Width120>
          <Styled.UserInputItem isLastChild>User Inputs</Styled.UserInputItem>
        </Styled.TrackLineInterface>
        {state.tracks.map((track, idx) => {
          return (
            <TrackInterface
              inheritState={track}
              key={`controller-${track.id}#${idx}`}
              index={idx}
            />
          )
        })}
        <Styled.Title>Captions</Styled.Title>
        <Styled.TrackLineInterface style={{ width: "100%" }}>
          <Styled.TrackIndex>Track #</Styled.TrackIndex>
          <Styled.CaptionNarrator>Metadata</Styled.CaptionNarrator>
          <Styled.CaptionDescription>Description</Styled.CaptionDescription>
          <Styled.CaptionText>Text</Styled.CaptionText>
        </Styled.TrackLineInterface>
        {state.tracks.map((track, idx) => {
          return (
            <CaptionViewer
              inheritState={track}
              key={`state-${track.id}#${idx}`}
              index={idx}
            />
          )
        })}
        <Footer />
      </Styled.Container>
      <AudioRequestHandler />
    </Styled.Wrapper>
  )
}

export default App
