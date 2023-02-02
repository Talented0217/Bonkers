import { Scene } from "phaser";
// components
import Character from "../components/Character";
import { BEAR, ZEPHYR, FIRE, LEFT, RIGHT, UP, DOWN, STATE_RUNNING, STATE_SLASHING_IDLE, STATE_SLASHING_RUNNING, STATE_KICKING } from "../playerConfig";
import { STATE_ATTACKING, STATE_IDLING, STATE_WALKING, STATE_DYING, STATE_WAITING } from '../playerConfig';
//images
import back1 from '../assets/background/game_background_1.png';

import bear from '../assets/sprites/bear.png'
import zephyr from "../assets/sprites/zephyr.png";
import fire from "../assets/sprites/fire.png";

//json
const bearJson = require('../assets/jsons/bear.json');

const zephyrJson = require('../assets/jsons/zephyr.json');
const fireJson = require('../assets/jsons/fire.json');

//

class Battle extends Scene {
    constructor(props) {
        super(props);

        // initial image config;
        this.backgroundImage = null;


    }

    preload() {
        this.load.image("background1", back1);
        // this.load.atlas("bear", bear, bearJson);
        this.load.atlas(ZEPHYR, zephyr, zephyrJson);
        this.load.atlas("Fire", fire, fireJson);
    }
    create() {
        this.backgroundImage = this.add.image(0, 0, "background1").setOrigin(0, 0).setScale(0.5, 0.5);



        // create animation
        this.createPlayerAnimations(FIRE);
        this.createPlayerAnimations(ZEPHYR);


        this.arrows = this.input.keyboard.createCursorKeys();
        this.controllers = this.input.keyboard.addKeys('A,S,F');


        this.player = new Character(this, {
            type: FIRE,
            direction: RIGHT,
            x: 300,
            y: 300,
            speed: 40,
            state: STATE_WAITING,
        });

        this.player2 = new Character(this, {
            type: ZEPHYR,
            direction: RIGHT,
            x: 600,
            y: 300,
            speed: 40,
            state: STATE_WAITING,
        });

    }
    update() {

        let h = null, v = null;
        let isRunning = false, isSlashing = false;
        let jumpStarted = false, isJumping = false;
        let isSliding = false;
        let keyPressed = false;


        // WALKING
        if (this.arrows.left.isDown) {
            h = LEFT;
            keyPressed = true;
        }
        if (this.arrows.right.isDown) {
            h = RIGHT;
            keyPressed = true;
        }
        if (this.arrows.up.isDown) {
            v = UP;
            keyPressed = true;
        }
        if (this.arrows.down.isDown) {
            v = DOWN;
            keyPressed = true;
        }

        // RUNNING
        if (this.arrows.shift.isDown) {
            isRunning = true;
            keyPressed = true;
        }
        //SLASHING
        if (this.controllers.A.isDown) {
            keyPressed = true;
            isSlashing = true;
        }

        if (this.controllers.S.isDown) {
            keyPressed = true;
            isSlashing = true;
        }

        // JUMPING
        // if (this.arrows.space.isDown) {
        //     jumpStarted = true;
        // }

        //Kick
        if (this.controllers.F.isDown) {
            this.player.updateState(STATE_KICKING);
        }
        if (keyPressed == false)
            this.player.updateState(STATE_IDLING);
        else {

            if (h != null || v != null) {

                if (isRunning) {

                    if (isSlashing) {
                        this.player.updateState(STATE_SLASHING_RUNNING, {
                            directionH: h,
                            directionV: v
                        });
                    }
                    else this.player.updateState(STATE_RUNNING, {
                        directionH: h,
                        directionV: v
                    });
                }
                else {
                    if (isSlashing) {
                        this.player.updateState(STATE_SLASHING_IDLE, {
                            directionH: h,
                            directionV: v
                        });
                    }
                    else {
                        this.player.updateState(STATE_WALKING, {
                            directionH: h,
                            directionV: v
                        });
                    }
                }
            }
            else if (isSlashing) {
                this.player.updateState(STATE_SLASHING_IDLE);

                // not moving idle

            }

        }

        this.player2.updateState(STATE_IDLING);





    }


