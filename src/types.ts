export type ValueOf<T> = T[keyof T]

export type PartiallyRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>

export type SubtitlesJSON = Record<string, Subtitle[]>

export type Listener<T> = (value: T) => void

export type Logger = (message?: any, ...optionalParams: any[]) => void

export type Subtitle = {
  /**
   * Timestamp in seconds
   *
   * Example: 1.45
   */
  from: number
  /**
   * Timestamp in seconds
   *
   * Example: 3.25
   */
  to: number

  /**
   * Required metadata: text body of the subtitle
   *
   * Supporting internationalization
   *
   * Example: { "en":"Hello", "fr": "Bonjour" }
   */
  text:
    | string
    | {
        [locale: string]: string
      }

  /**
   *  Extra metadata: Description of the scene
   *
   *  Supporting internationalization
   *
   *  Example: { "en":"(Footsteps approaching)", "fr": "(Des pas approchent)" }
   */
  description?:
    | string
    | {
        [langID: string]: string
      }
  /**
   * Extra metadata based on the timeline of the audio
   */
  metadata?: Record<string, any>
}

/* callbacks */
export type AudioCallbacks = {
  /** Callback on play */
  onPlay?: () => void | undefined
  /** Callback on play, ONLY once */
  // TODO: Implement this
  /* onFirstPlay?: () => void | undefined */
  /** Callback on audio update */
  onUpdate?: () => void | undefined
  /** Callback on audio pause (use cases of hardware buttons) */
  onPause?: () => void | undefined
  /** Callback on audio end, runs either if the audio was successfully played or was interrupted by an error */
  onEnd?: () => void | undefined
  /** Callback on audio end, runs only if the audio was successfully played */
  onResolve?: () => void | undefined
  /** Callback on audio error */
  onError?: (e: ErrorEvent) => void | undefined
}

// export type AudioCallback<K extends keyof AudioCallbacks> = AudioCallbacks[K]

/**
 * Options used to configure the individual `IAudioItem`'s behavior
 *
 */
export type AudioOptions = {
  /**
   * A float between 0 - 1
   */
  volume?: number

  muted?: boolean

  loop?: boolean

  playbackRate?: number

  // internationalization of subtitles
  locale?: string | undefined

  /**
   * By default, this will be the filename (without extension and path).
   *
   * Make sure that this key exists in the `AudiotrackManager.subtitlesJSON` property or in the custom option `subtitles` you can provide for each audio.
   */
  keyForSubtitles?: string | undefined

  /**
   * Option to override the `AudiotrackManager.subtitlesJSON` property which is the global subtitles reference object.
   */
  subtitles?: Subtitle[] | undefined

  /**
   *  Indicates if the audio should be added if there's another on the queue with the exact same audio source.
   *
   *  If a repetition is what you intend, consider using `loop` instead.
   *
   *  If a recurring soundeffect is what you intend, consider using `AudiotrackManager.playAudio` method instead.
   *
   *  Default: `false`
   */
  allowDuplicates?: boolean

  /**
   * Optional : playing priority order (index)
   *
   * 0 is the top priority -> will skip any current audio if exists
   *
   * If there is an audio currently being played, and you want it to play right after, give 1.
   *
   */
  priority?: number

  /**
   * Unlike static audio sources, user-uploaded audio file names will be received differently.
   *
   * In case this metadata matters (for subtitles), you can specify it.
   */
  originalFilename?: string

  /**
   * The timeupdate event is fired when the time indicated by the currentTime attribute has been updated.
   *
   * In most browsers, this event is fired between 4 to 66 times per second (every 250 to 15 milliseconds), depending on the system load and the browser's internal scheduling.
   *
   * This frequency is generally adequate for most use cases. However, in old devices, the frequency may be too slow and there might be lags.
   *
   * In that case, set this value manually (generally recommended: 50).
   */
  updateFrequencyMs?: number

  /**
   * @deprecated Use `Track.loop` instead.
   */
  // loop?: boolean // will loop endlessly unless skipped later on.
}

export type CaptionState = {
  /**
   * Current caption
   */
  text: string

  /**
   *  Extra metadata: Description of the scene
   *
   *  This has to be given in the subtitles option.
   *
   *  Example: "Footsteps approaching"
   */
  description?: string

  /**
   * Extra metadata based on the timeline of the audio
   *
   * This has to be given in the subtitles option.
   *
   */
  metadata?: Record<string, any>
}

