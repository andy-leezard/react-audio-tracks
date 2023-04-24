import * as UI from "./UI"
import { useTrackStream } from "."
import type { TrackState } from "."

type CaptionViewerProps = {
  inheritState: TrackState
  index: number
}

const CaptionViewer = ({ index, inheritState }: CaptionViewerProps) => {
  const [stream, instance] = useTrackStream(index)

  if (!stream || !instance) {
    return <></>
  }

  return (
    <UI.TrackLineContainer style={{ width: "100%" }} key={`state-${index}`}>
      <UI.TrackIndex>#{index}</UI.TrackIndex>
      <UI.CaptionNarrator>
        {(stream.caption?.narrator ?? "") || "-"}
      </UI.CaptionNarrator>
      <UI.CaptionDescription>
        {(stream.caption?.description ?? "") || "-"}
      </UI.CaptionDescription>
      <UI.CaptionText>{(stream.caption?.text ?? "") || "-"}</UI.CaptionText>
    </UI.TrackLineContainer>
  )
}

export default CaptionViewer
