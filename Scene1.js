class Scene1 extends Phaser.Scene {
  constructor() {
    super("Level1");
    this.level = 0;
    this.gold = 0;
    this.health = 100;
    this.hasMusicPlayed = false;
    this.isPaused = false;
  }
preload ()
{
  this.load.spritesheet('minotaur', 'assets/Minotaur.png',{
    frameWidth: 96,
  frameHeight: 96});
  this.load.image('tiles', 'assets/Dungeon_Tileset32bit.png');
  this.load.spritesheet('priest', 'assets/priest_1_spritesheet.png', {
    frameWidth: 16,
    frameHeight:16});
    this.load.spritesheet('fireball', 'assets/fireball.png', {
      frameWidth: 32,
      frameHeight:17});
  this.load.audio("Chest_pickup", "assets/audio/Coinpickup.mp3");
  this.load.audio("Potion_drink", "assets/audio/Potion.mp3");
  this.load.audio("Music", "assets/audio/DungeonCrawlerBaller.mp3");
  this.load.audio("fireball_woosh", "assets/audio/Fireball_woosh.mp3");
}

create ()
{
  //audio set up
  this.chestPickup = this.sound.add("Chest_pickup");
  this.potionDrink = this.sound.add("Potion_drink");
  if(this.hasMusicPlayed == false){
  this.music = this.sound.add("Music");
  this.music.play({volume: 0.5, loop:true})
  this.hasMusicPlayed = true
}
  this.fireballWoosh = this.sound.add("fireball_woosh");
  //variables+ group set up
  this.hasPlayerReachedLadder = false
  this.enemies = this.physics.add.group();
  this.fireballs = this.physics.add.group();
  this.level++;
  //Dungeon Generation
  this.dungeon = new Dungeon({
    // The dungeon's grid size
    width: 50,
    height: 50,
    doorPadding: 2,
    rooms: {
      // Random range for the width of a room (grid units)
      width: {min: 7, max: 15, onlyOdd: true},
      // Random range for the height of a room (grid units)
      height: {min: 7, max: 15, onlyOdd: true},
      // Cap the area of a room - e.g. this will prevent large rooms like 10 x 20
      // Max rooms to place
      maxRooms: 10
    }
  });
  this.map = this.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: this.dungeon.width,
      height: this.dungeon.height
  });
  const tileset = this.map.addTilesetImage("tiles", null, 32, 32,);
  this.groundLayer = this.map.createBlankDynamicLayer("Ground", tileset);
  this.itemsLayer = this.map.createBlankDynamicLayer("Items ", tileset);
  this.groundLayer.fill(18);
