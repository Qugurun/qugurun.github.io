class scene1 extends Phaser.Scene {
	constructor() {
		super("loader");
	}

	preload(){
		//фон
		this.load.image("background", "assets/images/background.jpg");

		//звёзды
		this.load.image("star_1", "assets/images/star_1.png");
		this.load.image("star_2", "assets/images/star_2.png");

		//камни
		for (var i = 1; i < 7; i++) {
			this.load.image("rock_"+i, "assets/images/rock_"+i+".png");
		}

		//топливо
		this.load.image("fuel", "assets/images/fuel.png");


		//турбина
		this.load.spritesheet("turbine", "assets/images/turbine.png",{
			frameWidth:74,
			frameHeight:105
		});

		//игрок
		this.load.image("player", "assets/images/player.png");
		
	}

	create(){
		this.add.text(20,20, "Loading game...");

		this.anims.create({
			key: "turbine_anim",
			frames: this.anims.generateFrameNumbers("turbine"),
			frameRate: 20,
			repeat: -1
		});
		
		this.scene.start("menu");
	}



}
