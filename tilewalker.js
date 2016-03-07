// TODO: Maybe Crazy idea: Instead of polluting Ghost class with flags, have a
// TileWalker object that stores the walking state and goToTile() in that
// object. Would have also hasArrived() and similar methods.
var TileWalker = function (object) {
    var self = this;
    self.object = object;
    self.game = object.game;
    self.map = object.map;
    self.isGoingToTile = false;
    self.hasArrived = false;
    // TODO: If it changes, clear the state as the new target is set.
    self.targetTile = null;
    self.checkpoints = [];
    self.currentCheckpoint = null;
    // FIXME: Get rid of that one, or merge somehow cuurentCheckpoint wit this one.
    self.currentCheckpointTile = null;
};

TileWalker.prototype.goToTile = function (targetTile, callback, callback_arg) {
    var self = this;

    // TODO: Hook methods?
    // onStart
    if (!self.isGoingToTile || !self.isMoving()) {
        self.goToTileFinished = false;
        self.goToTileCalled = true;
        self.updateCheckPoints(targetTile);
        self.currentCheckpoint = self.checkpoints.pop();
        self.currentCheckpointTile = self.map.getTile(
            self.currentCheckpoint.x, self.currentCheckpoint.y)
        self.setDirection();
    }

    // in the middle
    var distance = self.game.math.distance(
            self.worldX(), self.worldY(),
            self.currentCheckpointTile.worldX, self.currentCheckpointTile.worldY);

    if (distance <= self.MAX_DISTANCE) {
        self.currentCheckpoint = self.checkpoints.pop();
        // on finished
        if (!self.currentCheckpoint) {
            self.goToTileFinished = true;
            if (callback) {
                callback(callback_arg);
            }
        }
        self.setDirection();
    }
};


TileWalker.prototype.updateCheckPoints = function (targetTile) {
    var self = this;
    var objectTile = self.game.getObjectTile(self, true);
    var path = self.game.findPathToTile(objectTile, targetTile);
    var checkpoints = self.game.getTurnPointsFromPath(path);
    checkpoints = checkpoints.map(makePoint);
    //checkpoints.unshift(self.game.getPointTileXY(target.position));
    checkpoints.unshift(makePoint([targetTile.x, targetTile.y]));
    self.checkpoints = checkpoints;
};


TileWalker.prototype.setDirection = function () {
    var self = this;
    var speed = self.object.speed;

    var selfTileXY = self.game.getObjectTileXY(self)
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

    if (!self.currentCheckpoint || !self.currentCheckpointTile){
        var cornerPath = self.cornerPath;
        cornerPath = cornerPath.map(makePoint);
        self.pathIterator = itertools.cycle(cornerPath);
        self.currentCheckpoint = self.pathIterator.next();
        self.currentCheckpointTile = self.game.getPointXYTile(self.currentCheckpoint);
    }

    var distance = self.game.math.distance(
            self.worldX(), self.worldY(),
            self.currentCheckpointTile.worldX, self.currentCheckpointTile.worldY);

    if (distance <= self.MAX_DISTANCE) {
        self.currentCheckpoint = self.pathIterator.next();
        self.currentCheckpointTile = self.game.getPointXYTile(self.currentCheckpoint);
        self.updateCheckPoints(self.currentCheckpointTile);
        self.game.alignToTile(self);
        self.setDirection();
    }
};
