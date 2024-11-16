export const A_BUTTON = 0;
export const B_BUTTON = 1;
export const X_BUTTON = 2;
export const Y_BUTTON = 3;

export const LEFT_STICK_BUTTON = 10;
export const RIGHT_STICK_BUTTON = 11;

export const LEFT_TRIGGER = 6;
export const RIGHT_TRIGGER = 7;

export const LEFT_BUMPER = 4;
export const RIGHT_BUMPER = 5;


class MyButton {
    pressed;
    value;
    constructor(pressed = false, value = 0.0) {
        this.pressed = pressed;
        this.value = value;
    }

    static fromGamepadButton(gamepadButton) {
        return new MyButton(
            gamepadButton.pressed,
            gamepadButton.value
        );
    }
}

export class GamepadStick {
    axis: number[] | null;
    button: MyButton;

    constructor(axis: number[] | null, button: MyButton) {
        this.axis = axis;
        this.button = button;
    }
}


export class XboxGamepad {

    static gamepad: XboxGamepad;

    A_BUTTON: MyButton;
    B_BUTTON: MyButton;
    X_BUTTON: MyButton;
    Y_BUTTON: MyButton;

    LEFT_TRIGGER: MyButton;
    RIGHT_TRIGGER: MyButton;

    LEFT_BUMPER: MyButton;
    RIGHT_BUMPER: MyButton;

    LEFT_STICK: GamepadStick;
    RIGHT_STICK: GamepadStick;

    private constructor(gamepad: Gamepad) {
        this.A_BUTTON = MyButton.fromGamepadButton(gamepad.buttons[A_BUTTON]);
        this.B_BUTTON = MyButton.fromGamepadButton(gamepad.buttons[B_BUTTON]);
        this.X_BUTTON = MyButton.fromGamepadButton(gamepad.buttons[X_BUTTON]);
        this.Y_BUTTON = MyButton.fromGamepadButton(gamepad.buttons[Y_BUTTON]);
        this.LEFT_TRIGGER = MyButton.fromGamepadButton(gamepad.buttons[LEFT_TRIGGER]);
        this.RIGHT_TRIGGER = MyButton.fromGamepadButton(gamepad.buttons[RIGHT_TRIGGER]);
        this.LEFT_BUMPER = MyButton.fromGamepadButton(gamepad.buttons[LEFT_BUMPER]);
        this.RIGHT_BUMPER = MyButton.fromGamepadButton(gamepad.buttons[RIGHT_BUMPER]);

        this.LEFT_STICK = new GamepadStick(
            gamepad.axes.slice(0, 2).map(axisValue => parseFloat(axisValue.toFixed(2))),
            MyButton.fromGamepadButton(gamepad.buttons[LEFT_STICK_BUTTON])
        );

        this.RIGHT_STICK = new GamepadStick(
            gamepad.axes.slice(2, 4).map(axisValue => parseFloat(axisValue.toFixed(2))),
            MyButton.fromGamepadButton(gamepad.buttons[RIGHT_STICK_BUTTON])
        );
    }




    static create(gamepad: Gamepad) {
        XboxGamepad.gamepad = new XboxGamepad(gamepad);
        return XboxGamepad.gamepad;
    }

    static getInstance(gamepad: Gamepad) {
        return gamepad;
    }


}