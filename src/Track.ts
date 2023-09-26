import AudioItem from "./AudioItem"
import * as C from "./constants"
import * as U from "./utils"
import type * as T from "./types"

class Track {
  debug = false
  #index: number = 0
  #name: string = ""
  #queue: AudioItem[] = []
  #subtitlesJSON: T.SubtitlesJSON = {}
  #getInheritedAudioOptions: () => T.AudioOptions = () => ({})
  #getInheritedState: () => T.AudiotrackManagerState | null = () => null

  #state: T.TrackState = {
    queue: [],
    id: U.uuid(),
    isPlaying: false,
    volume: 1,
    muted: false,
    loop: false,
    autoPlay: false,
    playbackRate: 1,
    allowDuplicates: false,
    locale: undefined,
    updateFrequencyMs: undefined,
  }
  private state_listeners: T.Listener<T.TrackState>[] = []

  #stream: T.TrackStream = {
    trackIsPlaying: false,
    audioItemState: null,
    caption: null,
    innerAudioState: null,
  }
  private stream_listeners: T.Listener<T.TrackStream>[] = []
  updateTrackCallback: (trackState: T.TrackState) => void = () => {}

  constructor(
    args: Partial<T.MutTrackState> & {
      debug: boolean
      index: number
      name?: string
      getInheritedState: () => T.AudiotrackManagerState
      updateTrackCallback: (trackState: T.TrackState) => void
    }
  ) {
    const {
      debug,
      index,
      name,
      getInheritedState,
      updateTrackCallback,
      ...partialMutTrackState
    } = args
    this.debug = debug
    this.#index = index
    this.#name = name ?? `Track #${index}`
    this.#getInheritedState = getInheritedState
    this.updateTrackCallback = updateTrackCallback
    Object.assign(this.#state, partialMutTrackState)
  }

  public getState(): T.TrackState {
    return this.#State
  }

  get #State(): T.TrackState {
    return this.#state
  }

  set #State(value: T.TrackState) {
    this.#state = value
    this.emitState()
  }

  get #Queue(): AudioItem[] {
    return this.#queue
  }

  set #Queue(value: AudioItem[]) {
    this.#queue = value
    const hasItem = this.#queue.length
    const Statepayload: Partial<T.TrackState> = {
      queue: this.#queue.map((item) => item.getState()),
    }
    if (!hasItem) {
      Statepayload.isPlaying = false
      this.#updateStream({
        trackIsPlaying: false,
        caption: null,
        audioItemState: null,
        innerAudioState: null,
      })
    } else if (!this.#State.autoPlay) {
      Statepayload.isPlaying = false
      this.#updateStream({
        trackIsPlaying: false,
        audioItemState: this.#queue[0]?.getState() ?? null,
        innerAudioState: this.#queue[0]?.getInnerAudioState() ?? null,
      })
    }
    this.#updateState(Statepayload)
  }

  onStateChange(listener: T.Listener<T.TrackState>): () => void {
    this.state_listeners.push(listener)
    return () => {
      this.state_listeners = this.state_listeners.filter((l) => l !== listener)
    }
  }

  public getStream(): T.TrackStream {
    return this.#Stream
  }

  get #Stream(): T.TrackStream {
    return this.#stream
  }

  set #Stream(value: T.TrackStream) {
    this.#stream = value
    this.emitStream()
  }

  onStreamChange(listener: T.Listener<T.TrackStream>): () => void {
    this.stream_listeners.push(listener)
    return () => {
      this.stream_listeners = this.stream_listeners.filter(
        (l) => l !== listener
      )
    }
  }

  #updateStream(value?: Partial<T.TrackStream>) {
    const prev = this.#Stream
    const newState = { ...prev, ...value }
    this.#Stream = newState
  }

  private emitState(): void {
    this.updateTrackCallback(this.#State)
    this.state_listeners.forEach((listener) => listener(this.#State))
  }

  private emitStream(): void {
    this.stream_listeners.forEach((listener) => listener(this.#Stream))
  }

  getCurrentAudio() {
    if (!this.#State.queue.length) return null
    return this.#State.queue[0]
  }

  getNextAudio() {
    if (this.#State.queue.length < 2) return null
    return this.#State.queue[1]
  }

  isPlaying() {
    return this.#State.isPlaying
  }

  #updateState(value?: Partial<T.TrackState>) {
    const prev = this.#State
    const newState = { ...prev, ...value }
    this.#State = newState
  }

  /**
   * updates the track's mutable state properties
   */
  public updateState(value: Partial<T.MutTrackState>) {
    const {
      autoPlay,
      allowDuplicates,
      locale,
      loop,
      muted,
      volume,
      playbackRate,
    } = value
    const payload: Partial<T.MutTrackState> = {}
    if (typeof autoPlay === "boolean") {
      payload.autoPlay = autoPlay
      this.togglePlay(true)
    }
    if (typeof allowDuplicates === "boolean") {
      payload.allowDuplicates = allowDuplicates
    }
    if (typeof locale === "string") {
      payload.locale = locale
    }
    if (typeof loop === "boolean") {
      payload.loop = loop
      this.#Queue.forEach((item) => {
        item.setLoop(loop)
      })
    }
    if (typeof muted === "boolean") {
      payload.muted = muted
      this.#Queue.forEach((item) => {
        item.toggleMute(muted)
      })
    }
    if (typeof volume === "number") {
      payload.volume = volume
      this.#Queue.forEach((item) => {
        item.setVolume(
          volume * (this.#getInheritedState()?.masterVolume ?? C.DEFAULT_VOLUME)
        )
      })
    }
    if (typeof playbackRate === "number") {
      payload.playbackRate = playbackRate
      this.#Queue.forEach((item) => {
        item.setPlaybackRate(playbackRate)
      })
    }
    if ("updateFrequencyMs" in value) {
      payload.updateFrequencyMs = value.updateFrequencyMs
      this.#Queue.forEach((item) => {
        item.setFrequencyMs(value.updateFrequencyMs)
      })
    }
    this.#updateState(payload)
  }

  /**
   * Will resume the track ONLY IF it has a currently playing audio that has been paused.
   */
  resumeTrack() {
    if (!this.#Queue.length) return
    const audioItem = this.#Queue[0]
    if (!audioItem || !audioItem?.getState().paused) return
    audioItem.play()
  }

  /**
   * @param override
   * if true : always triggers `audioItem.play()`.
   *
   * if false : always triggers `audioItem.pause()`.
   *
   * Consider using `pauseTrack()` and `resumeTrack()` for most use cases.
   */
  togglePlay(override?: boolean) {
    if (!this.#Queue.length) return
    const audioItem = this.#Queue[0]
    if (!audioItem) return
    if (typeof override === "boolean") {
      if (override) {
        audioItem.play()
      } else {
        audioItem.pause()
      }
      return
    }
    /** is playing */
    if (!audioItem?.getState().paused && audioItem?.getState().started) {
      audioItem.pause()
    } else {
      audioItem.play()
    }
  }

  /**
   * Pause current audio if is playing
   */
  pauseTrack() {
    this.togglePlay(false)
  }

  #getLocale(overrideLocale?: string, inheritedLocale?: string) {
    return overrideLocale ?? this.#State.locale ?? inheritedLocale
  }

  #createAudio = (
    src: string,
    audioOptions: T.AudioCallbacks & T.AudioOptions
  ) => {
    const filename = U.getFileName(src)
    const {
      volume,
      loop,
      muted,
      locale,
      playbackRate,
      keyForSubtitles,
      subtitles,
      originalFilename,
      updateFrequencyMs,
      onPlay,
      onUpdate,
      onPause,
      onEnd,
      onResolve,
      onError,
    } = audioOptions
    const inhertiedAudioOptions = this.#getInheritedAudioOptions()
    const audio = new Audio(src)
    const uid = Date.now().toString()
    audio.setAttribute("id", uid)
    audio.volume =
      (volume ??
        this.#State.volume ??
        inhertiedAudioOptions.volume ??
        C.DEFAULT_VOLUME) *
      (this.#getInheritedState()?.masterVolume ?? C.DEFAULT_VOLUME)
    audio.muted =
      muted ?? this.#State.muted ?? inhertiedAudioOptions.muted ?? false
    audio.loop = loop ?? this.#State.loop ?? inhertiedAudioOptions.loop ?? false
    audio.playbackRate =
      playbackRate ??
      this.#State.playbackRate ??
      inhertiedAudioOptions.playbackRate ??
      1
    const _locale = this.#getLocale(locale, inhertiedAudioOptions.locale)
    const _keyForSubtitles = keyForSubtitles ?? originalFilename ?? filename
    const _subtitles =
      subtitles ??
      Object.prototype.hasOwnProperty.call(
        this.#subtitlesJSON,
        _keyForSubtitles
      )
        ? this.#subtitlesJSON[_keyForSubtitles]!
        : []
    const audioItem = new AudioItem({
      debug: this.debug,
      innerAudio: audio,
      id: uid,
      src: src,
      filename: originalFilename ?? filename,
      updateFrequencyMs: updateFrequencyMs ?? this.#State.updateFrequencyMs,
      onPlay: (firstRun: boolean) => {
        if (firstRun && onPlay) {
          onPlay()
        }
        const payload: Partial<T.TrackStream> = {
          trackIsPlaying: true,
          audioItemState: audioItem.getState(),
          innerAudioState: audioItem.getInnerAudioState(),
        }
        if (_subtitles?.length) {
          payload.caption = U.getCurrentCaption(_subtitles, 0, _locale)
        }
        this.#updateState({
          isPlaying: true,
        })
        this.#updateStream(payload)
      },
      onUpdate: () => {
        if (onUpdate) {
          onUpdate()
        }
        const payload: Partial<T.TrackStream> = {
          audioItemState: audioItem.getState(),
          innerAudioState: audioItem.getInnerAudioState(),
        }
        if (_subtitles?.length) {
          payload.caption = U.getCurrentCaption(
            _subtitles,
            audio.currentTime,
            _locale
          )
        }
        this.#updateStream(payload)
      },
      onPause: () => {
        if (onPause) {
          onPause()
        }
        this.#updateState({
          isPlaying: false,
        })
        this.#updateStream({
          trackIsPlaying: false,
          audioItemState: audioItem.getState(),
          innerAudioState: audioItem.getInnerAudioState(),
        })
      },
      onEnd: () => {
        if (onEnd) {
          onEnd()
        }
        this.clearAudio(uid, filename)
        this.#updateStream({
          audioItemState: null,
          innerAudioState: null,
          caption: null,
        })
      },
      onResolve: () => {
        if (onResolve) {
          onResolve()
        }
      },
      onError: (e: ErrorEvent) => {
        if (onError) {
          onError(e)
        }
        if (onEnd) {
          onEnd()
        }
        this.clearAudio(uid, filename)
        this.#updateStream({
          audioItemState: null,
          innerAudioState: null,
          caption: null,
        })
      },
    })
    return audioItem
  }

  #pushToQueue(payload: AudioItem) {
    this.#Queue = [...this.#Queue, payload]
  }

  #injectToQueue(splicingIndex: number, payload: AudioItem) {
    const queue = [
      ...this.#Queue.slice(0, splicingIndex),
      payload,
      ...this.#Queue.slice(splicingIndex, this.#Queue.length),
    ]
    this.#Queue = queue
  }

  /**
   * Registers an audio source to the `Track`'s queue to be played.
   *
   * By default, options inherit from the `Track`'s settings and then completes itself with `AudiotrackManager`'s settings if defined.
   * Debug the options in runtime if needed by using `Track.defaultAudioOptions` or `AudiotrackManager.getDefaultAudioOptions`.
   *
   * `AudiotrackManager`'s default `AudioOptions` can be set at the initializing phase by using `AudiotrackManager.initialize(...args)`
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
  registerAudio(src: string, options: T.AudioCallbacks & T.AudioOptions) {
    const dup = this.#Queue.find((s) => s.srcEqualTo(src))
    if (!options?.allowDuplicates && !this.#State.allowDuplicates && dup) {
      U.log(
        `Audiotrack Manager prevented playing a duplicate audio (${src})`,
        this.debug
      )
      return
    }
    const audioItem = this.#createAudio(src, options)
    const queueLength = this.#Queue.length
    const { priority } = options
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
      this.#injectToQueue(_priority, audioItem)
      if (skipCurrent) {
        this.skipAudio()
      }
    } else {
      this.#pushToQueue(audioItem)
    }
    if (this.#State.autoPlay && queueLength <= 0) {
      audioItem.play()
    }
  }

  /**
   * Skips the currently playing audio on the `Track`
   */
  skipAudio = (target: number | string = 0, method?: "match" | "include") => {
    if (typeof target === "number") {
      if (this.#Queue.length <= target || target < 0) return
      this.#Queue[target]?.end()
      U.log(
        `force stopping : ${this.#Queue[target]?.getState().src}`,
        this.debug
      )
    } else if (typeof target === "string") {
      if (method === "match") {
        const _item = this.#Queue.find((item) => item.srcEqualTo(target))
        if (_item) {
          _item.end()
        }
      } else if (method === "include") {
        const _item = this.#Queue.find((item) =>
          item.getState().src.includes(target)
        )
        if (_item) {
          _item.end()
        }
      }
    }
  }

  private clearAudio = (uid: string, filename: string) => {
    const soundIdx = this.#Queue.findIndex((s) => s.idEqualTo(uid))
    if (soundIdx) {
      U.log(
        `Cannot clear audio for uid: ${uid} (track & queue index not found)`
      )
      return
    }
    this.#Queue = U.dropFromArray(this.#Queue, soundIdx)
    const nextAudio = this.#Queue.length ? this.#Queue[0] : undefined
    U.log(`cleared ${filename}`)
    if (nextAudio && this.#State.autoPlay) {
      U.log(`next playing ${nextAudio.getState().filename}`)
      nextAudio.play()
    }
  }

  /**
   * Removes every audio registered in the queue and ends any currently playing audio.
   */
  purgeTrack = () => {
    const queueLen = this.#Queue.length
    let queue = this.#State.queue
    if (queueLen) {
      this.#Queue.forEach((item, idx) => {
        if (idx) {
          item.removeAllListeners()
        }
      })
      if (queueLen > 1) {
        this.#Queue = this.#Queue.slice(0, 1)
        queue = queue.slice(0, 1)
      }
      this.#Queue[0]!.end()
    }
    this.#updateState({ queue })
  }

  /**
   * Updates the subtitles ref for this track.
   */
  injectSubtitles = (subtitlesJSON: T.SubtitlesJSON) => {
    this.#subtitlesJSON = subtitlesJSON
  }

  /**
   * Update the inner index value when removing tracks.
   */
  updateIndex(index: number) {
    const prevIndex = this.#index
    this.#index = index
    // if default name
    if (this.#name === `Track #${prevIndex}`) {
      this.#name = `Track #${index}`
    }
  }

  /**
   * Updates the master volume reference.
   *
   * Do not call this method manually.
   */
  applyMasterVolume(masterVolume: number) {
    this.#queue.forEach((item) =>
      item.setVolume(masterVolume * this.#State.volume)
    )
  }

  /**
   * @returns the volume multiplied by the master volume reference
   */
  getAdjustedVolume() {
    return (
      this.#State.volume *
      (this.#getInheritedState()?.masterVolume ?? C.DEFAULT_VOLUME)
    )
  }

  /**
   * Re-construct its state from `AudiotrackManager` after a global audio options or locale change.
   * This will inherit and overwrite all applicable audio options.
   */
  reconstruct(payload: Partial<T.TrackState>) {
    const { volume, muted, loop, locale, playbackRate, updateFrequencyMs } =
      payload
    const subset: Partial<T.TrackState> = {}
    if (typeof volume === "number") {
      subset.volume = volume
    }
    if (typeof muted === "boolean") {
      subset.muted = muted
    }
    if (typeof loop === "boolean") {
      subset.loop = loop
    }
    if (typeof locale === "string") {
      subset.locale = locale
    }
    if (typeof playbackRate === "number") {
      subset.playbackRate = playbackRate
    }
    subset.updateFrequencyMs = updateFrequencyMs
    console.log(payload)
    this.#updateState(subset)
  }
}

export default Track
