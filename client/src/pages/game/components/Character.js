import Phaser from "phaser";
class Character{

    constructor(scene)
    {       
        
        
        this.scene = scene;
        this.body = this.scene.add.image(0,0,"background1").setScale(0.1,0.1);
        console.log("asdf",scene);
    }

}

export default Character;
