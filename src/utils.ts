import type { CaptionState, Subtitle, Track } from "./types"

const dropFromArray = (arr: any[], idx: number) => {
  if (!(arr instanceof Array) || idx < 0) return arr
  return [...arr.slice(0, idx), ...arr.slice(idx + 1, arr.length)]
}

function populateTracks(length: number, volume = 0.5) {
  const output: Track[] = []
  for (let i = 0; i < length; i++) {
    output.push({
      queue: [],
      currentAudio: null,
      isPlaying: false,
      name: `Track ${i + 1}`,
      volume: volume,
      muted: false,
      loop: false,
      autoPlay: false,
      allowDuplicates: false,

      // depreated
      currentlyPlaying: "",
    })
  }
  return output
}

function populateCaptions(length: number) {
  const output: CaptionState[] = []
  for (let i = 0; i < length; i++) {
    output.push({
      isPlaying: false,
      text: "",
    })
  }
  return output
}

const getCurrentCaption = (
  subtitles: Subtitle[],
  currentTimeSec: number,
  locale?: string
) => {
  let crnt: CaptionState = {
    isPlaying: true,
    text: "",
  }
  for (let i = 0; i < subtitles.length; i++) {
    const subtitle = subtitles[i]!
    if (subtitle.from <= currentTimeSec && subtitle.to > currentTimeSec) {
      const { text, description, ...rest } = subtitle
      crnt = { ...crnt, ...rest }
      if (typeof text === "string") {
        crnt.text = text
      } else if (locale && Object.prototype.hasOwnProperty.call(text, locale)) {
        crnt = { ...crnt, text: text[locale]! }
        if (subtitle.narrator) {
          crnt.narrator = subtitle.narrator
        }
      }
      if (description) {
        if (typeof description === "string") {
          crnt.description = description
        } else if (
          locale &&
          Object.prototype.hasOwnProperty.call(description, locale)
        ) {
          crnt = { ...crnt, description: description[locale] }
        }
      }
      break
    }
  }
  return crnt
}

const getFileName = (src: string): string => {
  const file_name_arr = src.split("/")
  const file_name_with_extension = file_name_arr[file_name_arr.length - 1]
  return file_name_with_extension!.split(".")[0]!
}

const detectLocale = () =>
  Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0]!

export {
  dropFromArray,
  getCurrentCaption,
  populateTracks,
  getFileName,
  detectLocale,
  populateCaptions,
}
