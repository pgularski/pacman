// TODO: What are world, state and stage anyway?
// TODO: Implement states => prepare for game/ game/ game over
// TODO: Rename ``object'' parameters to ``sprite''
// TODO: Ghost walking randomly/chasing in turns + running away
// TODO: Graphics

/*
 * Variable name convention
 * point - Actual Phaser.Point of an object. ie. Phaser.Point(self.pacman.x, self.pacman.y)
 * gridPoint - Grid Phaser.Point of an object . ie. self.getCurrentGridPint(new Phaser.Point(self.pacman.x, self.pacman.y))
 */

"use strict";


var PacmanGame = function(game) {
    var self = this;
    self.game = game;
    self.map = null;
    self.grid = null;
    self.layer = null;
    self.pacman = null;

    self.ghosts = null;
    self.ghost1 = null;
    self.ghost2 = null;
    self.ghost3 = null;
    self.ghost4 = null;

    self.safetile = 1;

    self.speed = 150;
    self.threshold = 5;
    self.justTeleported = false;
};

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
    self.load.spritesheet("boom", "assets/boom.png", 128, 128);
    self.load.spritesheet("dot", "assets/dot_tile.png", 32, 32);
    self.load.tilemap("map", "assets/map.json", null, Phaser.Tilemap.TILED_JSON);
}

PacmanGame.prototype.create = function () {
    var self = this;
    self.map = self.add.tilemap("map");
    self.map.addTilesetImage("tiles");
    // Display the layer from the map.json file. The name as in the json file.
    self.layer = self.map.createLayer('Layer1');
    self.map.setCollisionByExclusion([self.safetile], true, self.layer);
    //self.layer.fixedToCamera = false;
    //self.layer.anchor.setTo(0.5);
    //self.layer.position.set(0, 128);

    self.dots = self.add.group();
    self.dots.enableBody = true;
    self.map.createFromObjects('Objects', 4, 'dot', 0, true, false, self.dots);
    self.dots.callAll('body.setSize', 'body', 8, 8, 12, 12);

    self.camera.y = 100;

    self.pacman = new Pacman(self, self.game, (14 * 32) + 16, (23 * 32) + 16);
    self.ghosts = self.add.group();

    self.ghost1 = new Ghost(self, self.game, (1 * 32) + 16, (1 * 32) + 16, StraightToThePointChasing, 1);
    self.ghost2 = new Ghost(self, self.game, (26 * 32) + 16, (1 * 32) + 16, SlightlyRandomizedChasing, 2);
    self.ghost3 = new Ghost(self, self.game, (1 * 32) + 16, (29 * 32) + 16, RandomizedChasing, 3);
    self.ghost4 = new Ghost(self, self.game, (26 * 32) + 16, (29 * 32) + 16, RandomizedChasing, 4);

    self.ghosts.add(self.ghost1);
    self.ghosts.add(self.ghost2);
    self.ghosts.add(self.ghost3);
    self.ghosts.add(self.ghost4);

    self.cursors = self.game.input.keyboard.createCursorKeys();
    self.debugKey = self.game.input.keyboard.addKey(Phaser.Keyboard.D);
    self.debugKey.isPressed = false;

    //self.pacman.scale.x = 2;
    //self.pacman.scale.y = 2;
    //self.pacman.body.setSize(16, 16, 0, 0);
    self.pacman.move(Phaser.LEFT);

    // Trigger gameCreated to start tests.
    // TODO: There's definitely some better way of doing that.
    var event = new CustomEvent('gameCreated');
    window.dispatchEvent(event);
}

PacmanGame.prototype.update = function () {
    var self = this;
    self.physics.arcade.collide(self.pacman, self.layer);
    //self.physics.arcade.collide(self.pacman, self.ghosts);
    self.physics.arcade.collide(self.ghosts, self.layer);
    self.game.physics.arcade.overlap(self.pacman, self.ghosts, self.onPacmanTouched, null, this);
    self.game.physics.arcade.overlap(self.pacman, self.dots, self.onEat, null, this);

    self.game.world.wrap(self.pacman, 0);
    // TODO: Fix it - I want to add groups to the wrap method.
    self.game.world.wrap(self.ghost1, 0);
    self.game.world.wrap(self.ghost2, 0);
    self.game.world.wrap(self.ghost3, 0);
    self.game.world.wrap(self.ghost4, 0);

    self.checkKeys();
};

