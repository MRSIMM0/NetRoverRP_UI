import { Socket } from "socket.io-client"

export type SocketStore = SocketState & GamepadActions

export interface SocketState {
    socket: Socket | null
}

interface GamepadActions {
    setSocket: (socket: Socket | null) => void
}