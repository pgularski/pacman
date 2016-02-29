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

    self.threshold = 5;
    self.MAX_DISTANCE = 0;


}
Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.update = function () {
    var self = this;

    self.move();
}

Ghost.prototype.chase = function (target) {
    var self = this;
    var distance = self.game.math.distance(self.x, self.y, target.x, target.y);

    if (distance > self.MAX_DISTANCE) {
        ;
    }
    else {
        self.body.velocity.setTo(0, 0);
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
    checkpoints.unshift(target.position);
    self.checkpoints = checkpoints;
}

Ghost.prototype.move = function () {
    var self = this;

/*
 *    if is at the junction or has no destination designated whatsoever:
 *        self.updateGhostPath();
 *
 *    if arrived to the currentDestination(next turn or pacman):
 *        currentDestination = nextDestination
 *        moveTowards current destination
 */

    var nextTurnTile;

    if (!self.destination || (self.game.isJunction(self.game.getObjectTile(self)) && self.isInTurnPoint(self))) {
        if (!self.justGotAligned) {
            self.game.alignToTile(self, true);
            self.justGotAligned = true;
        }
        // FIXME: Should be Update path
        // self.updateGhostPath()
        // TODO: Should pacman be accessed from here?
        self.goToTile(self, self.game.getObjectTile(self.game.pacman));
    }
    else if (self.lastTurn) {
        nextTurnTile = self.map.getTile.apply(self.map, self.lastTurn);

        if ((self.game.getObjectTile(self) === nextTurnTile) && self.isInTurnPoint(self)) {
            self.game.alignToTile(self, true);
            self.justGotAligned = true;
            self.goToTile(self, self.game.getObjectTile(self.game.pacman));
        }
    }
    else{
        self.justGotAligned = false;
    }
}

// TODO: Pacman has the same method with similar implementation - can be extracted?
Ghost.prototype.isInTurnPoint = function (object) {
    var self = this;
    var objectGridPoint = self.game.getObjectTileXY(object);
    var currentX = Math.floor(object.x);
    var currentY = Math.floor(object.y);
    var turnPoint = new Phaser.Point();
    turnPoint.x = (objectGridPoint.x * self.map.tileWidth) + (self.map.tileWidth / 2);
    turnPoint.y = (objectGridPoint.y * self.map.tileHeight) + (self.map.tileHeight / 2);
    if (self.game.math.fuzzyEqual(currentX, turnPoint.x, self.threshold) &&
        self.game.math.fuzzyEqual(currentY, turnPoint.y, self.threshold)){
        return true;
    }
    return false;
};

Ghost.prototype.goToTile = function (object, toTile) {
    var self = this;
    var objectTile = self.game.getObjectTile(object);
    var path = self.game.findPathToTile(objectTile, toTile);
    var turns = self.game.getTurnPointsFromPath(path);
    var nextTurn;
    var speed = self.speed;

    self.path = path;

    if (path.length > 1){
        turns.unshift(path[0]);
    }
    self.destination = path[0];
    if (turns.length <= 0) {
        return;
    }
    self.lastTurn = turns[turns.length - 1];
    nextTurn = turns.pop();
    nextTurn = new Phaser.Point(nextTurn[0], nextTurn[1]);
    self.goingToTile = self.game.getPointTile(nextTurn);
    self.turns = turns;

    var debugPoint = new Phaser.Point(
            nextTurn.x * self.map.tileWidth + self.map.tileWidth / 2,
            nextTurn.y * self.map.tileHeight + self.map.tileHeight / 2);
    game.debug.geom(debugPoint, '#ffff00');

    if (objectTile.x < nextTurn.x) {
        object.body.velocity.x = speed;
        //object.body.velocity.y = 0;
    }
    else if (objectTile.x > nextTurn.x) {
        object.body.velocity.x = -speed;
        //object.body.velocity.y = 0;
    }
    else if (objectTile.y < nextTurn.y) {
        object.body.velocity.y = speed;
        //object.body.velocity.x = 0;
    }
    else if (objectTile.y > nextTurn.y) {
        object.body.velocity.y = -speed;
        //object.body.velocity.x = 0;
    }
}
