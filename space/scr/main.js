
var config = {
    // width: 607,
    // height: 500,
    width: window.innerWidth,
    height: window.innerHeight,
    bacgroundColor: 0x000000,
    banner: false,
    scene: [scene1, scene2],
    physics:{
        default: "arcade",
        arcade: {
            debug: false
        }
    }
}

var game = new Phaser.Game( config );
console.clear();
