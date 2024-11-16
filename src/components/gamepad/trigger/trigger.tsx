import React from 'react';
import styles from './trigger.module.scss';

interface Props {
    label: string;
    button: GamepadButton;
}

export default function Trigger({ label, button }: Props) {
    return (
        <div
            style={{
                backgroundColor: `rgba(255, 255, 255, ${button.value})`,
            }}
            className={styles.trigger}>
            {label}
        </div>
    );
}
