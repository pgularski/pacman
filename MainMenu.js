'use strict';

Pacman.MainMenu = function (game) {
    var self = this;
};


Pacman.MainMenu.prototype.create = function () {
    var self = this;
    self.input.onDown.addOnce(self.startGame, self);
};


Pacman.MainMenu.prototype.update = function () {
    var self = this;
};


Pacman.MainMenu.prototype.startGame = function () {
    var self = this;
    self.state.start('Game');
};
