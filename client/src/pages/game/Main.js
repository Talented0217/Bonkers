import Phaser from "phaser";
import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Board from "./scenes/Board";
import { connect } from "react-redux";
// import Temp from "./scenes/Temp";
const boardConfig = require("./config.json");

const Main = ({ auth }) => {
  const name = localStorage.getItem("name");
  const team = localStorage.getItem("team");
  const tank = useParams().tank;
  console.log("game-----****", auth);

  // if (auth.isAuthenticated != true || auth.user?.tankCount <= 0)
  //   return <Navigate to={`/game`} />;

  const config = {
    type: Phaser.AUTO,
    parent: "game",
    ...boardConfig,
    physics: {
      default: "arcade",
      arcade: {
        // gravity: { y: 300 },
        debug: true,
      },
    },
    background: "black",
    // scene: [new Board(tank, auth.user.name, auth.user.team, auth.user._id)],
    scene: [new Board(tank, name, team, 0)],
    scale: {
      mode: Phaser.Scale.FIT,
      parent: "game",
      autoCenter: Phaser.Scale.CENTER_BOTH,
      //   ...boardConfig,
      width: window.innerWidth,
      height: window.innerHeight,
      // width: 800,
      // height: 800,
    },
  };
  const game = new Phaser.Game(config);
  return <>{/* <div id="game"></div> */}</>;
};
const mapStateToProps = (state) => ({
  auth: state.auth,
});
export default connect(mapStateToProps, null)(Main);
