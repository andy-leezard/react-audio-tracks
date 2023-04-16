---
"react-audio-tracks": minor
---

1. new features
    - togglePlayTrack
    - resumeTrack

2. new track props
    - currentAudio: class - AudioItem
    - isPlaying: boolean
    - loop: boolean
    - autoPlay: boolean - will override queue items.autoPlay when changed.

3. deprecated track props (still supported but will be removed)
    - currentlyPlaying: string - use currentAudio instead

4. new audio props
    - autoPlay: boolean - will override track.autoPlay
    - originalFilename