import { create } from "zustand";
import { SocketState, SocketStore } from "./socket.types";

const initialState: SocketState = {
    socket: null
}

const useSocketStore = create<SocketStore>((set) => ({
    ...initialState,
    setSocket: (socket) => set({ socket })
}));

export default useSocketStore;