import { create } from "zustand";
import { GamepadState, GamepadStore } from "./gamepad.types";

const initialState: GamepadState = {
    gamepad: null
}

const useGamepadStore = create<GamepadStore>((set) => ({
    ...initialState,
    setGamepad: (gamepad) => set({ gamepad })
}));

export default useGamepadStore;