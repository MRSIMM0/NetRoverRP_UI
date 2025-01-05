import { memo, useRef, useState } from "react";
import { useEffect } from "preact/hooks";

import useAccelerationStore from "../store/acceleration/acceleration.store";
import useSocketStore from "../store/socket/socket.store";
import { ACC } from "../store/acceleration/acceleration.types";

// ---------------- Utility Converters ----------------
function toVec3(acc: ACC): [number, number, number] {
    return [acc.x, acc.y, acc.z];
}

function toACC(v: [number, number, number]): ACC {
    return { x: v[0], y: v[1], z: v[2] };
}

// ---------------- Vector Math ----------------
type Vec3 = [number, number, number];
type Mat3 = [
    [number, number, number],
    [number, number, number],
    [number, number, number]
];

function multiplyMat3Vec3(m: Mat3, v: Vec3): Vec3 {
    return [
        m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
        m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
        m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
    ];
}

// Build a rotation matrix for a rotation around X by 'angle'
function rotationX(angle: number): Mat3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
        [1, 0, 0],
        [0, c, -s],
        [0, s, c]
    ];
}

// Build a rotation matrix for a rotation around Y by 'angle'
function rotationY(angle: number): Mat3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
        [c, 0, s],
        [0, 1, 0],
        [-s, 0, c]
    ];
}

// Multiply two 3x3 matrices
function multiplyMat3Mat3(a: Mat3, b: Mat3): Mat3 {
    // a x b
    const result: Mat3 = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            result[r][c] =
                a[r][0] * b[0][c] +
                a[r][1] * b[1][c] +
                a[r][2] * b[2][c];
        }
    }
    return result;
}

// ---------------- Small Moving Average (pre-filter) ----------------
const PRE_FILTER_SIZE = 5;
class SmallMovingAverage {
    private buffer: ACC[] = [];

    addSample(acc: ACC) {
        if (this.buffer.length >= PRE_FILTER_SIZE) {
            this.buffer.shift();
        }
        this.buffer.push(acc);
    }

    getAverage(): ACC {
        if (this.buffer.length === 0) return { x: 0, y: 0, z: 0 };
        const sum = this.buffer.reduce(
            (prev, curr) => ({
                x: prev.x + curr.x,
                y: prev.y + curr.y,
                z: prev.z + curr.z
            }),
            { x: 0, y: 0, z: 0 }
        );
        return {
            x: sum.x / this.buffer.length,
            y: sum.y / this.buffer.length,
            z: sum.z / this.buffer.length
        };
    }
}

// ---------------- Optional FIR Filter (post-rotation) ----------------
const FIR_SIZE = 10;
const firCoeffs = Array(FIR_SIZE).fill(1 / FIR_SIZE);
const dataBuffer: ACC[] = [];

function applyFIR(inputData: ACC[], coeffs: number[]): ACC {
    let output = { x: 0, y: 0, z: 0 };
    for (let i = 0; i < coeffs.length; i++) {
        output.x += inputData[i].x * coeffs[i];
        output.y += inputData[i].y * coeffs[i];
        output.z += inputData[i].z * coeffs[i];
    }
    return output;
}

