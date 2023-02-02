import Phaser from "phaser";
import { ZEPHYR, FIRE } from "../playerConfig";
import { STATE_KICKING, STATE_RUNNING, STATE_SLASHING_IDLE, STATE_SLASHING_RUNNING } from "../playerConfig";
import { STATE_ATTACKING, STATE_IDLING, STATE_WALKING, STATE_DYING, STATE_WAITING } from '../playerConfig';
import { LEFT, RIGHT, UP, DOWN } from '../playerConfig';
class Character {

    constructor(scene, config) {

        this.scene = scene;

        this.config = { ...config };





        this.body = this.scene.physics.add.sprite(config.x, config.y, config.type, 0).setScale(0.2, 0.2).setOrigin(0, 0);
        this.body.setBodySize(700, 100, false);

        //event
        this.body.on("animationcomplete", ({ key }) => {
            this.setState(STATE_WAITING);
        })


    }
    setState = (state) => {
        this.config.state = state;
    }
    setVelocity = (x = 0, y = 0) => {
        this.body.setVelocity(x, y);
    }

    movePosition = (directionH, directionV, rate = 1) => {
        this.setVelocity(0, 0);
        let s = rate * this.config.speed
        if (directionV != null) {
            if (directionV == UP) {
                this.body.setVelocityY(-s);
            }
            else if (directionV == DOWN) {
                this.body.setVelocityY(s);
            }
        }
        if (directionH != null) {

            if (directionH != this.config.direction) {
                this.body.setFlipX(true);
            }
            else {
                this.body.setFlipX(false);
            }

            if (directionH == LEFT) this.body.setVelocityX(-s);
            if (directionH == RIGHT) this.body.setVelocityX(s);

        }
    }

    /// animations
    idle = () => {
        this.body.play(this.config.type + "Idle")
        this.body.setVelocity(0);
        this.setState(STATE_IDLING);

    }

    hurt = () => {

    }

    jump = () => {

    }

    die = () => {
        this.body.play(this.config.type + "Die")
        this.setState(STATE_DYING);
    }

    walk = () => {
        this.body.play(this.config.type + "Walk");
        this.setState(STATE_WALKING);
    }
    run = () => {
        this.body.play(this.config.type + "Run");
        this.setState(STATE_RUNNING);
    }

    kick = () => {
        this.body.play(this.config.type + "Kick");
        this.setVelocity(0, 0);
        this.setState(STATE_KICKING);
    }
    slashIdle = () => {
        this.body.play(this.config.type + "Slash");
        this.setVelocity(0, 0);
        this.setState(STATE_SLASHING_IDLE);
    }

    slashRun = () => {
        this.body.play(this.config.type + "RunSlash");
        this.setState(STATE_SLASHING_RUNNING);
    }

    //======================================================================
    attack = () => {
        this.body.play(this.config.type + "Attack");
        this.setState(STATE_ATTACKING);
    }





    updateState = (state, data) => {
        // console.log(state, this.config.state);

        switch (state) {

            case STATE_IDLING:
                if (this.config.state == STATE_WAITING || this.config.state == STATE_RUNNING || this.config.state == STATE_WALKING)
                    this.idle();
                break;
            case STATE_WALKING:
                if (this.config.state == STATE_WAITING || this.config.state == STATE_IDLING || this.config.state == STATE_RUNNING)
                    this.walk();
                if (this.config.state == STATE_WALKING) this.movePosition(data.directionH, data.directionV);

                break;
            case STATE_RUNNING:
                if (this.config.state == STATE_WAITING || this.config.state == STATE_IDLING || this.config.state == STATE_WALKING)
                    this.run();
                if (this.config.state == STATE_RUNNING) this.movePosition(data.directionH, data.directionV, 2);
                break;
            case STATE_SLASHING_IDLE:
                if (this.config.state == STATE_WAITING || this.config.state == STATE_IDLING || this.config.state == STATE_WALKING)
                    this.slashIdle();
                break;
            case STATE_SLASHING_RUNNING:
                if (this.config.state == STATE_WAITING || this.config.state == STATE_IDLING || this.config.state == STATE_RUNNING || this.config.state == STATE_WALKING) {
                    this.slashRun();
                }
                this.movePosition(data.directionH, data.directionV, 2);
                break;
            case STATE_KICKING:
                if (this.config.state == STATE_WAITING || this.config.state == STATE_IDLING || this.config.state == STATE_RUNNING || this.config.state == STATE_WALKING) {
                    this.kick();
                }

        }
    }

}

export default Character;
