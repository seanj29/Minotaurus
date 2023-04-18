class TitleScreen extends Phaser.Scene {
  constructor() {
    super("TitleScreen");
  }
  preload ()
  {
  this.load.image('Start', 'assets/Start.png');
  this.load.image('BG', 'assets/TitleBG.png');
  this.load.image('Quit', 'assets/Quit.png');
  this.load.image('Title', 'assets/Title.png');
  }
  create(){
    this.add.image(0,0, "BG").setOrigin(0,0)
    this.add.image(100,0, "Title").setOrigin(0,0)
    this.start = this.add.image(150,250, "Start").setOrigin(0,0)
    this.quit = this.add.image(150,400, "Quit").setOrigin(0,0)
    this.start.setInteractive()
    this.quit.setInteractive()
    this.start.once('pointerdown', () => {
      this.scene.launch("Level1");
    });
    this.quit.once('pointerdown', () => {
    this.sys.game.destroy(true);
    });
  }
}