    createBearAnimations = () => {
        // bear animation
        this.anims.create({
            key: 'bearIdle',
            frames: this.anims.generateFrameNames('bear', { prefix: 'zombie bear_idle', start: 0, end: 40, zeroPad: 3 }),
            frameRate: 24,
            repeat: -1
        })
        this.anims.create({
            key: 'bearDie',
            frames: this.anims.generateFrameNames('bear', { prefix: 'Dying_', start: 0, end: 36, zeroPad: 3 }),
            frameRate: 24,
            // repeat: -1
        })
        this.anims.create({
            key: 'bearAttack',
            frames: this.anims.generateFrameNames('bear', { prefix: 'Zombie Bear Attack_', start: 0, end: 40, zeroPad: 3 }),
            frameRate: 24,
        })
        this.anims.create({
            key: 'bearDie',
            frames: this.anims.generateFrameNames('bear', { prefix: 'Dying_', start: 0, end: 36, zeroPad: 3 }),
            frameRate: 24,
            // repeat: -1
        })
        this.anims.create({
            key: 'bearWalk',
            frames: this.anims.generateFrameNames('bear', { prefix: 'Zombie Bear_Walk', start: 0, end: 36, zeroPad: 3 }),
            frameRate: 24,
            repeat: -1
        })
    }
    createPlayerAnimations = (type = ZEPHYR) => {

        this.anims.create({
            key: type + 'Die',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Dying_', start: 0, end: 14, zeroPad: 3 }),
            frameRate: 24,
            // repeat: -1
        })
        this.anims.create({
            key: type + 'Fall',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Falling Down_', start: 0, end: 5, zeroPad: 3 }),
            frameRate: 24,
            repeat: -1
        })
        this.anims.create({
            key: type + 'Idle',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Idle Blinking_', start: 0, end: 17, zeroPad: 3 }),
            frameRate: 24,
            repeat: -1
        })
        this.anims.create({
            key: type + 'Hurt',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Hurt_', start: 0, end: 11, zeroPad: 3 }),
            frameRate: 24,

        })
        this.anims.create({
            key: type + 'JumpLoop',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Jump Loop_', start: 0, end: 5, zeroPad: 3 }),
            frameRate: 24,
            repeat: -1
        })
        this.anims.create({
            key: type + 'Jump',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Jump Start_', start: 0, end: 5, zeroPad: 3 }),
            frameRate: 24,
            repeat: -1
        })
        this.anims.create({
            key: type + 'Kick',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Kicking_', start: 0, end: 11, zeroPad: 3 }),
            frameRate: 24,
        })
        this.anims.create({
            key: type + 'Run',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Running_', start: 0, end: 11, zeroPad: 3 }),
            frameRate: 24,
            repeat: -1
        })
        this.anims.create({
            key: type + 'RunSlash',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Run Slashing_', start: 0, end: 11, zeroPad: 3 }),
            frameRate: 24,
            // repeat: -1
        })
        this.anims.create({
            key: type + 'Slash',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Slashing_', start: 0, end: 11, zeroPad: 3 }),
            frameRate: 24,
            // repeat: -1
        })
        this.anims.create({
            key: type + 'SlashInAir',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Slashing in The Air_', start: 0, end: 11, zeroPad: 3 }),
            frameRate: 24,
            // repeat: -1
        })
        this.anims.create({
            key: type + 'Slide',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Sliding_', start: 0, end: 5, zeroPad: 3 }),
            frameRate: 24,
            repeat: -1
        })
        this.anims.create({
            key: type + 'Walk',
            frames: this.anims.generateFrameNames(type, { prefix: type + '_Shiba_Walking_', start: 0, end: 23, zeroPad: 3 }),
            frameRate: 24,
            repeat: -1
        })
    }
    // createAnimations = (type) => {
    //     this.createPlayerAnimations(type);
    // }

}
export default Battle;