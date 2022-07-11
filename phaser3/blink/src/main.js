import Phaser from './lib/phaser.js'

import Game from './scenes/Game.js'

export default new Phaser.Game({
    type: Phaser.WEBGL,
    width: 1260,
    height: 1580,
    scene: Game,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render:{
        pixelArt: true
    }
})