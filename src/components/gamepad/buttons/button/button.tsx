import React from 'react'
import styles from './button.module.scss'

interface Props {
    label: string
    button: GamepadButton
}

export default function Button({ label, button }: Props) {
  return (
    <div style={
        {
            backgroundColor: button.pressed ? 'white' : 'transparent'
        }
    } className={styles.controller_button}>{label}</div>
  )
}
