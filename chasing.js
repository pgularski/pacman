// TODO: Move it somewhere else
var getRandomizedTargetTile = function (ghost, target, factor) {
    var x = target.x - factor * ghost.map.tileHeight;
    var y = target.y - factor * ghost.map.tileWidth;
    var width = target.x + factor * ghost.map.tileHeight;
    var height = target.y + factor * ghost.map.tileWidth;

    var safeTiles = ghost.layer.getTiles(x, y, width, height)
        .filter(ghost.game.isSafeTile.bind(ghost.game));

    return random.choice(safeTiles);

};

ChasingStrategy = function (ghost) {
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
ChasingStrategy.prototype.isPathUpdateNeeded = function () {
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


StraightToThePointChasing = function (ghost) {
    var self = this;
    ChasingStrategy.call(self, ghost);
};
StraightToThePointChasing.prototype = Object.create(ChasingStrategy.prototype);
StraightToThePointChasing.prototype.constructor = StraightToThePointChasing;

StraightToThePointChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;

    if (self.isPathUpdateNeeded()) {
        self.game.alignToTile(ghost);
        self.targetTile = ghost.game.getObjectTile(target);
    }
    self.ghost.tileWalker.goToTile(self.targetTile);

};

RandomizedChasing = function (ghost) {
    var self = this;
    ChasingStrategy.call(self, ghost);
    self.RANDOMNESS_FACTOR = 10;
};
RandomizedChasing.prototype = Object.create(ChasingStrategy.prototype);
RandomizedChasing.prototype.constructor = RandomizedChasing;

RandomizedChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;

    if (self.isPathUpdateNeeded()) {
        self.game.alignToTile(ghost);
        self.targetTile = getRandomizedTargetTile(ghost, target, self.RANDOMNESS_FACTOR);
    }
    self.ghost.tileWalker.goToTile(self.targetTile);
};

SlightlyRandomizedChasing = function (ghost) {
    var self = this;
    RandomizedChasing.call(self, ghost);
    self.RANDOMNESS_FACTOR = 5;
};
SlightlyRandomizedChasing.prototype = Object.create(RandomizedChasing.prototype);
SlightlyRandomizedChasing.prototype.constructor = SlightlyRandomizedChasing;


