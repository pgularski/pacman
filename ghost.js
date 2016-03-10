// TODO: Move it somewhere else
var makePoint = function (point_array) {
    return new Phaser.Point(point_array[0], point_array[1]);
};

// TODO: Move it somewhere else
var randomize = function(number, range) {
    return (function(number){
        number -= Math.floor(Math.random() * range);
        number += Math.floor(Math.random() * range);
        return number;
    })(number);
};


// TODO: Move it somewhere else
var getRandomizedTargetTile = function (ghost, target, factor) {
    var point = new Phaser.Point(
            randomize(target.x, ghost.width * factor),
            randomize(target.y, ghost.width * factor)
    );
    var virtualTarget = ghost.game.getPointTile(point);
    if (virtualTarget && ghost.game.isSafeTile(virtualTarget)) {
        return virtualTarget;
    }
    return ghost.game.getObjectTile(target, true);
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


// TODO: Tidy up the chasing algorithms. Remove duplicated code.
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


SlightlyRandomizedChasing = function (ghost) {
    var self = this;
    ChasingStrategy.call(self, ghost);
};
SlightlyRandomizedChasing.prototype = Object.create(ChasingStrategy.prototype);
SlightlyRandomizedChasing.prototype.constructor = SlightlyRandomizedChasing;


SlightlyRandomizedChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;
    var RANDOMNESS_FACTOR = 10;

    if (self.isPathUpdateNeeded()) {
        self.game.alignToTile(ghost);
        self.targetTile = getRandomizedTargetTile(ghost, target, RANDOMNESS_FACTOR);
    }
    self.ghost.tileWalker.goToTile(self.targetTile);
};


RandomizedChasing = function (ghost) {
    var self = this;
    ChasingStrategy.call(self, ghost);
};
RandomizedChasing.prototype = Object.create(ChasingStrategy.prototype);
RandomizedChasing.prototype.constructor = RandomizedChasing;

RandomizedChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;
    var RANDOMNESS_FACTOR = 30;

    if (self.isPathUpdateNeeded()) {
        self.game.alignToTile(ghost);
        self.targetTile = getRandomizedTargetTile(ghost, target, RANDOMNESS_FACTOR);
    }
    self.ghost.tileWalker.goToTile(self.targetTile);
};

Ghost = function (pacmanGameState, game, x, y, chasingStrategy, corner) {
    var self = this;
    Phaser.Sprite.call(self, game, x, y, 'ghost');

    // FIXME: make game a game and state a state because it's hard to get to a state when it's needed.
    self.game = pacmanGameState;
    self.map = self.game.map;
    self.layer = self.game.layer;

    self.anchor.set(0.5);
    self.animations.add('ghost', [0, 1, 2, 1], 10, true);
    self.play('ghost');

    self.game.physics.arcade.enable(self);
    self.body.setSize(32, 32, 0, 0);

    // TODO: This is too implicit. Move it to the PacmanGame object.
    self.game.add.existing(self);

    self.speed = 180;

    self.tileWalker = new TileWalker(self);

    self.chasingStrategy = new chasingStrategy(self);

    switch (corner) {
        case 1:
            self.cornerPath = [[1, 1], [6, 1], [6, 5], [1, 5]];
            break;
        case 2:
            self.cornerPath = [[26, 1], [26, 5], [21, 5], [21, 1]];
            break;
        case 3:
            self.cornerPath = [[1, 29], [1, 26], [6, 26], [6, 23], [9, 23], [9, 26], [12, 26], [12, 29]];
            break;
        case 4:
            self.cornerPath = [[26, 29], [15, 29], [15, 26], [18, 26], [18, 23], [21, 23], [21, 26], [26, 26]];
            break;
        default:
            self.cornerPath = [[1, 1], [6, 1], [6, 5], [1, 5]];
    }
    self.cornerPath = self.cornerPath.map(self.updateOffset.bind(self));

    self.cornerPath = self.cornerPath.map((function(point_array){
            return self.game.getPointXYTile(makePoint(point_array));
        })
    );

    self.state = 'doNothing';
    //self.state = 'goToTile';
    //self.state = 'cruise';
    // TODO: Replace with Phaser.Time.
    self.counter = 0;
    self.tile = null;

};
Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.updateOffset = function (point_array) {
    var self = this;
    return [point_array[0], point_array[1] + self.game.Y_OFFSET / self.map.tileHeight];
};

Ghost.prototype.worldX = function () {
    var self = this;
    return self.x - (self.body.width * self.anchor.x);
};

Ghost.prototype.worldY = function () {
    var self = this;
    return self.y - (self.body.height * self.anchor.y);
};

Ghost.prototype.isMoving = function () {
    var self = this;
    return self.tileWalker.isMoving();
};


Ghost.prototype.update = function () {
    var self = this;
    self.counter++;

    switch (self.state) {
        case 'doNothing':
            break;
        case 'goToTile':
            var tile = self.cornerPath[0];
            self.tileWalker.goToTile(tile,
                    (function(state){
                        self.state=state;
                        self.counter=0;
                        console.log('state updated: ' + self.state);
                    }), 'cruise'
            );
            break;
        case 'cruise':
            self.cruise();
            if (self.counter > 2e2) {
                self.state = 'chase';
                self.counter = 0;
            }
            break;
        case 'chase':
            self.chasingStrategy.chase(self.game.pacman);
            if (self.counter > 6e2) {
                self.state = 'goToTile';
                self.counter = 0;
            }
            break;
    }
};


Ghost.prototype.cruise = function () {
    var self = this;
    self.tileWalker.patrol(self.cornerPath);
};


Ghost.prototype.walkPath = function (tilePath) {
    var self = this;
    self.tileWalker.walkPath(tilePath);
};


Ghost.prototype.goHome = function () {
    var self = this;
    // TODO: Implement.
    var homeTile = null;
    self.tileWalker.goToTile(homeTile);
};


Ghost.prototype.walkRandomly = function () {
    var self = this;
    var randomTilePath = null;
    self.tileWalker.walkPath(tilePath);
};


Ghost.prototype.runAway = function (object) {
    var self = this;
    var objectTile = self.game.getObjectTile(object);
    var farAwayTile = null;
    self.tileWalker.goToTile(farAwayTile);
};


Ghost.prototype.enterHome = function () {
    var self = this;
};


Ghost.prototype.leaveHome = function () {
    var self = this;
};


Ghost.prototype.stayAtHome = function () {
    var self = this;
}
