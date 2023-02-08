import Phaser from "phaser";

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import Loading from './scenes/Loading';
import Battle from "./scenes/Battle";
const boardConfig = require("./config.json");

const Main = (props) => {

  const location = useLocation();

  useEffect(() => {
    const loading = new Loading({ key: 'loading' });
    const battle = new Battle({ key: 'battle', player: location.state.player });
    const config = {
      type: Phaser.AUTO,
      parent: "game",
      ...boardConfig,
      physics: {
        default: "arcade",
        arcade: {
          // debug: true,
          gravityY: 0

        },
      },
      background: "black",
      scene: [loading, battle],
      scale: {
        mode: Phaser.Scale.FIT,
        parent: "game",
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,

      },
    };
    const game = new Phaser.Game(config);
    game.scene.start('loading');

    return (() => {
      game = null;
    })
  }, [])


  return <></>;
};

export default Main;
