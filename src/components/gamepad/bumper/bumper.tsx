import React from 'react';
import styles from './bumper.module.scss';

interface Props {
    label: string;
    button: GamepadButton;
}

export default function Bumper({ label, button }: Props) {
    return (
        <div
            style={{
                backgroundColor: button.pressed ? 'white' : 'transparent',
            }}
            className={styles.bumper}>
            {label}
        </div>
    );
}
