// TODO: Change the pathfinding algorithm to A*, instead of a simple breadth first search.
// FIXME: Key timer needs fixing
// TODO: Add 1UP
// TODO: Generic inner state handling

'use strict';


Pacman.Game = function(game) {
    var self = this;
    self.game = game;
    self.map;
    self.grid;
    self.layer;
    self.pacman;
    self.scoreText;
    self.readyText;
    self.currentKey;
    self.sfx;

    self.ghosts;
    self.ghost1;
    self.ghost2;
    self.ghost3;
    self.ghost4;

    self.score = 0;
    self.safetile = 1;
    self.safeTiles = [];

    self.Y_OFFSET = 4 * 32;
};


Pacman.Game.prototype.create = function () {
    var self = this;
    self.physics.startSystem(Phaser.Physics.ARCADE);

    self.SPEED = 220;

    self.lives = 3;

    self.initSfx();
    self.initMap();
    self.initDots();
    self.initText();
    self.initLandmarks();
    self.initPacman();
    self.initGhosts();

    self.cursors = self.game.input.keyboard.createCursorKeys();
    self.debugKey = self.game.input.keyboard.addKey(Phaser.Keyboard.D);
    self.debugKey.isPressed = false;

    self.safeTiles = self.layer
        .getTiles(0, 0, self.layer.width, self.layer.height)
        .filter(self.isSafeTile.bind(self))

    self.paused = false;
    self.game.time.events.add(Phaser.Timer.SECOND * 0, self.togglePause, self);
    self.game.time.events.add(Phaser.Timer.SECOND * 3, self.togglePause, self);

    self.swipeStartX = 0;
    self.swipeStartY = 0;
    self.game.input.onDown.add(self.beginSwipe, self);

    // Trigger gameCreated to start tests.
    var event = new CustomEvent('gameCreated');
    window.dispatchEvent(event);
};

Pacman.Game.prototype.initSfx = function () {
    var self = this;
    self.sfx = self.add.audio('sfx');
    self.sfx.allowMultiple = true;
    self.sfx.addMarker('sfxBigDot', 0, 0.4);
    self.sfx.addMarker('sfxDie', 2, 1.8);
    self.sfx.addMarker('sfxDot', 5, 1.8);
    self.sfx.addMarker('sfxEatGhost', 8, 0.6);
};


Pacman.Game.prototype.beginSwipe = function () {
    var self = this;
    console.log('beginSwipe');
    self.swipeStartX = self.game.input.worldX;
    self.swipeStartY = self.game.input.worldY;
    self.input.onDown.remove(self.beginSwipe);
    self.game.input.onUp.add(self.endSwipe, self);
};

Pacman.Game.prototype.endSwipe = function () {
    var self = this;
    console.log('endSwipe');
    var swipeEndX = self.game.input.worldX;
    var swipeEndY = self.game.input.worldY;
    var deltaX = self.swipeStartX - swipeEndX;
    var deltaY = self.swipeStartY - swipeEndY;
    var abs = Math.abs;

    if (abs(deltaX) > 2 * abs(deltaY) && abs(deltaX) > 10) {
        if (deltaX > 0) {
            console.log('Swipe LEFT');
            self.currentKey = Phaser.LEFT;
        }
        else {
            console.log('Swipe RIGHT');
            self.currentKey = Phaser.RIGHT;
        }
    }

    if (abs(deltaY) > 2 * abs(deltaX) && abs(deltaY) > 10) {
        if (deltaY > 0) {
            console.log('Swipe UP');
            self.currentKey = Phaser.UP;
        }
        else {
            console.log('Swipe DOWN');
            self.currentKey = Phaser.DOWN;
        }
    }

    self.game.input.onDown.add(self.beginSwipe, self);
    self.game.input.onUp.remove(self.endSwipe);
};

Pacman.Game.prototype.initMap = function () {
    var self = this;
    self.map = self.add.tilemap("map");
    self.map.addTilesetImage("tiles");
    // Display the layer from the map.json file. The name as in the json file.
    self.layer = self.map.createLayer('Layer1');
    self.map.setCollisionByExclusion([self.safetile], true, self.layer);
};

