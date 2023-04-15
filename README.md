# Summary

- A light-weight solution to manage audio tracks and captions in front-end web projects.
- Optimized for React projects.

# example

Initialize `AudioTrackManager` class with parameters.

```javascript
import AudioTrackManager from 'react-audio-tracks'
import Subtitles from './Subtitles.json'

AudioTrackManager.initialize({
    debug: true,
    subtitlesJSON: Subtitles,
    number_of_tracks: 3,
    defaultVolume: 0.7,
    defaultAudioOptions: {
        locale: "fr",
    }
    fallbackLocale: "fr",
    supportedLocales: ["en", "fr", "ko"],
})

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