// visibility shadow
  const shadowLayer = this.map.createBlankDynamicLayer("Shadow", tileset).fill(78);
  this.tilemapVisibility = new TilemapVisibility(shadowLayer);
  // looping through each room in the generated dungeon
  this.dungeon.rooms.forEach(room => {
    //Randomized the floor
    const{x, y, width, height, left, right, top, bottom} = room;
    this.groundLayer.weightedRandomize(x+1, y+1, width - 2, height - 2,[
      {index: 6, weight: 9},
      {index: [7, 8, 61], weight: 1}
    ]);

// Corners
    this.groundLayer.putTileAt(0, left, top); //Top left
    this.groundLayer.putTileAt(5, right, top); // Top Right
    this.groundLayer.putTileAt(40, left, bottom); // Bottom Left
    this.groundLayer.putTileAt(45, right, bottom ); //Bottom right
// Walls
    this.groundLayer.fill(51, left + 1, top, width - 2, 1); //Top
    this.groundLayer.fill(10, left, top + 1, 1, height - 2); //Left
    this.groundLayer.fill(15, right, top + 1, 1, height - 2); // Right
    this.groundLayer.fill(41, left + 1, bottom, width - 2, 1); //Bottom

    var doors = room.getDoorLocations();
    for (var i = 0; i < doors.length; i++){
      if (doors[i].y === 0 || doors[i].y === room.height- 1){
        this.groundLayer.putTileAt(79, x + doors[i].x - 1, y+doors[i].y);
      } else if (doors[i].x === 0 || doors[i].x === room.width - 1 ){
        this.groundLayer.putTileAt(79, x+doors[i].x, y+doors[i].y - 1);
      }

      }
  });
  const rooms = this.dungeon.rooms.slice();
  const startRoom = rooms.shift();
  this.endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
  const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);
  // Place Ladder at end Room
  this.itemsLayer.putTileAt(39, this.endRoom.centerX, this.endRoom.centerY);

  otherRooms.forEach(room =>{
    const{x, y, width, height, left, right, top, bottom} = room;
  var rand = Math.random();
  if (rand <= 0.25){
    this.itemsLayer.weightedRandomize(room.centerX, room.centerY, 1, 1,[
      {index: [80,89], weight: 5}
    ]);
  }
  if(rand <= 0.5){
    this.itemsLayer.weightedRandomize(Phaser.Math.Between((x+1), (width-1)),Phaser.Math.Between((y+1), (height-1)), 1, 1,[
      {index: [68, 75, 49, 59, 65 ], weight: 2 }
    ]);
    this.enemies.create(this.itemsLayer.tileToWorldX(room.centerX-1), this.itemsLayer.tileToWorldY(room.centerY-1), 'priest');


}

});
  this.groundLayer.setCollisionByExclusion([18, 6, 7, 8, 61, 79]);
  this.itemsLayer.setCollision([80,89]);
    // enemies and stuff
    for (var i = 0; i <this.enemies.getLength(); i++){


    this.ai = this.enemies.getChildren()[i];
    this.ai.number = i;
    this.ai.health = 100;
    this.ai.isAlive = true;
    this.fireballs.create(this.ai.x, this.ai.y, 'fireball');
  }

    this.enemies.scaleXY(1, 1);
    this.enemies.setAlpha(0);
    this.fireballs.setAlpha(0)
      //add minotaur and anim
  this.minotaur = this.physics.add.sprite(this.map.widthInPixels / 2, this.map.heightInPixels / 2, 'minotaur');
  this.minotaur.direction = 'left';
  this.minotaur.isAttacking = false;
  this.minotaur.isAlive = true;
  this.physics.add.collider(this.enemies, this.minotaur);
  this.physics.add.collider(this.minotaur, this.groundLayer);
  this.physics.add.collider(this.enemies, this.groundLayer);
  this.physics.add.collider(this.minotaur, this.itemsLayer, this.itemPickup, null, this);
  this.fireballHit = this.physics.add.overlap(this.fireballs, this.minotaur, this.hitDetected, null, this);
  this.minotaur.setBodySize(32, 32, true);

  this.camera = this.cameras.main;
    this.camera.startFollow(this.minotaur);
    this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  //create and maintain animations for minotaur
  this.anims.create({
    key: "priest_idle_right",
    frames: this.anims.generateFrameNumbers("priest", {start: 0, end: 3}),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "priest_attack",
    frames: this.anims.generateFrameNumbers("priest", {start: 4, end: 6}),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "minotaur_idle_left",
    frames: this.anims.generateFrameNumbers("minotaur", {start: 100, end: 104}),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "minotaur_left",
    frames: this.anims.generateFrameNumbers("minotaur", {start: 110, end: 117}),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "minotaur_idle_right",
    frames: this.anims.generateFrameNumbers("minotaur", {start: 0, end: 4}),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "minotaur_right",
    frames:this.anims.generateFrameNumbers("minotaur", {start: 10, end: 17}),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: "minotaur_attack_1_right",
    frames:this.anims.generateFrameNumbers("minotaur", {start: 30, end: 35}),
    frameRate: 10,
    repeat: 0
  });
  this.anims.create({
    key: "minotaur_attack_1_left",
    frames:this.anims.generateFrameNumbers("minotaur", {start: 130, end: 135}),
    frameRate: 10,
    repeat: 0
  });
  this.anims.create({
    key: "fireball_move",
    frames:this.anims.generateFrameNumbers("fireball", {start: 0, end: 2}),
    frameRate: 10,
    repeat: -1
  });
  this.cursorKeys = this.input.keyboard.createCursorKeys()
  this.escKey = this.input.keyboard.addKey("esc")
  this.minotaur.anims.play("minotaur_idle_left", true);
  // Help text that has a "fixed" position on the screen
