import { useEffect, useRef, useState } from 'preact/hooks';
import { io } from "socket.io-client";
import './style.css';
import Gamepad from '../../components/gamepad/gamepad';
import styles from './home.module.scss';
import Status from '../../components/status/status';
import Stream from '../../components/stream/stream';
import Preview from '../../components/preview/preview';

export function Home() {

    return (
        <div class="home">
            <div className={styles.status}>
                <Status />
            </div>
            <div className={styles.gamepad}>
                <Gamepad />
            </div>
            <div className={styles.stream}>
                <Stream />
            </div>
            <div className={styles.preview}>
                <Preview />
            </div>
        </div>
    );
}
