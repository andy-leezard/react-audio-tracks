---
"react-audio-tracks": major
---

First official release with documented class methods. It establishes a clear inheritance of settings between the global options and the individual tracks and audio settings and provides a track-targeted hook for better performance. Warning: It has a lot of backward-incompatible changes with the previous versions.

How to migrate:
    - `AudiotrackManager` is now default-exported
    - Accessing subtitle stream is no longer allowed from the `useAudiotracks` hook to optimize performance on the higher-order parent components. Now listen to the stream (captions and the inner audio states) directly from a child component using `useTrackStream` for a specific track.
    - `number_of_tracks` property is renamed to `trackLength`.
    - `globalVolume` property is renamed to `masterVolume`.
    - `masterVolume` no longer overrides each `Track`'s volume property; it multiplies it instead.

New hook:
    `useTrackStream` will provide a `Track`'s stream state and the instance of itself to access the inner methods such as `getCurrentAudio` or `getNextAudio`. The stream state includes the real-time caption and the inner audio's state.