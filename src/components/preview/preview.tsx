import React, { useEffect, useRef } from 'react'
import useGamepadStore from '../../store/gamepad/gamepad.store';

export default function Preview() {

    const { gamepad } = useGamepadStore();

    const canvasRef = useRef(null)

    const steering = gamepad?.LEFT_STICK?.axis[0]
    const throttle = gamepad?.RIGHT_TRIGGER?.value

    useEffect(() => {
        if(!canvasRef.current) return

        const canvas = canvasRef.current

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = 'black'

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.beginPath()

        ctx.moveTo(canvas.width / 2, canvas.height / 2)

        ctx.lineTo(canvas.width / 2 + steering * 100, canvas.height / 2 + throttle * 100)

        ctx.stroke()
        
    }, [steering, throttle])


    return (
        <canvas ref={canvasRef} height={400} width={400} />
    )
}
