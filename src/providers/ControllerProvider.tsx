import { useEffect, useState } from 'react';
import { XboxGamepad } from '../types/gamepad';
import useGamepadStore from '../store/gamepad/gamepad.store';
import useSocketStore from '../store/socket/socket.store';
import _ from 'lodash';

// Track the last reported gamepad state
let lastGamepad = null;

/**
 * ControllerProvider:
 * - Subscribes to browser 'gamepadconnected'/'gamepaddisconnected' events
 * - On connection, starts a requestAnimationFrame loop to read gamepad data
 * - Debounces gamepad status updates and sends them to the server/store
 */
const ControllerProvider = () => {
    // Access the store setter for updating gamepad state in your app
    const { setGamepad } = useGamepadStore();

    // Access the socket instance from the socket store
    const { socket } = useSocketStore();

    // Whether we are actively polling the gamepad
    const [isLooping, setIsLooping] = useState(false);

    // On mount, set up event listeners for gamepad connection/disconnection
    useEffect(() => {
        /**
         * Handle gamepad-connected event
         * If a gamepad is connected, enable the polling loop
         */
        const handleGamepadConnected = (gamepad: GamepadEvent) => {
            console.log('Gamepad connected');
            setIsLooping(true);
        };

        /**
         * Handle gamepad-disconnected event
         * If a gamepad is disconnected, disable the polling loop
         */
        const handleGamepadDisconnected = (gamepad: GamepadEvent) => {
            console.log('Gamepad disconnected');
            setIsLooping(false);
        };

        window.addEventListener('gamepadconnected', handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

        // Cleanup: remove event listeners when the component unmounts
        return () => {
            window.removeEventListener('gamepadconnected', handleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
        };
    }, []);

    // Effect that runs whenever isLooping changes
    useEffect(() => {
        // If not in polling mode, do nothing
        if (!isLooping) return;

        /**
         * The main polling function to read the current gamepad state.
         * - Grabs the first connected gamepad
         * - Creates a new XboxGamepad object from it
         * - Checks if it differs from the last reported state
         * - If different, emit the new state over socket + update the store
         * - Recursively calls itself via requestAnimationFrame
         */
        const updateGamepadStatus = () => {
            if (!isLooping) return;

            const gamepads = navigator.getGamepads();

            // If at least one gamepad is detected
            if (gamepads[0]) {
                // Convert the raw gamepad object into an XboxGamepad instance
                const newGamepad = XboxGamepad.create(gamepads[0]);

                // Only update if there's a change from the last known state
                if (!_.isEqual(newGamepad, lastGamepad)) {
                    // Emit the new state over the socket (if available)
                    socket?.emit('gamepad', JSON.stringify(newGamepad));

                    // Update the store with the new gamepad state
                    setGamepad(newGamepad);

                    // Cache this state as the last known
                    lastGamepad = newGamepad;
                }
            }

            // Schedule the next read on the next animation frame
            requestAnimationFrame(debouncedUpdateGamepadStatus);
        };

        /**
         * We debounce the updateGamepadStatus function so that it won't fire
         * more frequently than every 100ms. This reduces overhead from rapid
         * gamepad polling and frequent state changes.
         */
        const debouncedUpdateGamepadStatus = _.debounce(updateGamepadStatus, 100);

        // Begin polling at the next animation frame
        requestAnimationFrame(debouncedUpdateGamepadStatus);

        // Cleanup: cancel the debounced function when effect is cleared
        return () => {
            debouncedUpdateGamepadStatus.cancel();
        };
    }, [isLooping]);

    return null; // This provider doesn't render anything
};

export default ControllerProvider;
