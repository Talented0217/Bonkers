import Phaser, { Scene } from "phaser";
// components
import Character from "../components/Character";
import { MAX_ENEMY, BEAR, BOSS, ZEPHYR, FIRE, LIGHTNING, SHIBA, LEFT, RIGHT, UP, DOWN, DELTA_X, DELTA_Y } from "../playerConfig";
import { STATE_RUNNING, STATE_SLASHING_IDLE, STATE_SLASHING_RUNNING, STATE_KICKING, STATE_SLIDING, STATE_ATTACKING, STATE_HURTING, STATE_IDLING, STATE_WALKING, STATE_DYING, STATE_WAITING } from '../playerConfig';

import { sleep } from "../playerConfig";

import api from "../../../utils/api";

import Joystick from "../components/Joystick";


//images
import back1 from '../assets/background/game_background_1.png';
import back2 from '../assets/background/game_background_2.png';
import back3 from '../assets/background/game_background_3.png';
import back4 from '../assets/background/game_background_4.png';
import back5 from '../assets/background/game_background_5.png';

import bear from '../assets/sprites/bear.png'
import zephyr from "../assets/sprites/zephyr.png";
import fire from "../assets/sprites/fire.png";
import shiba from "../assets/sprites/shiba.png";
import lightning from "../assets/sprites/lightning.png";
import hp from "../assets/sprites/hp.png";

import mana from "../assets/sprites/mana.png"

import pin from "../assets/sprites/pin.png";

import boss from "../assets/sprites/boss.png";

import audio1 from "../assets/audio/Level1Music.mp3"
import audioBoss from "../assets/audio/BossMusic.mp3"


import audioBearAttack from "../assets/audio/ZombieAttack.wav";
import audioSlash from "../assets/audio/SwordSwing.mp3";
import audioBearDie from "../assets/audio/ZombieDying.wav";
import audioEnd from "../assets/audio/GameEnd.wav";
// import audioBearAttack from "../assets/audio/ZombieAttack.wav";
//json
const bossJson = require('../assets/jsons/boss.json');
const bearJson = require('../assets/jsons/bear.json');
const zephyrJson = require('../assets/jsons/zephyr.json');
const fireJson = require('../assets/jsons/fire.json');
const lightningJson = require('../assets/jsons/lightning.json');
const shibaJson = require('../assets/jsons/shiba.json');
const hpJson = require('../assets/jsons/hp.json');
const manaJson = require('../assets/jsons/mana.json');


const initialEnemey = [2, 6, 7, 8, 9];
//

class Battle extends Scene {
    constructor(props = null) {
        super(props);

        // initial image config;       


        this.totalTime = 0;

        this.type = props.player;

        this.currentLevel = 1;
        this.currentEnemies = 0;
        this.score = 0;
        this.ended = false;
        //flags
        this.isSliding = false;
        this.enemies = [];
        this.padX = 0;
        this.padY = 0;
        this.backImages = [];
        this.buttonSpec = null;

    }

