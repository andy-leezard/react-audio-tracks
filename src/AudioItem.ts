import { AudioItemConstructor, IAudioItem } from "./types"

class AudioItem implements IAudioItem {
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
    this.onPlay()
  }

  public purge() {
    this.onPurge()
  }
}

export default AudioItem
