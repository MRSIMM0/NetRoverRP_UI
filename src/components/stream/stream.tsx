import React, { useEffect, useRef, useState } from 'react'
import styles from './stream.module.scss'
import useSocketStore from '../../store/socket/socket.store'
import NoCamera from './noCamera/noCamera'
export default function Stream() {
    const { socket } = useSocketStore()
    const ref = useRef(null)

    const [isCameraConnected, setCameraConnected] = useState(false)

    socket?.on('frame', (data) => {
        setCameraConnected(true)
        if(ref.current == null) return;
        var arrayBufferView = new Uint8Array( data );
        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL( blob );
        ref.current.src = imageUrl;
    })

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
