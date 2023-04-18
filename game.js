let game;
var gameSettings = {
  playerSpeed: 200,
}
var config = {
    type: Phaser.AUTO,
    scale: {
      width: 550,
    height: 550,
  },
    scene: [TitleScreen, Scene1, PauseScreen],
    pixelArt: true,
    physics: {
      default: "arcade",
    }
}

game = new Phaser.Game(config);
