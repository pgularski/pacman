"use strict";

var getRandomizedTargetTile = function (ghost, target, factor) {
    var x = target.x - factor * ghost.map.tileHeight;
    var y = target.y - factor * ghost.map.tileWidth;
    var width = target.x + factor * ghost.map.tileHeight;
    var height = target.y + factor * ghost.map.tileWidth;

    var safeTiles = ghost.layer.getTiles(x, y, width, height)
        .filter(ghost.game.isSafeTile.bind(ghost.game));

    return random.choice(safeTiles);

};

Pacman.ChasingStrategy = function (ghost) {
    var self = this;
    self.ghost = ghost;
    self.game = ghost.game;
    self.targetTile = null;
    self.junctionEntered = false;
    self.junctionLeft = false;
    self.MAX_DISTANCE = 3;
    self.justAligned = false;
    var RANDOMNESS_FACTOR = 0;
}

// TODO: Rename this method as it does more than just a check.
Pacman.ChasingStrategy.prototype.isPathUpdateNeeded = function () {
    var self = this;
    var ghost = self.ghost;
    var currentTile = self.game.getObjectTile(ghost, true);

    var distance = self.game.math.distance(
            self.ghost.worldX(), self.ghost.worldY(),
            currentTile.worldX, currentTile.worldY);

    if (!self.game.isJunction(currentTile)) {
        self.justAligned = false;
    }

    if (!self.targetTile || !self.ghost.isMoving() ||
            (!self.justAligned & self.game.isJunction(currentTile) && distance <= self.MAX_DISTANCE)) {
        self.justAligned = true;
        return true;
    }
    return false;
};


Pacman.StraightToThePointChasing = function (ghost) {
    var self = this;
    Pacman.ChasingStrategy.call(self, ghost);
};
Pacman.StraightToThePointChasing.prototype = Object.create(Pacman.ChasingStrategy.prototype);
Pacman.StraightToThePointChasing.prototype.constructor = Pacman.StraightToThePointChasing;

Pacman.StraightToThePointChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;

    if (self.isPathUpdateNeeded()) {
        self.game.alignToTile(ghost);
        self.targetTile = ghost.game.getObjectTile(target);
    }
    self.ghost.tileWalker.goToTile(self.targetTile);

};

Pacman.RandomizedChasing = function (ghost) {
    var self = this;
    Pacman.ChasingStrategy.call(self, ghost);
    self.RANDOMNESS_FACTOR = 10;
};
Pacman.RandomizedChasing.prototype = Object.create(Pacman.ChasingStrategy.prototype);
Pacman.RandomizedChasing.prototype.constructor = Pacman.RandomizedChasing;

Pacman.RandomizedChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;

    if (self.isPathUpdateNeeded()) {
        self.game.alignToTile(ghost);
        self.targetTile = getRandomizedTargetTile(ghost, target, self.RANDOMNESS_FACTOR);
    }
    self.ghost.tileWalker.goToTile(self.targetTile);
};

Pacman.SlightlyRandomizedChasing = function (ghost) {
    var self = this;
    Pacman.RandomizedChasing.call(self, ghost);
    self.RANDOMNESS_FACTOR = 5;
};
Pacman.SlightlyRandomizedChasing.prototype = Object.create(Pacman.RandomizedChasing.prototype);
Pacman.SlightlyRandomizedChasing.prototype.constructor = Pacman.SlightlyRandomizedChasing;
