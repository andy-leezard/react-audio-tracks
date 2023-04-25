import { useState, useEffect } from "react"
import AudiotrackManager from "./AudiotrackManager"
import type { AudiotrackManagerState } from "./types"

function useAudiotracks(): AudiotrackManagerState {
  const [state, setState] = useState<AudiotrackManagerState>(
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
