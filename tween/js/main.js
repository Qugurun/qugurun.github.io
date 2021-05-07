function resize() {
    var canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
    var wratio = width / height, ratio = canvas.width / canvas.height;

    if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
    } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
    }
}

var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    bacgroundColor: 0x000000,
    banner: false,
    scene: {
        preload: preload,
        create: create
    }
}

var easeText = [
"Power0",
"Power1",
"Power2",
"Power3",
"Power4",
"Linear",
"Quad",
"Cubic",
"Quart",
"Quint",
"Sine",
"Expo",
"Circ",
"Elastic",
"Back",
"Bounce",
"Stepped",
"Quad.easeIn",
"Cubic.easeIn",
"Quart.easeIn",
"Quint.easeIn",
"Sine.easeIn",
"Expo.easeIn",
"Circ.easeIn",
"Back.easeIn",
"Bounce.easeIn",
"Quad.easeOut",
"Cubic.easeOut",
"Quart.easeOut",
"Quint.easeOut",
"Sine.easeOut",
"Expo.easeOut",
"Circ.easeOut",
"Back.easeOut",
"Bounce.easeOut",
"Quad.easeInOut",
"Cubic.easeInOut",
"Quart.easeInOut",
"Quint.easeInOut",
"Sine.easeInOut",
"Expo.easeInOut",
"Circ.easeInOut",
"Back.easeInOut",
"Bounce.easeInOut"]

var ease = [];
for (var i = 0; i < easeText.length; i++) {
    ease[i] = Phaser.Tweens.Builders.GetEaseFunction(easeText[i]);
}

var game = new Phaser.Game( config );

function preload() {
  window.addEventListener('resize', resize);
  resize();

   this.load.setPath("assets/images/");
   for (var i = 0; i < 45; i++) {
       this.load.image("player"+i, "player.png");
   }
}

function create() {
    this.playerArray = this.add.group();

    for (var i = 0; i < ease.length; i++) {
       var player = this.add.image(0,0, "player"+i).setScale(0.4);
       this.playerArray.add(player);
    }   

    var pos = 0;
    for (var i = 0; i < 10; i++) {
       
       this.playerArray.getChildren()[i].x = pos*config.width/11+config.width/11;
       this.playerArray.getChildren()[i].y = 60;
       this.playerArray.add(player);
       pos += 1;
    }

    var pos = 0;
    for (var i = 10; i < 20; i++) {
       this.playerArray.getChildren()[i].x = pos*config.width/11+config.width/11;
       this.playerArray.getChildren()[i].y = 200;
       pos += 1;
    }

    var pos = 0;
    for (var i = 20; i < 30; i++) {
       this.playerArray.getChildren()[i].x = pos*config.width/11+config.width/11;
       this.playerArray.getChildren()[i].y = 340;
       pos += 1;
    }

    var pos = 0;
    for (var i = 30; i < 40; i++) {
       this.playerArray.getChildren()[i].x = pos*config.width/11+config.width/11;
       this.playerArray.getChildren()[i].y = 480;
       pos += 1;
    }

    var pos = 0;
    for (var i = 40; i < 44; i++) {
       this.playerArray.getChildren()[i].x = pos*config.width/11+config.width/11;
       this.playerArray.getChildren()[i].y = 620;
       pos += 1;
    }

    for (var i = 0; i < this.playerArray.getChildren().length; i++) {
        var player = this.playerArray.getChildren()[i];
        var title = this.add.text(player.x, player.y+60, easeText[i], {font: "12px Arial", fill: "yellow"}).setOrigin(0.5);
        
        var tween = this.tweens.add({
            targets: player,
            scaleX: 0.55,
            scaleY: 0.55,
            duration: 2000,
            ease: ease[i], 
            yoyo: true,
            repeat: -1
        });
    }
}
