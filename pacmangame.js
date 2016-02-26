// TODO: Extract ghost ocde to a separate file.
// TODO: Save Grid code for later use.
// TODO: Try to replace the Grid-related code with native methods.
// TODO: Replace all possible methods with native methods.
// TODO: Fix current ghost's algoritm.
// TODO: Change ghost's algoritm.
// TODO: Add another ghost.
// TODO: Update another ghost's algorithm.
// TODO: What are world, state and stage anyway?
// TODO: Rename ``object'' parameters to ``sprite''

/*
 * Variable name convention
 * point - Actual Phaser.Point of an object. ie. Phaser.Point(self.pacman.x, self.pacman.y)
 * gridPoint - Grid Phaser.Point of an object . ie. self.getCurrentGridPint(new Phaser.Point(self.pacman.x, self.pacman.y))
 */

"use strict";


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
    var tile = null;

    for (var i = 0; i < self.map.width; i++) {
        for (var j = 0; j < self.map.height; j++) {
            tile = self.map.getTile(i, j);
            if (tile.index !== self.safetile) {
                self.walls.add([tile.x, tile.y].toString());
            }
        }
    }
}


var PacmanGame = function(game) {
    var self = this;
    self.game = game;
    self.map = null;
    self.grid = null;
    self.layer = null;
    self.pacman = null;
    self.ghost = null;

    self.safetile = 1;

    self.speed = 150;
    self.threshold = 5;
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

    self.pacman = new Pacman(self, self.game, (12 * 32) + 16, (7 * 32) + 16);
    self.ghost = new Ghost(self, self.game, (1 * 32) + 16, (1 * 32) + 16);

    self.cursors = self.game.input.keyboard.createCursorKeys();
    self.debugKey = self.game.input.keyboard.addKey(Phaser.Keyboard.D);
    self.debugKey.isPressed = false;

    self.pacman.move(Phaser.RIGHT);

    // Trigger gameCreated to start tests.
    // TODO: There's definitely some better way of doing that.
    var event = new CustomEvent('gameCreated');
    window.dispatchEvent(event);
}

PacmanGame.prototype.update = function () {
    var self = this;
    self.physics.arcade.collide(self.pacman, self.layer);
    self.physics.arcade.collide(self.ghost, self.layer);

    self.checkKeys();

    if (self.pacman.turning !== Phaser.NONE)
    {
        self.pacman.turn();
    }
}


