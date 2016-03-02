var randomize = function(number, range) {
    return (function(number){
        number -= Math.floor(Math.random() * range);
        number += Math.floor(Math.random() * range);
        return number;
    })(number);
};


var getRandomizedTargetTile = function (ghost, target, factor) {
    var point = new Phaser.Point(
            randomize(target.x, ghost.width * factor),
            randomize(target.y, ghost.width * factor)
    );
    var virtualTarget = ghost.game.getPointTile(point);
    if (virtualTarget && ghost.game.isSafeTile(virtualTarget)) {
        return virtualTarget;
    }
    return ghost.game.getObjectTile(target);
};


StraightToThePointChasing = function (ghost) {
    var self = this;
    self.ghost = ghost;
};

StraightToThePointChasing.prototype.chase = function (target) {
    var self = this;
    var ghost = self.ghost;

    if (ghost.checkpoints.length === 0 || ghost.game.isJunction(ghost.game.getObjectTile(ghost)) ) {
        ghost.updateCheckPoints(ghost.game.getObjectTile(target));
        ghost.currentCheckpoint = ghost.checkpoints.pop();
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

    if (ghost.checkpoints.length === 0 || ghost.game.isJunction(ghost.game.getObjectTile(ghost))
        || (ghost.body.deltaX() === 0 && ghost.body.deltaY() ===0)) {
        ghost.updateCheckPoints(virtualTarget);
        ghost.currentCheckpoint = ghost.checkpoints.pop();
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

    var virtualTarget = getRandomizedTargetTile(ghost, target, 20);

    if (ghost.checkpoints.length === 0 || ghost.game.isJunction(ghost.game.getObjectTile(ghost))
        || (ghost.body.deltaX() === 0 && ghost.body.deltaY() ===0)) {
        ghost.updateCheckPoints(virtualTarget);
        ghost.currentCheckpoint = ghost.checkpoints.pop();
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
        ghost.setDirection();
    }
};


Ghost = function (pacmanGameState, game, x, y, chasingStrategy) {
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

    self.game.add.existing(self);

    self.speed = 150;

    self.destination = null;
    self.path = [];
    self.justGotAligned = false;
    self.goingToTile = null;
    self.turns = [];
    self.lastTurn = null;
    self.checkpoints = [];
    self.currentCheckpoint = new Phaser.Point();
    self.currentCheckpointTile = null;

    self.threshold = 5;
    self.MAX_DISTANCE = 3;

    self.chasingStrategy = new chasingStrategy(self);
};
Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Ghost.prototype.constructor = Ghost;


Ghost.prototype.update = function () {
    var self = this;
    self.chasingStrategy.chase(self.game.pacman);
};


Ghost.prototype.setDirection = function () {
    var self = this;
    var speed = self.speed;
    var selfTileXY = self.game.getObjectTileXY(self)
    if (!self.currentCheckpoint) {
        return;
    }

    if (selfTileXY.x < self.currentCheckpoint.x) {
        self.body.velocity.x = speed;
    }
    else if (selfTileXY.x > self.currentCheckpoint.x) {
        self.body.velocity.x = -speed;
    }
    else if (selfTileXY.y < self.currentCheckpoint.y) {
        self.body.velocity.y = speed;
    }
    else if (selfTileXY.y > self.currentCheckpoint.y) {
        self.body.velocity.y = -speed;
    }
};


Ghost.prototype.updateCheckPoints = function (targetTile) {
    var self = this;
    var path = self.game.findPathToTile(
            self.game.getObjectTile(self),
            targetTile);
    var checkpoints = self.game.getTurnPointsFromPath(path);
    checkpoints = checkpoints.map(
        (function (point_array) {
            return new Phaser.Point(point_array[0], point_array[1]);
        })
    );
    //checkpoints.unshift(self.game.getPointTileXY(target.position));
    checkpoints.unshift(new Phaser.Point(targetTile.x, targetTile.y));
    self.checkpoints = checkpoints;
};
