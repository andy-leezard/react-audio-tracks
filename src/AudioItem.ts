import { AudioItemConstructor, IAudioItem } from "./types"

class AudioItem implements IAudioItem {
  // Indicates whether or not the event listeners were registered.
  // If true: it specifically means that `play` method here has been already called.
  public loaded = false
  public id = ""
  public filename = ""
  public src = ""
  public audio: IAudioItem["audio"]

  private onPlay: () => void = () => {}
  private onPurge: () => void = () => {}

  constructor(
    parameters: AudioItemConstructor & {
      onPlay: () => void
      onPurge: () => void
    }
  ) {
    Object.assign(this, parameters)
  }

  public play() {
    if (!this.loaded) {
      this.onPlay()
      this.loaded = true
    }
  }

  public purge() {
    this.onPurge()
  }
}

export default AudioItem