/*
 *PacmanGame.prototype.render = function () {
 *    var self = this;
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
PacmanGame.prototype.pointToTile = function (point) {
    var self = this;
    //var gridPoint = self.gridPointFromPoint(point);
    //return self.map.getTile(gridPoint.x, gridPoint.y);
    return self.map.getTileWorldXY(point.x, point.y,
                    self.map.tileWidth, self.map.tileHeight,
                    self.layer);
};

// TODO: Extract to external plugin
PacmanGame.prototype.getObjectGridPoint = function (object) {
    var self = this;
    var gridPoint = new Phaser.Point(
        self.getObjectGridX(object),
        self.getObjectGridY(object)
    );
    return gridPoint;
};

// TODO: Extract to external plugin
PacmanGame.prototype.getObjectTile = function (object) {
    var self = this;
    var tile = self.pointToTile(object.position);
    return tile;
};

// TODO: Extract to external plugin
PacmanGame.prototype.gridPointFromPoint = function (point) {
    var self = this;
    var gridPoint = new Phaser.Point(
        self.getGridX(point.x),
        self.getGridY(point.y)
    );
    return gridPoint;
};

// TODO: Extract to external plugin
PacmanGame.prototype.isJunction = function (tile) {
    var self = this;
    var directions = [null, null, null, null, null];
    var index = self.layer.index;
    var x = tile.x;
    var y = tile.y;

    var result;
    var isSafeTile = function (tile) {
        if (!tile)
            return false;
        return tile.index === self.safetile;
    };

    directions[Phaser.LEFT] = self.map.getTileLeft(index, x, y);
    directions[Phaser.RIGHT] = self.map.getTileRight(index, x, y);
    directions[Phaser.UP] = self.map.getTileAbove(index, x, y);
    directions[Phaser.DOWN] = self.map.getTileBelow(index, x, y);

    //result = directions.filter(self.inBounds.bind(self))
    result = directions.filter(isSafeTile.bind(self));
    return result.length > 2;
};


PacmanGame.prototype.alignToTile = function (object, tween=false) {
    // TODO: Implement tween=true.
    var self = this;
    var gridPoint = self.getObjectGridPoint(object);
    var alignPoint = new Phaser.Point();

    alignPoint.x = (gridPoint.x * self.map.tileWidth) + (self.map.tileWidth / 2);
    alignPoint.y = (gridPoint.y * self.map.tileHeight) + (self.map.tileHeight / 2);

    object.position = alignPoint;
    object.body.reset(alignPoint.x, alignPoint.y);

    //var tile = self.getObjectTile(object);

    //object.position = new Phaser.Point(tile.x ,tile.y);
    //object.body.reset(tile.x, tile.y);
};

// TODO: Extract to external plugin
PacmanGame.prototype.getGridX = function (x) {
    var self = this;
    return self.math.snapToFloor(Math.floor(x), self.map.tileWidth) / self.map.tileWidth;
};

// TODO: Extract to external plugin
PacmanGame.prototype.getGridY = function (y) {
    var self = this;
    return self.math.snapToFloor(Math.floor(y), self.map.tileHeight) / self.map.tileHeight;
};

// TODO: Extract to external plugin
PacmanGame.prototype.getObjectGridX = function (obj) {
    var self = this;
    return self.math.snapToFloor(Math.floor(obj.x), self.map.tileWidth) / self.map.tileWidth;
};

// TODO: Extract to external plugin
PacmanGame.prototype.getObjectGridY = function (obj) {
    var self = this;
    return self.math.snapToFloor(Math.floor(obj.y), self.map.tileHeight) / self.map.tileHeight;
};

PacmanGame.prototype.isInTurnPoint  = function (object) {
    var self = this;
    var objectGridPoint = self.getObjectGridPoint(object);
    var currentX = Math.floor(object.x);
    var currentY = Math.floor(object.y);
    var turnPoint = new Phaser.Point();
    turnPoint.x = (objectGridPoint.x * self.map.tileWidth) + (self.map.tileWidth / 2);
    turnPoint.y = (objectGridPoint.y * self.map.tileHeight) + (self.map.tileHeight / 2);
    if (self.math.fuzzyEqual(currentX, turnPoint.x, self.threshold) &&
        self.math.fuzzyEqual(currentY, turnPoint.y, self.threshold)){
        return true;
    }
    return false;
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
        self.findPathToPacman();
    }
    else if (self.debugKey.isUp && self.debugKey.isPressed) {
        self.debugKey.isPressed = false;
    }
}

PacmanGame.prototype.findPathToTile = function (fromTile, toTile) {
    var self = this;

    var graph = self.grid;
    var start = [fromTile.x, fromTile.y].toString();
    var goal = [toTile.x, toTile.y].toString();

    var border = [];
    var cameFrom = {};
    var current;
    var neighbors;
    var node;
    cameFrom.start = null;
    border.push(start);
    while (border.length > 0) {
        current = border.shift();
        if (current === goal) {
            break;
        }
        neighbors = graph.neighbors(current);
        for(var i = 0; i < neighbors.length; i++){
            node = neighbors[i];
            if (!cameFrom.hasOwnProperty(node)) {
                border.push(node);
                cameFrom[node] = current
            }
        }
    }
    //console.log(self.reconstructPath(cameFrom, start, goal));
    return self.reconstructPath(cameFrom, start, goal);
}

PacmanGame.prototype.reconstructPath = function (cameFrom, start, goal) {
    var current = goal;
    var path = [current];
    while (current !== start){
        current = cameFrom[current];
        path.push(current);
    }
    return path;
}

PacmanGame.prototype.findPathToPacman = function () {
    var self = this;
    var fromTile ;
    var toTile;
    return self.findPathToTile(
            self.getObjectTile(self.ghost),
            self.getObjectTile(self.pacman)
            );
}

PacmanGame.prototype.getTurnPointsFromPath = function (path) {
    // TODO: I feel in guts it may be more elegant.
    var turnPoints = [];
    var x, y;
    var prevX, prevY;
    var currentDirection;
    for (var i = 0 ; i < path.length; i++) {
        x = path[i].split(',')[0];
        y = path[i].split(',')[1];
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
            turnPoints.push([prevX, prevY].toString());
        }
        else if (y === prevY && currentDirection === 'x') {
            currentDirection = 'y';
            turnPoints.push([prevX, prevY].toString());
        }

        prevX = x;
        prevY = y;

    }

    return turnPoints;
}

var game = new Phaser.Game(28 * 32, 31 * 32, Phaser.AUTO, "game");
game.state.add("Game", PacmanGame, true);
