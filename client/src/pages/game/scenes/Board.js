import Phaser from "phaser";

import imgStat from "../assets/materials/stat.jpg";
import imgPlayer from "../assets/materials/tanks/tank1.png";
import imgBulletV from "../assets/materials/bullet-v.png";
import imgBulletH from "../assets/materials/bullet-h.png";
import imgMap from "../assets/materials/map.png";
import imgWall from "../assets/materials/wall.bmp";

// import imgtank1 from "../assets/materials/tanks/tank1.png";
// import imgtank2 from "../assets/materials/tanks/tank2.png";
// import imgtank3 from "../assets/materials/tanks/tank3.png";
// import imgtank4 from "../assets/materials/tanks/tank4.png";
// import imgtank5 from "../assets/materials/tanks/tank5.png";
// import imgtank6 from "../assets/materials/tanks/tank6.png";

//
import tank from "../assets/materials/tanks/player_animate.png";
//

import imgScore from "../assets/materials/Score.png";
import imgReload from "../assets/materials/clock.png";
import imgHp from "../assets/materials/hp.png";
import imgNumbers from "../assets/materials/numbers.png";

import imgMine from "../assets/materials/mine.png";

import { useParams, Navigate } from "react-router-dom";

//items

import imgNuclear from "../assets/materials/nuclear.png";
import io from "socket.io-client";

import { getMapData } from "../assets/map";

const NUCLEAR = 0;
const FREEZE = 1;
const BULLET_1 = 2;
const BULLET_2 = 3;
const BULLET_3 = 4;

const item_existing = 6000; // 6s

//tank
const tankScale = 0.22;
const viewDistance = 20;

const hp_upgrade = 5;
const power_upgrade = 1;
const armour = 0.05;
const mine_damage = 7;
const mintTime = 200;
const mineCnt = 3;
const mineTime = 1000 * 10;

const mineR = 3;
const mineD = 6;
const mined = 4;
const mineColor = 0x804040;

const playerColor = 0xffffff;
const enemyColor = 0x000000;
const allianceColor = 0x2002ff;
// const speed_upgrade

const sWidth = window.innerWidth;
const sHeight = window.innerHeight;
// const sWidth = 800;
// const sHeight = 800;
export default class Board extends Phaser.Scene {
  constructor(tankType, name, team, userId) {
    super({
      key: "Board",
      physics: {
        arcade: {
          debug: false,
          gravity: {
            y: 0,
          },
        },
        matter: {
          debug: false,
          gravity: {
            y: 0,
          },
        },
      },
    });

    // light spot

    this.playerLight = null;

    this.bulletSpeed = 600;
    this.reloadTime = 1000;
    this.name = name;
    this.team = team;
    this.speed = 250;
    this.userId = userId;
    // mine
    this.canMine = true;
    this.mineCount = mineCnt;

    this.walls = [];
    this.mines = [];
    this.keys = [];
    this.minimap = {
      player: null,
      enemies: {},
      map: null,
    };
    this.score = 0;
    this.bullets = [];

    //socket

    this.Enemies = [];
    this.EnemyBullets = [];
    this.tankType = tankType;
    this.level = 1;

    //
    this.items = [];
  }
  setTankAlpha = (tank, alpha) => {
    tank.setAlpha(alpha);
    tank.name.setAlpha(alpha);
    tank.hp.setAlpha(alpha);
  };
  addNewEnemy = (enemy) => {
    let newEnemy = this.physics.add
      .sprite(enemy.x, enemy.y, "tank")
      .setScale(tankScale, tankScale);

    this.physics.add.collider(newEnemy, this.walls);
    if (enemy.team != this.team) newEnemy.setTint("0x22ffcc");

    newEnemy.config = enemy.config;
    newEnemy.angle = enemy.direction;

    newEnemy.setCollideWorldBounds(true);
    newEnemy.setImmovable();

    newEnemy.playerId = enemy.playerId;

    // ## todo _health
    newEnemy.hp = this.add
      .rectangle(enemy.x, enemy.y - 40, enemy.config.hp, 10, 0xff0000)
      .setDepth(1);

    newEnemy.name = this.add
      .text(enemy.x, enemy.y - 60, `${enemy.team}:${enemy.name}`)
      .setDepth(1)
      .setOrigin(0.5, 0.5);

    newEnemy.team = enemy.team;

    // console.log("mini", enemy.playerId);
    if (enemy.team == this.team)
      this.minimap.enemies[enemy.playerId] = this.add
        .ellipse(enemy.x, enemy.y, 5, 5, allianceColor)
        .setDepth(1);
    else
      this.minimap.enemies[enemy.playerId] = this.add
        .ellipse(enemy.x, enemy.y, 5, 5, enemyColor)
        .setDepth(1);
    let mapPos = this.getMiniMapPos(enemy.x, enemy.y);
    this.minimap.enemies[enemy.playerId].x = mapPos.x;
    this.minimap.enemies[enemy.playerId].y = mapPos.y;
    this.minimap.enemies[enemy.playerId].setScrollFactor(0);
    this.Enemies.push(newEnemy);
  };