PacmanGame.prototype.onEat = function (pacman, dot) {
    var self = this;
    dot.kill();
};

PacmanGame.prototype.onPacmanTouched = function () {
    var self = this;
    self.pacman.die();

    var explosion = this.game.add.sprite(0, 0, 'boom');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.x = self.pacman.x;
    explosion.y = self.pacman.y;

    var animation = explosion.animations.add('boom', [0,1,2,3,4], 10, false);
    explosion.animations.play('boom');
    animation.killOnComplete = true;
    animation.onComplete.add(self.restart, self);
}

PacmanGame.prototype.restart = function () {
    var self = this;
    self.game.state.start('Game');
}

/*
 *PacmanGame.prototype.render = function () {
 *    var self = this;
 *    //game.debug.bodyInfo(self.pacman, 32, 32);
 *    //game.debug.body(self.pacman);
 *
 *    //game.debug.bodyInfo(self.dots, 32, 32);
 *    //game.debug.body(self.dots);
 *
 *    //for (var t = 1; t < 5; t++)
 *    //{
 *        //if (self.directions[t] === null)
 *        //{
 *            //continue;
 *        //}
 *
 *        //var color = 'rgba(0,255,0,0.3)';
 *
 *        //if (self.directions[t].index !== self.safetile)
 *        //{
 *            //color = 'rgba(255,0,0,0.3)';
 *        //}
 *
 *        //if (t === self.current)
 *        //{
 *            //color = 'rgba(255,255,255,0.3)';
 *        //}
 *
 *        //self.game.debug.geom(new Phaser.Rectangle(self.directions[t].worldX, self.directions[t].worldY, 32, 32), color, true);
 *    //}
 *
 *    //self.game.debug.geom(self.turnPoint, '#ffff00');
 *    //self.game.debug.geom(self.ghostDestination, '#ffff00');
 *    //self.game.debug.bodyInfo(self.pacman, 10, 20);
 *    //self.game.debug.bodyInfo(self.ghost, 10, 20);
 *}
 */

// TODO: Extract to external plugin
PacmanGame.prototype.getPointTile = function (point, nonNull) {
    var self = this;
    var _point = point;
    // IF is needed because nonNull doesn't seem to work properly.
    if (_point.x / self.map.tileWidth === self.map.width) {
        _point.x--;
    }
    var tile = self.map.getTileWorldXY(_point.x, _point.y, undefined, undefined, self.layer, nonNull);
    return tile
};

// TODO: Extract to external plugin
PacmanGame.prototype.getPointTileXY = function (point) {
    var self = this;
    var tilePoint = new Phaser.Point();
    self.layer.getTileXY(point.x, point.y, tilePoint);
    return tilePoint;
};

// TODO: Extract to external plugin and rename it.
PacmanGame.prototype.getObjectTile = function (object, nonNull) {
    var self = this;
    return self.getPointTile(object.position, nonNull);
};

// TODO: Extract to external plugin
PacmanGame.prototype.getObjectTileXY = function (object) {
    var self = this;
    return self.getPointTileXY(object.position);
};

PacmanGame.prototype.getPointXYTile = function (point) {
    var self = this;
    return self.map.getTile(point.x, point.y)
}

PacmanGame.prototype.isSafeTile = function (tile) {
    var self = this;
    //if (!tile)
        //return false;
    //return tile.index === self.safetile;
    return tile !== null && tile.index === self.safetile;
};


// TODO: Extract to external plugin
PacmanGame.prototype.isJunction = function (tile) {
    var self = this;
    if (!tile) {
        return false;
    }
    var directions = [null, null, null, null, null];
    var index = self.layer.index;
    var x = tile.x;
    var y = tile.y;

    var result;
    directions = self.getTileNeighbors(tile);

    result = directions.filter(self.isSafeTile.bind(self));
    return result.length > 2;
};

// TODO: Implement tween=true.
PacmanGame.prototype.alignToTile = function (object, tween) {
    var self = this;
    var gridPoint = self.getObjectTileXY(object);
    var alignPoint = new Phaser.Point();

    alignPoint.x = (gridPoint.x * self.map.tileWidth) + (self.map.tileWidth / 2);
    alignPoint.y = (gridPoint.y * self.map.tileHeight) + (self.map.tileHeight / 2);

    object.position = alignPoint;
    object.body.reset(alignPoint.x, alignPoint.y);
};

