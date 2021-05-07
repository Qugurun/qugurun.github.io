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

class boot extends Phaser.Scene {
	constructor() 
	{
		super("bootScene");
	}

	preload()
	{
		window.addEventListener('resize', resize);
		resize();

		//----------------------------------------------------------------------------------
		this.load.setPath("assets/images/");
		this.load.image("background_boot", "background_boot.jpg");
		this.load.image("logo_boot", "logo_boot.png");
		this.load.image("logo_text", "logo_text.png");

		this.load.image("boot", "boot.png");
		this.load.image("boot_bg", "boot_bg.png");
		this.load.image('boot_mask', 'boot_mask.png');
		this.load.image('boot_frame', 'boot_frame.png');
	}

	create(){
		this.background_boot = this.add.image(config.width/2, config.height/2, "background_boot").setDisplaySize(config.width,config.height);
		this.logo_boot = this.add.image(config.width/2, config.height/2-100, "logo_boot");
		this.logo_text = this.add.image(config.width/2, config.height/2+20, "logo_text");

		this.mask = this.make.image({
            x: game.config.width / 2,
            y: game.config.height / 2+100,
            key: 'boot_mask',
            add: false
        });

		this.boot_bg = this.add.image(config.width/2, config.height/2+100, "boot_bg");
		this.boot = this.add.image(config.width/2-150, config.height/2+100, "boot").setOrigin(1,0.5);
		this.boot.mask = new Phaser.Display.Masks.BitmapMask(this, this.mask);
		// this.boot_sframe = this.add.image(config.width/2, config.height/2+100,"boot_frame");

	

		// this.tweens.add({
  //           targets: this.logo,
  //           duration: 2000,
  //           delay: 2000,
  //           scaleX: 2,
  //           scaleY: 2,
  //           ease: 'Sine.easeInOut',
  //           repeat: -1,
  //           yoyo: true
  //       });

		this.scene.run("loaderScene");
	}
}