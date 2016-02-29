Ghost = function (pacmanGameState, game, x, y) {
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


}
Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.update = function () {
    var self = this;

    //self.move();
    self.chase(self.game.pacman);
}

Ghost.prototype.chase = function (target) {
    var self = this;

    if (self.checkpoints.length === 0 || self.game.isJunction(self.game.getObjectTile(self)) ) {
        self.updateCheckPoints(target);
        self.currentCheckpoint = self.checkpoints.pop();
        self.currentCheckpointTile = self.map.getTile(
            self.currentCheckpoint.x, self.currentCheckpoint.y)
        self.setDirection();
    }
    var x = self.x - (self.body.width * self.anchor.x);
    var y = self.y - (self.body.height * self.anchor.y);

    //var currentCheckpointPoint = new Phaser.Point(
            //currentCheckpointTile.worldX, currentCheckpointTile.worldY);
    //game.debug.geom(currentCheckpointPoint, '#ffff00');

    var distance = self.game.math.distance(
            x, y,
            self.currentCheckpointTile.worldX, self.currentCheckpointTile.worldY);

    if (distance <= self.MAX_DISTANCE) {
        self.currentCheckpoint = self.checkpoints.pop();
        self.setDirection();
    }
}

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
}

Ghost.prototype.updateCheckPoints = function (target) {
    var self = this;
    var path = self.game.findPathToTile(
            self.game.getObjectTile(self),
            self.game.getObjectTile(target));
    var checkpoints = self.game.getTurnPointsFromPath(path);
    checkpoints = checkpoints.map(
        (function (point_array) {
            return new Phaser.Point(point_array[0], point_array[1]);
        })
    );
    checkpoints.unshift(self.game.getPointTileXY(target.position));
    self.checkpoints = checkpoints;
}
