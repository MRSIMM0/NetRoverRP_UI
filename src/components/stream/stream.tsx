import React, { useEffect, useRef, useState } from 'react'
import styles from './stream.module.scss'
import useSocketStore from '../../store/socket/socket.store'
import NoCamera from './noCamera/noCamera'
export default function Stream() {
    const { socket } = useSocketStore()
    const ref = useRef(null)

    const [isCameraConnected, setCameraConnected] = useState(false)

socket?.on('frame', (data) => {
    setCameraConnected(true);
    if (!ref.current) return;

    const blob = new Blob([new Uint8Array(data)], { type: "image/jpeg" });

    const url = URL.createObjectURL(blob);

    ref.current.src = url;

    url && setTimeout(() => URL.revokeObjectURL(url), 1000);
});


    useEffect(() => {
      setCameraConnected(false)
    }, [socket])

  return (
    <section className={styles.wrapper}>
        {(!isCameraConnected) && <NoCamera />}
        {!socket?.connected && <button className={styles.reconnect} onClick={() => socket.connect()} >Reconnect</button>}
        {(isCameraConnected && socket?.connected) && <img className={styles.video} ref={ref} />}
    </section>
  )
}
