import React, { useEffect, useRef, useState } from 'react';
import styles from './stream.module.scss';
import useSocketStore from '../../store/socket/socket.store';
import NoCamera from './noCamera/noCamera';

export default function Stream() {
    // Access the current socket from your store
    const { socket } = useSocketStore();

    // useRef to store a reference to the <img> element so we can set its .src
    const ref = useRef<HTMLImageElement | null>(null);

    // Track whether or not the camera is currently sending frames
    const [isCameraConnected, setCameraConnected] = useState(false);

    /**
     * Listen for the 'frame' event from the socket:
     * - Sets isCameraConnected to true (so we know we're receiving data).
     * - Creates a Blob from the raw binary data and constructs a temporary URL for the <img>.
     * - Points our <img> at that URL.
     * - Cleans up by revoking the object URL after a short delay (to avoid memory leaks).
     */
    socket?.on('frame', (data) => {
        setCameraConnected(true);

        // If the ref or ref.current is null, we can't update the image
        if (!ref.current) return;

        // Build a Blob from the incoming binary data (JPEG)
        const blob = new Blob([new Uint8Array(data)], { type: 'image/jpeg' });

        // Generate a temporary URL to display in the <img>
        const url = URL.createObjectURL(blob);
        ref.current.src = url;

        // Revoke the URL after 1 second to free up memory
        url && setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    /**
     * Whenever the socket changes (e.g., reconnected or disconnected),
     * we reset isCameraConnected to false. That way we show 'NoCamera'
     * until we receive new frames again.
     */
    useEffect(() => {
        setCameraConnected(false);
    }, [socket]);

    return (
        <section className={styles.wrapper}>
            {/* If camera is not sending frames yet, display the NoCamera fallback */}
            {(!isCameraConnected) && <NoCamera />}

            {/* If the socket is disconnected, show a button to manually reconnect */}
            {!socket?.connected && (
                <button className={styles.reconnect} onClick={() => socket.connect()}>
                    Reconnect
                </button>
            )}

            {/* If camera is connected and socket is connected, show the live image feed */}
            {(isCameraConnected && socket?.connected) && (
                <img className={styles.video} ref={ref} />
            )}
        </section>
    );
}
