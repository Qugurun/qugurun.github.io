let log = console.log

import Phaser from '../lib/phaser.js'
import { app } from '../lib/appScale.js'


export default class Game extends Phaser.Scene {
    constructor() {
        super('game')
    }

    preload() {

        this.load.image('bg', 'assets/background.jpg')
        this.load.image('logo', 'assets/logo.png')
        this.load.image('logoPhaser', 'assets/phaser3-logo.png')

        this.cameraUpdate()
    }

    create() {
        this.imageList = []
        let scaleLogo = 0.5

        let bg = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'bg')
        bg.update = function () {
            this.displayWidth = app.width
            this.displayHeight = app.height
        }

        // logoCenter -------------------------------------------------------------
        let logoCenter = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'logo').setScale(scaleLogo)

        // logoPhaser -------------------------------------------------------------
        let logoPhaser = this.add.image(window.innerWidth / 2, window.innerHeight / 2 + window.innerHeight / 4, 'logoPhaser').setScale(scaleLogo).setInteractive()
        logoPhaser.on('pointerup', function () {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                this.cameraUpdate()
            }
            else {
                this.scale.startFullscreen();
                this.cameraUpdate()
            }
        }, this);

        logoPhaser.update = function () {
            this.setPosition(app.centerX, app.centerY + app.height / 4)
        }
        // logoLeftTop -------------------------------------------------------------
        let logoLeftTop = this.add.image(0, 0, 'logo').setScale(scaleLogo).setOrigin(0, 0)
        logoLeftTop.update = function () {
            this.setPosition(app.left, app.top)
        }

        // logoRightTop -------------------------------------------------------------
        let logoRightTop = this.add.image(0, 0, 'logo').setScale(scaleLogo).setOrigin(1, 0)
        logoRightTop.update = function () {
            this.setPosition(app.right, app.top)
        }

        // logoLeftBottom -------------------------------------------------------------
        let logoLeftBottom = this.add.image(0, 0, 'logo').setScale(scaleLogo).setOrigin(0, 1)
        logoLeftBottom.update = function () {
            this.setPosition(app.left, app.bottom)
        }

        // logoRightBottom -------------------------------------------------------------
        let logoRightBottom = this.add.image(0, 0, 'logo').setScale(scaleLogo).setOrigin(1, 1)
        logoRightBottom.update = function () {
            this.setPosition(app.right, app.bottom)
        }

        this.imageList.push(bg, logoPhaser, logoLeftTop, logoRightTop, logoLeftBottom, logoRightBottom)

        // all sprite update
        for (let index = 0; index < this.imageList.length; index++) {
            this.imageList[index].update()
        }

        this.scale.on('resize', this.resize, this)

    }

    cameraUpdate() {
        app.update()
        const camera = this.cameras.main
        camera.setZoom(app.zoom)
        camera.centerOn(app.centerX, app.centerY)
    }

    resize() {
        this.cameraUpdate()

        // all sprite update
        for (let index = 0; index < this.imageList.length; index++) {
            this.imageList[index].update()
        }
    }

}
