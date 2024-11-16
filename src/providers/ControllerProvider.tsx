import { useEffect, useState } from 'react';
import { XboxGamepad } from '../types/gamepad';
import useGamepadStore from '../store/gamepad/gamepad.store';
import useSocketStore from '../store/socket/socket.store';
import _ from 'lodash';


let lastGamepad = null;

const ControllerProvider = () => {
    const { setGamepad } = useGamepadStore();

    const { socket } = useSocketStore();

    const [isLooping, setIsLooping] = useState(false);

    useEffect(() => {
        const handleGamepadConnected = (gamepad) => {
            console.log('Gamepad connected');
            setIsLooping(true);
        };

        const handleGamepadDisconnected = (gamepad) => {
            console.log('Gamepad disconnected');
            setIsLooping(false);
        };

        window.addEventListener('gamepadconnected', handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

        return () => {
            window.removeEventListener('gamepadconnected', handleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
        };
    }, []);

    useEffect(() => {
        if (!isLooping) return;

        const updateGamepadStatus = () => {
            if (!isLooping) return;

            const gamepads = navigator.getGamepads();

            if (gamepads[0]) {
                const newGamepad = XboxGamepad.create(gamepads[0]);

                console.log(newGamepad)

                if (!_.isEqual(newGamepad, lastGamepad)) {

                    socket.emit('gamepad', JSON.stringify(newGamepad))

                    setGamepad(newGamepad);
                    lastGamepad = newGamepad;
                }
            }

            requestAnimationFrame(debouncedUpdateGamepadStatus);
        };

        const debouncedUpdateGamepadStatus = _.debounce(updateGamepadStatus, 100);

        requestAnimationFrame(debouncedUpdateGamepadStatus);

        return () => {
            debouncedUpdateGamepadStatus.cancel();
        };
    }, [isLooping]);

    return null;
};

export default ControllerProvider;