this.goldtext =  this.add.text(440,500, `Gold = ${this.gold}`, {
    font: "18px monospace",
  fill: "#000000",
  padding: { x: 10, y: 10 },
  backgroundColor: "#ffffff"
}).setScrollFactor(0).setAlpha(0.5);
this.minotaurHealthText = this.add.text(220,487, `${this.health} / 100`, {
    font: "18px monospace",
  fill: "#ffffff",
  padding: { x: 10, y: 10 },
}).setScrollFactor(0).setAlpha(0.5).setDepth(1);
  if(this.level == 1){
   this.add.text(16, 16, `Find the ladder. Go deeper.\nArrow keys to move, space to Attack.\nEnemies die in 2 hits.\nCurrent level: ${this.level}.\nPress ESC to pause the game`, {
       font: "18px monospace",
       fill: "#000000",
       padding: { x: 20, y: 10 },
       backgroundColor: "#ffffff"
     }).setScrollFactor(0).setAlpha(0.5);
   }
   else{
     this.add.text(16, 16, `Current level: ${this.level}.\n Press ESC to pause the game`, {
         font: "18px monospace",
         fill: "#000000",
         padding: { x: 20, y: 10 },
         backgroundColor: "#ffffff"
       }).setScrollFactor(0).setAlpha(0.5);
   }

     for (var i = 0; i <this.fireballs.getLength(); i++){


   this.fireballz = this.fireballs.getChildren()[i];
   this.fireballz.fired = false;
   this.fireballz.number = i;
 }
 this.timerEvent = new Phaser.Time.TimerEvent({delay: 3000, loop:true, callback:this.resetFireballs, callbackScope: this});
 this.time.addEvent(this.timerEvent);
 this.bar = this.add.graphics();
this.bar.fillStyle(0x000000);
this.bar.fillRect(123, 499, 303, 13);
this.healthbar = this.makeBar(125, 500, 0xFF0000);
this.healthbar.setScrollFactor(0)
this.bar.setScrollFactor(0)
this.setValue(this.healthbar, this.health);
/* Robin */
// event listeners for pausing and unpausing
this.events.on("resume", () =>{
this.music.resume();
this.isPaused = false;
});
this.events.on("launch", () =>{
this.music.resume();
this.isPaused = false;
this.level = 1;
});
this.events.on("pause", () =>{
  console.log("Paused");
  this.isPaused = true;
  this.music.pause();
  this.scene.launch("PauseScreen");
});
this.escKey.on("down", () =>{
  if(this.isPaused == false){
    this.scene.pause();
  }
})
}
update (){
      //If the player has stopped moving
           if (this.minotaur.body.velocity.x < 0.5 && this.minotaur.body.velocity.x > -0.5 && this.minotaur.body.velocity.y < 0.5 && this.minotaur.body.velocity.y > -0.5) {
                if(!this.minotaur.isAttacking && this.minotaur.isAlive){
                  //Play idle animation if minotaur is not in the attacking state
               if(this.minotaur.direction == 'right'){
               this.minotaur.anims.play("minotaur_idle_right", true);
             }
             else{
               this.minotaur.anims.play("minotaur_idle_left", true);
             }
           }
         };
this.movePlayerManager();
this.FogofWar();
this.levelEnd();
this.minotaurDeath();
this.enemyclosest = this.physics.closest(this.minotaur,this.enemies.getChildren())

if(this.enemyclosest.isAlive == true){
this.Aicontroller();
this.FireballFOG();
}
else{
    this.minotaur.enableBody(false ,null, null,true, true);
}
}