    preload() {
        this.load.audio('intro', audio1);
        this.load.audio('introBoss', audioBoss);
        this.load.audio('audioBearAttack', audioBearAttack);
        this.load.audio('audioBearDie', audioBearDie);
        this.load.audio('audioSlash', audioSlash);
        this.load.audio('audioEnd', audioEnd);

        this.load.image("background1", back1);
        this.load.image("background2", back2);
        this.load.image("background3", back3);
        this.load.image("background4", back4);
        this.load.image("background5", back5);

        this.load.atlas("bear", bear, bearJson);
        this.load.atlas("boss", boss, bossJson);

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
        this.load.atlas("mana", mana, hpJson);

        this.load.image("pin", pin);


        // this.load.atlas(ZEPHYR, zephyr, zephyrJson);
        // this.load.atlas("Fire", fire, fireJson);

    }
    async create() {

        //controller

        // sound
        this.levelSound = this.sound.add("intro", { volume: 0.05 });
        this.bossSound = this.sound.add("introBoss", { volume: 0.05 });
        this.slashSound = this.sound.add("audioSlash");
        this.bearAttackSound = this.sound.add("audioBearAttack");
        this.bearDieSound = this.sound.add("audioBearDie");
        this.endSound = this.sound.add('audioEnd');
        //==================================================
        {
            let scaleW = window.innerWidth / 3840;
            let scaleH = window.innerHeight / 2160;
            this.backImages.push(this.add.image(0, 0, "background1").setOrigin(0, 0).setScale(scaleW, scaleH));
            this.backImages.push(this.add.image(window.innerWidth, 0, "background2").setOrigin(0, 0).setScale(scaleW, scaleH));
            this.backImages.push(this.add.image(window.innerWidth * 2, 0, "background3").setOrigin(0, 0).setScale(scaleW, scaleH));
            this.backImages.push(this.add.image(window.innerWidth * 3, 0, "background4").setOrigin(0, 0).setScale(scaleW, scaleH));
            this.backImages.push(this.add.image(window.innerWidth * 4, 0, "background5").setOrigin(0, 0).setScale(scaleW, scaleH));



            this.statusBar = this.add.container(200, 100).setDepth(9999);
            this.hpBar = this.add.sprite(0, 0, "hp");
            this.manaBar = this.add.sprite(0, 0, "mana");
            this.statusBar.add([this.hpBar, this.manaBar]).setScale(0.5, 0.5);
        }



        // create animation
        this.createPlayerAnimations(this.type);
        this.createBearAnimations();
        this.createBossAnimations();


        // this.test = this.add.circle().



        this.arrows = this.input.keyboard.createCursorKeys();
        this.controllers = this.input.keyboard.addKeys('A,S,F');

        this.player = new Character(this, {
            type: this.type,
            direction: RIGHT,
            x: window.innerWidth / 2 - 100,
            y: window.innerHeight / 2,
            speed: 40,
            state: STATE_WAITING,
            scale: 0.2,
            body_width: 700,
            body_height: 100,
            offsetY: 500,
            offsetX: 0,
            shadow_width: 500,
            shadow_height: 100,
            shadow_x: 20,
            shadow_y: 100,
            range: 100,
            hp: 10,
            currentHp: 10,

        });

        this.player.body.on("attack", (data) => {
            //console.log("player attacking");
            this.slashSound.play();
            for (let i = 0; i < this.enemies.length; i++) {


                if (this.enemies[i].currentHp <= 0) {
                    this.enemies[i].updateState(STATE_DYING);
                    continue;
                }

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





                if (Math.abs(dx) <= this.player.config.range && Math.abs(dy) <= DELTA_Y && ((dx > 0 && this.player.direction() == LEFT) || ((dx < 0 && this.player.direction() == RIGHT)))) {
                    //console.log("enemy is fool", this.enemies[i].config.currentHp)
                    this.enemies[i].config.currentHp--;
                    if (this.enemies[i].config.currentHp >= 1) {
                        this.enemies[i].updateState(STATE_HURTING);
                    }
                    else {
                        this.enemies[i].updateState(STATE_DYING);
                        this.enemies[i].die();
                        this.bearDieSound.play();
                    }


                }
            }


        });

        // this.cameras.main.startFollow(this.player);
        // this.cameras.main.setBounds(0, 0, 9600, 1080);
        // this.cameras.main.startFollow(this.player.body);








        this.stick = new Joystick({ scene: this, x: 200, y: window.innerHeight - 200, holder: zephyr, pin: "pin" });


        this.stick.on("mousemove", (dx, dy) => {
            this.padX = dx;
            this.padY = dy;
            //// console.log(this.padX, this.padY);
        })
        this.stick.on("dragStopped", () => {
            this.padX = 0;
            this.padY = 0;
        })


        this.SlideButton = this.add.circle(window.innerWidth - 150, window.innerHeight - 140, 30, 0xff0000).setInteractive().setDepth(9999);
        this.SlideButton.on('pointerdown', () => {
            this.SlideButton.setAlpha(0.5);
            this.buttonSpec = "SLIDE";
        })
        this.SlideButton.on('pointerup', () => {
            this.SlideButton.setAlpha(1);
            this.buttonSpec = null;
        })

        this.SlashButton = this.add.circle(window.innerWidth - 200, window.innerHeight - 200, 30, 0x00ffff).setInteractive().setDepth(9999);
        this.SlashButton.on('pointerdown', () => {
            this.SlashButton.setAlpha(0.5);
            this.buttonSpec = "SLASH";
        })
        this.SlashButton.on('pointerup', () => {
            this.SlashButton.setAlpha(1);
            this.buttonSpec = null;
        })

        this.KickButton = this.add.circle(window.innerWidth - 100, window.innerHeight - 200, 30, 0xffff00).setInteractive().setDepth(9999);
        this.KickButton.on('pointerdown', () => {
            this.KickButton.setAlpha(0.5);
            this.buttonSpec = "KICK";
        })
        this.KickButton.on('pointerup', () => {
            this.KickButton.setAlpha(1);
            this.buttonSpec = null;
        })



        // this.SlideButton.on('pointerdown', () => { })
        this.txt = this.add.text(window.innerWidth / 2, window.innerHeight / 2, `GAME OVER`, { fontFamily: 'bonkerFont', fontSize: 120, color: '#ff00ff' }).setOrigin(0.5, 0.5).setDepth(9999).setAlpha(0);
        await this.nextLevel(1);

    }
    update() {
        //console.log(this.ended, "game ended");
        if (!this.player) return;
        if (this.player && this.player.config.currentHp >= 0)
            this.hpBar.setFrame(`HP${this.player.config.hp - this.player.config.currentHp + 1}`);
        if (this.player.config.currentHp <= 0 || this.ended == true) {
            this.enemies.forEach((enemy) => {
                enemy.updateState(STATE_IDLING);

            })
            this.txt.setText("Game Over");
            this.txt.setAlpha(1)
            return true;
        }

        // console.log(this.totalTime);
        this.totalTime++;
        // this.txt.setText(`time:${~~(this.totalTime / 10)}`);

        if (this.enemies.length == 0) {
            if (this.currentLevel == 5) {
                let sc = this.player.config.currentHp * 1000000 - this.totalTime;
                alert(sc);
                api.post("/users/addScore", { score: sc }).then((res) => { document.getElementById("navTowith").click(); });

            }
            this.currentLevel++;
            this.currentEnemies = 0;
            this.nextLevel(this.currentLevel);
        }

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

        // if (this.padX < 0) {
        //     h = LEFT;
        // } else if (this.padX > 0) h = RIGHT;
        // if (this.padY < 0) {
        //     v = UP;
        // } else if (this.padY > 0) v = DOWN;


        let angle = Math.atan(this.padY / (this.padX + 0.0000001));
        angle = angle * 180 / (Math.PI);

        if (Math.abs(Math.abs(angle) - 90) <= 22.5) {

            if (this.padY < 0)
                v = UP;
            else if (this.padY > 0) v = DOWN;
        }
        if (Math.abs(Math.abs(angle) - 0) <= 22.5) {

            if (this.padX > 0)
                h = RIGHT;
            else if (this.padX < 0) h = LEFT;
        }
        if (Math.abs(Math.abs(angle) - 45) <= 22.5) {
            if (this.padX > 0)
                h = RIGHT;
            else if (this.padX < 0) h = LEFT;
            if (this.padY < 0)
                v = UP;
            else if (this.padY > 0) v = DOWN;

        }
        if (h == null && v == null) {
            //console.log(angle);
        }
        // RUNNING
        if (this.arrows.shift.isDown || this.padX ** 2 + this.padY ** 2 >= 2000) {
            isRunning = true;
            keyPressed = true;
        }
        //SLASHING
        if (this.controllers.A.isDown || this.buttonSpec == "SLASH") {
            keyPressed = true;
            isSlashing = true;
        }

        if (this.controllers.S.isDown || this.buttonSpec == "SLIDE") {
            keyPressed = true;
            // isSlashing = true;
        }

        // JUMPING
        // if (this.arrows.space.isDown) {
        //     jumpStarted = true;
        // }

        //Kick
        if (this.controllers.F.isDown || this.buttonSpec == "KICK") {
            this.player.updateState(STATE_KICKING);

        }
        else if ((this.controllers.S.isDown || this.buttonSpec == "SLIDE") && this.isSliding == false) {
            this.player.updateState(STATE_SLIDING);
            this.isSliding = true;
            setTimeout(() => {

                this.isSliding = false;
            }, 500)
        }

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
        else
            this.player.updateState(STATE_IDLING);


        this.controlGames();
        this.updateZindex();



    }

