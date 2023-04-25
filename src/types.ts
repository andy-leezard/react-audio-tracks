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
   * Extra metadata: Description of the source of audio
   *
   * Example: 'Person with a white hat'
   */
  narrator?: string
}

export type AudioCallbacks = {
  /* callbacks */
  onPlay?: () => void | undefined
  onUpdate?: () => void | undefined
  onPause?: () => void | undefined
  onEnd?: () => void | undefined
  onError?: () => void | undefined
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
   * Extra metadata: Description of the source of audio
   *
   * This has to be given in the subtitles option.
   *
   * Example: 'Person with a white hat'
   */
  narrator?: string
}

export type PlayRequestConstructor = {
  src: string

  /**
   * Target track index
   */
  trackIdx: number

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
export type AudioManagerState = {
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

export type MutTrackState = {
  volume: number
  muted: boolean
  loop: boolean
  autoPlay: boolean
  allowDuplicates: boolean
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
  readonly audioItemState: AudioItemState | null
  caption: CaptionState | null
  readonly innerAudioState: InnerAudioState | null
}
