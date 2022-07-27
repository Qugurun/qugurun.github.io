let log = console.log

let app = {
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2
}

app.update = function () {
    this.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    this.aspect = window.innerWidth > window.innerHeight ? window.innerWidth / window.innerHeight : window.innerHeight / window.innerWidth

    let isMobile = navigator.userAgent.indexOf("Mobile");
    if (isMobile == -1) {
        isMobile = navigator.userAgent.indexOf("Tablet");
    }
    isMobile = isMobile == -1 ? false : true

    if (isMobile === true) {
        this.factor = window.innerWidth > window.innerHeight ? 1.3 : 1.1
    } else {
        this.factor = window.innerWidth > window.innerHeight ? 1.5 : 1.4
    }
    
    
    if (this.aspect > 2.3) {
        this.offset = window.innerWidth > window.innerHeight ? window.innerWidth / (this.factor-0.2) : -window.innerHeight / (this.factor-0.4) 
    } else {
        this.offset = window.innerWidth > window.innerHeight ? window.innerWidth / this.factor : -window.innerHeight / this.factor
    }

    let zoomY = window.innerHeight / (window.innerWidth - this.offset)
    let zoomX = (window.innerWidth - this.offset) / window.innerHeight
    this.zoom = window.innerWidth > window.innerHeight ? zoomX : zoomY

    let widthX = window.innerWidth * zoomX
    let widthY = window.innerWidth * zoomY
    this.width = window.innerWidth > window.innerHeight ? widthY : widthX

    let heightX = window.innerHeight * zoomX
    let heightY = window.innerHeight * zoomY
    this.height = window.innerWidth > window.innerHeight ? heightY : heightX

    this.left = this.centerX - this.width / 2
    this.top = this.centerY - this.height / 2
    this.right = this.centerX + this.width / 2
    this.bottom = this.centerY + this.height / 2
}
app.update()

export {
    app
}
