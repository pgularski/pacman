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


