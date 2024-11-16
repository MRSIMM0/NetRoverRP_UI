import React, { useEffect, useRef } from 'react'
import { io } from 'socket.io-client';
import useSocketStore from '../store/socket/socket.store';

// Singleton instance of the socket
let socketInstance;

export default function SocketProvider() {
    const { setSocket } = useSocketStore();

    if (!socketInstance) {
        socketInstance = io('/', {
            transports: ['websocket'],
            autoConnect: true,
        });
    }

    useEffect(() => {
        function onConnect() {
            console.log("Connected to server");
            setSocket(socketInstance);
        }

        function onDisconnect() {
            console.log("Disconnected from server");
            setSocket(null);
        }

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);

        return () => {
            socketInstance.off('connect', onConnect);
            socketInstance.off('disconnect', onDisconnect);
        };
    }, [setSocket]);

    return null;
}