minotaurDeath(){
  if(!this.minotaur.isAlive){
// disable body, reset scene then fade out once minotaur dies;
    this.minotaur.disableBody(false, false);
    this.camera.fade(250, 0, 0, 0);
      this.camera.once("camerafadeoutcomplete", () =>{
        this.health = 100;
        this.level = 0;
        this.scene.restart();
        console.log("died")
      });
      this.minotaur.isAlive = true;
      /* Dunno why but this creates a glitch where if you don't descend a level before taking damage it registers multiple hits of foreballs, and thus multiple resets */
}
}
makeBar(x, y, colour){
  //draw bar
  var bar = this.add.graphics();
  bar.fillStyle(colour, 1);
  bar.fillRect(0, 0, 300, 11)
  bar.x = x;
  bar.y = y;
  return bar;
}

setValue(bar,percentage){
  bar.scaleX = percentage/100;
}

movePlayerManager(){

  this.minotaur.setVelocity(0);
  if(this.cursorKeys.space.isDown){
    this.attack();
  }
if(!this.minotaur.isAttacking){
  if(this.cursorKeys.left.isDown){
    this.minotaur.anims.play("minotaur_left", true);
    this.minotaur.setVelocityX(-gameSettings.playerSpeed);
    this.minotaur.direction = 'left';

  }else if(this.cursorKeys.right.isDown){
    this.minotaur.anims.play("minotaur_right", true);
    this.minotaur.setVelocityX(gameSettings.playerSpeed);
    this.minotaur.direction = 'right';
  }
  if(this.cursorKeys.up.isDown){
    this.minotaur.setVelocityY(-gameSettings.playerSpeed);
    this.minotaur.anims.play(`minotaur_${this.minotaur.direction}`, true);
  }else if(this.cursorKeys.down.isDown){
    this.minotaur.setVelocityY(gameSettings.playerSpeed);
    this.minotaur.anims.play(`minotaur_${this.minotaur.direction}` , true);

}
}
}
attack(){
  if(!this.minotaur.isAttacking){
  this.minotaur.isAttacking = true;
  this.minotaur.setBodySize(64, 64, true);
  this.enemyCollider =  this.physics.add.overlap(this.minotaur, this.enemies, this.takeDamage, null, this);
  this.minotaur.anims.play(`minotaur_attack_1_${this.minotaur.direction}`, true);
  this.minotaur.once('animationcomplete', () => {
            this.physics.world.removeCollider(this.enemyCollider);
            this.minotaur.isAttacking = false;
            this.minotaur.setBodySize(32, 32, true);
            this.minotaur.enableBody();
       });
}
}
takeDamage(){
this.enemyclosest = this.physics.closest(this.minotaur,this.enemies.getChildren());
this.enemyclosest.health -=50;
if(this.enemyclosest.health <= 0){
  this.enemyclosest.health = 0;
  this.enemyclosest.isAlive = false;
  this.enemyclosest.disableBody(true, true);
}

  this.physics.world.removeCollider(this.enemyCollider);
}
levelEnd(){
if(this.playerTileX == this.endRoom.centerX && this.playerTileY == this.endRoom.centerY){
  if(this.hasPlayerReachedLadder == false){

  this.camera.fade(250, 0, 0, 0);
  this.hasPlayerReachedLadder = true;
  this.camera.once("camerafadeoutcomplete", () =>{
    this.minotaur.disableBody(false, false);
    this.scene.restart();


  });
}
}
  }
FogofWar(){
  this.playerTileX = this.groundLayer.worldToTileX(this.minotaur.x);
   this.playerTileY = this.groundLayer.worldToTileY(this.minotaur.y);
   this.playerRoom = this.dungeon.getRoomAt(this.playerTileX, this.playerTileY);

   this.tilemapVisibility.setActiveRoom(this.playerRoom);
}
Aicontroller(){
  this.enemies.playAnimation("priest_idle_right", true);
  for (var i = 0; i <this.enemies.getLength(); i++){
    this.ai = this.enemies.getChildren()[i];
    this.ai.isAttacking = false;
  this.aiTileX = this.groundLayer.worldToTileX(this.ai.x);
 this.aiTileY = this.groundLayer.worldToTileY(this.ai.y);
 this.aiRoom = this.dungeon.getRoomAt(this.aiTileX, this.aiTileY);
 if(this.aiRoom == this.playerRoom){
   this.ai.setAlpha(1)
   this.distancex = this.minotaur.x - this.ai.x;
   this.distancey = this.minotaur.y - this.ai.y;
   if(this.ai.isAttacking == false){
   if(this.distancex < 50 && this.distancex > 0  || this.distancex < -100 ){
     this.ai.setVelocityX(-150);
   } else if(this.distancex > -50 && this.distancex < 0 || this.distancex > 100){
     this.ai.setVelocityX(150);
   }
   else{
     this.ai.setVelocityX(0);
   }
   if(this.distancey < 50 && this.distancey > 0 || this.distancey < -100 ){
     this.ai.setVelocityY(-150);
   }else if(this.distancey > -50 && this.distancey < 0 || this.distancey > 100){
     this.ai.setVelocityY(150);
   }
   else{
     this.ai.setVelocityY(0);
   }
 }
}
 else{
   this.ai.setAlpha(0);
 }
}
}

