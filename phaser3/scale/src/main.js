let log = console.log

import Phaser from './lib/phaser.js'
import Game from './scenes/Game.js'

let config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: 1920,
        height: 1080,
    },
    banner: false,
    disableContextMenu: true,
    inputTouch: true,
    scene: Game
}
export default new Phaser.Game(config)
