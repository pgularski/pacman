'use strict';

Pacman.MainMenu = function (game) {
    var self = this;
};


Pacman.MainMenu.prototype.create = function () {
    var self = this;
    //self.input.onDown.addOnce(self.startGame, self);
    self.enterKey = self.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    self.enterKey.onDown.add(self.startGame, self);
    self.startButton = self.add.button(self.world.centerX, self.world.centerY, 'startGameButton', self.startGame, self);
    self.startButton.anchor.setTo(0.5, 0.5);
    self.startButton.events.onInputDown.add(self.startGame, self);
};


Pacman.MainMenu.prototype.update = function () {
    var self = this;
};


Pacman.MainMenu.prototype.startGame = function () {
    var self = this;
    self.state.start('Game');
};