    createBossAnimations = () => {
        // bear animation
        this.anims.create({
            key: 'bossIdle',
            frames: this.anims.generateFrameNames('boss', { prefix: 'Potato Idle_', start: 0, end: 13, zeroPad: 2 }),
            frameRate: 24,
            repeat: -1
        })
        this.anims.create({
            key: 'bossAttack',
            frames: this.anims.generateFrameNames('boss', { prefix: 'Potato Attack_', start: 0, end: 16, zeroPad: 2 }),
            frameRate: 24,
        })
        this.anims.create({
            key: 'bossDie',
            frames: this.anims.generateFrameNames('boss', { prefix: 'Potato Die_', start: 0, end: 53, zeroPad: 2 }),
            frameRate: 24,
            // repeat: -1
        })
        this.anims.create({
            key: 'bossWalk',
            frames: this.anims.generateFrameNames('boss', { prefix: 'Potato walk_', start: 0, end: 19, zeroPad: 2 }),
            frameRate: 24,
            repeat: -1
        })
        this.anims.create({
            key: 'bossHurt',
            frames: this.anims.generateFrameNames('boss', { prefix: 'Potato Hurt_', start: 0, end: 9, zeroPad: 2 }),
            frameRate: 24,
            //repeat: -1
        })
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
        this.anims.create({
            key: 'bearHurt',
            frames: this.anims.generateFrameNames('bear', { prefix: 'Zombie Bear_hurt', start: 0, end: 24, zeroPad: 3 }),
            frameRate: 24,
            //repeat: -1
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

    controlGames = () => {
        //this.enemies


        for (let i = 0; i < this.enemies.length; i++) {

            if (this.enemies[i].dead == true) {
                this.enemies[i] = null;
                this.enemies.splice(i, 1);
                this.createBear(this.currentLevel);
                continue;
            }
            if (this.enemies[i].currentHp <= 0) {
                this.enemies[i].updateState(STATE_DYING);

                continue;
            }

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





            if (Math.abs(dx) <= this.player.config.range && Math.abs(dy) <= DELTA_Y && ((dx > 0 && this.player.direction() == LEFT) || ((dx < 0 && this.player.direction() == RIGHT)))) {
                if (this.player.attacking == true) {
                    this.enemies[i].updateState(STATE_HURTING);
                }
            }


            if (!(h == null && v == null))
                this.enemies[i].updateState(STATE_WALKING, {
                    directionH: h,
                    directionV: v

                });
            else {
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


    createBear = (level) => {
        let x, y, range, speed;
        x = Math.random() * window.innerWidth;
        y = Math.random() * window.innerHeight;
        speed = Math.random() * 10 + 60;
        range = Math.random() * 10 + 100;


        if (this.currentEnemies < MAX_ENEMY + (level == 1 ? 1 : 0))
            this.currentEnemies++;
        else return;

        let newE = null;
        if ((level == 5 && this.currentEnemies == MAX_ENEMY)) {
            newE = new Character(this, {
                type: BOSS,
                direction: LEFT,
                x: x,
                y: y,
                speed: speed,
                state: STATE_IDLING,
                scale: 0.2,
                body_width: 700,
                body_height: 100,
                shadow_width: 700,
                shadow_height: 100,
                offsetX: 270,
                offsetY: 750,
                shadow_x: 60,
                shadow_y: 150,
                range: range,
                hp: level,
                currentHp: level,
            });
            this.levelSound.stop();
            this.bossSound.play();
        }
        else
            newE = new Character(this, {
                type: BEAR,
                direction: RIGHT,
                x: x,
                y: y,
                speed: speed,
                state: STATE_IDLING,
                scale: 0.4,
                body_width: 350,
                body_height: 100,
                shadow_width: 350,
                shadow_height: 100,
                offsetY: 350,
                offsetX: 0,
                shadow_x: 0,
                shadow_y: 140,
                range: range,
                hp: level,
                currentHp: level,
            });
        newE.body.on("attack", (data) => {


            this.bearAttackSound.play();
            let dx = this.player.x() - data.x;
            let dy = this.player.y() - data.y;
            let h = null;
            let v = null;
            if (dx > data.range)
                h = RIGHT;
            if (dx < - data.range) h = LEFT;
            else {

                if (dx > 0 && data.direction == LEFT) {
                    h = RIGHT;
                }
                else if (dx < 0 && data.direction == RIGHT) {
                    h = LEFT;
                }
            }

            if (dy > DELTA_Y)
                v = DOWN;
            if (dy < -DELTA_Y) v = UP;



            if (this.player.config.state != STATE_DYING && Math.abs(dx) <= data.range && Math.abs(dy) <= DELTA_Y && ((dx < 0 && data.direction == LEFT) || ((dx > 0 && data.direction == RIGHT)))) {


                if (this.player.config.currentHp > 1) {
                    this.player.updateState(STATE_HURTING);
                    this.player.config.currentHp--;
                }
                else {
                    this.player.config.currentHp--;
                    this.ended = true;
                    this.endSound.play();
                    // this.player.updateState(STATE_DYING);
                    this.player.die();
                }
                //console.log("uahh");

            }


        })
        this.enemies.push(newE);
    }



    nextLevel = async (level) => {
        if (level == 1) {
            this.levelSound.play();
        }

        // this.cameras.main.setPosition(window.innerWidth * level - 1, 0);
        if (level >= 2) {
            this.backImages.forEach((back) => {
                this.add.tween({
                    targets: back,
                    x: back.x - window.innerWidth,
                    duration: 3000,
                    ease: 'Power2',
                    completeDelay: 3000
                });
            });
            // await sleep(3000);
        }
        for (let i = 0; i < initialEnemey[level - 1]; i++) {
            // setTimeout(() => { }, 1000)            
            this.createBear(level);
            await sleep(1000);
        }

    }

}
export default Battle;