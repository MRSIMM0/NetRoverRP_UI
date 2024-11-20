import React, { useEffect, useRef, useState } from 'react';
import useGamepadStore from '../../store/gamepad/gamepad.store';

export default function Preview() {
  const { gamepad } = useGamepadStore();

  const canvasRef = useRef(null);

  const [carState, setCarState] = useState({
    x: 200,
    y: 200,
    angle: 0,
  });

  const steering = gamepad?.LEFT_STICK?.axis[0] || 0;
  const throttle = gamepad?.RIGHT_TRIGGER?.value || 0;
  const back = gamepad?.LEFT_TRIGGER?.value || 0;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw the initial state
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    const updateCarPosition = () => {
      // Update car state
      setCarState((prevState) => {
        const newAngle = prevState.angle + steering * 0.05; // Steering adjusts the angle
        const forwardX = Math.cos(newAngle) * throttle * 5;
        const forwardY = Math.sin(newAngle) * throttle * 5;
        const backwardX = Math.cos(newAngle) * back * -5;
        const backwardY = Math.sin(newAngle) * back * -5;
        const newX = prevState.x + forwardX + backwardX;
        const newY = prevState.y + forwardY + backwardY;

        // Draw a line from the previous position to the new position
        ctx.beginPath();
        ctx.moveTo(prevState.x, prevState.y);
        ctx.lineTo(newX, newY);
        ctx.stroke();

        return {
          x: newX,
          y: newY,
          angle: newAngle,
        };
      });
    };

    const interval = setInterval(updateCarPosition, 16); // Update at ~60fps
    return () => clearInterval(interval);
  }, [steering, throttle, back]);

  return <canvas ref={canvasRef} height={400} width={400} />;
}
