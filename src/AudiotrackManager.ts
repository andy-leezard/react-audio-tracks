import {
  dropFromArray,
  getFileName,
  getCurrentCaption,
  populateTracks,
} from "./utils"
import type {
  Track,
  AudioOptions,
  AudioManagerState,
  CaptionState,
  Listener,
  Audio,
  Subtitle,
  PlayRequest,
  Logger,
  AudiotrackManagerState,
  SubtitlesJSON,
  ValueOf,
  PartiallyRequired,
} from "./types"
import { DEFAULT_NUMBER_OF_TRACKS, DEFAULT_VOLUME, LOG_LEVEL } from "./config"

class AudiotrackManager {
  /* MUTABLE CONFIGURATION */
  static #debug: boolean = false
  static #subtitlesJSON: SubtitlesJSON = {}
  static #defaultVolume: number = 0.5
  static #supportedLocales: string[] = ["en"]
  static #fallbackLocale: string = this.#supportedLocales[0]!
  static #defaultAudioOptions: AudioOptions = {
    locale: this.#fallbackLocale,
  }

  /* STATE */
  static #state: AudioManagerState = {
    tracks: populateTracks(DEFAULT_NUMBER_OF_TRACKS),
    playRequests: [],
    globalVolume: DEFAULT_VOLUME,
    globalMuted: false,
    jitsiIsMuted: false,
    conferenceVolumes: {},
  }

  private static state_listeners: Listener<AudioManagerState>[] = []

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - - - CONFIG - - - - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  public static setConfiguration(args: AudiotrackManagerState) {
    if (args.debug) {
      this.#debug = args.debug
    }
    if (args.subtitlesJSON) {
      this.#subtitlesJSON = args.subtitlesJSON
    }
    if (args.defaultVolume) {
      this.#defaultVolume = args.defaultVolume
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
      if (_locale && !args.supportedLocales.includes(_locale)) {
        _locale = this.#fallbackLocale
      }
      const payload: AudioOptions = { ...rest }
      if (_locale) {
        payload.locale = _locale
      }
      this.#defaultAudioOptions = payload
    }
    /* GRACEFULLY HANDLE REDUCING (DELETING) TRACKS LENGTH */
  }

  public static initialize(args: AudiotrackManagerState) {
    const { number_of_tracks, ...rest } = args
    this.setConfiguration(rest)
    /* CANNOT REDUCE TRACK NUMBERS WITH THIS METHOD */
    if (
      args.number_of_tracks &&
      args.number_of_tracks > this.#State.tracks.length
    ) {
      this.purgeAllTracks()
      this.updateState({
        tracks: populateTracks(args.number_of_tracks, this.#defaultVolume),
      })
    }
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - STATE MANAGEMENT - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  public static getState(): AudioManagerState {
    return this.#State
  }

  static get #State(): AudioManagerState {
    return this.#state
  }

  static set #State(value: AudioManagerState) {
    this.#state = value
    this.emit()
  }

  static onStateChange(listener: Listener<AudioManagerState>): () => void {
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

  static updateState(value: Partial<AudioManagerState>) {
    const prev = this.#State
    this.#State = { ...prev, ...value }
  }

  static getTrack(index: number): Track | null {
    if (!this.#State.tracks.length) return null
    if (index < 0 && index >= this.#State.tracks.length) return null
    return this.#State.tracks[index]!
  }

  static updateTrack(index: number, payload: Partial<Track>) {
    const track = this.getTrack(index)
    if (!track) return
    if (payload.queue) {
      track.queue = payload.queue
    }
    if (typeof payload.muted === "boolean") {
      track.muted = payload.muted
      track.queue.forEach((sound) => {
        sound.audio.muted = track.muted
      })
    }
    if (typeof payload.volume === "number") {
      track.volume = payload.volume
      track.queue.forEach((sound) => {
        sound.audio.volume = track.volume
      })
    }
    if (typeof payload.currentlyPlaying === "string") {
      track.currentlyPlaying = payload.currentlyPlaying
    }
    if (Object.prototype.hasOwnProperty.call(payload, "caption")) {
      track.caption = payload.caption
    }
    const prevTracks = this.#State.tracks
    prevTracks[index] = track
    this.updateState({ tracks: prevTracks })
  }

  static pushToQueue(trackIdx: number, payload: Audio) {
    const track = this.getTrack(trackIdx)
    if (!track) return
    track.queue.push(payload)
    const prevTracks = this.#State.tracks
    prevTracks[trackIdx] = track
    this.updateState({ tracks: prevTracks })
  }

  static injectToQueue(
    trackIdx: number,
    splicingIndex: number,
    payload: Audio
  ) {
    const track = this.getTrack(trackIdx)
    if (!track) return
    const queueLength = track.queue.length
    track.queue = [
      ...track.queue.slice(0, splicingIndex),
      payload,
      ...track.queue.slice(splicingIndex, queueLength),
    ]
    const prevTracks = this.#State.tracks
    prevTracks[trackIdx] = track
    this.updateState({ tracks: prevTracks })
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - - - - CORE - - - - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  private static purgeAllTracks() {
    this.#State.tracks.forEach((track) => {
      if (track.queue.length) {
        const currentlyPlaying = track.queue[0]!
        track.queue = track.queue.slice(0, 1)
        currentlyPlaying.forceStop()
      }
    })
  }

  static registerPlayRequests = (args: Array<Omit<PlayRequest, "id">>) => {
    const payload: PlayRequest[] = []
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]!
      const dup = this.#State.playRequests.find((vm) => vm.src === arg.src)
      if (dup) {
        log(
          `Audiotrack Manager prevented playing a duplicate audio (${arg.src})`,
          this.#debug,
          1
        )
        continue
      }
      const uid = Date.now().toString()
      let new_message: PlayRequest = {
        id: uid,
        src: arg.src,
        trackIdx: arg.trackIdx,
      }
      if (arg.options) {
        new_message.options = arg.options
      }
      payload.push(new_message)
    }
    const prev = this.#State.playRequests
    this.updateState({ playRequests: [...prev, ...payload] })
  }

  private static createAudio = (
    src: string,
    audioOptions: PartiallyRequired<AudioOptions, "volume" | "trackIdx"> & {
      muted?: boolean
    }
  ) => {
    const filename = getFileName(src)
    const {
      trackIdx,
      volume,
      loop,
      muted,
      locale,
      keyForSubtitles,
      subtitles,
      onStart,
      onEnd,
    } = audioOptions
    const trackIdxIsValid = trackIdx >= 0
    const audio = new Audio(src)
    const uid = Date.now().toString()
    audio.volume = volume
    if (typeof muted === "boolean") {
      audio.muted = muted // this.#State.globalMuted
    }
    if (typeof loop === "boolean") {
      audio.loop = loop
    }
    audio.setAttribute("id", uid)
    let _keyForSubtitles = keyForSubtitles ?? filename
    let _subtitles: null | Subtitle[] =
      subtitles ??
      Object.prototype.hasOwnProperty.call(
        this.#subtitlesJSON,
        _keyForSubtitles
      )
        ? this.#subtitlesJSON[_keyForSubtitles]!
        : null
    let _locale = locale ?? this.#fallbackLocale
    const update = (e: Event) => {
      if (!_subtitles || !trackIdxIsValid) return
      this.updateTrack(trackIdx, {
        caption: getCurrentCaption(_subtitles, audio.currentTime, _locale),
      })
    }
    const endingCallback = () => {
      if (_subtitles || !trackIdxIsValid) {
        this.updateTrack(trackIdx, {
          caption: null,
        })
      }
      if (onEnd) {
        onEnd()
      }
      cleanup()
    }
    const fireOnLoad = () => {
      const promise = audio.play()
      if (trackIdxIsValid) {
        this.updateTrack(trackIdx, { currentlyPlaying: filename })
      }
      if (promise !== undefined) {
        promise
          .then(() => {})
          .catch((e) => {
            endingCallback()
            console.error(e)
          })
      }
      if (onStart) {
        onStart()
      }
    }
    const errorHandler = (e: ErrorEvent) => {
      endingCallback()
      log(
        `COULD NOT LOAD AUDIO SRC (${src}) : ${JSON.stringify(e)}`,
        this.#debug,
        2
      )
    }
    const play = () => {
      audio.addEventListener("canplaythrough", fireOnLoad)
      audio.addEventListener("ended", endingCallback)
      audio.addEventListener("error", errorHandler)
      audio.addEventListener("timeupdate", update)
      audio.load()
    }
    const cleanup = () => {
      audio.currentTime = 0
      audio.pause()
      audio.removeEventListener("canplaythrough", fireOnLoad)
      audio.removeEventListener("ended", endingCallback)
      audio.removeEventListener("timeupdate", update)
      audio.removeEventListener("error", errorHandler)
      audio.remove()
      log(`cleaning up audio: ${filename}`, this.#debug)
      if (trackIdxIsValid) {
        this.clearAudio(uid, filename)
      }
    }
    const audioItem: Audio = {
      id: uid,
      src: src,
      audio: audio,
      play: play,
      forceStop: endingCallback,
    }
    return audioItem
  }

  // UNSAFE: Using -1 as trackIdx lets play the audio without assigning any track's queue.
  //         By doing so, the audio will only play once and immediately without affecting existing tracks and its queues.
  //         Doing so also overrides the `loop` value to `false`.
  //         Playing an audio this way allows overlapping as many times as possible; it's useful for sound effects like notifications.
  //         For this use case, please use `playAudio` instead of accessing this feature directly from `registerAudio`.
  public static registerAudio = (src: string, options: AudioOptions) => {
    const _options = options ?? this.#defaultAudioOptions
    const { trackIdx = 0, priority, allowDuplicate } = _options
    /* const playWithoutRegistering = trackIdx === -1 */
    const track = this.getTrack(trackIdx)
    if (!track) {
      log(
        `Audio source (${src}) could not be played - track idx out of range (${trackIdx})/${
          this.#State.tracks.length - 1
        }`,
        this.#debug,
        2
      )
      return
    }
    const dup = track.queue.find((s) => s.src === src)
    if (!allowDuplicate && dup) {
      log(
        `Audiotrack Manager prevented playing a duplicate audio (${src})`,
        this.#debug,
        1
      )
      return
    }
    const audioItem = this.createAudio(src, {
      ..._options,
      trackIdx: trackIdx,
      volume: track.volume,
      muted: track.muted || this.#State.globalMuted,
    })
    const queueLength = track.queue.length
    if (
      typeof priority === "number" &&
      queueLength &&
      priority >= 0 &&
      priority < queueLength
    ) {
      let _priority = priority
      let skipCurrent = false
      if (_priority === 0) {
        _priority = 1
        skipCurrent = true
      }
      // ANCHOR
      this.injectToQueue(trackIdx, _priority, audioItem)
      if (skipCurrent) {
        this.skipAudio(trackIdx)
      }
    } else {
      this.pushToQueue(trackIdx, audioItem)
    }
    if (queueLength <= 0) {
      audioItem.play()
    }
  }

  private static getAudioBySourceName(
    sourceName: string,
    method: "match" | "include" = "match"
  ): Audio | null {
    for (let i = 0; i < this.#State.tracks.length; i++) {
      for (let j = 0; j < this.#State.tracks[i]!.queue.length; j++) {
        const queue = this.#State.tracks[i]!.queue!
        switch (method) {
          case "include":
            return queue.find((a) => a.src.includes(sourceName)) ?? null
          default:
            return queue.find((a) => a.src === sourceName) ?? null
        }
      }
    }
    return null
  }

  public static playAudio = (
    src: string,
    options: Pick<AudioOptions, "onStart" | "onEnd" | "volume"> & {
      muted?: boolean
    }
  ) => {
    const audioItem = this.createAudio(src, {
      ...options,
      trackIdx: -1,
      volume: this.#State.globalVolume,
    })
    audioItem.play()
    return audioItem
  }

  public static skipAudio = (
    target: number | string = 0,
    method?: "match" | "include"
  ) => {
    if (typeof target === "number") {
      const track = this.getTrack(target)
      if (!track?.queue.length) return
      const currentAudio = track.queue[0]!
      log(`force stopping : ${currentAudio.src}`, this.#debug)
      currentAudio.forceStop()
    } else if (typeof target === "string") {
      const audio = this.getAudioBySourceName(target, method)
      if (audio) {
        audio.forceStop()
      }
    }
  }

  private static playNext = (trackIdx: number) => {
    const track = this.getTrack(trackIdx)
    if (!track?.queue.length) return
    const next_audio = track.queue[0]!
    if (!next_audio.audio.currentTime) {
      log(`play next audio: ${getFileName(next_audio.src)}`, this.#debug)
      next_audio.play()
    }
  }

  private static searchIndexesByUID = (uid: string) => {
    const tracks = this.#State.tracks
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]!
      for (let j = 0; j < track.queue.length; j++) {
        const _audio = track.queue[j]!
        if (_audio.id === uid) {
          //sound = _audio
          return { trackIdx: i, soundIdx: j }
        }
      }
    }
    return { trackIdx: -1, soundIdx: -1 }
  }

  private static clearAudio = (uid: string, filename: string) => {
    const { trackIdx, soundIdx } = this.searchIndexesByUID(uid)
    if (trackIdx + soundIdx < 0) {
      log(
        `Cannot clear audio for uid: ${uid} (track & queue index not found)`,
        this.#debug,
        2
      )
      return
    }
    this.updateTrack(trackIdx, {
      queue: dropFromArray(this.#State.tracks[trackIdx]!.queue, soundIdx),
      currentlyPlaying: "",
    })
    log(`clear ${filename}`, this.#debug)
    if (this.#State.tracks[trackIdx]!.queue.length) {
      this.playNext(trackIdx)
    }
  }

  public static setGlobalVolume = (val: number) => {
    log(`new global volume : ${val}`, this.#debug)
    const tracks = this.#State.tracks
    tracks.forEach((track) => {
      track.volume = val
      track.queue.forEach((sound) => {
        sound.audio.volume = val
      })
    })
    this.updateState({ tracks: tracks, globalVolume: val })
  }

  public static toggleMuteAllSources = (override?: boolean) => {
    const state =
      typeof override === "boolean" ? override : !this.#State.globalMuted
    const tracks = this.#State.tracks
    tracks.forEach((track) => {
      if (!track.muted) {
        track.queue.forEach((sound) => {
          sound.audio.muted = state
        })
      }
    })
    this.updateState({ globalMuted: state })
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - JITSI RELATED - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  public static initializeConferenceRefs = (
    pid: string,
    options?: { volume?: number; muted?: boolean }
  ) => {
    if (this.#State.conferenceVolumes[pid]) return
    const volumes = this.#State.conferenceVolumes
    this.updateState({
      conferenceVolumes: {
        ...volumes,
        [pid]: {
          volume: typeof options?.volume === "number" ? options.volume : 1,
          muted: typeof options?.muted === "boolean" ? options.muted : false,
        },
      },
    })
  }

  public static updateConferenceRefs = (
    pid: string,
    args: { volume?: number; muted?: boolean }
  ) => {
    const prev = this.#State.conferenceVolumes
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
    this.updateState({ conferenceVolumes: prev })
  }
}

function log(
  message: any,
  debug = false,
  logLevel: ValueOf<typeof LOG_LEVEL> = LOG_LEVEL.debug,
  alertErrorOnProduction = false
) {
  if (!debug) return
  let isError = false
  let println: Logger | undefined
  switch (logLevel) {
    case LOG_LEVEL.error:
      println = console.error
      isError = true
      break
    case LOG_LEVEL.warn:
      println = console.warn
      break
    default:
      println = console.log
      break
  }
  if (message instanceof Array) {
    println(...message)
    return
  }
  if (isError && message?.message) {
    println(message.message)
    if (alertErrorOnProduction) {
      alert(message.message)
    }
    return
  }
  println(message)
}

export default AudiotrackManager
