import { useState, useEffect } from "react"
import AudiotrackManager from "./AudiotrackManager"
import type { AudioManagerState } from "./types"

function useAudiotracks(): AudioManagerState {
  const [state, setState] = useState<AudioManagerState>(
    AudiotrackManager.getState()
  )

  useEffect(() => {
    const unsubscribe = AudiotrackManager.onStateChange(setState)
    return () => {
      unsubscribe()
    }
  }, [])

  return state
}

export default useAudiotracks