Pacman.Game.prototype.initText = function () {
    var self = this;
    self.scoreText = self.game.add.text(32, 32, "Score: 0", {fontsize: "32px", fill: "#fff"});
    self.readyText = self.game.add.text(
            12 * self.map.tileWidth, 21 * self.map.tileHeight,
            "Ready!", {fontsize: "32px", fill: "#fff"});
    self.readyText.anchor.setTo(0.5, 0);
    self.readyText.position.set(self.game.world.centerX, self.readyText.y);
    self.readyText.visible = false;

    self.livesText = self.game.add.text(
            self.map.tileWidth,
            self.map.heightInPixels - 2 * self.map.tileHeight,
            "Lives: " + self.lives,
            {fontsize: "32px", fill: "#fff"});

};

Pacman.Game.prototype.initDots = function () {
    var self = this;
    self.dots = self.add.group();
    self.dots.enableBody = true;
    self.map.createFromObjects('Objects', 25, 'dot', 0, true, false, self.dots);
    self.dots.callAll('body.setSize', 'body', 8, 8, 12, 12);

    self.bigDots = self.add.group();
    self.bigDots.enableBody = true;
    self.map.createFromObjects('Objects', 26, 'bigDot', 0, true, false, self.bigDots);
    self.bigDots.callAll('body.setSize', 'body', 8, 8, 12, 12);
    self.bigDots.callAll('animations.add', 'animations', 'blink', [0, 1], 10, true);
    self.bigDots.callAll('animations.play', 'animations', 'blink');
};

Pacman.Game.prototype.initLandmarks = function () {
    var self = this;
    self.pacmanStart = self.map.objects['Landmarks'][0];
    self.homeArea1 = self.map.objects['Landmarks'][1];
    self.homeArea2 = self.map.objects['Landmarks'][2];
    self.homeArea3 = self.map.objects['Landmarks'][3];
    self.homeDoor = self.map.objects['Landmarks'][4];
};

Pacman.Game.prototype.togglePause = function (gameOver) {
    var self = this;
    //self.game.paused = true;
    self.game.physics.arcade.isPaused = (self.game.physics.arcade.isPaused) ? false : true;
    if (self.paused)
    {
        self.game.tweens.resumeAll();
        self.readyText.visible = false;
    }
    else
    {
        self.game.tweens.pauseAll();
        if (!gameOver) {
            self.readyText.visible = true;
        }
    }
    self.paused = self.paused ? false : true;
}

Pacman.Game.prototype.initPacman = function () {
    var self = this;
    self.pacman = new Pacman.Pacman(self, self.game, 100, 100);
    self.pacman.position.set(self.pacmanStart.x, self.pacmanStart.y);
    self.pacman.move(Phaser.LEFT);
    self.game.add.existing(self.pacman);
    self.pacman.scale.x = -2;
    self.pacman.scale.y = 2;
    self.pacman.body.setSize(16, 16, 0, 0);
};

Pacman.Game.prototype.initGhosts = function () {
    var self = this;
    self.ghosts = self.add.group();
    self.ghost1 = new Pacman.Ghost(self, self.game, 0, 0, Pacman.StraightToThePointChasing, 2, 'stayAtDoor');
    self.ghost2 = new Pacman.Ghost(self, self.game, 0, 0, Pacman.SlightlyRandomizedChasing, 1);
    self.ghost3 = new Pacman.Ghost(self, self.game, 0, 0, Pacman.RandomizedChasing, 3);
    self.ghost4 = new Pacman.Ghost(self, self.game, 0, 0, Pacman.RandomizedChasing, 4);
    self.ghosts.add(self.ghost1);
    self.ghosts.add(self.ghost2);
    self.ghosts.add(self.ghost3);
    self.ghosts.add(self.ghost4);

    self.ghost1.position.set(self.homeDoor.x, self.homeDoor.y);
    self.ghost2.position.set(self.homeArea1.x, self.homeArea1.y);
    self.ghost3.position.set(self.homeArea2.x, self.homeArea2.y);
    self.ghost4.position.set(self.homeArea3.x, self.homeArea3.y);
}

