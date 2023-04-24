# Summary

- A light-weight solution to manage audio tracks and captions in front-end web projects.
- Provides handy custom react hooks to listen to audio tracks' state and captions.

# Demo

- https://react-audio-tracks.vercel.app/

# Demo source code

- Refer to the [Git repo](https://github.com/AndyLeezard/react-audio-tracks/tree/master/example)

# Example

Initialize `AudiotrackManager` class with parameters.

```javascript
import AudiotrackManager from "react-audio-tracks"
import Subtitles from "./Subtitles.json"

AudiotrackManager.initialize({
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
```

Example using the custom react hook

```javascript
import React, { useEffect } from "react"
import AudiotrackManager, {
  useAudiotracks,
  useTrackStream,
} from "react-audio-tracks"

const TestScreen = (props) => {
  // listen to the global state
  const state = useAudiotracks()

  // listen to the individual track stream state of the track index #0
  const [stream, trackInstance] = useTrackStream(0)
  const audioRef = useRef < HTMLAudioElement > null

  useEffect(() => {
    if (state) {
      const { tracks, masterVolume, globalMuted, ...rest } = state
      // state of every tracks
      tracks.forEach((track, idx) => {
        const { queue, isPlaying, volume, muted } = track
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
      // state of the AudioItem class
      if (audioItemState) {
        console.log(
          `Track [#0]'s current audio item state ${JSON.stringify(
            audioItemState
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
    AudiotrackManager.purgeTrack(0)
    AudiotrackManager.registerAudio("/audios/drumline1.mp3", {
      trackIdx: 0,
      onStart: () => {
        console.log("Intro drumline started")
      },
      onEnd: () => {
        console.log("Intro drumline ended")
      },
    })
    AudiotrackManager.registerAudio("/audios/drumline2.mp3", {
      trackIdx: 0,
      loop: true,
      onStart: () => {
        console.log("Real drumline started")
      },
    })
  }

  const playAudioOnTrack1 = () => {
    AudiotrackManager.registerAudio("/audios/bassline1.mp3", {
      trackIdx: 1,
      onEnd: () => {
        console.log("Bassline ended")
      },
    })
  }

  const playWithoutTrack = () => {
    // not assigning any tracks
    const audio: HTMLAudioElement = AudiotrackManager.playAudio(
      "/audios/guitar1.mp3",
      {
        onEnd: () => {
          audioRef.current = null
        },
      }
    )
    audioRef.current = audio
  }

  const stopGuitar = () => {
    // will stop the audio and leave it to the garbage collector to clean up.
    if (audioRef.current) {
      audioRef.current?.purge()
      audioRef.current = null
    }
  }

  const changemasterVolume = AudiotrackManager.setMasterVolume

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
V0.11.0 MIT © 2023 Andy Lee 🔗
