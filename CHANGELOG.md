# react-audio-tracks

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
