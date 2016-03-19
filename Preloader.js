'use strict';

Pacman.Preloader = function (game) {
    var self = this;
};

Pacman.Preloader.prototype.preload = function () {
    var self = this;

    self.preloadBar = self.add.sprite(self.world.centerX, self.world.centerY, 'preloaderBar');
    self.preloadBar.anchor.setTo(0.5, 0.5);
    self.load.setPreloadSprite(self.preloadBar);

    self.SaveCPU = self.game.plugins.add(Phaser.Plugin.SaveCPU);
    self.SaveCPU.renderOnFPS = 45;

    self.stage.backgroundColor = '#000';
    self.load.image("tiles", "assets/tiles.png");
    self.load.image("tiles", "assets/tiles.png");
    self.load.image("startGameButton", "assets/startgamebutton.png");
    self.load.spritesheet("pacman", "assets/pacman.png", 32, 32);
    self.load.spritesheet("ghost", "assets/ghost.png", 32, 32);
    self.load.spritesheet("boom", "assets/boom.png", 128, 128);
    self.load.spritesheet("dot", "assets/dot_tile.png", 32, 32);
    self.load.spritesheet("bigDot", "assets/big_dot.png", 32, 32);
    self.load.tilemap("map", "assets/map.json", null, Phaser.Tilemap.TILED_JSON);

    self.load.audio('sfx', 'assets/sfx/pacman.ogg');
};

Pacman.Preloader.prototype.create = function () {
    var self = this;
    self.state.start('MainMenu');
};