export type PlayRequestConstructor = {
  src: string

  /**
   * Target track index
   */
  trackIdx: number

  audioCallbacks?: AudioCallbacks
  audioOptions?: AudioOptions
  /**
   * Metadata that can be used to render a custom modal dialog
   */
  metadata?: {
    title?: string
    description?: string
    imgsrc?: string
  }
}

export type PlayRequest = PlayRequestConstructor & {
  id: string

  onAccept: () => void
  onReject: () => void
}

/*
 * useSoundtrackState hook returns this object.
 */
export type AudiotrackManagerState = {
  /**
   * Array of tracks that can play sounds concurrently.
   */
  readonly tracks: TrackState[]

  /**
   * Requests to user interaction before feeding into the track and play the audio automatically
   */
  readonly playRequests: PlayRequest[]

  /**
   * A float between 0 - 1.
   *
   * Coefficient to the track's `volume` property.
   *
   * Set it with `AudiotrackManager.setGlobalVolume` method.
   *
   * Default: `0.5`
   */
  readonly masterVolume: number

  /**
   * Indicates whether or not all tracks are muted.
   *
   * Toggle / Set it with `AudiotrackManager.toggleGlobalMute` method. It will affect all tracks globally.
   *
   * Default: `false`
   */
  readonly globalMuted: boolean

  /* JITSI RELATED */
  readonly jitsiMuted: boolean
  readonly jitsiConferenceContext: {
    [pid: string]: {
      volume: number
      muted: boolean
    }
  }
}

// Config state of the class
export type AudiotrackManagerSettings = {
  /**
   * Will console.log/warn/error
   */
  readonly debug?: boolean

  /**
   * Global source of subtitles
   *
   * Refer to type `Subtitle`
   */
  readonly subtitlesJSON?: SubtitlesJSON

  /**
   * Default: `1`
   */
  readonly trackLength?: number

  /**
   * A float between  0 and 1
   *
   * Default: `0.5`
   */
  readonly masterVolume?: number

  /**
   * Default: `{ locale:'en' }`
   */
  readonly defaultAudioOptions?: AudioOptions & { trackIdx?: number }

  /**
   * Default: `'en'`
   */
  readonly fallbackLocale?: string

  /**
   * Default: `['en']`
   */
  readonly supportedLocales: string[]
}

export type InheritedTrackState = Required<
  Pick<
    AudioOptions,
    "volume" | "muted" | "loop" | "allowDuplicates" | "playbackRate"
  >
> &
  Pick<AudioOptions, "locale" | "updateFrequencyMs">

export type MutTrackState = InheritedTrackState & {
  autoPlay: boolean
}

export type TrackState = MutTrackState & {
  readonly id: string
  readonly queue: AudioItemState[]
  isPlaying: boolean
}

export type AudioItemState = {
  readonly id: string
  readonly src: string
  readonly filename: string
  readonly paused: boolean
  readonly ended: boolean
  readonly started: boolean
  readonly updateFrequencyMs: number | undefined
}

export type InnerAudioState = {
  readonly muted: boolean
  readonly volume: number
  readonly currentTime: number
  readonly duration: number
  readonly paused: boolean
  readonly playbackRate: number
  readonly preservesPitch: boolean
}

export type TrackStream = {
  /** Shortcut of `trackInstance.getState().isPlaying` */
  readonly trackIsPlaying: boolean
  readonly audioItemState: AudioItemState | null
  caption: CaptionState | null
  readonly innerAudioState: InnerAudioState | null
}

/**
 * Options used to control the `useTrackStream` hook.
 */
export type StreamOptions = {
  /**
   * Reference value to force-update the hook.
   * Provide this value if the `Track` is expected to be instantiated AFTER the initial render of the hooked component.
   */
  trackLength?: number

  /**
   * Arbitrary value to force-update the hook.
   */
  key?: string | number

  /**
   * Will disable the hook and let it return null
   */
  disabled?: boolean
}

/** Used as an argument tuple for `registerAudio` and `registerAudios` */
export type RegistrationArgTuple = [
  src: string,
  options?: AudioCallbacks &
    AudioOptions & {
      trackIdx?: number
    }
]
