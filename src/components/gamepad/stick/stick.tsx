import React, { useRef } from 'react'
import styles from './stick.module.scss'
import { GamepadStick } from '../../../types/gamepad'

interface Props {
    stick: GamepadStick
}

export default function StickComponent({ stick }: Props) {
    const [x, y] = stick?.axis || [0, 0]

    const button = stick?.button || { pressed: false }

    const normalize = (x: number) => {
        return ((x + 1) / 2) * 30;
    }

    return (
    <div className={styles.outside_circle}>
        <span className={styles.inner_circle} style={
            {
                left: `${normalize(x)}%`,
                top: `${normalize(y)}%`,
                backgroundColor: button.pressed ? 'white' : 'black'
            }
        } />
    </div>
  )
}