// ------------------------------------------------------
//              The AccelerationProvider
// ------------------------------------------------------
function AccelerationProvider() {
    const { setAcceleration } = useAccelerationStore();
    const { socket } = useSocketStore();

    const [accData, setAccData] = useState<ACC | null>(null);

    // Listen for incoming acceleration from the socket
    useEffect(() => {
        if (!socket) return;
        const handler = (acc: ACC) => {
            setAccData(acc);
        };
        socket.on("acceleration", handler);
        return () => {
            socket.off("acceleration", handler);
        };
    }, [socket]);

    // We store the calibration rotation matrix and any small offsets
    const calibrationMatrixRef = useRef<Mat3 | null>(null);
    const residualOffsetRef = useRef<ACC>({ x: 0, y: 0, z: 0 });

    const preFilter = useRef(new SmallMovingAverage()).current;

    const [initialSamples, setInitialSamples] = useState<ACC[]>([]);
    const [hasCalibrated, setHasCalibrated] = useState(false);

    useEffect(() => {
        if (!accData) return; // do nothing if no data yet

        // ------------------------------------------
        // 1) During CALIBRATION: Collect ~20 samples
        // ------------------------------------------
        if (!hasCalibrated) {
            // Add raw sample to the pre-filter
            preFilter.addSample(accData);

            // Grab the pre-filtered (smoothed) reading
            const filteredAcc = preFilter.getAverage();

            // Keep track of these initial samples
            setInitialSamples((prev) => [...prev, filteredAcc]);

            if (initialSamples.length + 1 >= 20) {
                // Enough samples => compute average gravity vector
                const sum = initialSamples.reduce(
                    (prev, curr) => ({
                        x: prev.x + curr.x,
                        y: prev.y + curr.y,
                        z: prev.z + curr.z
                    }),
                    { x: 0, y: 0, z: 0 }
                );
                const avg = {
                    x: sum.x / initialSamples.length,
                    y: sum.y / initialSamples.length,
                    z: sum.z / initialSamples.length
                };
                const g = toVec3(avg); // gravity vector

                console.log("Average gravity from calibration:", g);

                // ------------------------------------------
                // 2) Compute roll & pitch from g
                //    (roll around X, pitch around Y)
                // ------------------------------------------
                // roll = atan2(g_y, g_z)
                const roll = Math.atan2(g[1], g[2] || 1e-9);

                // pitch = atan2(-g_x, sqrt(g_y^2 + g_z^2))
                const pitch = Math.atan2(
                    -g[0],
                    Math.sqrt(g[1] * g[1] + g[2] * g[2]) || 1e-9
                );

                console.log("Calibration angles:", { roll, pitch });

                // ------------------------------------------
                // 3) Build a matrix that *removes* pitch & roll
                //    R = R_y(-pitch) * R_x(-roll)
                // ------------------------------------------
                const Rx_negRoll = rotationX(-roll);
                const Ry_negPitch = rotationY(-pitch);
                const calibrationMatrix = multiplyMat3Mat3(
                    Ry_negPitch,
                    Rx_negRoll
                );
                calibrationMatrixRef.current = calibrationMatrix;

                // Optionally compute a small residual offset in X/Y after rotation
                const rotatedG = multiplyMat3Vec3(calibrationMatrix, g);
                // We expect rotatedG ~ [0, 0, ±1]. The leftover in X/Y can be subtracted if needed.
                residualOffsetRef.current = {
                    x: rotatedG[0], // round to 2 decimals
                    y: rotatedG[1],
                    z: 0 // ignore Z offset
                };

                setHasCalibrated(true);
                console.log(
                    "Calibration complete. Residual offset:",
                    residualOffsetRef.current
                );
            }
            return;
        }

        // ------------------------------------------
        // 4) AFTER CALIBRATION: Use the matrix on new data
        // ------------------------------------------
        // Convert to vector
        let rawVec = toVec3(accData);

        if (calibrationMatrixRef.current) {
            rawVec = multiplyMat3Vec3(calibrationMatrixRef.current, rawVec);
        }

        let leveledAcc = toACC(rawVec);
        leveledAcc.x -= residualOffsetRef.current.x;
        leveledAcc.y -= residualOffsetRef.current.y;


        const finalRoll = Math.atan2(leveledAcc.y, leveledAcc.z || 1e-9);
        const finalPitch = Math.atan2(
            -leveledAcc.x,
            Math.sqrt(leveledAcc.y * leveledAcc.y + (leveledAcc.z || 0) * (leveledAcc.z || 0)) || 1e-9
        );

        if (dataBuffer.length >= FIR_SIZE) {
            dataBuffer.shift();
        }
        dataBuffer.push(leveledAcc);

        if (dataBuffer.length === FIR_SIZE) {
            const filteredData = applyFIR(dataBuffer, firCoeffs);

            setAcceleration({
                x: filteredData.x,
                y: filteredData.y - finalRoll,
                z: filteredData.z
            });
        }
    }, [accData, hasCalibrated, initialSamples, setAcceleration]);

    return null;
}

export default memo(AccelerationProvider);
