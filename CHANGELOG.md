# react-audio-tracks

## 0.11.5

### Patch Changes

- e8b6e91: 1. Some of the `updateState` method parameters are limited for runtime safety reasons. 2.bugfix: tracks `muted` property wasn't visually updated when `globalMuted` is updated.`

## 0.11.4

### Patch Changes

- fbaa424: bugfix- properly process allowDuplicates option

## 0.11.3

### Patch Changes

- fb97dc3: 1. New methods: - updateAllTracks - getCurrentCaption

  2. Method name change to make it easier to understand: toggleMuteAllSources -> toggleGlobalMute

  3. `globalMuted` now has a priority over `track.muted`

  4. Minor bug fix (registerAudio) -> when trackIdx was not explicitly given, the default track idx (0) was not properly registered.

## 0.11.2

### Patch Changes

- 0a4939d: Improved play latency

## 0.11.1

### Patch Changes

- 3635c51: add demo website for npm repository

## 0.11.0

### Minor Changes

- ef28a56: 1. new features - togglePlayTrack - resumeTrack

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

### Patch Changes

- 5d67506: added and updated example

## 0.10.0

### Minor Changes

- 46ef34a: 1. Now exports types. 2. Updated ReadMe Example code blocks. 3. bugfix: options arguments are now truly optional.

## 0.9.1

### Patch Changes

- efcf17a: A hail-mary pass to publish the library unscoped. Also fixed the branch name of the changeset.
- 73a3850: import refactoring
