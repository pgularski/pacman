// TODO: Once there's ghost and pacman walking around, separate the pacman and the ghost's code.

"use strict";

var game = new Phaser.Game(28 * 32, 31 * 32, Phaser.AUTO, "");

var Grid = function (map) {
    var self = this;
    self.map = map;
    // TODO: This should be rather passed in.
    self.safetile = 1;
    self.width = map.width;
    self.height = map.height;
    self.walls = new Set();
    self._updateWallsData();
}

Grid.prototype.inBounds = function (xy) {
    var self = this;
    var xy_ints = xy.split(",").map(Number);
    var x = xy_ints[0];
    var y = xy_ints[1];
    return x >= 0 && x < self.width && y >= 0 && y < self.height;
}

Grid.prototype.canPass = function (xy) {
    var self = this;
    return !self.walls.has(xy);
}

Grid.prototype.neighbors = function (xy) {
    var self = this;
    var xy_ints = xy.split(",").map(Number);
    var x = xy_ints[0];
    var y = xy_ints[1];
    var result = [
        [x + 1, y].toString(),
        [x - 1, y].toString(),
        [x, y - 1].toString(),
        [x, y + 1].toString(),
        ];
    result = result.filter(self.inBounds.bind(self))
    result = result.filter(self.canPass.bind(self))
    return result
}

Grid.prototype._updateWallsData = function () {
    var self = this;
    var map_data = self.map.layer.data;
    var tile = null;

    for (var i = 0; i < map_data.length - 1; i++) {
        for (var j = 0; j < map_data[i].length - 1; j++) {
            tile = map_data[i][j];
            if (tile.index !== self.safetile) {
                self.walls.add([i, j].toString());
            }
        }
    }
}


var PacmanGame = function() {
    var self = this;
    self.map = null;
    self.grid = null;
    self.layer = null;
    self.pacman = null;
    self.ghost = null;

    self.safetile = 1;
    self.gridsize = 32;

    self.speed = 150;
    self.threshold = 5;

    self.ghostSpeed = 150;

    self.marker = new Phaser.Point();
    self.turnPoint = new Phaser.Point();

    self.ghostMarker = new Phaser.Point();

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
    self.load.spritesheet("ghost", "assets/ghost.png", 32, 32);
    self.load.tilemap("map", "assets/map.json", null, Phaser.Tilemap.TILED_JSON);
}

PacmanGame.prototype.create = function () {
    var self = this;
    self.map = self.add.tilemap("map");
    self.map.addTilesetImage("tiles");
    // Display the layer from the map.json file. The name as in the json file.
    self.layer = self.map.createLayer("Tile Layer 1");
    self.map.setCollisionByExclusion([self.safetile], true, self.layer);

    self.grid = new Grid(self.map);

    self.pacman = self.add.sprite((2 * 32) + 16, (1 * 32) + 16, "pacman", 0);
    // Set the origin point of the sprite. Anchor 0.5 means the origins is in the middle.
    self.pacman.anchor.set(0.5);
    self.pacman.animations.add("eat", [0, 1, 2, 1], 10, true);
    self.pacman.play("eat");

    self.ghost = self.add.sprite((1 * 32) + 16, (1 * 32) + 16, "ghost", 0);
    self.ghost.anchor.set(0.5);
    self.ghost.animations.add("walk", [0, 1, 2, 1], 10, true);
    self.ghost.play("walk")

    self.physics.arcade.enable(self.pacman);
    self.physics.arcade.enable(self.ghost);
    self.pacman.body.setSize(32, 32, 0, 0);
    self.ghost.body.setSize(32, 32, 0, 0);

    self.cursors = game.input.keyboard.createCursorKeys();
    self.debugKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    self.debugKey.isPressed = false;

    self.move(Phaser.RIGHT);
}

PacmanGame.prototype.update = function () {
    var self = this;
    self.physics.arcade.collide(self.pacman, self.layer);
    self.physics.arcade.collide(self.ghost, self.layer);

    // It's in the grid coordinates, not in pixels
    self.marker.x = self.getObjectGridX(self.pacman);
    self.marker.y = self.getObjectGridY(self.pacman);

    // It's in the grid coordinates, not in pixels
    self.ghostMarker.x = self.getObjectGridX(self.ghost);
    self.ghostMarker.y = self.getObjectGridY(self.ghost);

    self.directions[Phaser.LEFT] = self.map.getTileLeft(self.layer.index, self.marker.x, self.marker.y);
    self.directions[Phaser.RIGHT] = self.map.getTileRight(self.layer.index, self.marker.x, self.marker.y);
    self.directions[Phaser.UP] = self.map.getTileAbove(self.layer.index, self.marker.x, self.marker.y);
    self.directions[Phaser.DOWN] = self.map.getTileBelow(self.layer.index, self.marker.x, self.marker.y);

    self.checkKeys();

    if (self.turning !== Phaser.NONE)
    {
        self.turn();
    }

    self.moveGhost();

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

PacmanGame.prototype.getObjectGridX = function (obj) {
    var self = this;
    return self.math.snapToFloor(Math.floor(obj.x), self.gridsize) / self.gridsize;
}

PacmanGame.prototype.getObjectGridY = function (obj) {
    var self = this;
    return self.math.snapToFloor(Math.floor(obj.y), self.gridsize) / self.gridsize;
}

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

PacmanGame.prototype.moveGhost = function () {
    var self = this;

    var speed = self.ghostSpeed;

    self.ghost.body.velocity.y = speed;
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

    if (self.debugKey.isDown && !self.debugKey.isPressed) {
        console.log("Debug key pressed");
        self.debugKey.isPressed = true;
        self.findPathToPacman();
    }
    else if (self.debugKey.isUp && self.debugKey.isPressed) {
        self.debugKey.isPressed = false;
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

PacmanGame.prototype.findPathToPacman = function () {
    var self = this;
    var graph = self.grid;
    var start = [self.getObjectGridX(self.ghost), self.getObjectGridY(self.ghost)].toString();
    var goal = [self.getObjectGridX(self.pacman), self.getObjectGridY(self.pacman)].toString();

    var border = [];
    var came_from = {};
    var current;
    var neighbors;
    var node;
    came_from.start = null;
    border.push(start);
    while (border.length > 0) {
        current = border.shift();
        if (current === goal) {
            break;
        }
        neighbors = graph.neighbors(current);
        for(var i = 0; i < neighbors.length; i++){
            node = neighbors[i];
            if (!came_from.hasOwnProperty(node)) {
                border.push(node);
                came_from.node = current
            }
        }
    }
    return came_from;
}


game.state.add("Game", PacmanGame, true);