Pacman.Game.prototype.update = function () {
    var self = this;
    self.physics.arcade.collide(self.pacman, self.layer);
    //self.physics.arcade.collide(self.pacman, self.ghosts);
    self.physics.arcade.collide(self.ghosts, self.layer);
    self.game.physics.arcade.overlap(self.pacman, self.ghosts, self.onPacmanTouched, null, this);
    self.game.physics.arcade.overlap(self.pacman, self.dots, self.onEat, null, this);
    self.game.physics.arcade.overlap(self.pacman, self.bigDots, self.onBigDotEat, null, this);

    self.game.world.wrap(self.pacman);
    self.ghosts.forEach(function(ghost) {self.game.world.wrap(ghost)}, self);

    self.updateCurrentKey();
    self.checkKeys();
};

Pacman.Game.prototype.onEat = function (pacman, dot) {
    var self = this;
    self.sfx.play('sfxDot');
    self.score += 10;
    self.scoreText.text = "Score: " + self.score;
    dot.kill();

    if (self.dots.countLiving() === 0 && self.bigDots.countLiving() === 0) {
        self.restart();
    }
};

Pacman.Game.prototype.onBigDotEat = function (pacman, dot) {
    var self = this;
    self.sfx.play('sfxBigDot');
    self.score += 50;
    self.scoreText.text = "Score: " + self.score;
    dot.kill();
    self.ghosts.callAll('onBigDotEaten');

    if (self.dots.countLiving() === 0 && self.bigDots.countLiving() === 0) {
        self.restart();
    }
};


Pacman.Game.prototype.onPacmanTouched = function (pacman, ghost) {
    var self = this;

    if (arraytools.inArray(['goHome'], ghost.state)) {
        return;
    }
    if (arraytools.inArray(['walkRandomly', 'enterHome'], ghost.state)) {
        self.sfx.play('sfxEatGhost');
        ghost.onGhostEaten();
        return;
    }
    if (!self.pacman.isAlive) {
        return;
    }
    self.sfx.play('sfxDie');
    self.pacman.die();
    self.lives--;
    self.livesText.text = "Lives: " + self.lives;

    var explosion = this.game.add.sprite(0, 0, 'boom');
    explosion.anchor.setTo(0.5, 0.5);
    explosion.x = self.pacman.x;
    explosion.y = self.pacman.y;

    var animation = explosion.animations.add('boom', [0,1,2,3,4], 10, false);
    if (self.lives > 0) {
        animation.onComplete.add(self.restart, self);
    }
    else
    {
        animation.onComplete.add(self.onGameOver, self);
    }
    explosion.animations.play('boom');
    animation.killOnComplete = true;
}

Pacman.Game.prototype.onGameOver = function () {
   var self = this;
   self.gameOverText = self.game.add.text(0, 0,
            "Game Over", {fontsize: "32px", fill: "#fff"});
   self.gameOverText.anchor.setTo(0.5, 0.5);
   self.gameOverText.position.setTo(self.game.world.centerX, self.game.world.centerY);
   self.togglePause(true);
   self.game.time.events.add(Phaser.Timer.SECOND * 4, self.togglePause, self);
   self.game.time.events.add(Phaser.Timer.SECOND * 4, self.goToMainMenu, self);
}

Pacman.Game.prototype.goToMainMenu = function () {
    var self = this;
    self.state.start('MainMenu');
}

Pacman.Game.prototype.restart = function () {
    var self = this;
    //self.game.state.start('Game');
    self.game.time.events.add(Phaser.Timer.SECOND * 0, self.togglePause, self);
    self.game.time.events.add(Phaser.Timer.SECOND * 4, self.togglePause, self);

    self.pacman.destroy();
    self.ghosts.destroy();

    if (self.dots.countLiving() === 0 && self.bigDots.countLiving() === 0) {
        self.dots.destroy();
        self.bigDots.destroy();
        self.initDots();
    }
    self.initPacman();
    self.initGhosts();

}

/*
 *Pacman.Game.prototype.render = function () {
 *    var self = this;
 *    game.debug.bodyInfo(self.ghost1, 32, 64);
 *    game.debug.body(self.ghost1);
 *    var checkpoint = self.ghost1.tileWalker.currentCheckpoint;
 *    var checkpointTile = self.ghost1.tileWalker.currentCheckpointTile;
 *    var color = 'rgba(255, 0, 0, 1)';
 *    if (checkpoint)
 *    {
 *        self.game.debug.geom(
 *                new Phaser.Rectangle(checkpoint.x * self.map.tileHeight,
 *                                     checkpoint.y * self.map.tileHeight,
 *                                     32, 32), color, true);
 *    }
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
 *
 */
