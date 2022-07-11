import Phaser from '../lib/phaser.js'

export default class Game extends Phaser.Scene
{

    l1 = true
    l2 = false

    constructor()
    {
        super('game')
    }

    preload()
    {
        this.load.image({
            key: 'diamond', 
            url: 'assets/pic1/pic1.png',
            normalMap: 'assets/pic1/normal1.png'
        });

        this.load.image('blink', 'assets/pic1/blink.png')
    
    }

    create()
    {
        let picture = this.add.sprite(0, 0, 'diamond').setOrigin(0).setPipeline('Light2D')
        let width_temp = picture.width
        let height_temp = picture.height

        picture.displayHeight = 1260 * height_temp / width_temp
        picture.displayWidth = 1260

        this.light  = this.lights.addLight(0, 0, 1500, 0xffffff, 1.0);
  
        this.light.x = -300

        this.lights.enable().setAmbientColor(0xdddddd);

        this.light2  = this.lights.addLight(0, 0, 1500, 0xffffff, 1.0);
        this.light2.x = 1260+300
        this.light2.y = 1580

        this.arr_blink = []
        this.arr_duration= [500,1000,1250,800,900,1600]
        for (let i = 0; i < 5; i++) {

            this.arr_blink.push(this.add.sprite(0, 0, 'blink'))

            this.tweens.add({
                targets: this.arr_blink[i],
                alpha: 0,
                scale: 0,
                ease: 'Cubic.easeOut',  
                duration: this.arr_duration[i],
                repeat: -1,
                yoyo: true,
            })  
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    update(t, dt)
    {   
        // ------------------------------------------------------------
        if (this.l1 === true){
            this.light.y = this.light.y + 1*dt
            this.light2.y = this.light2.y - 1*dt
            if (this.light.y > 1580){
                this.l1 = false

                for (let i = 0; i < this.arr_blink.length; i++) {
                    this.arr_blink[i].x = this.getRandomInt(1260)
                    this.arr_blink[i].y = this.getRandomInt(1580) 
                }
                
            }
        }else{
            this.light.y = this.light.y - 1*dt
            this.light2.y = this.light2.y + 1*dt
            if (this.light.y < 0){
                this.l1 = true

                for (let i = 0; i < this.arr_blink.length; i++) {
                    this.arr_blink[i].x = this.getRandomInt(1260)
                    this.arr_blink[i].y = this.getRandomInt(1580) 
                }
            }
        }

    }
}