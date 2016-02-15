var game = new Phaser.Game(28 * 32, 31 * 32, Phaser.AUTO, "");

var PacmanGame = function() {
    var self = this;
    self.map = null;
    self.layer = null;
    self.pacman = null;

    self.safetile = 1;
    self.gridsize = 32;

    self.speed = 150;
    self.threshold = 15;

    self.marker = new Phaser.Point();
    self.turnPoint = new Phaser.Point();

    self.directions = [ null, null, null, null, null ];
    self.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

    self.current = Phaser.NONE;
    self.turning = Phaser.NONE;
}

PacmanGame.prototype.init = function () {
    var self = this;
    self.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    self.scale.pageAlignVertically = true;
    self.scale.pageAlignHorizontally = true;
    //Phaser.Canvas.setImageRenderingCrisp(self.game.canvas);
    self.physics.startSystem(Phaser.Physics.ARCADE);
}

PacmanGame.prototype.preload = function () {
    var self = this;
    self.load.image("tiles", "assets/tiles.png");
    self.load.spritesheet("pacman", "assets/pacman.png", 32, 32);
    self.load.tilemap("map", "assets/map.json", null, Phaser.Tilemap.TILED_JSON);

}

PacmanGame.prototype.create = function () {
    var self = this;
    self.map = self.add.tilemap("map");
    self.map.addTilesetImage("tiles");
    // Display the layer from the map.json file. The name as in the json file.
    self.layer = self.map.createLayer("Tile Layer 1");
    self.map.setCollisionByExclusion([self.safetile], true, self.layer);

    self.pacman = self.add.sprite((2 * 32) + 16, (1 * 32) + 16, "pacman", 0);
    // Set the origin point of the sprite. Anchor 0.5 means the origins is in the middle.
    self.pacman.anchor.set(0.5);
    self.pacman.animations.add("eat", [0, 1, 2], 10, true);
    self.pacman.play("eat");

    self.physics.arcade.enable(self.pacman);
    self.pacman.body.setSize(32, 32, 0, 0);

    self.cursors = game.input.keyboard.createCursorKeys();

    self.move(Phaser.RIGHT);
}

PacmanGame.prototype.update = function () {
    var self = this;
    self.physics.arcade.collide(self.pacman, self.layer);
    self.checkKeys();

    self.marker.x = self.math.snapToFloor(Math.floor(self.pacman.x), self.gridsize) / self.gridsize;
    self.marker.y = self.math.snapToFloor(Math.floor(self.pacman.y), self.gridsize) / self.gridsize;

    self.directions[Phaser.LEFT] = self.map.getTileLeft(self.layer.index, self.marker.x, self.marker.y);
    self.directions[Phaser.RIGHT] = self.map.getTileRight(self.layer.index, self.marker.x, self.marker.y);
    self.directions[Phaser.UP] = self.map.getTileAbove(self.layer.index, self.marker.x, self.marker.y);
    self.directions[Phaser.DOWN] = self.map.getTileBelow(self.layer.index, self.marker.x, self.marker.y);

    self.checkKeys();

    if (self.turning !== Phaser.NONE)
    {
        self.turn();
    }

}

/*
 *PacmanGame.prototype.render = function () {
 *    var self = this;
 *    for (var t = 1; t < 5; t++)
 *    {
 *        if (self.directions[t] === null)
 *        {
 *            continue;
 *        }
 *
 *        var color = 'rgba(0,255,0,0.3)';
 *
 *        if (self.directions[t].index !== self.safetile)
 *        {
 *            color = 'rgba(255,0,0,0.3)';
 *        }
 *
 *        if (t === self.current)
 *        {
 *            color = 'rgba(255,255,255,0.3)';
 *        }
 *
 *        self.game.debug.geom(new Phaser.Rectangle(self.directions[t].worldX, self.directions[t].worldY, 32, 32), color, true);
 *    }
 *
 *    self.game.debug.geom(self.turnPoint, '#ffff00');
 *
 *}
 */

PacmanGame.prototype.move = function (direction) {
    var self = this;

    var speed = self.speed;

    if (direction === Phaser.LEFT || direction === Phaser.UP)
    {
        speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
    {
        self.pacman.body.velocity.x = speed;
    }
    else
    {
        self.pacman.body.velocity.y = speed;
    }

    //  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
    self.pacman.scale.x = 1;
    self.pacman.angle = 0;

    if (direction === Phaser.LEFT)
    {
        self.pacman.scale.x = -1;
    }
    else if (direction === Phaser.UP)
    {
        self.pacman.angle = 270;
    }
    else if (direction === Phaser.DOWN)
    {
        self.pacman.angle = 90;
    }

    self.current = direction;

}

PacmanGame.prototype.checkKeys = function () {
    var self = this;

    if (self.cursors.left.isDown && self.current !== Phaser.LEFT) {
        self.checkDirection(Phaser.LEFT);
    }
    else if (self.cursors.right.isDown && self.current !== Phaser.RIGHT) {
        self.checkDirection(Phaser.RIGHT);
    }

    else if (self.cursors.up.isDown && self.current !== Phaser.UP) {
        self.checkDirection(Phaser.UP);
    }

    else if (self.cursors.down.isDown && self.current !== Phaser.DOWN) {
        self.checkDirection(Phaser.DOWN);
    }
    else
    {
        self.turning = Phaser.NONE;
    }
}

PacmanGame.prototype.checkDirection = function (turnTo) {
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
}

PacmanGame.prototype.turn = function () {
    var self = this;

    var cx = Math.floor(self.pacman.x);
    var cy = Math.floor(self.pacman.y);

    //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (!self.math.fuzzyEqual(cx, self.turnPoint.x, self.threshold) || !self.math.fuzzyEqual(cy, self.turnPoint.y, self.threshold))
    {
        return false;
    }

    //  Grid align before turning
    self.pacman.x = self.turnPoint.x;
    self.pacman.y = self.turnPoint.y;

    self.pacman.body.reset(self.turnPoint.x, self.turnPoint.y);

    self.move(self.turning);

    self.turning = Phaser.NONE;

    return true;

}


game.state.add("Game", PacmanGame, true);
