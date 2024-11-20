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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const updateCarPosition = () => {
      // Update car state
      setCarState((prevState) => {
        const newAngle = prevState.angle + steering * 0.05; // Steering adjusts the angle
        const newX = prevState.x + Math.cos(newAngle) * throttle * 5;
        const newY = prevState.y + Math.sin(newAngle) * throttle * 5;

        return {
          x: newX,
          y: newY,
          angle: newAngle,
        };
      });

      // Draw the path
      ctx.fillStyle = 'black';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;

      // Draw a line from the previous position to the new position
      ctx.beginPath();
      ctx.moveTo(carState.x, carState.y);
      ctx.lineTo(carState.x + Math.cos(carState.angle) * throttle * 5, carState.y + Math.sin(carState.angle) * throttle * 5);
      ctx.stroke();
    };

    if (throttle > 0) {
      const interval = setInterval(updateCarPosition, 16); // Update at ~60fps
      return () => clearInterval(interval);
    }
  }, [steering, throttle]);

  return <canvas ref={canvasRef} height={400} width={400} />;
}
