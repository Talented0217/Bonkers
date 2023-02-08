import { Scene } from "phaser";
// components
import Character from "../components/Character";
import { BEAR, ZEPHYR, FIRE, LIGHTNING, SHIBA, LEFT, RIGHT, UP, DOWN, DELTA_X, DELTA_Y } from "../playerConfig";
import { STATE_RUNNING, STATE_SLASHING_IDLE, STATE_SLASHING_RUNNING, STATE_KICKING, STATE_SLIDING, STATE_ATTACKING, STATE_HURTING, STATE_IDLING, STATE_WALKING, STATE_DYING, STATE_WAITING } from '../playerConfig';

import { sleep } from "../playerConfig";



//images
import back1 from '../assets/background/game_background_1.png';
import bear from '../assets/sprites/bear.png'
import zephyr from "../assets/sprites/zephyr.png";
import fire from "../assets/sprites/fire.png";
import shiba from "../assets/sprites/shiba.png";
import lightning from "../assets/sprites/lightning.png";
import hp from "../assets/sprites/hp.png";
//json
const bearJson = require('../assets/jsons/bear.json');
const zephyrJson = require('../assets/jsons/zephyr.json');
const fireJson = require('../assets/jsons/fire.json');
const lightningJson = require('../assets/jsons/lightning.json');
const shibaJson = require('../assets/jsons/shiba.json');
const hpJson = require('../assets/jsons/hp.json');
//

class Battle extends Scene {
    constructor(props) {
        super(props);

        // initial image config;
        this.backgroundImage = null;


        this.type = props.player;


        //flags
        this.isSliding = false;
        this.enemies = [];
    }

    preload() {
        this.load.image("background1", back1);
        this.load.atlas("bear", bear, bearJson);

        if (this.type == FIRE) {
            this.load.atlas(this.type, fire, fireJson);
        }
        if (this.type == SHIBA) {
            this.load.atlas(this.type, shiba, shibaJson);
        }
        if (this.type == LIGHTNING) {
            this.load.atlas(this.type, lightning, lightningJson);
        }
        if (this.type == ZEPHYR) {
            this.load.atlas(this.type, zephyr, zephyrJson);
        }


        this.load.atlas("hp", hp, hpJson);
        // this.load.atlas(ZEPHYR, zephyr, zephyrJson);
        // this.load.atlas("Fire", fire, fireJson);

    }
    async create() {
        this.backgroundImage = this.add.image(0, 0, "background1").setOrigin(0, 0).setScale(0.5, 0.5);

        // create animation
        this.createPlayerAnimations(this.type);
        this.createBearAnimations();



        this.arrows = this.input.keyboard.createCursorKeys();
        this.controllers = this.input.keyboard.addKeys('A,S,F');


        this.player = new Character(this, {
            type: this.type,
            direction: RIGHT,
            x: 300,
            y: 300,
            speed: 40,
            state: STATE_WAITING,
            scale: 0.2,
            body_width: 700,
            body_height: 100,
            offsetY: 500,
            shadow_width: 500,
            shadow_height: 100,
            shadow_x: 20,
            shadow_y: 100,


        });

        for (let i = 0; i < 5; i++) {
            // setTimeout(() => { }, 1000)
            await sleep(1000);
            let bear_temp = new Character(this, {
                type: BEAR,
                direction: RIGHT,
                x: 1000 + i * Math.random() * 200,
                y: 300 + i * 200,
                speed: 60,
                state: STATE_IDLING,
                scale: 0.4,
                body_width: 350,
                body_height: 100,
                shadow_width: 350,
                shadow_height: 100,
                offsetY: 350,
                shadow_x: 0,
                shadow_y: 140,
                range: 100

            });
            this.enemies.push(bear_temp);
        }


    }
    update() {

        let h = null, v = null;
        let isRunning = false, isSlashing = false;
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
            // isSlashing = true;
        }

        // JUMPING
        // if (this.arrows.space.isDown) {
        //     jumpStarted = true;
        // }

        //Kick
        if (this.controllers.F.isDown) {
            this.player.updateState(STATE_KICKING);

        }
        else if (this.controllers.S.isDown && this.isSliding == false) {
            this.player.updateState(STATE_SLIDING);
            this.isSliding = true;
            setTimeout(() => {

                this.isSliding = false;

            }, 500)
            return;
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

            } else {
                this.player.updateState(STATE_IDLING);
            }


        }

        this.controlBears();
        this.updateZindex();

    }


    createBearAnimations = () => {
        // bear animation
        this.anims.create({
            key: 'bearIdle',
            frames: this.anims.generateFrameNames('bear', { prefix: 'zombie bear_idle', start: 0, end: 24, zeroPad: 3 }),
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
            frames: this.anims.generateFrameNames('bear', { prefix: 'Zombie Bear Attack_', start: 0, end: 24, zeroPad: 3 }),
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

    generateRandomState = () => {

        let states = [STATE_IDLING, STATE_WALKING];
        // return states[~~Math.random() * (states.length + 1)];
        if (Math.random() < 0.1) return STATE_IDLING;
        else return STATE_WALKING;
    }

    controlBears = () => {
        //this.enemies
        for (let i = 0; i < this.enemies.length; i++) {




            let dx = this.getDeltaX(this.player, this.enemies[i]);
            let dy = this.getDeltaY(this.player, this.enemies[i]);

            let h = null;
            let v = null;
            if (dx > this.enemies[i].config.range)
                h = RIGHT;
            if (dx < - this.enemies[i].config.range) h = LEFT;
            else {


                if (dx > 0 && this.enemies[i].direction() == LEFT) {
                    h = RIGHT;
                }
                else if (dx < 0 && this.enemies[i].direction() == RIGHT) {
                    h = LEFT;
                }
            }

            if (dy > DELTA_Y)
                v = DOWN;
            if (dy < -DELTA_Y) v = UP;



            if (!(h == null && v == null))
                this.enemies[i].updateState(STATE_WALKING, {
                    directionH: h,
                    directionV: v
                });
            else {
                console.log("attacking");
                this.enemies[i].updateState(STATE_ATTACKING);
            }



        }

    }

    getDeltaX = (playerA, playerB) => {
        return playerA.x() - playerB.x();
    }
    getDeltaY = (playerA, playerB) => {
        return playerA.y() - playerB.y();
    }

    updateZindex = () => {

        let r = 1;
        for (let i = 0; i < this.enemies.length; i++) {
            r = this.getZindex(this.enemies[i]);
            this.enemies[i].setZindex(3 * r + 1);
        }
        r = this.getZindex(this.player);
        this.player.setZindex(3 * r - 1 + 1);

    }

    getZindex = (obj) => {
        let rank = 1;
        for (let i = 0; i < this.enemies.length; i++) {
            if (obj.y() > this.enemies[i].y() && i != rank)
                rank++;
        }
        return rank;

    }


}
export default Battle;