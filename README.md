# Summary

- A light-weight solution to manage audio tracks and captions in front-end web projects.
- Provides handy custom react hooks to listen to audio tracks' state and captions.

# Demo

- https://react-audio-tracks.vercel.app/

# Demo source code

- Refer to the [Git repo](https://github.com/AndyLeezard/react-audio-tracks/tree/master/example)

# Example

Initialize the main class `RATM` (React Audio Track Manager) with parameters.

```javascript
import { RATM } from "react-audio-tracks"
import Subtitles from "./Subtitles.json"

RATM.initialize({
  debug: true,
  subtitlesJSON: Subtitles,
  trackLength: 3,
  masterVolume: 0.7,
  defaultAudioOptions: {
    locale: "fr",
  },
  fallbackLocale: "fr",
  supportedLocales: ["en", "fr", "ko"],
})

//recommended settings for tracks
RATM.updateAllTracks({ autoPlay: true, allowDuplicates: true })
```

Example using the custom react hook

```javascript
import React, { useEffect, useRef } from "react"
import {
  RATM,
  useAudiotracks,
  useTrackStream,
} from "react-audio-tracks"

const TestScreen = () => {
  // listen to the global state
  const state = useAudiotracks()

  // listen to the individual track stream state of the track index #0
  const [stream, trackInstance] = useTrackStream(0)
  const audioRef = useRef<Array<HTMLAudioElement | null>>([])

  useEffect(() => {
    if (state) {
      const { tracks, masterVolume, globalMuted, ...rest } = state
      // state of every tracks
      tracks.forEach((track, idx) => {
        const { queue, isPlaying, volume, muted } = track
        // same thing as `trackInstance.getState()`
        console.log(
          `Track [${idx}] - volume: ${volume} muted: ${muted} is ${
            isPlaying ? "playing" : "not playing"
          }`
        )
      })
    }
  }, [state])

  useEffect(() => {
    if (stream) {
      const { caption, audioItemState, innerAudioState } = stream
      if (caption) {
        console.log(`Track [#0] is displaying caption: ${caption.text}`)
      }
      const currentAudioState = audioItemState
      // same thing as `trackInstance?.getCurrentAudio()`

      const nextAudioState = trackInstance?.getNextAudio()
      // state of the AudioItem class
      if (currentAudioState) {
        const { src, filename, paused, ended, started } = currentAudioState
        console.log(
          `Track [#0] is currently playing audio item state ${JSON.stringify(
            currentAudioState
          )}`
        )
      }
      if (nextAudioState) {
        const { src, filename, paused, ended, started } = nextAudioState
        console.log(
          `Track [#0]'s current audio item state ${JSON.stringify(
            nextAudioState
          )}`
        )
      }
      // state of the inner HTMLAudioElement
      if (innerAudioState) {
        console.log(
          `Track [#0]'s inner HTMLAudioElement state ${JSON.stringify(
            innerAudioState
          )}`
        )
      }
    }
  }, [stream])

  const loopAudioOnTrack0 = () => {
    RATM.purgeTrack(0)
    RATM.registerAudio("/audios/drumline1.mp3", {
      trackIdx: 0,
      onPlay: () => {
        console.log("Drumline part 1 started")
      },
      onEnd: () => {
        console.log("Drumline part 1 ended")
      },
    })
    RATM.registerAudio("/audios/drumline2.mp3", {
      trackIdx: 0,
      loop: true,
      onPlay: () => {
        console.log("Drumline part 2 started")
      },
    })
  }

  const playAudioOnTrack1 = () => {
    RATM.registerAudio("/audios/bassline1.mp3", {
      trackIdx: 1,
      onEnd: () => {
        console.log("Bassline ended")
      },
    })
  }

  const playWithoutTrack = () => {
    // not assigning any tracks
    const audio: HTMLAudioElement = RATM.playAudio(
      "/audios/guitar1.mp3",
      {
        onEnd: () => {
          audioRef.current[0] = null
        },
      }
    )
    audioRef.current[0] = audio
  }

  const pauseTrack = () => {
    trackInstance?.togglePlay(false)
  }

  const resumeTrack = () => {
    trackInstance?.resumeTrack()
  }

  const playTrack = () => {
    trackInstance?.togglePlay(true)
  }

  const togglePlayTrack = () => {
    trackInstance?.togglePlay()
  }

  const stopGuitar = () => {
    // will stop the audio and leave it to the garbage collector to clean up.
    if (audioRef.current[0]) {
      audioRef.current[0].dispatchEvent(new Event("ended"))
    }
  }

  const changemasterVolume = RATM.setMasterVolume

  return <></>
}
```

# Maintenance

I am using `changeset` to make versioning easier.

```bash
pnpm changeset
```

# How it's made

```bash
pnpm add react
pnpm add -D typescript tsup @types/react @changesets/cli
git init
pnpm run lint
pnpm run build
pnpm changeset init
```

# License

React-audio-track is licensed under the MIT License.
