import Phaser from './lib/phaser.js'

import Game from './scenes/Game.js'

export default new Phaser.Game({
    // type: Phaser.AUTO,
    type: Phaser.WEBGL,
    // width: 525,
    // height: 790,
    width: 1260,
    height: 1580,
    scene: Game,
    // physics: {
    //     default: 'arcade',
    //     arcade: {
    //         gravity: { x: 0, y: 200 },
    //         debug: true
    //         }
    //     },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render:{
        pixelArt: true
    }
})