import { useRef, useEffect } from "react";
import useAccelerationStore from "../../store/acceleration/acceleration.store";

export default function Preview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { acceleration } = useAccelerationStore();

  // Position of the car
  const positionRef = useRef({ x: 200, y: 200 });

  // Keep an array of all positions (the "path") to draw the trail
  const pathRef = useRef<Array<{ x: number, y: number }>>([
    { x: 200, y: 200 } // initial position
  ]);

  // Forward velocity, turning velocity, heading (in radians)
  const forwardVelRef = useRef(0);
  const turnVelRef = useRef(0);
  const headingRef = useRef(0);

  // For delta time calculation
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    function animate(time: number) {
      const dt = (time - lastTimeRef.current) / 1000; // convert ms to s
      lastTimeRef.current = time;

      // ---------------------------------------------------
      // 1) Update velocities based on acceleration
      // ---------------------------------------------------
      // forward/back acceleration
      forwardVelRef.current += acceleration.x * dt * 10;
      // turning acceleration
      turnVelRef.current += acceleration.y * dt * 50;

      // ---------------------------------------------------
      // 2) Apply friction so it doesn't spin/roll forever
      // ---------------------------------------------------
      const friction = 0.9;
      forwardVelRef.current *= friction;
      turnVelRef.current *= friction;

      // ---------------------------------------------------
      // 3) Update heading
      // ---------------------------------------------------
      headingRef.current += turnVelRef.current * dt;

      // ---------------------------------------------------
      // 4) Update position
      // ---------------------------------------------------
      positionRef.current.x +=
          forwardVelRef.current * Math.cos(headingRef.current) * dt * 100;
      positionRef.current.y +=
          forwardVelRef.current * Math.sin(headingRef.current) * dt * 100;

      // Keep track of each position in the path array
      pathRef.current.push({
        x: positionRef.current.x,
        y: positionRef.current.y
      });

      // ---------------------------------------------------
      // 5) Rendering
      // ---------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the path (a continuous line from each stored point to the next)
      ctx.beginPath();
      pathRef.current.forEach((pos, i) => {
        if (i === 0) {
          ctx.moveTo(pos.x, pos.y);
        } else {
          ctx.lineTo(pos.x, pos.y);
        }
      });
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw the car
      ctx.save();
      ctx.translate(positionRef.current.x, positionRef.current.y);
      ctx.rotate(headingRef.current);

      ctx.fillStyle = "#007BFF";
      ctx.fillRect(-30, -15, 60, 30);

      ctx.fillStyle = "black";
      // front wheels
      ctx.fillRect(-25, -20, 10, 5);
      ctx.fillRect(15, -20, 10, 5);
      // rear wheels
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
