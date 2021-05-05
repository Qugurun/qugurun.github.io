function print( text ) {
	console.log(text);
}

function resize() {
    var canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
    var wratio = width / height, ratio = canvas.width / canvas.height;
    
    // canvas.style.width = width + "px";
    // canvas.style.height = height + "px";
    if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
    } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
    }
}

class scene2 extends Phaser.Scene {
	constructor() {
		super("menu");
	}

	create(){
		window.addEventListener('resize', resize);
    	resize();

		//------------------------------------------------------------------------------------------
		//фон
		this.background = this.add.image(0,0, "background");
		this.background.setPosition(config.width/2, config.height/2);
		this.background.displayWidth=config.width;
		this.background.displayHeight=config.height;

		//------------------------------------------------------------------------------------------
		//звёзды
		this.starGroup = this.add.group();

		var maxStarNormal = 10;
		var maxStarBlur = 5;

		for (var i = 0; i < maxStarNormal; i++) {

			this.addStar(this.add.image(0,0, "star_1"), this.starGroup);

		}

		for (var i = 0; i < maxStarBlur; i++) {
			this.addStar(this.add.image(0,0, "star_2"), this.starGroup)
		}	

		//------------------------------------------------------------------------------------------
		//камни
		this.rockGroup = this.add.group();
		for (var i = 1; i < 7; i++) {
			var rock = this.add.image(0,0, "rock_"+i);
			rock.speed = Phaser.Math.Between(4, 6);

			rock.angleSpeed = rock.speed
			if (Math.random() > 0.5){
				rock.angleSpeed *= -1;
			}
			

			var randomX = Phaser.Math.Between(0, config.width);
			var randomY = Phaser.Math.Between(0, config.height);
			rock.x = randomX;
			rock.y = randomY;
			this.rockGroup.add(rock)
		}
		//------------------------------------------------------------------------------------------
		//топливо
		this.fuel = this.physics.add.image(config.width/2, config.height/2, "fuel");

		//------------------------------------------------------------------------------------------
		//турбина
		this.turbine = this.add.sprite(0,0,"turbine");
		this.turbine.setScale(0.65);
		this.turbine.play("turbine_anim");

		// var particles = this.add.particles('star_2');
  //       var emitter = particles.createEmitter({
  //           speed: 10,
  //           scale: { start: 1, end: 0 },
  //           blendMode: 'ADD'
  //       });
		
		//------------------------------------------------------------------------------------------
		//игрок
		this.player = this.physics.add.image(config.width/2, config.height-150, "player");
		this.player.move = false;
		this.player.setScale(0.65);
		// this.player.setCollideWorldBounds(true);

		this.turbine.setPosition(this.player.x-3, this.player.y+this.player.displayHeight-15);

		//------------------------------------------------------------------------------------------
		this.pointer = this.input.activePointer;

		//------------------------------------------------------------------------------------------

		//------------------------------------------------------------------------------------------
		
		// this.layer_1 = this.add.tileSprite(0,0, config.width, config.height, "layer_1");
		// this.layer_2 = this.add.tileSprite(0,0, config.width, config.height, "layer_2");
		// this.layer_1.setOrigin(0,0);
		// this.layer_2.setOrigin(0,0);
	}

	//==========================================================================================
	getDistance(object_1,object_2){
		return Math.sqrt((object_1.x - object_2.x)^2 + (object_1.y - object_2.y)^2);
	}	

	//==========================================================================================
	 // update(time, delta){
	update(){
		// // this.layer_1.tilePositionY -= 1.5;
		// // this.layer_2.tilePositionY -= 2.5;

		//перемещение коробля
		if (this.pointer.isDown) {
			if (this.pointer.x > this.player.displayWidth/2 && this.pointer.x < config.width-this.player.displayWidth/2){
				this.player.x = this.pointer.x;
		    		
			}

			if (this.pointer.y > 100  && this.pointer.y < config.height){
				this.player.y = this.pointer.y-120;
			}
				
			this.turbine.setPosition(this.player.x-3, this.player.y+this.player.displayHeight-15);
		}
		

		// // if (this.player.move = true){
		// 	if (this.getDistance(this.player, this.pointer) < 5){
		// 		this.player.move = false;
		// 		this.player.setVelocity(0);
		// 	}
		// // }
		

		//перемещение коробля
		// if (this.pointer.isDown){
			// if (this.getDistance(this.player, this.pointer, 3) == false){
			// 	this.physics.moveToObject(this.player, this.pointer, 500);
			// }else{
				// this.player.setVelocity(0);
				// this.player.x = this.pointer.x
		  //   	this.player.y = this.pointer.y-120;	
			// }
		// }
		// this.turbine.setPosition(this.player.x-3, this.player.y+this.player.displayHeight-15);


		// if (this.touch == true){
		// 	print(this.touch)
		// 	this.physics.moveToObject(this.player, this.pointer, 500)
		// }

		//перемещение звёзд
		for (var i = 0; i < this.starGroup.getChildren().length; i++){
			var star = this.starGroup.getChildren()[i];
			this.moveStar(star, star.speed); 
		}

		//перемещение камней
		for (var i = 0; i < this.rockGroup.getChildren().length; i++){
			var rock = this.rockGroup.getChildren()[i];
			this.moveRock(rock, rock.speed, rock.angleSpeed); 
		}

		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.refresh();
	}

	//==========================================================================================
	addStar(object, group){
		group.add(object);
		object.setScale(Phaser.Math.Between(1, 10)/10);
		object.speed = Phaser.Math.Between(50, 100)/10;

		var randomX = Phaser.Math.Between(0, config.width);
		var randomY = Phaser.Math.Between(0, config.height);
		object.x = randomX;
		object.y = randomY;
	}

	//==========================================================================================
	moveStar(object, speed){
		object.y += speed;
		if (object.y-object.displayHeight > config.height){
			this.resetStarPosition(object);
		}
	}

	//==========================================================================================
	moveRock(object, speed, angle){
		object.y += speed;
		object.angle += angle;
		if (object.y-object.displayHeight > config.height){
			this.resetRockPosition(object);
		}
	}
	//==========================================================================================
	resetStarPosition( object ){
		var randomX = Phaser.Math.Between(0, config.width);
		object.x = randomX;
		object.y = -object.displayHeight;

	}
	//==========================================================================================
	resetRockPosition( object ){
		var randomX = Phaser.Math.Between(0, config.width);

		object.speed = Phaser.Math.Between(4, 6);
		object.angleSpeed = object.speed
		if (Math.random() > 0.5){
			object.angleSpeed *= -1;
		}

		object.x = randomX;
		object.y = -object.displayHeight;

	}

	//==========================================================================================

}	