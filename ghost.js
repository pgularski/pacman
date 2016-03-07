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


// TODO: Tidy up the chasing algorithms. Remove duplicated code.
StraightToThePointChasing = function (ghost) {
    var self = this;
    self.ghost = ghost;
};

StraightToThePointChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;

    if (ghost.checkpoints.length === 0 || ghost.game.isJunction(ghost.game.getObjectTile(ghost, true))
        || (ghost.body.deltaX() === 0 && ghost.body.deltaY() ===0)) {
        ghost.updateCheckPoints(ghost.game.getObjectTile(target, true));
        ghost.currentCheckpoint = ghost.checkpoints.pop();
        ghost.currentCheckpointTile = ghost.game.getPointXYTile(ghost.currentCheckpoint);
        ghost.setDirection();
    }
    var distance = ghost.game.math.distance(
            ghost.worldX(), ghost.worldY(),
            ghost.currentCheckpointTile.worldX, ghost.currentCheckpointTile.worldY);

    if (distance <= ghost.MAX_DISTANCE) {
        ghost.currentCheckpoint = ghost.checkpoints.pop();
        ghost.setDirection();
    }
};


SlightlyRandomizedChasing = function (ghost) {
    var self = this;
    self.ghost = ghost;
};


SlightlyRandomizedChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;

    var virtualTarget = getRandomizedTargetTile(ghost, target, 10);

    if (ghost.checkpoints.length === 0 || ghost.game.isJunction(ghost.game.getObjectTile(ghost, true))
        || (ghost.body.deltaX() === 0 && ghost.body.deltaY() ===0)) {
        ghost.updateCheckPoints(virtualTarget);
        ghost.currentCheckpoint = ghost.checkpoints.pop();
        ghost.currentCheckpointTile = ghost.map.getTile(
            ghost.currentCheckpoint.x, ghost.currentCheckpoint.y)
        ghost.setDirection();
    }
    var distance = ghost.game.math.distance(
            ghost.worldX(), ghost.worldY(),
            ghost.currentCheckpointTile.worldX, ghost.currentCheckpointTile.worldY);

    if (distance <= ghost.MAX_DISTANCE) {
        ghost.currentCheckpoint = ghost.checkpoints.pop();
        ghost.setDirection();
    }
};


RandomizedChasing = function (ghost) {
    var self = this;
    self.ghost = ghost;
};


RandomizedChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;

    var virtualTarget = getRandomizedTargetTile(ghost, target, 30);

    if (ghost.checkpoints.length === 0 || ghost.game.isJunction(ghost.game.getObjectTile(ghost, true))
        || (ghost.body.deltaX() === 0 && ghost.body.deltaY() ===0)) {
        ghost.updateCheckPoints(virtualTarget);
        ghost.currentCheckpoint = ghost.checkpoints.pop();
        ghost.checkpoints.unshift(ghost.currentCheckpoint);
        ghost.currentCheckpointTile = ghost.map.getTile(
            ghost.currentCheckpoint.x, ghost.currentCheckpoint.y)
        ghost.setDirection();
    }
    var x = ghost.x - (ghost.body.width * ghost.anchor.x);
    var y = ghost.y - (ghost.body.height * ghost.anchor.y);

    //var currentCheckpointPoint = new Phaser.Point(
            //currentCheckpointTile.worldX, currentCheckpointTile.worldY);
    //game.debug.geom(currentCheckpointPoint, '#ffff00');

    var distance = ghost.game.math.distance(
            x, y,
            ghost.currentCheckpointTile.worldX, ghost.currentCheckpointTile.worldY);

    if (distance <= ghost.MAX_DISTANCE) {
        ghost.currentCheckpoint = ghost.checkpoints.pop();
        ghost.checkpoints.unshift(ghost.currentCheckpoint);
        ghost.setDirection();
    }
};


Ghost = function (pacmanGameState, game, x, y, chasingStrategy, corner) {
    var self = this;
    Phaser.Sprite.call(self, game, x, y, 'ghost');

    // FIXME: make game a game and state a state becaus it's hard to get to a state when it's needed.
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

    // TODO: These should go to TileWalker.
    self.checkpoints = [];
    self.currentCheckpoint = new Phaser.Point();
    self.currentCheckpointTile = null;
    self.pathIterator = null;

    self.tileWalker = new TileWalker(self);

    self.threshold = 5;
    self.MAX_DISTANCE = 3;

    self.chasingStrategy = new chasingStrategy(self);

    switch (corner) {
        case 1:
            self.cornerPath = [[1, 1], [6, 1], [6, 5], [1, 5]]
            break;
        case 2:
            self.cornerPath = [[26, 1], [26, 5], [21, 5], [21, 1]]
            break;
        case 3:
            self.cornerPath = [[1, 29], [1, 26], [6, 26], [6, 23], [9, 23], [9, 26], [12, 26], [12, 29]]
            break;
        case 4:
            self.cornerPath = [[26, 29], [15, 29], [15, 26], [18, 26], [18, 23], [21, 23], [21, 26], [26, 26]]
            break;
        default:
            self.cornerPath = [[1, 1], [6, 1], [6, 5], [1, 5]]
    }

    //self.state = 'goToTile';
    self.state = 'cruise';
    // TODO: Replace with Phaser.Time.
    self.counter = 0;

};
Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.worldX = function () {
    var self = this;
    return self.x - (self.body.width * self.anchor.x);
};

Ghost.prototype.worldY = function () {
    var self = this;
    return self.y - (self.body.height * self.anchor.y);
};

Ghost.prototype.update = function () {
    var self = this;
    self.counter++;

    /* Below depends on the state. Implement 'self.state.update();' */
    //self.chasingStrategy.chase(self.game.pacman);
    //self.cruise();
    //self.goHome();
    //self.flee();
    //self.goToTile(self.game.getPointXYTile(makePoint(self.cornerPath[0])));

    switch (self.state) {
        case 'goToTile':
            var tile = self.game.getPointXYTile(makePoint(self.cornerPath[0]);
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


Ghost.prototype.updateCheckPoints = function (targetTile) {
    var self = this;
    var objectTile = self.game.getObjectTile(self, true);
    var path = self.game.findPathToTile(objectTile, targetTile);
    var checkpoints = self.game.getTurnPointsFromPath(path);
    checkpoints = checkpoints.map(makePoint);
    //checkpoints.unshift(self.game.getPointTileXY(target.position));
    checkpoints.unshift(makePoint([targetTile.x, targetTile.y]));
    self.checkpoints = checkpoints;
};

// TODO: corner - Integer. Should be a property.
Ghost.prototype.cruise = function () {
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
