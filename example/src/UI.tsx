
import styled, { keyframes } from "styled-components"

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0px;
  background: linear-gradient(#141e30, #243b55);
  overflow: auto;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0rem 1rem 1rem 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  min-width: max(550px, 80dvw);
  margin: auto;
`

export const glitch = keyframes`
  40% {
    text-shadow: -0.03rem 0px 2px red, 0.03em 0px 2px cyan;
  }

  42.5% {
    text-shadow: -0.06rem 0px 2px red, 0.06em 0px 2px cyan;
  }

  45% {
    text-shadow: -0.09rem 0px 2px red, 0.09em 0px 2px cyan;
  }

  47.5% {
    text-shadow: -0.012rem 0px 2px red, 0.012em 0px 2px cyan;
  }

  50% {
    text-shadow: 0.09rem 0px 2px red, -0.09em 0px 2px cyan;
  }

  75.5% {
    text-shadow: -0.06rem 0px 2px red, 0.06em 0px 2px cyan;
  }

  100% {
    text-shadow: -0.025rem 0px 2px red, 0.025em 0px 2px cyan;
  }
`

export const GlitchedSpan = styled.span`
  text-shadow: -0.03rem 0px 2px red, 0.03em 0px 2px cyan;
  animation: ${glitch} 2s infinite;
  -webkit-animation: ${glitch} 2s infinite;
`

export const Title = styled(GlitchedSpan)`
  font-size: 1.5rem;
  align-self: center;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`

export const TrackLineInterface = styled.div`
  align-self: center;
  display: flex;
  padding: 0.5rem;
  border-radius: 8px;
  gap: 0.5rem;
  align-items: center;
  min-height: 3.25rem;
`

export const TrackLineContainer = styled(TrackLineInterface)`
  background-color: #333333;
  margin-bottom: 0.5rem;
  text-overflow: ellipsis;
`
interface TrackLineItemProps {
  isLastChild?: boolean
}

export const TrackLineItem = styled.div<TrackLineItemProps>`
  display: flex;
  flex-shrink: 0;
  padding-right: 0.5rem;
  border-right: ${(props) => (props.isLastChild ? "0" : "1")}px solid #858585;
  justify-content: center;
  text-align: center;
`

export const TrackIndex = styled(TrackLineItem)`
  width: 55px;
`

export const Width120 = styled(TrackLineItem)`
  width: 117px;
`

export const UserInputItem = styled(TrackLineItem)`
  width: 320px;
`

export const TrackMute = styled(TrackLineItem)`
  width: 45px;
`

export const TrackMuteInteractable = styled(TrackMute)`
  opacity: 0.75;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

export const Width70 = styled(TrackLineItem)`
  width: 70px;
`

export const Width70Interactable = styled(Width70)`
  opacity: 0.75;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

export const TrackQueue = styled(TrackLineItem)`
  width: 60px;
`

export const TrackPlayState = styled(TrackLineItem)`
  width: 60px;
`

export const TrackPlayStateInteractable = styled(TrackPlayState)`
  opacity: 0.75;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

export const CaptionNarrator = styled(TrackLineItem)`
  width: 80px;
`

export const CaptionDescription = styled(TrackLineItem)`
  width: 200px;
`

export const CaptionText = styled(TrackLineItem)`
  flex: 1;
  min-width: 200px;
`

export const Ellipsis = styled.span`
  max-width: 100%;
  max-height: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`
