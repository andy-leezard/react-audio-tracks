export type ValueOf<T> = T[keyof T]

export type PartiallyRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>

export type SubtitlesJSON = Record<string, Subtitle[]>

export type Listener<T> = (value: T) => void

export type Logger = (message?: any, ...optionalParams: any[]) => void

export type Subtitle = {
  // timestamp in seconds
  from: number // ex: 1.45
  to: number // ex: 3.25

  // supporting internationalization
  // ex: { "en":"Hello", "fr": "Bonjour" }
  text:
    | string
    | {
        [locale: string]: string
      }

  /* EXTRA METADATA FOR VARIOUS USE CASES */
  // description of the scene
  // supporting internationalization
  // ex: { "en":"(Footsteps approaching)", "fr": "(Des pas approchent)" }
  description?:
    | string
    | {
        [langID: string]: string
      }
  // who is talking?
  narrator?: string
}

export type AudioOptions = {
  volume?: number // a float between 0 - 1

  // This overrides the track.autoPlay property
  // If true: The audio will be played immediately on the queue.
  //          If the audio is waiting on the queue, it will be automatically
  //          played when all the previous items have finished playing.
  //          If the queue is empty, the audio will be played immediately
  //          after being registered to the queue.
  // default: The audio shall be played on demand.
  autoPlay?: boolean

  /* callbacks */
  onStart?: () => void | undefined
  onEnd?: () => void | undefined

  /* CORE FEATURE */
  // assign a track with index, and the audio will be pushed to its queue.
  // default is 0
  trackIdx?: number

  // internationalization of subtitles
  locale?: string | undefined
  // by default, this will be the filename (without extension and path).
  // make sure that this key exists in the `subtitlesJSON` of the class of the custom subtitles (optional) below.
  keyForSubtitles?: string | undefined
  // by default, this will be the `subtitlesJSON` of the class which is the global subtitles reference object.
  subtitles?: Subtitle[] | undefined

  // By default, it is considered as a human error to register an identical audio source multiple times and is thus blocked.
  // If a repetition is what you intend, consider using `loop` instead.
  // If audios are expected to be overlapped (such as notificaiton sound effects), consider using `playAudio` method instead.
  // However, if there is a specific use case to play the same audio multiple times on one queue without looping,
  // enable this option when registering an audio to a track so that the register won't be ignored.
  // This option will override priority and trackIdx properties.
  allowDuplicate?: boolean

  // optional : playing priority order (index)
  // 0 is the top priority -> will skip any current audio if exists
  // If there is an audio currently being played, and you want it to play right after, give 1.
  priority?: number

  // Unlike static audio sources, user-uploaded audio file names will be received differently.
  // In case this metadata matters, you can specify it.
  originalFilename?: string

  /**
   * @deprecated Use `Track.loop` instead.
   */
  // loop?: boolean // will loop endlessly unless skipped later on.
}

export type CaptionState = {
  isPlaying: boolean
  text: string

  /* OPTIONAL */
  description?: string

  /* EXTRA METADATA */
  // who is talking?
  narrator?: string
}

export type AudioItemConstructor = {
  id: string // unique identifier
  src: string // audio source
  filename: string
  audio: HTMLAudioElement | undefined

  // dynamically inherited from type: AudioOptions
  autoPlay?: boolean

  // refer to type: Subtitle
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

  // will be overriden by the global volume when that changes.
  volume: number
  // will not be overriden by the global mute value.
  muted: boolean
  // will loop any audio registered
  loop: boolean
  // indicates if the current audio is currently playing
  isPlaying: boolean
  // indicates if the track should, by default, autoplay any audio being registered.
  autoPlay: boolean

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
  // array of tracks that can play sounds concurrently.
  tracks: Track[]
  // requests to user interaction before feeding into the track and play the audio automatically
  playRequests: PlayRequest[]

  // will override all tracks and the audios in it.
  globalVolume: number

  // if true: will mute all tracks and the audios in it.
  // if false (default): will unmute tracks EXCEPT those individually muted.
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
  // will console.log/warn/error
  debug?: boolean

  // global source of subtitles
  subtitlesJSON?: Record<string, Subtitle[]>

  // default is 1
  number_of_tracks?: number

  // a float between  0 and 1
  // default is 0.5
  defaultVolume?: number

  // default is { locale:'en' }
  defaultAudioOptions?: AudioOptions

  // default is 'en'
  fallbackLocale?: string

  // default is ['en']
  supportedLocales: string[]
}
