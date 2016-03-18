'use strict';

var Pacman = {
    score: 0
}


Pacman.Boot = function (game) {
    var self = this;
    self.game = game;
};

Pacman.Boot.prototype.preload = function () {
    var self = this;
    self.load.image('preloaderBar', 'assets/preload.png');

};

Pacman.Boot.prototype.create = function () {
    var self = this;
    self.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    self.scale.pageAlignVertically = true;
    self.scale.pageAlignHorizontally = true;
    //Phaser.Canvas.setImageRenderingCrisp(self.game.canvas);
    self.state.start('Preloader');
};
