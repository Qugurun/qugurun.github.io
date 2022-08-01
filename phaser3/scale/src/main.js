import Phaser from './lib/phaser.js'
import Game from './scenes/Game.js'

let config = {
    type: Phaser.WEBGL,
    scene: Game,
    scale: {
        mode: Phaser.Scale.RESIZE,
    },
    // banner: false
    // disableContextMenu: true,
    // inputTouch: true,
   
}
export default new Phaser.Game(config)
