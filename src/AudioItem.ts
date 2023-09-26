import type * as T from "./types"
import * as U from "./utils"
class AudioItem {
  #debug = false
  #id = ""
  #filename = ""
  #src = ""
  #innerAudio: HTMLAudioElement | null = null
  #updateFrequencyMs: number | undefined = undefined
  #interval: ReturnType<typeof setInterval> | null = null
  #onPlay: () => void = () => {}
  #onPause: () => void = () => {}
  #onEnd: () => void = () => {}
  #onError: (e: ErrorEvent) => void = () => {}
  #onUpdate: () => void = () => {}
  removeAllListeners: () => void = () => {}

  #started = false
  #paused = false
  #ended = false

  constructor(
    parameters: Pick<T.AudioItemState, "id" | "src" | "filename"> &
      Required<Omit<T.AudioCallbacks, "onPlay">> &
      Pick<T.AudioOptions, "updateFrequencyMs"> & {
        debug: boolean
        innerAudio: HTMLAudioElement

        id: string
        src: string
        filename: string

        onPlay: (firstRun: boolean) => void
      }
  ) {
    const {
      debug,
      innerAudio,
      id,
      filename,
      src,
      updateFrequencyMs,
      onPlay,
      onPause,
      onEnd,
      onResolve,
      onError,
      onUpdate,
    } = parameters
    this.#updateFrequencyMs = updateFrequencyMs
    this.#debug = debug
    this.#id = id
    this.#filename = filename
    this.#src = src
    this.#onPlay = () => {
      this.#paused = false
      onPlay(!this.#started)
      if (!this.#started) {
        this.#started = true
      }
      this.#loopUpdate()
    }
    this.#onPause = () => {
      this.#paused = true
      onPause()
    }
    this.#onError = (e: ErrorEvent) => {
      this.#ended = true
      this.removeAllListeners()
      onError(e)
      onEnd()
    }
    this.#onUpdate = (e?: Event) => {
      // if updateFrequencyMs is manually given, ignore the native event
      if ((this.#updateFrequencyMs && !e) || (!this.#updateFrequencyMs && e)) {
        onUpdate()
      }
    }
    this.#onEnd = () => {
      this.#ended = true
      this.removeAllListeners()
      onEnd()
      onResolve()
    }
    this.removeAllListeners = () => {
      innerAudio.removeEventListener("play", this.#onPlay)
      innerAudio.removeEventListener("pause", this.#onPause)
      innerAudio.removeEventListener("error", this.#onError)
      innerAudio.removeEventListener("timeupdate", this.#onUpdate)
      innerAudio.removeEventListener("ended", this.#onEnd)
      innerAudio.pause()
      innerAudio.currentTime = 0
      U.log(`cleaning up audio: ${filename}`, this.#debug)
    }
    innerAudio.addEventListener("play", this.#onPlay)
    innerAudio.addEventListener("pause", this.#onPause)
    innerAudio.addEventListener("ended", this.#onEnd)
    innerAudio.addEventListener("error", this.#onError)
    innerAudio.addEventListener("timeupdate", this.#onUpdate)
    this.#innerAudio = innerAudio
  }

  get #UpdateFrequencyMs() {
    return this.#updateFrequencyMs
  }

  set #UpdateFrequencyMs(value: number | undefined) {
    this.#updateFrequencyMs = value
    this.#loopUpdate()
  }

  public idEqualTo(id: string) {
    return this.#id === id
  }

  public srcEqualTo(src: string) {
    return this.#src === src
  }

  public getState(): T.AudioItemState {
    return {
      id: this.#id,
      src: this.#src,
      filename: this.#filename,
      paused: this.#paused,
      ended: this.#ended,
      started: this.#started,
      updateFrequencyMs: this.#updateFrequencyMs,
    }
  }

  public getInnerAudioState(): T.InnerAudioState | null {
    if (!this.#innerAudio) return null
    return {
      muted: this.#innerAudio.muted,
      volume: this.#innerAudio.volume,
      currentTime: this.#innerAudio.currentTime,
      duration: this.#innerAudio.duration,
      paused: this.#innerAudio.paused,
      playbackRate: this.#innerAudio.playbackRate,
      preservesPitch: this.#innerAudio.preservesPitch,
    }
  }

  /** According to `this.#updateFrequencyMs` */
  #loopUpdate() {
    const frequency =
      this.#updateFrequencyMs && this.#updateFrequencyMs > 0
        ? Math.round(this.#updateFrequencyMs)
        : undefined
    if (!this.#started) return
    if (frequency) {
      if (this.#interval) {
        clearInterval(this.#interval)
      }
      this.#interval = setInterval(() => {
        const frequencyIsStillValid =
          this.#updateFrequencyMs && this.#updateFrequencyMs > 0
        if (
          this.#interval &&
          (!this.#innerAudio ||
            this.#paused ||
            this.#ended ||
            !frequencyIsStillValid)
        ) {
          clearInterval(this.#interval)
          return
        }
        if (this.#innerAudio) {
          this.#onUpdate()
        }
      }, frequency)
    } else if (this.#interval) {
      clearInterval(this.#interval)
    }
  }

  public play() {
    if (!this.#innerAudio) return
    this.#innerAudio.play()
  }

  public pause() {
    if (!this.#innerAudio) return
    this.#innerAudio.pause()
  }

  public end() {
    if (!this.#innerAudio) return
    this.#innerAudio.dispatchEvent(new Event("ended"))
  }

  public mute() {
    if (!this.#innerAudio) return
    this.#innerAudio.muted = true
  }

  public unmute() {
    if (!this.#innerAudio) return
    this.#innerAudio.muted = false
  }

  public toggleMute(override?: boolean) {
    if (!this.#innerAudio) return
    this.#innerAudio.muted =
      typeof override === "boolean" ? override : !this.#innerAudio.muted
  }

  public setLoop(state: boolean) {
    if (!this.#innerAudio) return
    this.#innerAudio.loop = state
  }

  public setVolume(level: number) {
    if (!this.#innerAudio) return
    this.#innerAudio.volume = level
  }

  public setPlaybackRate(level: number) {
    if (!this.#innerAudio) return
    this.#innerAudio.playbackRate = level
  }

  public setFrequencyMs(frequencyMs: number | undefined) {
    this.#UpdateFrequencyMs = frequencyMs
  }
}

export default AudioItem
