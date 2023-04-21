---
"react-audio-tracks": patch
---

1. New methods:
    - updateAllTracks
    - getCurrentCaption

2. Method name change to make it easier to understand: toggleMuteAllSources -> toggleGlobalMute

3. `globalMuted` now has a priority over `track.muted`

4. Minor bug fix (registerAudio) -> when trackIdx was not explicitly given, the default track idx (0) was not properly registered.