PacmanGame.prototype.checkKeys = function () {
    var self = this;

    if (self.cursors.left.isDown && self.pacman.current !== Phaser.LEFT) {
        self.pacman.checkDirection(Phaser.LEFT);
    }
    else if (self.cursors.right.isDown && self.pacman.current !== Phaser.RIGHT) {
        self.pacman.checkDirection(Phaser.RIGHT);
    }

    else if (self.cursors.up.isDown && self.pacman.current !== Phaser.UP) {
        self.pacman.checkDirection(Phaser.UP);
    }

    else if (self.cursors.down.isDown && self.pacman.current !== Phaser.DOWN) {
        self.pacman.checkDirection(Phaser.DOWN);
    }
    else
    {
        self.pacman.turning = Phaser.NONE;
    }

    if (self.debugKey.isDown && !self.debugKey.isPressed) {
        console.log("Debug key pressed");
        self.debugKey.isPressed = true;
    }
    else if (self.debugKey.isUp && self.debugKey.isPressed) {
        self.debugKey.isPressed = false;
    }
}

PacmanGame.prototype.getTileNeighbors = function (tile, passableOnly) {
    var self = this;
    var neighbors = [null, null, null, null, null]
    var passableNeighbors = [];
    var index = self.layer.index;

    neighbors[Phaser.LEFT] = self.map.getTileLeft(index,   tile.x, tile.y, true);
    neighbors[Phaser.RIGHT] = self.map.getTileRight(index, tile.x, tile.y, true);
    neighbors[Phaser.UP] = self.map.getTileAbove(index,    tile.x, tile.y);
    neighbors[Phaser.DOWN] = self.map.getTileBelow(index,  tile.x, tile.y);

    if (passableOnly) {
        passableNeighbors = neighbors.filter(self.isSafeTile.bind(self));
        return passableNeighbors;
    }
    return neighbors;
};

PacmanGame.prototype.findPathToTile = function (fromTile, toTile) {
    var self = this;
    var toArray = function(elem){return [elem.x, elem.y];};
    var arrToTile = function(elem){return self.map.getTile(elem[0], elem[1])};

    var start = toArray(fromTile);
    var goal = toArray(toTile);

    var border = [];
    var cameFrom = {};
    var current;
    var neighbors;
    var node;
    cameFrom.start = null;
    border.push(start);
    while (border.length > 0) {
        current = border.shift();
        if (JSON.stringify(current) === JSON.stringify(goal)) {
            break;
        }
        neighbors = self.getTileNeighbors(arrToTile(current), true).map(toArray);
        for(var i = 0; i < neighbors.length; i++){
            node = neighbors[i];
            if (!cameFrom.hasOwnProperty(node)) {
                border.push(node);
                cameFrom[node] = current
            }
        }
    }
    return self.reconstructPath(cameFrom, start, goal);
}

PacmanGame.prototype.reconstructPath = function (cameFrom, start, goal) {
    var self = this;
    var current = goal;
    var path = [current];
    while (JSON.stringify(current) !== JSON.stringify(start)){
        current = cameFrom[current];
        path.push(current);
    }
    return path;
}

PacmanGame.prototype.getTurnPointsFromPath = function (path) {
    var self = this;
    // TODO: I feel in guts it may be more elegant.
    var turnPoints = [];
    var x, y;
    var prevX, prevY;
    var currentDirection;
    for (var i = 0 ; i < path.length; i++) {
        x = path[i][0];
        y = path[i][1];
        if (!prevX && !prevY){
            prevX = x;
            prevY = y;
            continue;
        }
        if (!currentDirection){
            if (x === prevX) {
                currentDirection = 'x';
            }
            else {
                currentDirection = 'y';
            }
            continue;
        }

        if (x === prevX && currentDirection === 'y') {
            currentDirection = 'x';
            turnPoints.push([prevX, prevY]);
        }
        else if (y === prevY && currentDirection === 'x') {
            currentDirection = 'y';
            turnPoints.push([prevX, prevY]);
        }

        prevX = x;
        prevY = y;

    }

    return turnPoints;
}

var game = new Phaser.Game(28 * 32, 37 * 32, Phaser.AUTO, "game");
game.state.add("Game", PacmanGame, true);
