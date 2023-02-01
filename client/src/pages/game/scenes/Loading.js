import {Scene} from "phaser";
// import logo from '../assets/load/8.png';
class Loading extends Scene {
    constructor(props){
        super(props);                
    }
    preload(){
        
    }
    create(){
        
    }
    update(){
        this.scene.start('battle');
    }
    
}
export default Loading;