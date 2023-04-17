# Summary

- A light-weight solution to manage audio tracks and captions in front-end web projects.
- Provides a handy custom react hook.

# Demo

- Refer to the [Git repo](https://github.com/AndyLeezard/react-audio-tracks/tree/master/example)

# Example

Initialize `AudiotrackManager` class with parameters.

```javascript
import AudiotrackManager from "react-audio-tracks"
import Subtitles from "./Subtitles.json"

AudiotrackManager.initialize({
  debug: true,
  subtitlesJSON: Subtitles,
  number_of_tracks: 3,
  defaultVolume: 0.7,
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
import { useAudiotracks, AudiotrackManager } from "react-audio-tracks"

const TestScreen = (props) => {
  const state = useAudiotracks()
  const audioRef = useRef(null)

  useEffect(() => {
    if (state) {
      const { tracks, globalVolume, globalMuted, ...rest } = state
      tracks.forEach((track, idx) => {
        const { queue, caption, volume, muted } = track
        console.log(`track [${idx}] - volume: ${volume} muted: ${muted}`)
        if (caption?.text) {
          console.log(`caption: ${caption.text}`)
        }
        queue.forEach((audio) => {
          console.log(audio.src)
        })
      })
    }
  }, [state])

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
    const audio = AudiotrackManager.playAudio("/audios/guitar1.mp3", {
      onEnd: () => {
        audioRef.current = null
      },
    })
    audioRef.current = audio
  }

  const stopGuitar = () => {
    // will stop the audio and leave it to the garbage collector to clean up.
    if(audioRef.current){
      audioRef.current?.purge()
      audioRef.current = null
    }
  }

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
