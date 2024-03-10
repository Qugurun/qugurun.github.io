
// pixi 7.2.4
window.onload = function () {
    const config = {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x1099bb,
        antialias: true,
        resolution: 1,
        view: document.getElementById('gameCanvas'),
        virtualWidth: 1280,
        virtualHeight: 720
    }

    const app = new PIXI.Application(config)
    app.renderer.view.style.position = "absolute"

    document.body.appendChild(app.view)

    //-----------------------------------------------------------
    const sprite = PIXI.Sprite.from("assets/background.jpg")
    app.stage.addChild(sprite);
    //-----------------------------------------------------------

    function eventResize() {
        let bw = window.innerWidth
        let bh = window.innerHeight

        let new_width = bw
        let new_height = bh

        let scene_width = config.virtualWidth
        let scene_height = config.virtualHeight

        if (bw > bh) {
            new_width = scene_height * bw / bh
            new_height = scene_height
        } else {
            new_width = scene_width
            new_height = scene_width * bh / bw
        }

        if (new_width < scene_width) {
            new_width = scene_width
            new_height = scene_width * bh / bw
        }

        if (new_height < scene_height) {
            new_width = scene_height * bw / bh
            new_height = scene_height
        }

        //актуальные размеры рабочей области находятся в new_width и new_height
        app.renderer.view.style.width = window.innerWidth + 'px'
        app.renderer.view.style.height = window.innerHeight + 'px'
        app.renderer.resize(new_width, new_height)

        // позиционируем stage по середине окна
        app.stage.x = new_width/2 - config.virtualWidth/2
        app.stage.y = new_height/2 - config.virtualHeight/2

        console.log("Canvas ", window.innerWidth, " - ", window.innerHeight)
        console.log("Virtual ", new_width, " - ", new_height)
    }
    window.addEventListener("resize", eventResize.bind(app), false)
    eventResize()
}


