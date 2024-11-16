import Button from '../../components/gamepad/buttons/button/button';
import Buttons from '../../components/gamepad/buttons/buttons';
import StickComponent from '../../components/gamepad/stick/stick';
import styles from './gamepad.module.scss';
import Trigger from '../../components/gamepad/trigger/trigger';
import Bumper from '../../components/gamepad/bumper/bumper';
import useGamepadStore from '../../store/gamepad/gamepad.store';

export default function Gamepad() {
    const { gamepad } = useGamepadStore();
    if (!gamepad) {
        return  <div className={styles.wrapper}><div className={styles.connect}>Connect a gamepad</div></div>;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.controller}>
                <div className={styles.left_group}>
                    <Bumper label='LB' button={gamepad.LEFT_BUMPER} />
                    <Trigger label='LT' button={gamepad.LEFT_TRIGGER} />
                </div>
                <div className={styles.right_group}>
                    <Bumper label='RB' button={gamepad.RIGHT_BUMPER} />
                    <Trigger label='RT' button={gamepad.RIGHT_TRIGGER} />
                </div>
                <div class={styles.main_controls}>
                    <div className={styles.sticks}>
                        <StickComponent stick={gamepad.LEFT_STICK} />
                        <StickComponent stick={gamepad.RIGHT_STICK} />
                    </div>
                    <div className={styles.buttons}>
                        <Buttons gamepad={gamepad} />
                    </div>
                </div>
            </div>
        </div>
    );
}
