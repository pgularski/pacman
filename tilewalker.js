var TileWalker = function (object) {
    var self = this;
    self.object = object;
    self.game = object.game;
    self.map = object.map;
    // TODO: A duplicate of hasArrived?
    self.hasTarget = false;
    self.hasArrived = false;
    // TODO: If it changes, clear the state as the new target is set.
    self.targetTile = null;
    self.checkpoints = [];
    self.currentCheckpoint = null;
    self.isPatroling = false;
    self.pathIterator = null;

    self.MAX_DISTANCE = 3;
};

TileWalker.prototype.goToTile = function (targetTile, callback, callback_arg) {
    var self = this;
    //self.object.speed = 60;

    if (targetTile !== self.targetTile) {
        // TODO: Reset the path and everything!
        //console.log('different tile');
        self.hasArrived = false;
        self.hasTarget = false;
    }

    if (self.hasArrived) {
        //console.log('has arrived');
        return;
    }

    // TODO: Hook methods?
    // onStart
    if (!self.hasTarget || !self.isMoving()) {
        //console.log('not going/not moving');
        //console.log('Calculating path');
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
        //console.log('small distance');
        self.currentCheckpoint = self.checkpoints.pop();
        self.game.alignToTile(self.object);

        // on finished
        if (!self.currentCheckpoint) {
            //console.log('has arrived');
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


TileWalker.prototype.updateCheckPoints = function (targetTile) {
    var self = this;
    self.object.body.velocity.setTo(0, 0);
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
    var anchorValue = {x: self.object.body.width * self.object.anchor.x,
                       y: self.object.body.height * self.object.anchor.y}
    var x = self.currentCheckpoint.x * self.map.tileWidth + anchorValue.x;
    var y = self.currentCheckpoint.y * self.map.tileHeight + anchorValue.y;
    self.game.physics.arcade.moveToXY(self.object, x, y, speed);
};


TileWalker.prototype.isMoving = function () {
    var self = this;
    return !(self.object.body.deltaX() === 0 && self.object.body.deltaY() === 0)
};


TileWalker.prototype.patrol = function (arrayOfTiles) {
    var self = this;
    if (!self.isPatroling) {
        self.pathIterator = itertools.cycle(arrayOfTiles);
        self.isPatroling = true;
    }
    if (!self.hasTarget) {
        self.goToTile(self.pathIterator.next());
        //console.log('Patroling to a new tile: ' + self.targetTile.x + ' ' + self.targetTile.y);
    }
    else {
        self.goToTile(self.targetTile);
    }
};
