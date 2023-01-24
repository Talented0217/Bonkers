import Phaser from "phaser";
export default class Temp extends Phaser.Scene {
  constructor() {
    super({
      key: "Temp",
      physics: {
        arcade: {
          debug: false,
          gravity: {
            y: 0,
          },
        },
        matter: {
          debug: true,
          gravity: {
            y: 0,
          },
        },
      },
    });
  }
}
