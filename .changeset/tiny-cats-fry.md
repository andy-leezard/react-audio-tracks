---
"react-audio-tracks": patch
---

New feature - `updateFrequencyMs` option allows you to subscribe to `timeupdate` events at a fixed custom frequency, eliminating device or browser-specific frequency differences that can result in unexpected user experience.
New feature - `onResolve` callback that runs ONLY when the audio has played successfully without error.

New property - `useTrackStream` hook provides a new value `trackIsPlaying`, which is a shortcut for `trackInstance.getState().isPlaying`.
New property - `error` state and `ended` states are separated and distinguished in `AudioItemState`.

+ Minor performance improvements and bug fixes.

