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

/**
 * Options used to configure the individual `IAudioItem`'s behavior
 *
 */
export type AudioOptions = {
  /**
   * A float between 0 - 1
   */
  volume?: number

  /**
   * This property is inherited from the `Track.autoPlay` property.
   * By giving this option, you override it.
   *
   * If `true`: The audio will be played immediately on the queue.
   * If the audio is waiting on the queue, it will be automatically played when all the previous items have finished playing.
   * If the queue is empty, the audio will be played immediately after being registered to the queue.
   *
   * Default (`false`): The audio shall be played on demand.
   */
  autoPlay?: boolean

  /* callbacks */
  onStart?: () => void | undefined
  onEnd?: () => void | undefined

  /* CORE FEATURE */
  /**
   *  Assigns a track with index, and the audio will be pushed to its queue.
   *
   *  Default: 0
   */
  trackIdx?: number

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
  isPlaying: boolean
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

export type AudioItemConstructor = {
  id: string // unique identifier
  src: string // audio source
  filename: string
  audio: HTMLAudioElement | undefined

  /**
   *  Dynamically inherited from type: `AudioOptions` input when an audio is registered to the queue.
   */
  autoPlay?: boolean

  /**
   * Refer to type: `Subtitle`
   */
  subtitles?: Subtitle
}

export interface IAudioItem extends AudioItemConstructor {
  play: () => void
  purge: () => void

  /**
   * Indicates whether or not the event listeners were registered.
   * If true: it specifically means that `play` method here has been already called.
   * @deprecated will always return true now
   */
  loaded?: boolean | undefined
}

export type Track = {
  queue: IAudioItem[]
  currentAudio: IAudioItem | null
  name: string
  caption?: CaptionState | null

  /**
   * Any change will affect all audios on the queue in real-time.
   * This value will be overriden by any change from the `globalVolume`.
   *
   * Default: `globalVolume`
   */
  volume: number
  /**
   * Will be overriden by the `globalMuted` value.
   *
   * Default: `false`
   */
  muted: boolean
  /**
   * Will loop any audio registered. When it changes, it affects all audios on the queue.
   *
   * Defulat: `false`
   */
  loop: boolean
  /**
   *  Indicates if the current audio is currently playing.
   *
   *  Alternatively you can directly access the `currentAudio.audio.pause` state to check.
   */
  isPlaying: boolean
  /**
   * Indicates if the track should, by default, autoplay any audio being registered.
   *
   * When it changes, it affects all audios on the queue.
   *
   * Defulat: `false`
   */
  autoPlay: boolean
  /**
   *  Indicates if the track should allow adding the same audio to the queue simultaneously.
   *
   *  Defulat: `false`
   */
  allowDuplicates: boolean

  /**
   * name of the audio source file currently playing
   * @deprecated Use `currentAudio` instead.
   */
  currentlyPlaying: string
}

/* USECASE : some mobile (tablet) devices doesn't let the navigator play sounds programmatically.
 * In that case, the sound can only be played in the process of a user interaction event (such as click events).
 * So here is an interesting workaround to add a step before automatically playing the audio.
 * Extended type of param{options} will provide an additional context to pop up a modal dialogue asking if the user wants to play the sound or not.
 * This will be fed into the track's queue.
 */
export type PlayRequest = {
  id: string // unique identifier
  src: string // audio source
  trackIdx: number // target track index
  options?: AudioOptions & {
    title?: string
    description?: string
    imgsrc?: string
  }
}

/*
 * useSoundtrackState hook returns this object.
 */
export type AudioManagerState = {
  /**
   * Array of tracks that can play sounds concurrently.
   */
  tracks: Track[]

  /**
   * Requests to user interaction before feeding into the track and play the audio automatically
   */
  playRequests: PlayRequest[]

  /**
   * Will override all tracks and the audios in it.
   *
   * Default: `0.5`
   */
  globalVolume: number

  /**
   * Will override all tracks and the audios in it.
   *
   * Default: `false`
   */
  globalMuted: boolean

  /* JITSI RELATED */
  jitsiIsMuted: boolean
  conferenceVolumes: {
    [pid: string]: {
      volume: number
      muted: boolean
    }
  }
}

// Config state of the class
export type AudiotrackManagerState = {
  /**
   * Will console.log/warn/error
   */
  debug?: boolean

  /**
   * Global source of subtitles
   * 
   * Refer to type `Subtitle`
   */
  subtitlesJSON?: Record<string, Subtitle[]>

  /**
   * Default: `1`
   */
  number_of_tracks?: number

  /**
   * A float between  0 and 1
   * 
   * Default: `0.5`
   */
  defaultVolume?: number

  /**
   * Default: `{ locale:'en' }`
   */
  defaultAudioOptions?: AudioOptions

  /**
   * Default: `'en'`
   */
  fallbackLocale?: string

  /**
   * Default: `['en']`
   */
  supportedLocales: string[]
}
