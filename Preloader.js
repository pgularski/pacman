'use strict';

Pacman.Preloader = function (game) {
    var self = this;
};

Pacman.Preloader.prototype.preload = function () {
    var self = this;

    self.preloadBar = self.add.sprite(0, 100, 'preloaderBar');
    self.load.setPreloadSprite(self.preloadBar);

    self.stage.backgroundColor = '#000';
    self.load.image("tiles", "assets/tiles.png");
    self.load.spritesheet("pacman", "assets/pacman.png", 32, 32);
    self.load.spritesheet("ghost", "assets/ghost.png", 32, 32);
    self.load.spritesheet("boom", "assets/boom.png", 128, 128);
    self.load.spritesheet("dot", "assets/dot_tile.png", 32, 32);
    self.load.spritesheet("bigDot", "assets/big_dot.png", 32, 32);
    self.load.tilemap("map", "assets/map.json", null, Phaser.Tilemap.TILED_JSON);
};

Pacman.Preloader.prototype.create = function () {
    var self = this;
    self.state.start('MainMenu');
};
