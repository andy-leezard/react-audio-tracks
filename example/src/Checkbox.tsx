import React from "react"
import * as UI from "./UI"

type CheckboxProps = {
  checked: boolean
  label: string
  onChange: (newState: boolean) => void
}

const Checkbox = ({ checked, label, onChange }: CheckboxProps) => {
  return (
    <UI.CheckboxContainer>
      <input
        type="checkbox"
        style={{
          width: "1.5rem",
          height: "1.5rem",
        }}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor="checkbox">{label}</label>
    </UI.CheckboxContainer>
  )
}

export default Checkbox
