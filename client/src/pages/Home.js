import tank1 from "./game/assets/materials/tanks/tank1.png";
import tank2 from "./game/assets/materials/tanks/tank2.png";
import tank3 from "./game/assets/materials/tanks/tank3.png";
import tank4 from "./game/assets/materials/tanks/tank4.png";
import tank5 from "./game/assets/materials/tanks/tank5.png";
import tank6 from "./game/assets/materials/tanks/tank6.png";

import { connect } from "react-redux";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { removeTank } from "../actions/user";
var web3 = require("@solana/web3.js");

const Home = ({ auth, removeTank }) => {
  const [tank, setTank] = useState(0);

  const buyTank = async (type) => {
    // removeTank();
    setTank(type);
  };
  console.log("game" + auth);

  // if (auth.isAuthenticated != true || auth.user?.tankCount <= 0)
  //   return <Navigate to={`/dashboard`} />;

  if (tank > 0) return <Navigate to={`/battle/` + tank} />;
  return (
    <div className="relative">
      {/* <div className="w-full h-screen s-contain flex justify-center items-center content-center">
        <div className="s-modal w-2/3 sm:w-5/12 flex flex-col py-10 px-4">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Start Game
          </button>
        </div>
      </div> */}
      <input
        placeholder="name"
        onChange={(e) => {
          localStorage.setItem("name", e.target.value);
        }}
      ></input>
      <input
        placeholder="team"
        onChange={(e) => {
          localStorage.setItem("team", e.target.value);
        }}
      ></input>
      <div className="w-full py-20 ">
        <div className="m-auto grid grid-cols-1 w-[250px] gap-[50px] xl:w-[900px] xl:grid-cols-3 xl:gap-[100px] lg:w-[700px] lg:grid-cols-3 lg:gap-[50px] sm:w-[550px] sm:grid-cols-2 sm:gap-[50px] h-full justify-around items-center">
          <div
            className="a-tank-board rounded-lg py-5 px-2   hover:border hover:border-gray-100  hover:border-[5px] hover:blur-[0px]  hover:cursor-pointer transition-all"
            onClick={() => {
              buyTank(1);
            }}
          >
            <div className="a-tank-img h-[200px] px-2">
              <img className="w-full h-full" src={tank1}></img>
            </div>
            <div className="a-tank-text px-5 pt-5 text-white flex justify-between">
              <span>Super</span> <span>0.1 sol</span>
            </div>
            <div className="bg-gray-800 rounded-b-[10px] py-2 mt-2 px-2">
              <div className="border-b border-green-500 w-5/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                HP
              </div>
              <div className="border-b border-green-500 w-2/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Speed
              </div>
              <div className="border-b border-green-500 w-4/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Power
              </div>
              <div className="border-b border-green-500 w-3/5  h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Reloading
              </div>
            </div>
          </div>
          <div
            className="rounded-lg a-tank-board py-5 px-2   hover:border hover:border-gray-100  hover:border-[5px] hover:blur-[0px]   hover:cursor-pointer transition-all"
            onClick={() => {
              buyTank(2);
            }}
          >
            <div className="a-tank-img h-[200px] px-2">
              <img className="w-full h-full" src={tank2}></img>
            </div>
            <div className="a-tank-text px-5 pt-5 text-white flex justify-between">
              <span>Wolf</span> <span>0.1 sol</span>
            </div>
            <div className="bg-gray-800 rounded-b-[10px] py-2 mt-2 px-2">
              <div className="border-b border-green-500 w-3/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                HP
              </div>
              <div className="border-b border-green-500 w-4/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Speed
              </div>
              <div className="border-b border-green-500 w-3/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Power
              </div>
              <div className="border-b border-green-500 w-4/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Reloading
              </div>
            </div>
          </div>
          <div
            className="rounded-lg a-tank-board py-5 px-2   hover:border hover:border-gray-100  hover:border-[5px] hover:blur-[0px]   hover:cursor-pointer transition-all"
            onClick={(e) => {
              buyTank(3);
            }}
          >
            <div className="a-tank-img h-[200px] px-2">
              <img className="w-full h-full" src={tank3}></img>
            </div>
            <div className="a-tank-text px-5 pt-5 text-white flex justify-between">
              <span>Unique</span> <span>0.1 sol</span>
            </div>
            <div className="bg-gray-800 rounded-b-[10px] py-2 mt-2 px-2">
              <div className="border-b border-green-500  w-4/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                HP
              </div>
              <div className="border-b border-green-500  w-3/5  h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Speed
              </div>
              <div className="border-b border-green-500  w-4/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Power
              </div>
              <div className="border-b border-green-500  w-4/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Reloading
              </div>
            </div>
          </div>
          <div
            className="rounded-lg a-tank-board py-5 px-2   hover:border hover:border-gray-100  hover:border-[5px] hover:blur-[0px]  hover:cursor-pointer transition-all"
            onClick={(e) => {
              buyTank(4);
            }}
          >
            <div className="a-tank-img h-[200px] px-2">
              <img className="w-full h-full" src={tank5}></img>
            </div>
            <div className="a-tank-text px-5 pt-5 text-white flex justify-between">
              <span>Zxc</span> <span>0.1 sol</span>
            </div>
            <div className="bg-gray-800 rounded-b-[10px] py-2 mt-2 px-2">
              <div className="border-b border-green-500  w-3/5  h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                HP
              </div>
              <div className="border-b border-green-500  w-5/5  h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Speed
              </div>
              <div className="border-b border-green-500  w-4/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Power
              </div>
              <div className="border-b border-green-500 w-4/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Reloading
              </div>
            </div>
          </div>

          <div
            className="rounded-lg a-tank-board py-5 px-2   hover:border hover:border-gray-100  hover:border-[5px] hover:blur-[0px]  hover:cursor-pointer transition-all"
            onClick={(e) => {
              buyTank(5);
            }}
          >
            <div className="a-tank-img h-[200px] px-2">
              <img className="w-full h-full" src={tank4}></img>
            </div>
            <div className="a-tank-text px-5 pt-5 text-white flex justify-between">
              <span>Zxc</span> <span>0.1 sol</span>
            </div>
            <div className="bg-gray-800 rounded-b-[10px] py-2 mt-2 px-2">
              <div className="border-b border-green-500  w-4/5  h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                HP
              </div>
              <div className="border-b border-green-500  w-3/5  h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Speed
              </div>
              <div className="border-b border-green-500  w-5/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Power
              </div>
              <div className="border-b border-green-500 w-3/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Reloading
              </div>
            </div>
          </div>
          <div
            className="rounded-lg a-tank-board py-5 px-2   hover:border hover:border-gray-100  hover:border-[5px] hover:blur-[0px]  hover:cursor-pointer transition-all"
            onClick={(e) => {
              buyTank(6);
            }}
          >
            <div className="a-tank-img h-[200px] px-2">
              <img className="w-full h-full" src={tank6}></img>
            </div>
            <div className="a-tank-text px-5 pt-5 text-white flex justify-between">
              <span>Steed</span> <span>0.1 sol</span>
            </div>
            <div className="bg-gray-800 rounded-b-[10px] py-2 mt-2 px-2">
              <div className="border-b border-green-500  w-2/5  h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                HP
              </div>
              <div className="border-b border-green-500  w-5/5  h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Speed
              </div>
              <div className="border-b border-green-500  w-2/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Power
              </div>
              <div className="border-b border-green-500 w-5/5 h-[20px] border-b-[5px] pt-2 pb-6 text-white text-xs">
                Reloading
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="blur-[2px] absolute w-full xl:h-[1600px] lg:h-[1600px] md:h-[2000px]  sm:h-[2000px] h-[3200px] -z-10 top-[0px] bg-[url('./img/back.jpg')] bg-no-repeat bg-center bg-cover"></div>
    </div>
  );
};
const mapStateToProps = (state) => ({
  auth: state.auth,
});
export default connect(mapStateToProps, { removeTank })(Home);
