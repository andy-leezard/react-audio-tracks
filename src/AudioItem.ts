import type * as T from "./types"
import * as U from "./utils"
class AudioItem {
  #debug = false
  #id = ""
  #filename = ""
  #src = ""
  #innerAudio: HTMLAudioElement | null = null
  #onPlay: () => void = () => {}
  #onPause: () => void = () => {}
  #onEnd: () => void = () => {}
  #onError: () => void = () => {}
  #onUpdate: () => void = () => {}
  removeAllListeners: () => void = () => {}

  #started = false
  #paused = false
  #ended = false

  constructor(
    parameters: Pick<T.AudioItemState, "id" | "src" | "filename"> & {
      debug: boolean
      innerAudio: HTMLAudioElement

      id: string
      src: string
      filename: string

      onPlay: (firstRun: boolean) => void
      onPause: () => void
      onEnd: () => void
      onError: () => void
      onUpdate: () => void
    }
  ) {
    const {
      debug,
      innerAudio,
      id,
      filename,
      src,
      onPlay,
      onPause,
      onEnd,
      onError,
      onUpdate,
    } = parameters
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
    }
    this.#onPause = () => {
      this.#paused = true
      onPause()
    }
    this.#onError = () => {
      this.#ended = true
      onError()
      onEnd()
    }
    this.#onUpdate = () => {
      onUpdate()
    }
    this.#onEnd = () => {
      this.#ended = true
      this.removeAllListeners()
      onEnd()
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
}

export default AudioItem