// TODO: Extract to external plugin
Pacman.Game.prototype.getPointTile = function (point, nonNull) {
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
Pacman.Game.prototype.getPointTileXY = function (point) {
    var self = this;
    var tilePoint = new Phaser.Point();
    self.layer.getTileXY(point.x, point.y, tilePoint);
    return tilePoint;
};

// TODO: Extract to external plugin and rename it.
Pacman.Game.prototype.getObjectTile = function (object, nonNull) {
    var self = this;
    return self.getPointTile(object.position, nonNull);
};

// TODO: Extract to external plugin
Pacman.Game.prototype.getObjectTileXY = function (object) {
    var self = this;
    return self.getPointTileXY(object.position);
};

Pacman.Game.prototype.getPointXYTile = function (point) {
    var self = this;
    return self.map.getTile(point.x, point.y)
}

Pacman.Game.prototype.isSafeTile = function (tile) {
    var self = this;
    return tile !== null && tile.index === self.safetile;
};


// TODO: Extract to external plugin
Pacman.Game.prototype.isJunction = function (tile) {
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
Pacman.Game.prototype.alignToTile = function (object, tween) {
    var self = this;
    var gridPoint = self.getObjectTileXY(object);
    var alignPoint = new Phaser.Point();

    alignPoint.x = (gridPoint.x * self.map.tileWidth) + (self.map.tileWidth * 0.5);
    alignPoint.y = (gridPoint.y * self.map.tileHeight) + (self.map.tileHeight * 0.5);

    object.position = alignPoint;
    object.body.reset(alignPoint.x, alignPoint.y);
};

Pacman.Game.prototype.keyPressTimedOut = function () {
    var self = this;
    self.currentKey = null;
}

Pacman.Game.prototype.updateCurrentKey = function () {
    var self = this;

    if (self.cursors.left.isDown) {
        self.currentKey = Phaser.LEFT;
        self.game.time.events.add(Phaser.Timer.SECOND * 0.3, self.keyPressTimedOut, self);
    }
    else if (self.cursors.right.isDown) {
        self.currentKey = Phaser.RIGHT;
        self.game.time.events.add(Phaser.Timer.SECOND * 0.3, self.keyPressTimedOut, self);
    }
    else if (self.cursors.up.isDown) {
        self.currentKey = Phaser.UP;
        self.game.time.events.add(Phaser.Timer.SECOND * 0.3, self.keyPressTimedOut, self);
    }
    else if (self.cursors.down.isDown) {
        self.currentKey = Phaser.DOWN;
        self.game.time.events.add(Phaser.Timer.SECOND * 0.3, self.keyPressTimedOut, self);
    }
};


Pacman.Game.prototype.checkKeys = function () {
    var self = this;

    if (self.currentKey === Phaser.LEFT && self.pacman.current !== Phaser.LEFT) {
        self.pacman.checkDirection(Phaser.LEFT);
    }
    else if (self.currentKey === Phaser.RIGHT && self.pacman.current !== Phaser.RIGHT) {
        self.pacman.checkDirection(Phaser.RIGHT);
    }
    else if (self.currentKey === Phaser.UP && self.pacman.current !== Phaser.UP) {
        self.pacman.checkDirection(Phaser.UP);
    }
    else if (self.currentKey === Phaser.DOWN && self.pacman.current !== Phaser.DOWN) {
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

Pacman.Game.prototype.getTileNeighbors = function (tile, passableOnly) {
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

Pacman.Game.prototype.findPathToTile = function (fromTile, toTile) {
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
    cameFrom[start] = null;
    border.push(start);
    while (border.length > 0) {
        current = border.shift();
        if (arraytools.isEqual(current, goal)) {
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

Pacman.Game.prototype.reconstructPath = function (cameFrom, start, goal) {
    var self = this;
    var current = goal;
    var path = [current];
    while (!arraytools.isEqual(current, start)) {
        current = cameFrom[current];
        path.push(current);
    }
    return path;
}

Pacman.Game.prototype.getTurnPointsFromPath = function (path) {
    var self = this;
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
