// =======================================================
class SC_MAIN extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        
        this.load.image('sQugurun', 'assets/qugurun.png')
        this.load.image('background', 'assets/background.jpg')
    }

    create ()
    {   
        // -----------------------------------------------
        let background = this.add.image(0, 0, 'background')
        background.onResize = function () {
            if (app.width * this.height/this.width < app.height){
                this.displayWidth = app.height * this.width/this.height
                this.displayHeight = app.height
            }else{
                this.displayWidth = app.width
                this.displayHeight = app.width * this.height/this.width
            }
            this.setPosition(app.width/2, app.height/2)
        }

        // -----------------------------------------------
        let sQugurun_left_top = this.add.image(0, 0, 'sQugurun').setOrigin(0, 0).setScale(0.7);

        // -----------------------------------------------
        let sQugurun_left_bottom = this.add.image(0, app.height, 'sQugurun').setOrigin(0, 1).setScale(0.7);
        sQugurun_left_bottom.onResize = function(){
            this.y = app.height
         }

        // -----------------------------------------------
        let sQugurun_right_top = this.add.image( app.width, 0, 'sQugurun').setOrigin(1, 0).setScale(0.7);
        sQugurun_right_top.onResize = function(){
           this.x = app.width
        }

        // -----------------------------------------------
        let sQugurun_right_bottom = this.add.image( app.width, app.height, 'sQugurun').setOrigin(1, 1).setScale(0.7);
        sQugurun_right_bottom.onResize = function(){
           this.x = app.width
           this.y = app.height
        }
        // -----------------------------------------------
        GAME.onResize()
    }
}

// =======================================================
var app = {
    width: 0,
    height: 0
}

let config = {
    width: window.innerWidth,       // Стартовая ширина канваса  
    height: window.innerHeight,     // Стартовая высота канваса
    virtualWidth: 1136,             // Ширина проекта
    virtualHeight: 640,             // Высота проекта   
    orientation: "landscape",       // Ориентация проекта: landscape или portrait
    backgroundColor: 0xff0000,      // Чистый цвет
    banner: false,                  // Cкрыть банер из консоли
    type: Phaser.AUTO,              // Режим рендера
    antialias: true,                // Сглаживание
    disableContextMenu: true,       // Отключить меню по правому клику
    autoMobilePipeline: true,       // Оптимизация для мобильных устрйств
    autoRound: true,                // Размеры холста в целых числах
    scene: SC_MAIN                  // Сцена
}

let GAME = new Phaser.Game(config);

GAME.onResize = function (){
    let size;

    this.scale.resize(window.innerWidth, window.innerHeight);
	this.scale.refresh();
   
    if (config.orientation == "landscape") {
        size = config.virtualWidth

    }else if (config.orientation == "portrait"){
        size = config.virtualHeight
    }

	if (window.innerWidth > window.innerHeight){
        this.renderer.projectionWidth = size * window.innerWidth/window.innerHeight;
		this.renderer.projectionHeight = size;
    }else{
        this.renderer.projectionWidth = size;
		this.renderer.projectionHeight = size * window.innerHeight/window.innerWidth;
    }
    
    // Актуальные внутренние размеры игры
    app.width = this.renderer.projectionWidth
	app.height = this.renderer.projectionHeight
    
    // Проходимся по всем объектам сцены
    this.scene.scenes.forEach(function(scene) {
        scene.children.list.forEach(function(child) {
            if (typeof child.onResize === 'function') {
                child.onResize();
            }
        });
    });
}
window.addEventListener("resize", GAME.onResize.bind(GAME), false)
