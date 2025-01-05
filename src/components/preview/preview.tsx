import { useRef, useEffect } from "react";
import useAccelerationStore from "../../store/acceleration/acceleration.store";

export default function Preview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { acceleration } = useAccelerationStore();

  // Position
  const positionRef = useRef({ x: 200, y: 200 });

  // Forward velocity (scalar), turning velocity (scalar), heading (radians)
  const forwardVelRef = useRef(0);
  const turnVelRef = useRef(0);
  const headingRef = useRef(0);

  // For delta time
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    function animate(time: number) {
      const dt = (time - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = time;

      // ---------------------------------------------------
      // 1) Update velocities from acceleration
      // ---------------------------------------------------
      // X-axis => forward/back acceleration
      // Multiply by some factor to make the effect more visible
      forwardVelRef.current += acceleration.x * dt * 10;

      // Y-axis => turning acceleration
      // Multiply by factor for how quickly the car turns
      turnVelRef.current += acceleration.y * dt * 50;

      // ---------------------------------------------------
      // 2) Apply friction so the car doesn't drift/spin forever
      // ---------------------------------------------------
      const friction = 0.9;
      forwardVelRef.current *= friction;
      turnVelRef.current *= friction;

      // ---------------------------------------------------
      // 3) Update heading from turning velocity
      // ---------------------------------------------------
      headingRef.current += turnVelRef.current * dt;

      // ---------------------------------------------------
      positionRef.current.x += forwardVelRef.current * Math.cos(headingRef.current) * dt * 100;
      positionRef.current.y += forwardVelRef.current * Math.sin(headingRef.current) * dt * 100;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move origin to car's position
      ctx.save();
      ctx.translate(positionRef.current.x, positionRef.current.y);

      // Rotate around the center of the car
      ctx.rotate(headingRef.current);

      ctx.fillStyle = "#007BFF";
      ctx.fillRect(-30, -15, 60, 30);

      ctx.fillStyle = "black";
      // front wheels
      ctx.fillRect(-25, -20, 10, 5);
      ctx.fillRect(15, -20, 10, 5);
      ctx.fillRect(-25, 15, 10, 5);
      ctx.fillRect(15, 15, 10, 5);

      ctx.restore();

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [acceleration]);

  return (
      <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{ border: "1px solid #000" }}
      />
  );
}
