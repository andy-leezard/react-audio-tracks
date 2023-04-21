import * as U from "./utils"
import * as C from "./constants"
import type * as T from "./types"
import AudioItem from "./AudioItem"

class AudiotrackManager {
  /* MUTABLE CONFIGURATION */
  static #debug: boolean = false
  static #subtitlesJSON: T.SubtitlesJSON = {}
  static #supportedLocales: string[] = ["en"]
  static #fallbackLocale: string = this.#supportedLocales[0]!
  static #defaultAudioOptions: T.AudioOptions = {
    locale: this.#fallbackLocale,
  }

  /**
   * @deprecated use state.globalVolume instead
   */
  static #defaultVolume: number = 0.5

  /* STATE */
  static #state: T.AudioManagerState = {
    tracks: U.populateTracks(C.DEFAULT_NUMBER_OF_TRACKS),
    playRequests: [],
    globalVolume: C.DEFAULT_VOLUME,
    globalMuted: false,
    jitsiIsMuted: false,
    conferenceVolumes: {},
  }

  private static state_listeners: T.Listener<T.AudioManagerState>[] = []

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - - - CONFIG - - - - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  public static setConfiguration(args: T.AudiotrackManagerState) {
    if (typeof args.debug === "boolean") {
      this.#debug = args.debug
    }
    if (args.subtitlesJSON) {
      this.#subtitlesJSON = args.subtitlesJSON
    }
    if (typeof args.defaultVolume === "number") {
      this.#State = { ...this.#State, globalVolume: args.defaultVolume }
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
      const payload: T.AudioOptions = { ...rest }
      if (_locale) {
        payload.locale = _locale
      }
      this.#defaultAudioOptions = payload
    }
    /* TODO : GRACEFULLY HANDLE REDUCING (DELETING) TRACKS LENGTH */
  }

  public static initialize(args: T.AudiotrackManagerState) {
    const { number_of_tracks, ...rest } = args
    this.setConfiguration(rest)
    /* CANNOT REDUCE TRACK NUMBERS WITH THIS METHOD */
    if (
      args.number_of_tracks &&
      args.number_of_tracks > this.#State.tracks.length
    ) {
      this.purgeAllTracks()
      this.updateState({
        tracks: U.populateTracks(args.number_of_tracks, this.#defaultVolume),
      })
    }
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - STATE MANAGEMENT - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  public static getState(): T.AudioManagerState {
    return this.#State
  }

  static get #State(): T.AudioManagerState {
    return this.#state
  }

  static set #State(value: T.AudioManagerState) {
    this.#state = value
    this.emit()
  }

  static onStateChange(listener: T.Listener<T.AudioManagerState>): () => void {
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

  public static updateState(value: Partial<T.AudioManagerState>) {
    const prev = this.#State
    this.#State = { ...prev, ...value }
  }

  static getTrack(index: number): T.Track | null {
    if (!this.#State.tracks.length) return null
    if (index < 0 && index >= this.#State.tracks.length) return null
    return this.#State.tracks[index]!
  }

  static updateTrack(index: number, payload: Partial<T.Track>) {
    const track = this.getTrack(index)
    if (!track) return
    if (payload.queue) {
      track.queue = payload.queue
    }
    if (typeof payload.autoPlay === "boolean") {
      track.autoPlay = payload.autoPlay
      track.queue.forEach((item, idx) => {
        if (item.audio) {
          item.autoPlay = track.autoPlay
        }
      })
      const isPlaying = this.resumeTrack(index)
      track.isPlaying = isPlaying
    }
    if (typeof payload.muted === "boolean") {
      track.muted = payload.muted
      track.queue.forEach((item) => {
        if (item.audio) {
          item.audio.muted = track.muted
        }
      })
    }
    if (typeof payload.volume === "number") {
      track.volume = payload.volume
      track.queue.forEach((item) => {
        if (item.audio) {
          item.audio.volume = track.volume
        }
      })
    }
    if (typeof payload.loop === "boolean") {
      track.loop = payload.loop
      track.queue.forEach((item) => {
        if (item.audio) {
          item.audio.loop = track.loop
        }
      })
    }
    if (typeof payload.allowDuplicates === "boolean") {
      track.allowDuplicates = payload.allowDuplicates
    }
    if (typeof payload.isPlaying === "boolean") {
      track.isPlaying = payload.isPlaying
    }
    if (Object.prototype.hasOwnProperty.call(payload, "currentAudio")) {
      track.currentAudio = payload.currentAudio ?? null
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

  public static updateAllTracks(
    payload: Pick<
      Partial<T.Track>,
      "autoPlay" | "loop" | "volume" | "muted" | "allowDuplicates"
    >
  ) {
    const tracks = this.#State.tracks
    tracks.forEach((track, idx) => {
      const { autoPlay, loop, volume, muted, allowDuplicates } = payload
      if (typeof autoPlay === "boolean") {
        track.autoPlay = autoPlay
        track.queue.forEach((item) => {
          if (item.audio) {
            item.autoPlay = autoPlay
          }
        })
        const isPlaying = this.resumeTrack(idx)
        track.isPlaying = isPlaying
      }
      if (typeof loop === "boolean") {
        track.loop = loop
        track.queue.forEach((item) => {
          if (item.audio) {
            item.audio.loop = loop
          }
        })
      }
      if (typeof volume === "number") {
        track.volume = volume
        track.queue.forEach((item) => {
          if (item.audio) {
            item.audio.volume = volume
          }
        })
      }
      if (typeof muted === "boolean") {
        track.muted = muted
        track.queue.forEach((item) => {
          if (item.audio) {
            item.audio.muted = muted
          }
        })
      }
      if (typeof allowDuplicates === "boolean") {
        track.allowDuplicates = allowDuplicates
      }
    })
    this.updateState({ tracks })
  }

  static pushToQueue(trackIdx: number, payload: T.IAudioItem) {
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
    payload: T.IAudioItem
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

  public static togglePlayTrack(index: number) {
    const track = this.getTrack(index)
    if (!track?.queue.length) return
    const audioItem = track.queue[0]
    const audio = audioItem?.audio
    if (!audioItem || !audio) return
    let isPlaying = audio.paused
    if (audio.paused) {
      audio.play()
    } else {
      audio.pause()
    }
    this.updateTrack(index, { isPlaying })
  }

  public static resumeTrack(index: number): boolean {
    const track = this.getTrack(index)
    if (!track?.queue.length) return false
    const audioItem = track.queue[0]
    const audio = audioItem?.audio
    if (!audioItem || !audio) return false
    if (audio.paused) {
      audio.play()
      this.updateTrack(index, { isPlaying: true })
    }
    return true
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /* - - - - - - - - - - - - - - CORE - - - - - - - - - - - - - - - */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  public static purgeTrack(trackIdx: number) {
    const track = this.getTrack(trackIdx)
    if (!track?.queue.length) return
    let queue = track.queue
    if (queue.length) {
      const currentlyPlaying = queue[0]!
      queue = queue.slice(0, 1)
      currentlyPlaying.purge()
    }
    this.updateTrack(trackIdx, { queue })
  }

  private static purgeAllTracks() {
    this.#State.tracks.forEach((track, idx) => {
      this.purgeTrack(idx)
    })
  }

  static registerPlayRequests = (args: Array<Omit<T.PlayRequest, "id">>) => {
    const payload: T.PlayRequest[] = []
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
      let new_message: T.PlayRequest = {
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
    audioOptions: T.PartiallyRequired<T.AudioOptions, "volume" | "trackIdx"> & {
      muted?: boolean
      loop?: boolean
    }
  ) => {
    const filename = U.getFileName(src)
    const {
      trackIdx,
      volume,
      loop,
      muted,
      locale,
      keyForSubtitles,
      autoPlay,
      subtitles,
      originalFilename,
      onStart,
      onEnd,
    } = audioOptions
    const trackIdxIsValid = trackIdx >= 0
    const audio = new Audio(src)
    const uid = Date.now().toString()
    audio.volume = volume
    audio.muted = Boolean(muted)
    if (typeof loop === "boolean" && trackIdxIsValid) {
      audio.loop = loop
    }
    audio.setAttribute("id", uid)
    let _keyForSubtitles = keyForSubtitles ?? originalFilename ?? filename
    let _subtitles: null | T.Subtitle[] =
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
        caption: U.getCurrentCaption(_subtitles, audio.currentTime, _locale),
      })
    }
    const endingCallback = () => {
      if (onEnd) {
        onEnd()
      }
      cleanup()
    }
    const fireOnLoad = () => {
      const promise = audio.play()
      if (promise !== undefined) {
        promise
          .then(() => {
            if (trackIdxIsValid) {
              this.updateTrack(trackIdx, {
                isPlaying: true,
                currentAudio: audioItem,
                currentlyPlaying: filename,
              })
            }
          })
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
      log(`COULD NOT LOAD AUDIO SRC (${src})`, this.#debug)
      log(e, this.#debug, 2)
    }
    audio.addEventListener("play", fireOnLoad)
    audio.addEventListener("ended", endingCallback)
    audio.addEventListener("error", errorHandler)
    audio.addEventListener("timeupdate", update)
    const cleanup = () => {
      audio.currentTime = 0
      audio.pause()
      audio.removeEventListener("play", fireOnLoad)
      audio.removeEventListener("ended", endingCallback)
      audio.removeEventListener("timeupdate", update)
      audio.removeEventListener("error", errorHandler)
      log(`cleaning up audio: ${filename}`, this.#debug)
      if (trackIdxIsValid) {
        this.clearAudio(uid, filename)
      }
    }
    const audioItem = new AudioItem({
      id: uid,
      src: src,
      filename: originalFilename ?? filename,
      audio: audio,
      autoPlay: autoPlay,
      onPlay: fireOnLoad,
      onPurge: endingCallback,
    })
    return audioItem
  }

  // UNSAFE: Using -1 as trackIdx lets play the audio without assigning any track's queue.
  //         By doing so, the audio will only play once and immediately without affecting existing tracks and its queues.
  //         Doing so also overrides the `loop` value to `false`.
  //         Playing an audio this way allows overlapping as many times as possible; it's useful for sound effects like notifications.
  //         For this use case, please use `playAudio` instead of accessing this feature directly from `registerAudio`.
  public static registerAudio = (src: string, options?: T.AudioOptions) => {
    const _options = options
      ? { ...this.#defaultAudioOptions, ...options }
      : this.#defaultAudioOptions
    const { trackIdx = 0, priority, allowDuplicates } = _options
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
    if (!allowDuplicates && !track.allowDuplicates && dup) {
      log(
        `Audiotrack Manager prevented playing a duplicate audio (${src})`,
        this.#debug,
        1
      )
      return
    }
    _options.volume =
      typeof options?.volume === "number"
        ? Math.min(_options.volume!, track.volume, this.#State.globalVolume)
        : Math.min(track.volume, this.#State.globalVolume)
    _options.autoPlay =
      typeof options?.autoPlay === "boolean"
        ? options?.autoPlay
        : track.autoPlay
    const audioItem = this.createAudio(src, {
      ..._options,
      trackIdx: trackIdx,
      muted: this.#State.globalMuted || track.muted,
      loop: track.loop,
    } as Required<T.AudioOptions>)
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
    if (_options.autoPlay && queueLength <= 0) {
      audioItem.play()
    }
  }

  private static getAudioBySourceName(
    sourceName: string,
    method: "match" | "include" = "match"
  ): T.IAudioItem | null {
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
    options?: Pick<T.AudioOptions, "onStart" | "onEnd" | "volume"> & {
      muted?: boolean
      loop?: boolean
    }
  ) => {
    const audioItem = this.createAudio(src, {
      ...options,
      trackIdx: -1,
      volume:
        typeof options?.volume === "number"
          ? options.volume
          : this.#State.globalVolume,
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
      currentAudio.purge()
    } else if (typeof target === "string") {
      const currentAudio = this.getAudioBySourceName(target, method)
      if (currentAudio) {
        currentAudio.purge()
      }
    }
  }

  private static playNext = (trackIdx: number) => {
    const track = this.getTrack(trackIdx)
    if (!track?.queue.length) return
    const next_audio = track.queue[0]!
    if (next_audio.audio && !next_audio.audio?.currentTime) {
      log(`play next audio: ${U.getFileName(next_audio.src)}`, this.#debug)
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
      queue: U.dropFromArray(this.#State.tracks[trackIdx]!.queue, soundIdx),
      caption: null,
      currentAudio: null,
      isPlaying: false,
      currentlyPlaying: "",
    })
    log(`clear ${filename}`, this.#debug)
    const queue = this.#State.tracks[trackIdx]!.queue
    if (queue.length && queue[0]?.autoPlay) {
      this.playNext(trackIdx)
    }
  }

  public static setGlobalVolume = (val: number) => {
    log(`new global volume : ${val}`, this.#debug)
    const tracks = this.#State.tracks
    tracks.forEach((track) => {
      track.volume = val
      track.queue.forEach((item) => {
        if (item.audio) {
          item.audio.volume = val
        }
      })
    })
    this.updateState({ tracks: tracks, globalVolume: val })
  }

  public static toggleGlobalMute = (override?: boolean) => {
    const state =
      typeof override === "boolean" ? override : !this.#State.globalMuted
    const tracks = this.#State.tracks
    tracks.forEach((track) => {
      if (!track.muted) {
        track.queue.forEach((item) => {
          if (item.audio) {
            item.audio.muted = state
          }
        })
      }
      track.muted = state
    })
    this.updateState({ globalMuted: state })
  }

  public static getCurrentCaption = (trackIdx: number) => {
    const track = this.getTrack(trackIdx)
    if (!track) return null
    if (!track.caption) {
      console.log(`track#${trackIdx} is not displaying a caption.`)
      return null
    }
    return track.caption
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
  logLevel: T.ValueOf<typeof C.LOG_LEVEL> = C.LOG_LEVEL.debug,
  alertErrorOnProduction = false
) {
  if (!debug) return
  let isError = false
  let println: T.Logger | undefined
  switch (logLevel) {
    case C.LOG_LEVEL.error:
      println = console.error
      isError = true
      break
    case C.LOG_LEVEL.warn:
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
