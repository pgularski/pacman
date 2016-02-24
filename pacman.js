Pacman = function (game, x, y) {
    var self = this;
    Phaser.Sprite.call(self, game, x, y, 'pacman');
    self.game = game;

    self.anchor.set(0.5);
    self.animations.add("eat", [0, 1, 2, 1], 10, true);
    self.play("eat");

    self.game.physics.arcade.enable(self);
    self.body.setSize(32, 32, 0, 0);

    self.game.add.existing(self);
}
Pacman.prototype = Object.create(Phaser.Sprite.prototype);
Pacman.prototype.constructor = Pacman;
