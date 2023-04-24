import React, { ChangeEvent, useCallback, useState } from "react"
import {
  BsVolumeMuteFill,
  BsVolumeUpFill,
  BsVolumeDownFill,
  BsPlayFill,
  BsFillPauseFill,
  BsFillSkipForwardFill,
} from "react-icons/bs"
import * as UI from "./UI"
import { TfiLoop } from "react-icons/tfi"
import { MdQueueMusic } from "react-icons/md"
import { getFileName } from "./utils"
import { useTrackStream } from "."
import type { AudioOptions, TrackState } from "."

type TrackInterfaceProps = {
  inheritState: TrackState
  index: number
}

const TrackInterface = ({ index, inheritState }: TrackInterfaceProps) => {
  const [stream, instance] = useTrackStream(index)
  const [audioUrls, setAudioUrls] = useState<
    AudioOptions & {
      src: string
      filename: string
    }
  >({
    filename: "",
    src: "",
  })

  const handleFileUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files && event.target.files[0]
      if (file && file.type.match("audio.*")) {
        const audioURL = URL.createObjectURL(file)
        setAudioUrls((prev) => ({
          ...prev,
          src: audioURL,
          originalFilename: getFileName(file.name),
          onPlay: () => console.log(`onPlay ${file.name}}`),
          onEnd: () => console.log(`onEnd ${file.name}`),
        }))
      }
    },
    []
  )

  if (!inheritState || !instance) {
    return <></>
  }

  return (
    <UI.TrackLineContainer /* key={`controller-${index}`} */>
      <UI.TrackIndex>#{index}</UI.TrackIndex>
      <UI.TrackQueue>{inheritState.queue.length}</UI.TrackQueue>
      <UI.TrackMuteInteractable
        onClick={() => {
          instance.updateState({
            muted: !inheritState.muted,
          })
        }}
      >
        {inheritState.muted ? (
          <BsVolumeMuteFill size={24} style={{ color: "#ff6464" }} />
        ) : inheritState.volume > 0.5 ? (
          <BsVolumeUpFill size={24} />
        ) : (
          <BsVolumeDownFill size={24} />
        )}
      </UI.TrackMuteInteractable>
      <UI.Width70>
        <input
          type="range"
          style={{ width: "60px" }}
          value={inheritState.volume}
          min={0}
          max={1}
          step={0.05}
          onChange={(e) => {
            instance.updateState({
              volume: e.target.valueAsNumber,
            })
          }}
        />
      </UI.Width70>
      <UI.Width70Interactable
        onClick={() => {
          instance.updateState({
            loop: !inheritState.loop,
          })
        }}
      >
        <TfiLoop
          size={24}
          color={!inheritState.loop ? "#858585" : "#1b9fff"}
          strokeWidth={inheritState.loop ? 1 : 0}
        />
      </UI.Width70Interactable>
      <UI.Width70Interactable
        onClick={() => {
          instance.updateState({
            autoPlay: !inheritState.autoPlay,
          })
        }}
      >
        <MdQueueMusic
          size={24}
          color={!inheritState.autoPlay ? "#858585" : "#1b9fff"}
        />
      </UI.Width70Interactable>
      <UI.TrackPlayStateInteractable
        style={{ pointerEvents: inheritState.queue.length ? "auto" : "none" }}
        onClick={() => {
          if (inheritState.queue.length) {
            instance.togglePlay()
          }
        }}
      >
        {!inheritState.queue.length ||
        !inheritState.isPlaying /* track.queue[0].audio?.paused */ ? (
          <BsPlayFill
            size={24}
            style={{ color: inheritState.queue.length ? "#44c9b0" : "" }}
          />
        ) : (
          <BsFillPauseFill size={24} style={{ color: "#ff6464" }} />
        )}
      </UI.TrackPlayStateInteractable>
      <UI.Width70Interactable
        style={{ pointerEvents: inheritState.isPlaying ? "auto" : "none" }}
        onClick={() => {
          instance.skipAudio()
        }}
      >
        <BsFillSkipForwardFill
          size={24}
          color={!inheritState.isPlaying ? "#858585" : "#CCCCCC"}
        />
      </UI.Width70Interactable>
      <UI.Width120>
        <UI.Ellipsis>
          {getFileName((instance.getCurrentAudio()?.filename ?? "") || "-")}
        </UI.Ellipsis>
      </UI.Width120>
      <UI.Width120>
        <UI.Ellipsis>
          {inheritState.queue.length < 1
            ? "-"
            : getFileName(instance.getNextAudio()?.filename ?? "") || "-"}
        </UI.Ellipsis>
      </UI.Width120>
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
          onChange={(e) => handleFileUpload(e)}
        />
        <button
          type="button"
          disabled={!audioUrls.src}
          onClick={() => {
            if (audioUrls) {
              const { src, ...rest } = audioUrls
              instance.registerAudio(audioUrls.src, rest)
            }
          }}
        >
          Add
        </button>
      </div>
    </UI.TrackLineContainer>
  )
}

export default TrackInterface
