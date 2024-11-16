import React from 'react'
import styles from './buttons.module.scss'
import Button from './button/button'
import { XboxGamepad } from '../../../types/gamepad'

const createButton = (label: string, button: GamepadButton) => ({
    label: label,
    button: button
})

interface Props {
    gamepad: XboxGamepad
}

export default function Buttons({ gamepad }: Props) {
    const A = createButton('A', gamepad.A_BUTTON)
    const B = createButton('B', gamepad.B_BUTTON)
    const X = createButton('X', gamepad.X_BUTTON)
    const Y = createButton('Y', gamepad.Y_BUTTON)
  return (


    <div className={styles.controller_buttons}>
        <span/>
        <Button {...Y}/>
        <span/>
        <Button {...X} />
        <span/>
        <Button {...B} />
        <span/>
        <Button {...A} />
    </div>
  )
}
