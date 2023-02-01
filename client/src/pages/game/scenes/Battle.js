import {Scene} from "phaser";
import back1 from '../assets/background/game_background_1.png';

import Character from "../components/Character";
class Battle extends Scene {
    constructor(props){
        super(props);        

        // initial image config;
        this.backgroundImage = null;
        
        
        
    }
    preload(){
        this.load.image("background1", back1);        
    }
    create(){
        this.backgroundImage = this.add.image(0,0,"background1").setOrigin(0,0).setScale(0.5,0.5);
        this.player = new Character(this);
    }
    update(){
        
    }
    
}
export default Battle;