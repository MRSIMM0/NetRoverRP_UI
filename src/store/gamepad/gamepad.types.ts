import { XboxGamepad } from "../../types/gamepad"

export type GamepadStore = GamepadState & GamepadActions

export interface GamepadState {
    gamepad: XboxGamepad | null
}

interface GamepadActions {
    setGamepad: (gamepad: XboxGamepad | null) => void
}


