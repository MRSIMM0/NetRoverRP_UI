import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import useSocketStore from '../store/socket/socket.store';

// We keep a module-level variable for our socket instance,
// ensuring there's only one socket connection (a singleton).
let socketInstance: ReturnType<typeof io> | null = null;

/**
 * The SocketProvider component initializes a singleton Socket.IO client.
 * It updates the global/socket store with the current socket instance
 * whenever a connection/disconnection event occurs.
 */
export default function SocketProvider() {
    // A setter from your custom socket store that can store the socket instance
    const { setSocket } = useSocketStore();

    // If there's no existing socket instance, create one.
    if (!socketInstance) {
        socketInstance = io('/', {
            transports: ['websocket'], // Force WebSocket transport
            autoConnect: true,         // Automatically connect
        });
    }

    // Use an effect to attach event listeners when the component mounts
    useEffect(() => {
        /**
         * onConnect: Called when the socket has successfully connected to the server.
         * Logs a message and stores the socket in the global store.
         */
        function onConnect() {
            console.log("Connected to server");
            setSocket(socketInstance);
        }

        /**
         * onDisconnect: Called when the socket becomes disconnected.
         * Logs a message and sets the socket in the store to null.
         */
        function onDisconnect() {
            console.log("Disconnected from server");
            setSocket(null);
        }

        // Attach the event listeners
        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);

        // Cleanup: remove listeners when this component unmounts or re-renders
        return () => {
            socketInstance?.off('connect', onConnect);
            socketInstance?.off('disconnect', onDisconnect);
        };
    }, [setSocket]); // Re-run if setSocket changes (usually stable)

    // This provider component doesn't render any UI
    return null;
}
