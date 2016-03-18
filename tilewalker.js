"use strict";

Pacman.TileWalker = function (object) {
    var self = this;
    self.object = object;
    self.game = object.game;
    self.map = object.map;
    self.hasTarget = false;
    self.hasArrived = false;
    self.targetTile = null;
    self.checkpoints = [];
    self.currentCheckpoint = null;
    self.isPatroling = false;
    self.pathIterator = null;

    self.MAX_DISTANCE = 3;
};

Pacman.TileWalker.prototype.goToTile = function (targetTile, callback, callback_arg) {
    var self = this;

    if (targetTile !== self.targetTile) {
        self.hasArrived = false;
        self.hasTarget = false;
    }

    if (self.hasArrived) {
        return;
    }

    // TODO: Hook methods?
    // onStart
    if (!self.hasTarget || !self.isMoving()) {
        self.hasTarget = true;
        self.hasArrived = false;
        self.targetTile = targetTile;
        self.updateCheckPoints(targetTile);
        self.currentCheckpoint = self.checkpoints.pop();
        //self.game.alignToTile(self.object);
        self.setDirection();
    }

    // in the middle
    var checkpointX = self.currentCheckpoint.x * self.map.tileWidth;
    var checkpointY = self.currentCheckpoint.y * self.map.tileHeight;
    var distance = self.game.math.distance(
            self.object.worldX(), self.object.worldY(),
            checkpointX, checkpointY);

    if (distance <= self.MAX_DISTANCE) {
        self.currentCheckpoint = self.checkpoints.pop();
        self.game.alignToTile(self.object);

        // on finished
        if (!self.currentCheckpoint) {
            self.hasArrived = true;
            self.hasTarget = false;

            if (callback) {
                callback(callback_arg);
            }

            self.object.body.velocity.setTo(0, 0);
        }
        else {
            self.setDirection();

        }
    }
};


Pacman.TileWalker.prototype.updateCheckPoints = function (targetTile) {
    var self = this;
    //self.object.body.velocity.setTo(0, 0);
    var objectTile = self.game.getObjectTile(self.object);
    var path = self.game.findPathToTile(objectTile, targetTile);
    var checkpoints = self.game.getTurnPointsFromPath(path);
    checkpoints = checkpoints.map(arrayToPoint);
    checkpoints.unshift(arrayToPoint([targetTile.x, targetTile.y]));
    self.checkpoints = checkpoints;
};


Pacman.TileWalker.prototype.setDirection = function () {
    var self = this;
    var speed = self.object.speed;
    var anchorValue = {x: self.object.body.width * self.object.anchor.x,
                       y: self.object.body.height * self.object.anchor.y}
    var x = self.currentCheckpoint.x * self.map.tileWidth + anchorValue.x;
    var y = self.currentCheckpoint.y * self.map.tileHeight + anchorValue.y;
    //self.game.physics.arcade.moveToXY(self.object, x, y, speed);

    if (self.object.x < x){
        self.object.body.velocity.x = speed;
    }
    else if (self.object.x > x) {
        self.object.body.velocity.x = -speed;
    }
    else if (self.object.y < y) {
        self.object.body.velocity.y = speed;
    }
    else if (self.object.y > y) {
        self.object.body.velocity.y = -speed;
    }
};


Pacman.TileWalker.prototype.isMoving = function () {
    var self = this;
    return !(self.object.body.deltaX() === 0 && self.object.body.deltaY() === 0)
};


Pacman.TileWalker.prototype.patrol = function (arrayOfTiles) {
    var self = this;
    if (!self.isPatroling) {
        self.pathIterator = itertools.cycle(arrayOfTiles);
        self.isPatroling = true;
    }
    if (!self.hasTarget) {
        self.goToTile(self.pathIterator.next());
    }
    else {
        self.goToTile(self.targetTile);
    }
};
