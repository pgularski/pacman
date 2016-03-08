// TODO: Maybe Crazy idea: Instead of polluting Ghost class with flags, have a
// TileWalker object that stores the walking state and goToTile() in that
// object. Would have also hasArrived() and similar methods.
var TileWalker = function (object) {
    var self = this;
    self.object = object;
    self.game = object.game;
    self.map = object.map;
    // TODO: A duplicate of hasArrived?
    self.isGoingToTile = false; // TODO: Replace with self.hasTarget = false;
    self.hasArrived = false;
    // TODO: If it changes, clear the state as the new target is set.
    self.targetTile = null;
    self.checkpoints = [];
    self.currentCheckpoint = null;
    // FIXME: Get rid of that one, or merge somehow cuurentCheckpoint wit this one.
    self.currentCheckpointTile = null;
    self.isPatroling = false;
    self.pathIterator = null;

    self.MAX_DISTANCE = 3;
};

TileWalker.prototype.goToTile = function (targetTile, callback, callback_arg) {
    var self = this;

    if (targetTile !== self.targetTile) {
        // TODO: Reset the path and everything!
        self.hasArrived = false;
        self.isGoingToTile = false;
    }

    if (self.hasArrived) {
        return;
    }

    // TODO: Hook methods?
    // onStart
    if (!self.isGoingToTile || !self.isMoving()) {
        console.log('Calculating path');
        self.isGoingToTile = true;
        self.hasArrived = false;
        self.targetTile = targetTile;
        self.updateCheckPoints(targetTile);
        self.currentCheckpoint = self.checkpoints.pop();
        self.currentCheckpointTile = self.map.getTile(
            self.currentCheckpoint.x, self.currentCheckpoint.y)
        self.setDirection();
    }

    // in the middle
    var distance = self.game.math.distance(
            self.object.worldX(), self.object.worldY(),
            self.currentCheckpointTile.worldX, self.currentCheckpointTile.worldY);

    if (distance <= self.MAX_DISTANCE) {
        self.currentCheckpoint = self.checkpoints.pop();
        self.game.alignToTile(self.object);

        // on finished
        if (!self.currentCheckpoint) {
            console.log('has arrived');
            self.hasArrived = true;
            self.isGoingToTile = false;

            if (callback) {
                callback(callback_arg);
            }

            self.object.body.velocity.setTo(0, 0);
        }
        else {
            self.setDirection();

            self.currentCheckpointTile = self.map.getTile(
                self.currentCheckpoint.x, self.currentCheckpoint.y)
        }
    }
};


TileWalker.prototype.updateCheckPoints = function (targetTile) {
    var self = this;
    var objectTile = self.game.getObjectTile(self.object);
    var path = self.game.findPathToTile(objectTile, targetTile);
    var checkpoints = self.game.getTurnPointsFromPath(path);
    checkpoints = checkpoints.map(makePoint);
    //checkpoints.unshift(self.game.getPointTileXY(target.position));
    checkpoints.unshift(makePoint([targetTile.x, targetTile.y]));
    // TODO: Ceckpoints should be tiles;
    self.checkpoints = checkpoints;
};


TileWalker.prototype.setDirection = function () {
    var self = this;
    var speed = self.object.speed;

    var selfTileXY = self.game.getObjectTileXY(self.object)
    if (!self.currentCheckpoint) {
        return;
    }

    if (selfTileXY.x < self.currentCheckpoint.x) {
        self.object.body.velocity.x = speed;
    }
    else if (selfTileXY.x > self.currentCheckpoint.x) {
        self.object.body.velocity.x = -speed;
    }
    else if (selfTileXY.y < self.currentCheckpoint.y) {
        self.object.body.velocity.y = speed;
    }
    else if (selfTileXY.y > self.currentCheckpoint.y) {
        self.object.body.velocity.y = -speed;
    }
};


TileWalker.prototype.isMoving = function () {
    var self = this;
    return !(self.object.body.deltaX() === 0 && self.object.body.deltaY() === 0)
};


TileWalker.prototype.patrol = function (arrayOfTiles) {
    var self = this;
    if (!self.isPatroling) {
        self.pathIterator = itertools.cycle(arrayOfTiles);
    }
    self.goToTile(self.pathIterator.next());
};