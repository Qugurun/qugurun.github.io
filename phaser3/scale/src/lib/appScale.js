let app = {
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    defaultWidth: 1920,
    defaultHeight: 1080,
}

app.update = function () {
    // -- [experiment] --
    // this.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    // this.aspect = window.innerWidth > window.innerHeight ? window.innerWidth / window.innerHeight : window.innerHeight / window.innerWidth

    // app.isMobile = navigator.userAgent.indexOf("Mobile");
    // if (app.isMobile == -1) {
    //     app.isMobile = navigator.userAgent.indexOf("Tablet");
    // }
    // app.isMobile = app.isMobile == -1 ? false : true
    
    // let zoomX = window.innerWidth >= 520 ? (window.innerWidth / (app.defaultWidth / 100)) / 100 : (520 / (app.defaultWidth / 100)) / 100
    // let zoomY = window.innerHeight >= 400 ? (window.innerHeight / (app.defaultHeight / 100)) / 100 : (400 / (app.defaultHeight / 100)) / 100
    // this.zoom = this.orientation === 'landscape' ? zoomX: zoomY

    this.zoom = window.innerHeight >= 400 ? (window.innerHeight / (app.defaultHeight*2 / 100)) / 100 : (400 / (app.defaultHeight*2 / 100)) / 100

    this.width = window.innerWidth / this.zoom
    this.height = window.innerHeight / this.zoom

    this.left = this.centerX - this.width / 2
    this.top = this.centerY - this.height / 2
    this.right = this.centerX + this.width / 2
    this.bottom = this.centerY + this.height / 2
}
app.update()

export {
    app
}