  getPlayers = (Players) => {
    Object.keys(Players).forEach((player) => {
      if (Players[player].playerId != this.socket.id)
        this.addNewEnemy(Players[player]);
      else {
        this.player.x = Players[player].x;
        this.player.y = Players[player].y;
        this.player.config = Players[player].config;
        this.player.hp.x = this.player.x;
        this.player.hp.y = this.player.y - 60;
        this.player.hp.width = this.player.config.hp;
        this.player.life = this.player.config.hp;
        this.player.angle = Players[player].direction;
        this.reloadingTime = this.player.config.reloading;
      }
    });
  };

  getNewPlayer = (enemy) => {
    this.addNewEnemy(enemy);
  };

  updatePlayers = (_enemy) => {
    this.Enemies.forEach((enemy) => {
      if (enemy.playerId == _enemy.playerId) {
        // enemy.x = _enemy.x;
        // enemy.y = _enemy.y;

        let duration =
          (Math.floor(
            Math.sqrt((enemy.x - _enemy.x) ** 2 + (enemy.y - _enemy.y) ** 2)
          ) /
            200) *
          10;

        // console.log(duration);

        if (duration > 0) enemy.anims.play("move", true);
        this.tweens.add({
          targets: enemy,
          x: _enemy.x,
          y: _enemy.y,
          ease: "Power1",
          duration: duration,
        });

        enemy.config = _enemy.config;
        enemy.angle = _enemy.direction;

        return;
      }
    });
    if (_enemy.playerId == this.socket.id) {
      // this.player.x = _enemy.x;
      // this.player.y = _enemy.y;
      // this.player.hp.x = _enemy.x;
      // this.player.hp.y = _enemy.y - 50;
      // this.player.direction = _enemy.direction;
      // this.player.setFrame(_enemy.direction / 90);
      this.player.config = _enemy.config;
      this.player.hp.width = _enemy.config.hp;
    }
  };
  deleteEnemy = (_enemy) => {
    if (_enemy.playerId == this.socket.id) {
      this.cameras.main.flash(5000, 255, 0, 0);
      this.player.hp.width = 0;
      this.socket.disconnect();

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      this.Enemies.forEach((enemy, index) => {
        if (enemy.playerId == _enemy.playerId) {
          enemy.hp.destroy();
          enemy.name.destroy();
          enemy.destroy();
          this.Enemies.splice(index, 1);
          this.minimap.enemies[_enemy.playerId].destroy();
          delete this.minimap.enemies[_enemy.playerId];
          return;
        }
      });
    }
  };