FireballFOG(){
  this.fireballs.playAnimation("fireball_move", true);
  for (var i = 0; i <this.fireballs.getLength(); i++){


this.fireballz = this.fireballs.getChildren()[i];

  this.fireballzTileX = this.groundLayer.worldToTileX(this.fireballz.x);
 this.fireballzTileY = this.groundLayer.worldToTileY(this.fireballz.y);
 this.fireballzRoom = this.dungeon.getRoomAt(this.fireballzTileX, this.fireballzTileY);
 if(this.fireballzRoom == this.playerRoom){
   this.fireballz.setAlpha(1)
   this.physics.velocityFromRotation(this.fireballz.rotation, 70, this.fireballz.body.velocity);
   if(this.fireballz.fired == false){
     this.enemies.playAnimation("priest_attack", true);
   this.fireballz.rotation = (Phaser.Math.Angle.Between(this.minotaur.x, this.minotaur.y, this.fireballz.x, this.fireballz.y)+Math.PI);
 }
 this.fireballz.fired = true;
 }
 else{
   this.fireballz.setAlpha(0);
   this.fireballz.setVelocity(0);
 }

 }
}

resetFireballs(){

if (this.enemyclosest.isAlive == true){
  this.fireballWoosh.play();
  for (var i = 0; i <this.fireballs.getLength(); i++){
  this.fireballz = this.fireballs.getChildren()[i];
  this.fireballz.fired = false;
  for(var j = 0; j<this.enemies.getLength(); j++){
  this.ai = this.enemies.getChildren()[j];
  if(this.fireballz.number == this.ai.number){
    this.fireballz.x = this.ai.x;
    this.fireballz.y = this.ai.y;
  }
  }

}
}
else{
  for (var i = 0; i <this.fireballs.getLength(); i++){
  this.fireballz = this.fireballs.getChildren()[i];
  if(this.fireballz.number == this.enemyclosest.number){
  this.fireballz.destroy();
}
}
}
}

hitDetected(){
  console.log("this amount of fireballs")
    this.health -= 10;
  if(this.health <= 0){
    this.health = 0;
    this.minotaur.isAlive = false;
    this.physics.world.removeCollider(this.fireballHit);
  }
this.setValue(this.healthbar, this.health);
this.minotaurHealthText.setText(`${this.health} / 100`);
this.physics.world.removeCollider(this.fireballHit);
setTimeout(() => {this.fireballHit = this.physics.add.overlap(this.fireballs, this.minotaur, this.hitDetected, null, this); }, 1500);
}
itemPickup(minotaur, itemsLayer){

if(itemsLayer.index == 89){
  if(this.health < 100){
  this.itemsLayer.removeTileAt(itemsLayer.x, itemsLayer.y);
  this.potionDrink.play();
    this.health += 30;
    if(this.health >= 100){
      this.health = 100;
    }
    this.setValue(this.healthbar, this.health);
    this.minotaurHealthText.setText(`${this.health} / 100`);
  }
}
  else{
    this.gold += ((Phaser.Math.Between(1,5) * 10) );
    this.goldtext.setText(`Gold = ${this.gold}`)
    this.itemsLayer.removeTileAt(itemsLayer.x, itemsLayer.y);
    this.chestPickup.play();
  }
}
}
