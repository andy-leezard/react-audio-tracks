# react-audio-tracks

## 1.2.4

### Patch Changes

- 37009bd: New feature - `updateFrequencyMs` option allows you to subscribe to `timeupdate` events at a fixed custom frequency, eliminating device or browser-specific frequency differences that can result in unexpected user experience.
  New feature - `onResolve` callback that runs ONLY when the audio has played successfully without error.

  New property - `useTrackStream` hook provides a new value `trackIsPlaying`, which is a shortcut for `trackInstance.getState().isPlaying`.
  New property - `error` state and `ended` states are separated and distinguished in `AudioItemState`.

  - Minor performance improvements and bug fixes.

## 1.2.3

### Patch Changes

- 22fe772: Fix RegistrationArgTuple export (2)

## 1.2.2

### Patch Changes

- 578d7d4: Fix type export: RegistrationArgTuple

## 1.2.1

### Patch Changes

- c7527b7: Add feature: control individual tracks' playback rate value

## 1.2.0

### Minor Changes

- 1d2a29f: Better support parameter types for `registerAudio` and `registerAudios` method.
  Breaking change: the parameter for registerAudios has changed from one array of arguments to the enumerated classic list of arguments for flexibility and readibility.

## 1.1.1

### Patch Changes

- 0c63ac7: New track method: `isPlaying()` and `pauseTrack()` which is a shortcut of `getState().isPlaying` and `togglePlay(false)`. Also clarified the ts docs for `togglePlay()` method.

## 1.1.0

### Minor Changes

- f6dd883: Default export changed into a named export (RATM). Also this version introduces the expandable real-time metadata updates (previously limited to 'narrator' metadata.)

### Patch Changes

- Updated dependencies [f6dd883]
  - react-audio-tracks@1.1.0

## 1.0.10

### Patch Changes

- 0517bd5: Added feature: register multiple audios at once

## 1.0.9

### Patch Changes

- 0a3e78d: Fixed omitted metadata bug related to registering play requests. Also added audio callbacks to play requests.

## 1.0.8

### Patch Changes

- e9ac8cc: Allow updating locale while rendering captions.

## 1.0.7

### Patch Changes

- b79d4f7: Stability update: Automatically reconstruct tracks with inherited locale (and other default audio options) on creation

## 1.0.6

### Patch Changes

- 6a87581: Type updates and documentation typo fixes.

## 1.0.5

### Patch Changes

- 97ef2ac: Important bugfix - Initial track properties were reassigned to undefined if options were not explicitly given.

## 1.0.4

### Patch Changes

- 5dfd325: 1. accept string as `useTrackStream` hook's `key` option 2. audio options inheritance related bugfix

## 1.0.3

### Patch Changes

- 5ff4bf1: 1. Jitsi-related type name changes to make it easier to understand.

  2. Type name change (`AudioManagerState` => `AudiotrackManagerState`)

  3. Dynamic optimization of the hook `useTrackStream` with various options

## 1.0.2

### Patch Changes

- d6c7dfb: bugfix: false negative if statement in `Track.applyMasterVolume` method.

## 1.0.1

### Patch Changes

- d4e7035: changing `autoPlay` settings of an idle track will automatically trigger `play`.

## 1.0.0

### Major Changes

- 1bb9ee2: First official release with documented class methods. It establishes a clear inheritance of settings between the global options and the individual tracks and audio settings and provides a track-targeted hook for better performance. Warning: It has a lot of backward-incompatible changes with the previous versions.

  How to migrate: - `AudiotrackManager` is now default-exported - Accessing subtitle stream is no longer allowed from the `useAudiotracks` hook to optimize performance on the higher-order parent components. Now listen to the stream (captions and the inner audio states) directly from a child component using `useTrackStream` for a specific track. - `number_of_tracks` property is renamed to `trackLength`. - `globalVolume` property is renamed to `masterVolume`. - `masterVolume` no longer overrides each `Track`'s volume property; it multiplies it instead.

  New hook:
  `useTrackStream` will provide a `Track`'s stream state and the instance of itself to access the inner methods such as `getCurrentAudio` or `getNextAudio`. The stream state includes the real-time caption and the inner audio's state.

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
