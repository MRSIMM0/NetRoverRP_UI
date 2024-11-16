import React from 'react';
import useSocketStore from '../../store/socket/socket.store';
import styles from './status.module.scss';

export default function Status() {
    const { socket } = useSocketStore();

    return (
        <section className={[styles.wrapper, socket ? styles.connected : styles.disconnected].join(' ')}>
            <span>{socket?.connected ? 'Connected' : 'Disconnected'}</span>
        </section>
    );
}
