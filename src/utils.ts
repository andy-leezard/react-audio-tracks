import { LOG_LEVEL } from "./constants"
import type { CaptionState, Logger, Subtitle, ValueOf } from "./types"

const dropFromArray = <T>(arr: T[], idx: number): T[] => {
  if (!(arr instanceof Array) || idx < 0) return arr
  return [...arr.slice(0, idx), ...arr.slice(idx + 1, arr.length)]
}

const getCurrentCaption = (
  subtitles: Subtitle[],
  currentTimeSec: number,
  locale?: string
) => {
  let crnt: CaptionState = {
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

/**
A function that returns a universally unique identifier (uuid).  
example: 1b83fd69-abe7-468c-bea1-306a8aa1c81d
@returns `string` : 32 character uuid (see example)
*/
function uuid() {
  const hashTable = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ]
  let uuid = []
  for (let i = 0; i < 35; i++) {
    if (i === 7 || i === 12 || i === 17 || i === 22) {
      uuid[i] = "-"
    } else {
      uuid[i] = hashTable[Math.floor(Math.random() * hashTable.length - 1)]
    }
  }
  return uuid.join("")
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

export {
  dropFromArray,
  getCurrentCaption,
  getFileName,
  detectLocale,
  uuid,
  log,
}
