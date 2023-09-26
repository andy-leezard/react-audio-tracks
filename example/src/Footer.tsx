import React from "react"
import * as UI from "./UI"
import { TbBrandNpm } from "react-icons/tb"

type Props = {}

const Footer = (props: Props) => {
  return (
    <>
      <UI.GlitchedSpan
        style={{
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          marginTop: "0.75rem",
        }}
      >
        <a
          href="https://www.npmjs.com/package/react-audio-tracks"
          target="_blank"
        >
          <TbBrandNpm color={"#cb0303"} size={32} />
        </a>
      </UI.GlitchedSpan>
      <UI.GlitchedSpan
        style={{
          alignSelf: "center",
        }}
      >
        V1.2.4 MIT © 2023{" "}
        <a href="https://github.com/AndyLeezard" target="_blank">
          Andy Lee 🔗
        </a>
      </UI.GlitchedSpan>
      <UI.GlitchedSpan
        style={{
          alignSelf: "center",
        }}
      >
        React-audio-track is licensed under the MIT License.
      </UI.GlitchedSpan>
    </>
  )
}

export default Footer
