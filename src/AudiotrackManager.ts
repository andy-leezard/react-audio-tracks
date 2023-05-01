import * as C from "./constants"
import * as U from "./utils"
import Track from "./Track"
import type * as T from "./types"

class AudiotrackManager {
  /* MUTABLE CONFIGURATION */
  static #debug: boolean = false
  static #subtitlesJSON: T.SubtitlesJSON = {}
  static #supportedLocales: string[] = ["en"]
  static #fallbackLocale: string = this.#supportedLocales[0]!
  static #defaultAudioOptions: T.AudioOptions & { trackIdx?: number } = {
    locale: this.#fallbackLocale,
    trackIdx: 0,
  }
  static #tracks: Track[] = this.#populateTracks(C.DEFAULT_NUMBER_OF_TRACKS)

  /* STATE */
  static #state: T.AudiotrackManagerState = {
    tracks: this.#tracks.map((track) => track.getState()),
    playRequests: [],
    masterVolume: C.DEFAULT_VOLUME,
    globalMuted: false,
    jitsiMuted: false,
    jitsiConferenceContext: {},
  }

  private static state_listeners: T.Listener<T.AudiotrackManagerState>[] = []

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - - - CONFIG - - - - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  /**
   * @param args will update the `AudiotrackManager` class.
   * @param initialize will force-update every tracks' corresponding properties of the `args`.
   */
  public static setConfiguration(
    args: T.AudiotrackManagerSettings,
    initialize = false
  ) {
    if (typeof args.debug === "boolean") {
      this.#debug = args.debug
      this.#Tracks.forEach((track) =>
        track.injectSubtitles(this.#subtitlesJSON)
      )
    }
    if (args.subtitlesJSON) {
      this.#subtitlesJSON = args.subtitlesJSON
      if (initialize) {
        this.#Tracks.forEach((track) =>
          track.injectSubtitles(this.#subtitlesJSON)
        )
      }
    }
    if (typeof args.masterVolume === "number") {
      this.#State = { ...this.#State, masterVolume: args.masterVolume }
    }
    if (args.fallbackLocale) {
      this.#fallbackLocale = args.fallbackLocale
    }
    if (args.supportedLocales?.length) {
      this.#supportedLocales = args.supportedLocales
      if (!args.supportedLocales.includes(this.#fallbackLocale)) {
        this.#fallbackLocale = args.supportedLocales[0]!
      }
    }
    if (args.defaultAudioOptions) {
      const { locale, ...rest } = args.defaultAudioOptions
      let _locale = locale
      if (_locale && !this.#supportedLocales.includes(_locale)) {
        _locale = this.#fallbackLocale
      }
      const payload: T.AudioOptions = { ...rest }
      if (_locale) {
        payload.locale = _locale
      }
      this.#defaultAudioOptions = payload
    }
    /* TODO : GRACEFULLY HANDLE REDUCING (DELETING) TRACKS LENGTH */
  }

  /**
   * (RECOMMENDED) Call this method once when your web app launches with desired settings.
   *
   * @param args will be referenced to initialize `AudiotrackManager` class.
   */
  public static initialize(args: T.AudiotrackManagerSettings) {
    const { trackLength, ...rest } = args
    /* CANNOT REDUCE TRACK NUMBERS WITH THIS METHOD */
    if (args.trackLength && args.trackLength > this.#Tracks.length) {
      this.purgeAllTracks()
      this.#Tracks = this.#populateTracks(args.trackLength)
    }
    this.setConfiguration(rest, true)
    this.#Tracks.forEach((track) => {
      track.reconstruct()
    })
  }

  static #populateTracks(length: number) {
    return Array.from({ length: length }).map(
      (_, i) =>
        new Track({
          debug: this.#debug,
          index: i,
          getInheritedState: () => this.#state,
          getInheritedAudioOptions: () => this.#defaultAudioOptions,
          updateTrackCallback: (trackState: T.TrackState) => {
            this.#updateTrackState(i, trackState)
          },
        })
    )
  }

  static getDefaultAudioOptions() {
    return this.#defaultAudioOptions
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - STATE MANAGEMENT - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  public static getState(): T.AudiotrackManagerState {
    return this.#State
  }

  static get #State(): T.AudiotrackManagerState {
    return this.#state
  }

  static set #State(value: T.AudiotrackManagerState) {
    this.#state = value
    this.emit()
  }

  static get #Tracks(): Track[] {
    return this.#tracks
  }

  static set #Tracks(value: Track[]) {
    this.#tracks = value
    console.log(`tracks are ${value}`)
    this.#updateState({ tracks: this.#tracks.map((track) => track.getState()) })
  }

  static onStateChange(
    listener: T.Listener<T.AudiotrackManagerState>
  ): () => void {
    this.state_listeners.push(listener)
    return () => {
      this.state_listeners = this.state_listeners.filter((l) => l !== listener)
    }
  }

  private static emit(): void {
    this.state_listeners.forEach((listener) => listener(this.#State))
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - ABSTRACTION LAYER TO ENSURE SETTER TRIGGER - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  static #updateState(value?: Partial<T.AudiotrackManagerState>) {
    const prev = this.#State
    const newState = { ...prev, ...value }
    this.#State = newState
  }

  /**
   * Updates the state of the `AudiotrackManager` class.
   * The change will be directly emitted via `useAudiotracks` hooks.
   */
  static updateState(
    value: Omit<Partial<T.AudiotrackManagerState>, "tracks" | "playRequests">
  ) {
    this.#updateState(value)
  }

  /**
   * @returns a `Track` class instance of the corresponding track.
   */
  static getTrack(index: number): Track | null {
    if (!this.#Tracks.length) return null
    if (index < 0 && index >= this.#Tracks.length) return null
    return this.#Tracks[index]!
  }

  /**
   * @returns current state of the `Track` class instance of the corresponding track.
   */
  static getTrackState(index: number): T.TrackState | null {
    if (!this.#State.tracks.length) return null
    if (index < 0 && index >= this.#Tracks.length) return null
    return this.#State.tracks[index]!
  }

  /**
   * @returns all existing `Track` class instances
   */
  static getAllTracks = () => {
    return this.#Tracks
  }

  /**
   * updates a track's mutable state properties
   */
  static updateTrack(index: number, payload: Partial<T.MutTrackState>) {
    const track = this.getTrack(index)
    if (!track) return
    const { muted } = payload
    if (this.#State.globalMuted && muted === false) {
      this.#updateState({ globalMuted: muted })
    }
    track.updateState(payload)
  }

  static #updateTrackState(index: number, payload: Partial<T.TrackState>) {
    const tracks = this.#State.tracks
    Object.assign(tracks[index]!, payload)
    this.#updateState({ tracks })
  }

  /**
   * updates every track's mutable state properties
   */
  public static updateAllTracks(payload: Partial<T.MutTrackState>) {
    const { muted } = payload
    if (typeof muted === "boolean") {
      this.#updateState({ globalMuted: muted })
    }
    const tracks = this.#Tracks
    tracks.forEach((track) => {
      track.updateState(payload)
    })
    this.#updateState({ tracks: tracks.map((track) => track.getState()) })
  }

  /**
   * Will pause a track if it's playing, otherwise it will resume it.
   */
  public static togglePlayTrack(index: number) {
    const track = this.getTrack(index)
    if (!track) return
    track.togglePlay()
  }

  /**
   * Will resume a track only if it has a currently playing audio that has been paused.
   */
  public static resumeTrack(index: number) {
    const track = this.getTrack(index)
    if (!track) return
    track.resumeTrack()
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - - - - CORE - - - - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  /**
   * Removes every audio registered in the queue and ends any currently playing audio.
   */
  public static purgeTrack(trackIdx: number) {
    const track = this.getTrack(trackIdx)
    if (!track) return
    track.purgeTrack()
  }

  /**
   * For every track, removes every audio registered in the queue and ends any currently playing audio.
   */
  private static purgeAllTracks() {
    this.#Tracks.forEach((track) => {
      track.purgeTrack()
    })
  }

  /**
   * This method stores audio sources (with or without `options`) to insert them later on the queue when user interacts with UI elements.
   *
   * Use cases : Some mobile (tablet) devices doesn't let the navigator play sounds programmatically unless the user has interacted with it (such as click events).
   *
   * This is a workaround to add a step before automatically registering the audio on the queue.
   *
   * The `metadata` options can provide an additional context to pop up a modal dialog asking if the user wants to play the sound or not.
   *
   * @returns {Array<string>} uids of the created requests that can be used to dismiss each item later by using `AudiotrackManager.dismissPlayRequest` method.
   */
  static registerPlayRequests = (
    args: Array<T.PlayRequestConstructor>
  ): string[] => {
    if (!args.length) return []
    const payload: T.PlayRequest[] = []
    const uids: string[] = []
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]!
      const trackState = this.getTrackState(arg.trackIdx)
      if (!trackState) {
        U.log(
          `Audiotrack Manager prevented registering a play request (${arg.src}) - track index (${arg.trackIdx}) out of range`,
          this.#debug
        )
        continue
      }
      const dup = this.#State.playRequests.find((vm) => vm.src === arg.src)
      const allowDuplicates =
        this.#defaultAudioOptions.allowDuplicates ||
        trackState.allowDuplicates ||
        Boolean(arg.audioOptions?.allowDuplicates)
      if (dup && !allowDuplicates) {
        U.log(
          `Audiotrack Manager prevented registering a duplicate audio play request (${arg.src})`,
          this.#debug,
          1
        )
        continue
      }
      const uid = Date.now().toString()
      let new_message: T.PlayRequest = {
        id: uid,
        src: arg.src,
        trackIdx: arg.trackIdx,
        onAccept: () =>
          this.registerAudio(arg.src, {
            ...arg?.audioOptions,
            trackIdx: arg.trackIdx,
          }),
        onReject: () => this.dismissPlayRequest(uid),
      }
      uids.push(uid)
      payload.push(new_message)
    }
    const prev = this.#State.playRequests
    this.#updateState({ playRequests: [...prev, ...payload] })
    return uids
  }

  /**
   * Removes a play request if exists
   */
  static dismissPlayRequest = (id: string) => {
    const exists = this.#State.playRequests.find((pr) => pr.id === id)
    if (!exists) return
    const playRequests = this.#State.playRequests.filter((pr) => pr.id !== id)
    this.#updateState({ playRequests })
  }

  /**
   * Registers an audio source to a `Track`'s queue to be played.
   *
   * By default, options inherit from the `Track`'s settings and then completes itself with `AudiotrackManager`'s settings if defined.
   * Debug the options in runtime if needed by using `Track.defaultAudioOptions` or `AudiotrackManager.getDefaultAudioOptions`.
   *
   * `AudiotrackManager`'s default `AudioOptions` can be set at the initializing phase by using `AudiotrackManager.initialize(...args)`
   *
   * Specify the `trackIdx` to target a specific `Track` to play the audio on. If it's not provided, this option inherits from `AudiotrackManager`'s settings (0 by default).
   *
   * If the `Track` has its property `autoPlay` set to `true`, the audio source will be played automatically.
   * If there are already other audio sources registered or being played, it will be played right after those audios have finished playing.
   * Otherwise, the audio source will be played on demand.
   *
   * if the option `priority` is given, it will override the new audio's index position in the `Track`'s `queue`, therefore `0` being the top priority and skipping the current audio.
   *
   * If the `Track` has its property `allowDuplicates` set tot `true`, a duplicate audio source can be registered on the `Track`'s queue at the same time.
   *
   * For more and subtitles related information, see the documentation of the type `AudioOptions`.
   *
   */
  public static registerAudio = (
    src: string,
    options?: T.AudioCallbacks &
      T.AudioOptions & {
        trackIdx?: number
      }
  ) => {
    let { trackIdx, ...rest } = options ?? {}
    if (typeof trackIdx !== "number") {
      trackIdx =
        typeof this.#defaultAudioOptions.trackIdx === "number"
          ? this.#defaultAudioOptions.trackIdx
          : 0
    }
    /* const playWithoutRegistering = trackIdx === -1 */
    const track = this.getTrack(trackIdx)
    if (!track) {
      U.log(
        `Audio source (${src}) could not be played - track idx out of range (${trackIdx})/${
          this.#Tracks.length - 1
        }`,
        this.#debug,
        2
      )
      return
    }
    track.registerAudio(src, rest)
  }

  /**
   * Plays once an audio source with or without options and callbacks.
   *
   * options inherits from `AudiotrackManager`'s settings.
   */
  public static playAudio = (
    src: string,
    options?: T.AudioCallbacks &
      Pick<T.AudioOptions, "volume"> & {
        muted?: boolean
        loop?: boolean
      }
  ): HTMLAudioElement => {
    const audio = new Audio(src)
    audio.muted = Boolean(options?.muted)
    audio.loop = Boolean(options?.loop)
    audio.volume =
      typeof options?.volume === "number"
        ? options.volume
        : this.#State.masterVolume
    const onPlay = () => {
      if (options?.onPlay) {
        options.onPlay()
      }
    }
    const onPause = () => {
      if (options?.onPause) {
        options.onPause()
      }
    }
    const onUpdate = () => {
      if (options?.onUpdate) {
        options.onUpdate()
      }
    }
    const onError = () => {
      if (options?.onError) {
        options.onError()
      }
    }
    const onEnd = () => {
      cleanup()
      if (options?.onEnd) {
        options.onEnd()
      }
    }
    const cleanup = () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("error", onError)
      audio.removeEventListener("timeupdate", onUpdate)
      audio.removeEventListener("ended", onEnd)
    }

    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnd)
    audio.addEventListener("error", onError)
    audio.addEventListener("timeupdate", onUpdate)
    audio.play()
    return audio
  }

  /**
   * Skips the currently playing audio on a `Track`
   */
  public static skipTrack = (trackIdx: number = 0) => {
    const track = this.getTrack(trackIdx)
    if (!track) return
    track.skipAudio()
  }

  /**
   * Sets the `masterVolume` property of `AudiotrackManager`'s state.
   */
  public static setMasterVolume = (masterVolume: number) => {
    U.log(`new global volume : ${masterVolume}`, this.#debug)
    this.#updateState({ masterVolume })
    this.#Tracks.forEach((track) => {
      track.applyMasterVolume(masterVolume)
    })
  }

  /**
   * toggles `globalMuted` property of `AudiotrackManager`'s state
   * @param override if given, this value will set the `globalMuted` value.
   */
  public static toggleGlobalMute = (override?: boolean) => {
    const globalMuted =
      typeof override === "boolean" ? override : !this.#State.globalMuted
    const tracks = this.#Tracks
    tracks.forEach((track) => {
      track.updateState({ muted: globalMuted })
    })
    this.#Tracks = tracks
    this.#updateState({ globalMuted })
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - JITSI PLUGIN - - - - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  /**
   * Plugin for JitsiMeet to store volume and muted state of participants of a video/audio conference.
   * @param pid `Participant`'s ID used in the conference
   * @param options Initial volume and muted state
   */
  public static initializeConferenceRefs = (
    pid: string,
    options?: { volume?: number; muted?: boolean }
  ) => {
    if (this.#State.jitsiConferenceContext[pid]) return
    const volumes = this.#State.jitsiConferenceContext
    this.#updateState({
      jitsiConferenceContext: {
        ...volumes,
        [pid]: {
          volume: typeof options?.volume === "number" ? options.volume : 1,
          muted: typeof options?.muted === "boolean" ? options.muted : false,
        },
      },
    })
  }

  /**
   * Plugin for JitsiMeet to update volume and muted state of participants of a video/audio conference.
   * @param pid `Participant`'s ID used in the conference
   * @param options new volume and muted state
   */
  public static updateConferenceRefs = (
    pid: string,
    args: { volume?: number; muted?: boolean }
  ) => {
    const prev = this.#State.jitsiConferenceContext
    if (!prev[pid]) {
      this.initializeConferenceRefs(pid, args)
      return
    }
    const { volume, muted } = args
    if (typeof volume === "number") {
      prev[pid]!.volume = volume
    }
    if (typeof muted === "boolean") {
      prev[pid]!.muted = muted
    }
    this.#updateState({ jitsiConferenceContext: prev })
  }
}

export default AudiotrackManager
