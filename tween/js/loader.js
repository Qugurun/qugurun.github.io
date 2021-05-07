// this.background = this.add.image(config.width/2, config.height/2, "background.jpg");

// this.scene.launch("loader");


class loader extends Phaser.Scene {
	constructor() 
	{
		super("loaderScene");
	}

	preload()
	{
		window.addEventListener('resize', resize);
		resize();


		//----------------------------------------------------------------------------------
		//прогресс бар
		var bootScene =  this.scene.get("bootScene");

		this.load.on('progress', function (value) {
			bootScene.boot.x = config.width/2-150 + 300 * value;
		});
		 
		this.load.on('complete', function () {
			console.log("Complete");
		});

		//----------------------------------------------------------------------------------
		this.load.setPath("assets/images/");

		for (var i = 0; i < 10; i++) {
			this.load.image("background"+i, "background_boot.jpg");
		}
		
	}

	// update(){
	// 	console.log(this.progressValue);
	// 	this.progress.displayWidth = this.progressValue;
	// }

	create(){
		// progress.destroy();
		var bootScene =  this.scene.get("bootScene");

		var tween = this.tweens.add({
	        targets: bootScene.logo_boot,
	        scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
	        ease: 'Back.easeInOut', 
	        yoyo: true,
	        repeat: -1
	    });

	    var tween2 = this.tweens.add({
	        targets: bootScene.logo_text,
            y: bootScene.logo_text.y-10,
            duration: 1000,
	        ease: 'Power0', 
	        yoyo: true,
	        repeat: -1
	    });

		console.log("Create Loader");
	}
}