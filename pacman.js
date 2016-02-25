// TODO: Make it work with use strict;
//"use strict";

Pacman = function (game, x, y) {
    var self = this;
    Phaser.Sprite.call(self, game, x, y, 'pacman');
    // FIXME: Why it doesn't work?
    //self.game = game;
    self.game = game.state.states.Game;
    // FIXME: How to get the actual map object from the game object?
    //self.map = self.game.map;
    self.map = game.state.states.Game.map;

    // FIXME: How to get the actual layer object from the game object?
    //self.layer = self.game.layer;
    self.layer = game.state.states.Game.layer;

    self.anchor.set(0.5);
    self.animations.add("eat", [0, 1, 2, 1], 10, true);
    self.play("eat");

    self.speed = 150;

    self.game.physics.arcade.enable(self);
    self.body.setSize(32, 32, 0, 0);

    // FIXME: Isn't that too implicit?
    self.game.add.existing(self);

    self.directions = [ null, null, null, null, null ];

    self.turnPoint = new Phaser.Point();
    self.marker = new Phaser.Point();

    self.current = Phaser.NONE;
    self.turning = Phaser.NONE;

    // TODO: This should not be hardcoded.
    self.safetile = 1;

    self.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];
};

Pacman.prototype = Object.create(Phaser.Sprite.prototype);
Pacman.prototype.constructor = Pacman;

Pacman.prototype.checkDirection = function (turnTo) {
    var self = this;
    if (self.turning === turnTo || self.directions[turnTo] === null || self.directions[turnTo].index !== self.safetile)
    {
        return;
    }

    //  Check if they want to turn around and can
    if (self.current === self.opposites[turnTo])
    {
        self.move(turnTo);
    }
    else
    {
        self.turning = turnTo;

        self.turnPoint.x = (self.marker.x * self.gridsize) + (self.gridsize / 2);
        self.turnPoint.y = (self.marker.y * self.gridsize) + (self.gridsize / 2);
    }
};


Pacman.prototype.update = function () {
    var self = this;

    // It's in the grid coordinates, not in pixels
    // TODO: Use some built-in methods.
    self.marker = self.game.getObjectGridPoint(self);

    self.directions[Phaser.LEFT] = self.map.getTileLeft(self.layer.index, self.marker.x, self.marker.y);
    self.directions[Phaser.RIGHT] = self.map.getTileRight(self.layer.index, self.marker.x, self.marker.y);
    self.directions[Phaser.UP] = self.map.getTileAbove(self.layer.index, self.marker.x, self.marker.y);
    self.directions[Phaser.DOWN] = self.map.getTileBelow(self.layer.index, self.marker.x, self.marker.y);
};

Pacman.prototype.isInTurnPoint = function (object) {
    var self = this;
    var objectGridPoint = self.getObjectGridPoint(object);
    var currentX = Math.floor(object.x);
    var currentY = Math.floor(object.y);
    if (self.math.fuzzyEqual(currentX, self.turnPoint.x, self.threshold) &&
        self.math.fuzzyEqual(currentY, self.turnPoint.y, self.threshold)){
        return true;
    }
    return false;
}


Pacman.prototype.turn = function () {
    var self = this;

    if (!self.game.isInTurnPoint(self)) {
        return false;
    }

    //  Grid align before turning
    self.game.alignToTile(self);

    self.move(self.turning);

    self.turning = Phaser.NONE;

    return true;

}


Pacman.prototype.move = function (direction) {
    var self = this;

    var speed = self.speed;

    if (direction === Phaser.LEFT || direction === Phaser.UP)
    {
        speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
    {
        self.body.velocity.x = speed;
    }
    else
    {
        self.body.velocity.y = speed;
    }

    //  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
    self.scale.x = 1;
    self.angle = 0;

    if (direction === Phaser.LEFT)
    {
        self.scale.x = -1;
    }
    else if (direction === Phaser.UP)
    {
        self.angle = 270;
    }
    else if (direction === Phaser.DOWN)
    {
        self.angle = 90;
    }

    self.current = direction;
}

