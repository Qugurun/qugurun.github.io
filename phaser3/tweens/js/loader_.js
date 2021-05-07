var group;
var groupCount = 0;

class loader extends Phaser.Scene {
	constructor() 
	{
		super("loader");
	}

	preload()
	{
		window.addEventListener('resize', resize);
		resize();

		//----------------------------------------------------------------------------
		//прогресс бар
		var width = this.cameras.main.width;
		var height = this.cameras.main.height;

		//-----------------------------
		var progressBar = this.add.graphics();
		var progressBox = this.add.graphics();
		var progressLogo = this.add.graphics();

		//-----------------------------
		progressBox.fillStyle(0x222222, 0.8);
		progressBox.fillRect(width/2-160, height/2, 320, 50);

		//-----------------------------
		var loadingText = this.make.text({
		    x: width / 2,
		    y: height / 2 - 20,
		    text: 'Загрузка...',
		    style: {
		        font: '18px monospace',
		        fill: '#ffffff'
		    }
		});
		loadingText.setOrigin(0.5, 0.5);

		//-----------------------------
		var percentText = this.make.text({
		    x: width / 2,
		    y: height / 2 +25,
		    text: '0%',
		    style: {
		        font: '18px monospace',
		        fill: '#ffffff'
		    }
		});
		percentText.setOrigin(0.5, 0.5);
		
		//----------------------------------------------------------------------------
		this.load.on('progress', function (value) {
	    	// console.log(value);
	    	progressBar.clear();
		    progressBar.fillStyle(0xffffff, 1);
		    progressBar.fillRect(width/2-150, height/2+10, 300 * value, 30);
		    percentText.setText(parseInt(value * 100) + '%');
		});
		 
		this.load.on('fileprogress', function (file) {
		    // console.log(file.src);
		});
		 
		this.load.on('complete', function () {
			//console.log('Завершено');
			progressBar.destroy();
			progressBox.destroy();
			loadingText.destroy();
			percentText.destroy();
		});

		//-----------------------------
		//установка пути по умолчанию
		this.load.setPath("assets/images/");

		this.load.image("background", "background.jpg");
		this.load.image("cloud", "cloud.png");
	}


	create(){

		this.background = this.add.image(app.width/2, app.height/2, "background").setDisplaySize(app.width, app.height);
		this.cloud = this.add.image(app.width, app.height, "cloud").setOrigin(1, 1).setPosition(app.width, app.height);


	}
	
}