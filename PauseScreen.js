class PauseScreen extends Phaser.Scene {
  constructor() {
    super("PauseScreen");
  }
preload ()
{
this.load.image('Pause', 'assets/Paused.png');
this.load.image('Background', 'assets/Background.png');
this.load.image('Continue', 'assets/Continue.png');
this.load.image('Quit', 'assets/Quit.png');
}

create ()
{
  this.escKey = this.input.keyboard.addKey("esc")
  this.add.image(0,0, "Background").setOrigin(0,0);
  this.continue = this.add.image(275,250, "Continue");
  this.add.image(20,0, "Pause").setOrigin(0,0);
  this.quitbut = this.add.image(150,350, "Quit").setOrigin(0,0)
  this.continue.setInteractive();
  this.quitbut.setInteractive();

  this.continue.once('pointerdown', () => {
    this.scene.resume("Level1"); // Robin you need to use the scene key not the class name here
    this.scene.stop("PauseScreen")
  });
  this.escKey.on("down", () => {
      this.scene.resume("Level1"); // Robin you need to use the scene key not the class name here
      this.scene.stop("PauseScreen")
    });
  this.quitbut.once('pointerdown', () => {
    this.scene.stop("PauseScreen")
    this.scene.stop("Level1")
      this.sys.game.destroy(true);
      console.log("quit!") // Robin you need to use the scene key not the class name here
    });
}
}
