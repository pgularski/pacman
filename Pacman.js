'use strict';

Pacman.Pacman = function (pacmanGameState, game, x, y) {
    var self = this;
    Phaser.Sprite.call(self, game, x, y, 'pacman');
    //self.game = game.state.states.Game;
    self.game = pacmanGameState;
    self.map = self.game.map;
    self.layer = self.game.layer;

    self.anchor.set(0.5);
    self.animations.add("eat", [0, 1, 2, 1], 16, true);
    self.play("eat");

    self.speed = self.game.SPEED;

    self.game.physics.arcade.enable(self);
    self.body.setSize(32, 32, 0, 0);

    self.directions = [ null, null, null, null, null ];

    self.turnPoint = new Phaser.Point();
    self.marker = new Phaser.Point();

    self.current = Phaser.NONE;
    self.turning = Phaser.NONE;

    self.threshold = 5;
    self.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

    self.isAlive = true;

};

Pacman.Pacman.prototype = Object.create(Phaser.Sprite.prototype);
Pacman.Pacman.prototype.constructor = Pacman.Pacman;

Pacman.Pacman.prototype.checkDirection = function (turnTo) {
    var self = this;
    if (self.turning === turnTo || self.directions[turnTo] === null || self.directions[turnTo].index !== self.game.safetile)
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

        self.turnPoint.x = (self.marker.x * self.map.tileWidth) + (self.map.tileWidth * 0.5);
        self.turnPoint.y = (self.marker.y * self.map.tileHeight) + (self.map.tileHeight * 0.5);
    }
};


Pacman.Pacman.prototype.update = function () {
    var self = this;

    self.marker = self.game.getObjectTileXY(self);
    self.directions = self.game.getTileNeighbors(self.game.getObjectTile(self, true));

    if (self.turning !== Phaser.NONE)
    {
        self.turn();
    }
};

Pacman.Pacman.prototype.isInTurnPoint = function (object) {
    var self = this;
    var objectGridPoint = self.game.getObjectTileXY(object);
    var currentX = Math.floor(object.x);
    var currentY = Math.floor(object.y);
    if (self.game.math.fuzzyEqual(currentX, self.turnPoint.x, self.threshold) &&
        self.game.math.fuzzyEqual(currentY, self.turnPoint.y, self.threshold)){
        return true;
    }
    return false;
}

Pacman.Pacman.prototype.turn = function () {
    var self = this;

    if (!self.isInTurnPoint(self)) {
        return false;
    }

    //  Grid align before turning
    self.game.alignToTile(self);

    self.move(self.turning);

    self.turning = Phaser.NONE;

    return true;

}


Pacman.Pacman.prototype.move = function (direction) {
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
    self.scale.x = 2;
    self.angle = 0;

    if (direction === Phaser.LEFT)
    {
        self.scale.x = -2;
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
};


Pacman.Pacman.prototype.die = function () {
    var self = this;
    console.log('Pacman dies!');
    self.isAlive = false;
    self.kill();
};

