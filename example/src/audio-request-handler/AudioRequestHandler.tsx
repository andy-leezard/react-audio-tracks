import React, { useEffect, useRef } from "react"
import styles from "./AudioRequestHandler.module.css"
import { useAudiotracks } from "../"

type AudioRequestHandlerProps = {}

const AudioRequestHandler = (props: AudioRequestHandlerProps) => {
  const state = useAudiotracks()
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const listener = () => {
      if (!dialogRef?.current) return
      if (state.playRequests.length && !dialogRef.current.open) {
        dialogRef.current.showModal()
        return
      }
      if (!state.playRequests.length && dialogRef.current.open) {
        dialogRef.current.close()
      }
    }
    listener()
  }, [state])

  return (
    <dialog ref={dialogRef} className={styles.dialogWrapper}>
      <div className={styles.modal_container}>
        {state.playRequests.length ? (
          <>
            {state.playRequests[0].metadata ? (
              <>
                <span>{state.playRequests[0].metadata.title}</span>
                <span>{state.playRequests[0].metadata.description}</span>
              </>
            ) : (
              <></>
            )}
            {state.playRequests.length > 1 ? (
              <span>
                You have ({state.playRequests.length}) audios in queue.
              </span>
            ) : (
              <></>
            )}
            <button
              onClick={() => {
                state.playRequests.forEach((r) => r.onAccept())
              }}
            >
              Listen
            </button>
            {/* YOU CAN'T REJECT */}
            <button
              onClick={() => {
                state.playRequests.forEach((r) => r.onReject())
              }}
            >
              Dismiss
            </button>
          </>
        ) : (
          <></>
        )}
      </div>
    </dialog>
  )
}

export default AudioRequestHandler