  mapLoad = (mapData) => {
    // console.log("mapLoaded");
    this.walls = [];
    // mapData.forEach((mapItem) => {
    //   for (let i = 1; i <= mapItem.w; i += 1) {
    //     for (let j = 1; j <= mapItem.h; j += 1) {
    //       let m = this.physics.add
    //         .image(mapItem.x + i * 50, mapItem.y + j * 50, "wall")
    //         .setScale(0.5, 0.5);
    //       // .setPipeline("Light2D");

    //       m.setImmovable();
    //       this.walls.push(m);
    //     }
    //   }
    // });
    // this.walls.setPipeline("Light2D");

    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 100; j++) {
        if (getMapData(i, j) == 1) {
          let m = this.physics.add
            .image(i * 50, j * 50, "wall")
            .setOrigin(0, 0)
            .setScale(0.5, 0.5);

          m.setImmovable();
          this.walls.push(m);
        }
      }
    }
    this.physics.add.collider(this.walls, this.player);
  };

  enemyBulletFired = (bulletData) => {
    let bullet = this.physics.add
      .image(bulletData.x, bulletData.y, "bulletV")
      .setScale(0.1, 0.1);

    let direction = bulletData.direction;
    bullet.angle = direction;
    bullet.playerId = bulletData.playerId;
    switch (direction) {
      case 0:
        bullet.setVelocityY(-this.bulletSpeed);
        bullet.y -= 50;
        break;
      case -90:
        bullet.setVelocityX(-this.bulletSpeed);
        bullet.body.setSize(bullet.body.height, bullet.body.width);
        bullet.x -= 50;
        break;
      case -180:
        bullet.setVelocityY(this.bulletSpeed);
        bullet.y += 50;
        break;
      case 90:
        bullet.setVelocityX(this.bulletSpeed);
        bullet.body.setSize(bullet.body.height, bullet.body.width);
        bullet.x += 50;
        break;
    }

    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;

    setTimeout(() => {
      bullet.destroy();
    }, 10000);
    // this.EnemyBullets.push(bullet);
    this.physics.world.on("worldbounds", this.onWorldBounds);
    this.physics.add.collider(bullet, this.walls, this.hitWall, null);
    this.physics.add.collider(bullet, this.player, this.hitMe, null);
    this.physics.add.collider(bullet, this.Enemies, this.hitWall, null);

    // this.physics.add.collider(bullet, this.bullets, this.hitBullet, null);
    // this.physics.add.collider(bullet, this.EnemyBullets, this.hitBullet, null);
  };

  enemyMine = (data) => {
    let opacity = 0;
    if (data.team == this.team) opacity = 1;
    let mineItem = this.physics.add
      .sprite(data.x, data.y, "mine", 0)
      .setBodySize(30, 30)
      .setDepth(-1)
      .setAlpha(opacity)
      .setImmovable();
    mineItem.flag = true;
    mineItem.team = data.team;
    mineItem.id = data.id;
    if (mineItem.team != this.team) {
      const pos = this.getMiniMapPos(data.x, data.y);
      let mineMap = this.add
        .ellipse(
          pos.x - (Math.random() - 0.5) * mineR,
          pos.y - (Math.random() - 0.5) * mineR,
          mineD + Math.random() * mined,
          mineD + Math.random() * mined,
          mineColor
        )
        .setDepth(1)
        .setScrollFactor(0);
      mineMap.config = data;
      this.mines.push(mineMap);
    }

    this.physics.add.overlap(this.player, mineItem, this.hitEnemyMine, null);
    this.physics.add.overlap(this.Enemies, mineItem, this.hitMine, null);

    // this.physics.add.overlap(this.Enemies, mineItem, this.hitEnemyMine, null);
    // this.socket.emit("mine", { x: this.player.x, y: this.player.y });
  };
  /* check mini map */
  addItem = (item) => {
    switch (item.type) {
      case NUCLEAR:
        let newItem = this.physics.add
          .image(item.config.x, item.config.y, "nuclear")
          .setDepth(4)
          .setScale(0.5, 0.5);

        newItem.type = item.type;
        newItem.config = item.config;
        newItem.id = item.id;

        this.items.push(newItem);
        this.physics.add.collider(newItem, this.player, this.hitItem, null);
        break;
    }
  };

  getMiniMapPos = (x, y) => {
    let pos = {
      x: this.minimap.map.x + (x / 5000) * this.minimap.map.width,
      y: this.minimap.map.y + (y / 5000) * this.minimap.map.width,
    };
    return pos;
  };

  tankCollider = (player, enemy) => {
    player.setVelocity(0);
  };
  enemyCollider = (enemy1, enemy2) => {};
  setPositionOnMiniMap = () => {
    this.minimap.player.x =
      this.minimap.map.x + (this.player.x / 5000) * this.minimap.map.width;
    this.minimap.player.y =
      this.minimap.map.y + (this.player.y / 5000) * this.minimap.map.height;
  };

  preload() {
    // this.load.image("map", welcome);
    // this.load.spritesheet("player", imgPlayer, {
    //   frameWidth: 47.5,
    //   frameHeight: 50,
    // });

    this.load.image("nuclear", imgNuclear);
    this.load.image("bulletV", imgBulletV);
    this.load.image("bulletH", imgBulletH);
    this.load.image("map", imgMap);
    this.load.image("wall", imgWall);
    // this.load.image("tank1", imgtank1);
    // this.load.image("tank2", imgtank2);
    // this.load.image("tank3", imgtank3);
    // this.load.image("tank4", imgtank4);
    // this.load.image("tank5", imgtank5);
    // this.load.image("tank6", imgtank6);
    this.load.spritesheet("tank", tank, { frameWidth: 192, frameHeight: 192 });
    this.load.image("statTable", imgStat);
    this.load.image("score", imgScore);
    this.load.image("clock", imgReload);
    this.load.image("hp", imgHp);
    this.load.spritesheet("numbers", imgNumbers, {
      frameWidth: 72,
      frameHeight: 69,
    });

    this.load.spritesheet("mine", imgMine, { frameWidth: 75, frameHeight: 75 });
  }

  gameConnect = () => {
    // console.log("gameConnected");
    this.socket.emit("mapLoad");
    this.socket.emit("registerTank", {
      type: this.tankType,
      name: this.name,
      team: this.team,
      userId: this.userId,
    });
  };

  killEnemy = (attacker) => {
    if (attacker == this.socket.id) {
      this.score++;
      this.mineCount += 1;
      let h = this.score / 100;
      let t = (this.score % 100) / 10;
      let o = this.score % 10;
      this.hundred.setFrame(Math.floor(h));
      this.ten.setFrame(Math.floor(t));
      this.one.setFrame(Math.floor(o));
      this.upgrade();
    }
  };

  updateLog = (log) => {
    // console.log("Logs:", log);
    for (let i = 0; i < log.length; i++) {
      this.logs[i].setText(log[i]);
    }
  };
  create() {
    // lights---------------
    // this.lights.enable();
    // this.lights.setAmbientColor(0x000000);

    // this.playerLight = this.lights.addPointLight(0, 0, 500, 0xffffff, 6);
    // this.playerLight = this.lights.addPointLight(0, 0, 0xffffff, 6, 0.1);

    //*********** */ animation

    //---mine   && tank
    this.anims.create({
      key: "move",
      frames: this.anims.generateFrameNumbers("tank", { start: 0, end: 3 }),
      frameRate: 50,
      repeat: 0,
    });
    this.anims.create({
      key: "mine",
      frames: this.anims.generateFrameNumbers("mine", { start: 0, end: 8 }),
      frameRate: 10,
      repeat: 0,
    });
    //

    this.keyMine = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyFire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.keyEnter = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyRight = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.socket = io.connect("http://10.10.10.79:3000");
    // this.socket = io.connect("https://backend.robotfactory.works");

    this.socket.on("gameConnected", this.gameConnect);
    this.socket.on("currentPlayers", this.getPlayers);
    this.socket.on("newPlayer", this.getNewPlayer);
    this.socket.on("playerMoved", this.updatePlayers);
    // this.socket.on("hitEnemy", this.enemyHitted);
    this.socket.on("deletePlayer", this.deleteEnemy);
    this.socket.on("bulletFired", this.enemyBulletFired);
    this.socket.on("map", this.mapLoad);
    this.socket.on("killEnemy", this.killEnemy);
    this.socket.on("newLog", this.updateLog);

    this.socket.on("loadItem", (items) => {
      items.forEach((item) => {
        this.addItem(item);
      });
    });
    this.socket.on("newItem", (item) => {
      this.addItem(item);
    });
    this.socket.on("removeItem", (id) => {
      //console.log(id);
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id == id) {
          this.items[i].destroy();
          this.items.splice(i, 1);
          break;
        }
      }
    });
    this.socket.on("upgrade", (data) => {
      this.Enemies.forEach((enemy) => {
        if (enemy.playerId == data.id) {
          enemy.name.text = data.name;
        }
      });
    });
    this.socket.on("mine", (data) => {
      this.enemyMine(data);
    });

    this.socket.on("loadMine", (mines) => {
      //console.log(mines);
      for (let i = 0; i < mines.length; i++) {
        this.enemyMine(mines[i]);
      }
    });

    // let mapData = [];

    // for (let y = 0; y < 5000 / 45 + 1; y++) {
    //   let row = [];
    //   for (let x = 0; x < 5000 / 45 + 1; x++) {
    //     let tileIndex = Math.floor(Math.random() * 24) + 1;
    //     row.push(tileIndex);
    //   }
    //   mapData.push(row);
    // }

    // this.map = this.make.tilemap({
    //   data: mapData,
    //   tileWidth: 45,
    //   tileHeight: 45,
    // });

    // let tileset = this.map.addTilesetImage("map");
    // let layer = this.map.createLayer(0, tileset, 0, 0);

    //Score
    let Score = this.add.image(80, 50, "score").setScrollFactor(0).setDepth(4);
    this.hundred = this.add
      .sprite(180, 50, "numbers")
      .setScrollFactor(0)
      .setDepth(4);
    this.ten = this.add
      .sprite(230, 50, "numbers")
      .setScrollFactor(0)
      .setDepth(4);
    this.one = this.add
      .sprite(280, 50, "numbers")
      .setScrollFactor(0)
      .setDepth(4);

    this.cursors = this.input.keyboard.createCursorKeys();

    let playerType = "tank";

    this.player = this.physics.add
      .sprite(-100, -100, playerType)
      .setScale(tankScale, tankScale);

    // this.player.setPipeline("Light2D");
    this.player.hp = this.add
      .rectangle(-100, -100, 100, 6, 0x00ff00)
      .setDepth(1);
    this.player.hp.setOrigin(0.5, 0.5);
    this.player.name = this.add.text(
      -100,
      -100,
      `${this.team}:${this.name}`,
      "0xffff00"
    );
    this.player.name.setOrigin(0.5, 0.5).setDepth(1);
    this.player.setCollideWorldBounds(true);

    // bars;
    this.add
      .image(sWidth - 220, 50, "clock")
      .setScrollFactor(0)
      .setDepth(3)
      .setScale(0.5, 0.5);
    this.add
      .image(sWidth - 220, 20, "hp")
      .setScrollFactor(0)
      .setDepth(3)
      .setScale(0.4, 0.4);
    this.player.hpBar = this.add
      .rectangle(sWidth - 200, 20, 100, 25, 0xff0000)
      .setDepth(3)
      .setScrollFactor(0);
    this.player.reloadBar = this.add
      .rectangle(sWidth - 200, 50, 100, 25, 0x00ddff)
      .setDepth(3)
      .setScrollFactor(0);
    //
    // log
    this.logs = [];
    for (let i = 0; i < 6; i++) {
      let log = this.add
        .text(10, 120 + i * 30, "...", 0x00ddff)
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(3);
      this.logs.push(log);
    }
    this.player.reloadBar.setOrigin(0, 1);

    //Camera
    this.cameras.main.startFollow(this.player);

    this.cameras.main.setBounds(0, 0, 5000, 5000);

    this.physics.world.setBounds(0, 0, 5000, 5000);

    // minimap
    this.minimap.map = this.add
      .rectangle(sWidth - 220, sHeight - 220, 200, 200, 0x00ff0f, 0.5)
      .setOrigin(0, 0)
      .setDepth(1);

    this.minimap.player = this.add
      .ellipse(150, 150, 5, 5, playerColor)
      .setDepth(2);
    // this.minimap.player
    this.minimap.map.setScrollFactor(0);
    this.minimap.player.setScrollFactor(0);

    this.physics.add.collider(
      this.player,
      this.Enemies,
      this.tankCollider,
      null,
      this
    );
  }

  getMinDistance = (playerId, team) => {
    let d = 0;
    if (team != this.team)
      d = Math.sqrt(
        (this.minimap.player.x - this.minimap.enemies[playerId].x) ** 2 +
          (this.minimap.player.y - this.minimap.enemies[playerId].y) ** 2
      );
    else {
      return 0;
    }
    this.Enemies.forEach((enemy) => {
      // console.log(enemy.playerId, enemy.team, playerId, team);
      if (enemy.playerId != playerId && enemy.team == this.team) {
        let t = Math.sqrt(
          (this.minimap.enemies[enemy.playerId].x -
            this.minimap.enemies[playerId].x) **
            2 +
            (this.minimap.enemies[enemy.playerId].y -
              this.minimap.enemies[playerId].y) **
              2
        );
        // console.log("tDistance->", t);
        if (t < d) d = t;
      }
    });
    return d;
  };
  update() {
    this.walls.forEach((wall) => {
      let d = Math.sqrt(
        (wall.x - this.player.x) ** 2 + (wall.y - this.player.y) ** 2
      );
      if (d > viewDistance * 25) wall.setAlpha(0.2);
      else wall.setAlpha(1);
    });

    this.Enemies.forEach((enemy) => {
      if (enemy.playerId != this.socket.id) {
        enemy.hp.x = enemy.x;
        enemy.hp.y = enemy.y - 40;
        enemy.name.x = enemy.x;
        enemy.name.y = enemy.y - 60;
        enemy.name.setOrigin(0.5, 0.5);
        enemy.hp.width = enemy.config.hp;
        enemy.hp.setOrigin(0.5, 0.5);
        let mapPos = this.getMiniMapPos(enemy.x, enemy.y);
        this.minimap.enemies[enemy.playerId].x = mapPos.x;
        this.minimap.enemies[enemy.playerId].y = mapPos.y;

        if (enemy.team != this.team) {
          let distance = this.getMinDistance(enemy.playerId, enemy.team);
          console.log("distance", distance);
          if (distance > viewDistance) {
            this.minimap.enemies[enemy.playerId].setAlpha(0);
            this.setTankAlpha(enemy, 0);
          } else {
            this.minimap.enemies[enemy.playerId].setAlpha(1);

            this.setTankAlpha(enemy, 1);
          }
        } else {
          let distance = Math.sqrt(
            (enemy.x - this.player.x) ** 2 + (enemy.y - this.player.y) ** 2
          );
          if (distance > viewDistance * 25) {
            this.setTankAlpha(enemy, 0.2);
          } else {
            this.setTankAlpha(enemy, 1);
          }
        }
      }
    });
    if (this.player) {
      this.player.hp.x = this.player.x;
      this.player.hp.y = this.player.y - 40;
      this.player.name.x = this.player.x;
      this.player.name.y = this.player.y - 60;
      this.player.name.setOrigin(0.5, 0.5);
      this.player.hp.setOrigin(0.5, 0.5);

      if (this.cursors.left.isDown && this.keys.indexOf(0) == -1) {
        this.keys.push(0);
      } else if (this.cursors.left.isUp) {
        for (let i = 0; i < this.keys.length; i++)
          if (this.keys[i] == 0) {
            this.keys.splice(i, 1);
            break;
          }
      }
      if (this.cursors.right.isDown && this.keys.indexOf(1) == -1) {
        this.keys.push(1);
      } else if (this.cursors.right.isUp) {
        for (let i = 0; i < this.keys.length; i++)
          if (this.keys[i] == 1) {
            this.keys.splice(i, 1);
            break;
          }
      }
      if (this.cursors.up.isDown && this.keys.indexOf(2) == -1) {
        this.keys.push(2);
      } else if (this.cursors.up.isUp) {
        for (let i = 0; i < this.keys.length; i++)
          if (this.keys[i] == 2) {
            this.keys.splice(i, 1);
            break;
          }
      }
      if (this.cursors.down.isDown && this.keys.indexOf(3) == -1) {
        this.keys.push(3);
      } else if (this.cursors.down.isUp) {
        for (let i = 0; i < this.keys.length; i++)
          if (this.keys[i] == 3) {
            this.keys.splice(i, 1);
            break;
          }
      }

      if (this.player.config != undefined) {
        this.player.reloadBar.width =
          (this.player.config.reloading - this.reloadingTime) / 5;
        this.player.hpBar.width = this.player.config.hp * 2;
        this.player.hpBar.setOrigin(0, 0.5);
        this.player.reloadBar.setOrigin(0, 0.5);
      }
      if (this.reloadingTime > 0) this.reloadingTime -= 10;
      let movedFlag = false;
      let rotation = 0;
      this.player.setVelocity(0);

      if (this.keys.length > 0) {
        this.player.anims.play("move", true);
        let key = this.keys[this.keys.length - 1];
        if (key == 0) {
          this.player.setVelocityX(-this.player.config.speed);
          movedFlag = true;
          rotation = -90;
        }
        if (key == 1) {
          this.player.setVelocityX(this.player.config.speed);
          movedFlag = true;
          rotation = 90;
        }
        if (key == 2) {
          this.player.setVelocityY(-this.player.config.speed);
          movedFlag = true;
          rotation = 0;
        }
        if (key == 3) {
          this.player.setVelocityY(this.player.config.speed);
          movedFlag = true;
          rotation = -180;
        }
      }
      {
        // if (this.cursors.left.isDown || this.keyLeft.isDown) {
        //   this.player.setVelocityX(-this.player.config.speed);
        //   rotation = -90;
        //   movedFlag = true;
        // } else if (this.cursors.right.isDown || this.keyRight.isDown) {
        //   this.player.setVelocityX(this.player.config.speed);
        //   rotation = 90;
        //   movedFlag = true;
        // } else if (this.cursors.up.isDown || this.keyUp.isDown) {
        //   this.player.setVelocityY(-this.player.config.speed);
        //   movedFlag = true;
        //   rotation = 0;
        // } else if (this.cursors.down.isDown || this.keyDown.isDown) {
        //   this.player.setVelocityY(this.player.config.speed);
        //   rotation = -180;
        //   movedFlag = true;
        // }
      }
      if (movedFlag == true) {
        // this.player.direction = rotation;
        this.player.angle = rotation;
      } else if (this.player.config != undefined) {
        if (this.player.life > this.player.config.hp)
          this.player.config.hp += armour * this.level;
        this.player.hp.width = this.player.config.hp;
      }

      if (this.player.config != undefined) {
        let movement = {
          x: this.player.x,
          y: this.player.y,
          hp: this.player.config.hp,
          direction: this.player.angle,
        };

        // this.playerLight.x = this.player.x;
        // this.playerLight.y = this.player.y;
        this.socket.emit("playerMovement", movement);
      }

      // console.log(this.cursors.space.isDown);
      if (
        (this.cursors.space.isDown ||
          this.keyFire.isDown ||
          this.keyEnter.isDown) &&
        this.reloadingTime == 0
      ) {
        // console.log("fire");
        this.fire();
        this.reloadingTime = this.player.config.reloading;
      }

      if (this.keyMine.isDown && this.canMine && this.mineCount > 0) {
        // console.log("fire");
        this.canMine = false;
        this.mine();
        this.mineCount--;
        setTimeout(() => {
          this.canMine = true;
        }, mintTime);
      }
    }
    // mini map
    this.setPositionOnMiniMap();
  }
  render() {}

  mine = () => {
    let mineItem = this.physics.add
      .sprite(this.player.x, this.player.y, "mine", 0)
      .setBodySize(30, 30)
      .setDepth(-1)
      .setImmovable();
    mineItem.flag = true;
    mineItem.team = this.team;
    mineItem.id = this.socket.id;

    this.physics.add.overlap(this.Enemies, mineItem, this.hitMine, null);
    this.socket.emit("mine", {
      x: this.player.x,
      y: this.player.y,
      team: this.team,
      id: this.socket.id,
    });
    // setTimeout(() => {
    //   this.destroyMine(mineItem);
    // }, mineTime);
  };
  fire = () => {
    let direction = this.player.angle;
    // alert(direction);
    let bullet = this.physics.add
      .image(this.player.x, this.player.y, "bulletV")
      .setScale(0.1, 0.1);

    // bullet.body.setAllowRotation(true);

    // BigInt;
    bullet.angle = direction;

    switch (direction) {
      case 0:
        bullet.setVelocityY(-this.bulletSpeed);
        bullet.y -= 50;
        break;
      case -90:
        bullet.setVelocityX(-this.bulletSpeed);
        bullet.body.setSize(bullet.body.height, bullet.body.width);
        bullet.x -= 50;
        break;
      case -180:
        bullet.setVelocityY(this.bulletSpeed);
        bullet.y += 50;
        break;
      case 90:
        bullet.setVelocityX(this.bulletSpeed);
        bullet.body.setSize(bullet.body.height, bullet.body.width);
        bullet.x += 50;
        break;
    }
    let bulletData = {
      x: this.player.x,
      y: this.player.y,
      direction: direction,
      playerId: this.socket.id,
    };

    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
    // this.bullets.push(bullet);
    setTimeout(() => {
      bullet.destroy();
    }, 10000);
    this.socket.emit("bulletFired", bulletData);

    this.physics.add.collider(bullet, this.walls, this.hitWall, null);
    this.physics.add.collider(bullet, this.Enemies, this.hitEnemy, null);
    this.physics.world.on("worldbounds", this.onWorldBounds);

    // this.physics.add.collider(bullet, this.bullets, this.hitBullet, null);
    // this.physics.add.collider(bullet, this.EnemyBullets, this.hitBullet, null);
  };

  onWorldBounds = (bullet, wall) => {
    bullet.gameObject.destroy();
    // console.log("true");
  };
  hitMe = (bullet, me) => {
    // this.cameras.main.shake(100, 10, true);
    // x`this.cameras.main.flash(300, 100, 0, 0);
    bullet.destroy();
  };
  hitWall = (bullet, wall) => {
    bullet.destroy();
  };
  hitEnemy = (bullet, enemy) => {
    // console.log("enemy hitted", enemy.playerId);
    if (enemy.team != this.team)
      this.socket.emit("hitEnemy", {
        enemy: enemy.playerId,
        attacker: this.socket.id,
        power: this.player.config.power,
      });
    bullet.destroy();
  };
  hitBullet = (bullet1, bullet2) => {
    bullet1.destroy();
    bullet2.destroy();
  };

  hitItem = (hitItem, player) => {
    const type = hitItem.type;
    const id = hitItem.id;
    switch (type) {
      case NUCLEAR:
        this.socket.emit("nuclear", this.socket.id);
        break;
    }
    hitItem.destroy();
    this.socket.emit("getItem", id, type);
  };

  // upgrade tanks
  upgrade = () => {
    //
    if (this.score == this.level ** 2) {
      this.player.config.power += power_upgrade;
      // this.player.config.speed += 50;
      this.player.config.hp += hp_upgrade;
      this.level++;
      this.player.name.text = this.player.name.text + "⭐";
      this.socket.emit("upgrade", {
        id: this.socket.id,
        name: this.player.name.text,
      });
    }
    // this.player.config.reloadTime += 2;
  };

  destroyMine = (mineItem) => {
    mineItem.anims.play("mine", true);
    mineItem.on("animationcomplete", () => {
      for (let i = 0; i < this.mines.length; i++) {
        if (
          this.mines[i].config.x == mineItem.x &&
          this.mines[i].config.y == mineItem.y &&
          this.mines[i].config.team == mineItem.team
        ) {
          this.mines[i].destroy();
          this.mines.splice(i, 1);
          break;
        }
      }
      mineItem.destroy();
    });
    this.socket.emit("mineDestroy", mineItem);
  };
  mineAnimation = (mineItem, player, type) => {
    // mineItem.collider.destroy();

    mineItem.anims.play("mine", true);

    mineItem.on("animationcomplete", () => {
      for (let i = 0; i < this.mines.length; i++) {
        if (
          this.mines[i].config.x == mineItem.x &&
          this.mines[i].config.y == mineItem.y &&
          this.mines[i].config.team == mineItem.team
        ) {
          this.mines[i].destroy();
          this.mines.splice(i, 1);
          break;
        }
      }
      mineItem.destroy();
      if (type == "player")
        this.socket.emit("hitMine", {
          enemy: this.socket.id,
          attacker: mineItem.id,
          x: mineItem.x,
          y: mineItem.y,
          team: mineItem.team,
        });
    });
  };
  hitMine = (enemy, mineItem) => {
    if (mineItem.flag == true && enemy.team != mineItem.team) {
      this.mineAnimation(mineItem, enemy, "enemy");
      mineItem.flag = false;
    }
  };
  hitEnemyMine = (player, mineItem) => {
    mineItem.setAlpha(1);
    if (mineItem.flag == true && this.team != mineItem.team) {
      this.mineAnimation(mineItem, player, "player");
      mineItem.flag = false;
    }
  };
}
