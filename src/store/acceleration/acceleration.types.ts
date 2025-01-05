export type ACC = {
    x: number,
    y: number,
    z: number,
}

export type AccelerationStore = AccelerationState & AccelerationActions

export interface AccelerationState {
    acceleration: ACC | null
}

interface AccelerationActions {
    setAcceleration: (gamepad: ACC | null) => void
}


