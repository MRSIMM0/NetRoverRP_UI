import { create } from "zustand";
import {AccelerationState, AccelerationStore} from "./acceleration.types";

const initialState: AccelerationState = {
    acceleration: null
}

const useAccelerationStore = create<AccelerationStore>((set) => ({
    ...initialState,
    setAcceleration: (acceleration) => set({ acceleration })
}));

export default useAccelerationStore;