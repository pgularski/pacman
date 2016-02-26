Ghost = function (pacmanGameState, game, x, y) {
    var self = this;
    Phaser.Sprite.call(self, game, x, y, 'ghost');

    self.game = pacmanGameState;;
    self.map = self.game.map;
    self.layer = self.game.layer;

    self.anchor.set(0.5);
    self.animations.add('ghost', [0, 1, 2, 1], 10, true);
    self.play('ghost');

    self.game.physics.arcade.enable(self);
    self.body.setSize(32, 32, 0, 0);

    self.game.add.existing(self);

    self.speed = 150;

    self.ghostSpeed = 150;
    self.ghostMarker = new Phaser.Point();
    self.ghostDestination = null;
    self.ghostPath = [];
    self.justGotAligned = false;
    self.goingToTile = null;
    self.ghostTurns = [];
    self.ghostLastTurn = null;


}
Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.update = function () {
    // It's in the grid coordinates, not in pixels
    self.ghostMarker = self.getObjectGridPoint(self.ghost);

    //var ghostDirection = self.checkDirection();
    self.move();
}

Ghost.prototype.checkDirection = function () {
    var x = self.ghostMarker.x;
    var y = self.ghostMarker.y;

    //nextTile = getNextTileFromPathInTheReferenceToCurrentGhostPosition(pathToPacman, x, y);
    //direction = getDirectionTo(nextTile);

    return direction;
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

    if (!self.ghostDestination || (self.isJunction(self.getObjectTile(self.ghost)) && self.isInTurnPoint(self.ghost))) {
        if (!self.justGotAligned) {
            self.alignToTile(self.ghost, true);
            self.justGotAligned = true;
        }
        // FIXME: Should be Update path
        // self.updateGhostPath()
        self.goToTile(self.ghost, self.getObjectTile(self.pacman));
    }
    else if (self.ghostLastTurn) {
        nextTurnTile = self.map.getTile.apply(self.map, self.ghostLastTurn.split(','));

        if ((self.getObjectTile(self.ghost) === nextTurnTile) && self.isInTurnPoint(self.ghost)) {
            self.alignToTile(self.ghost, true);
            self.justGotAligned = true;
            self.goToTile(self.ghost, self.getObjectTile(self.pacman));
        }
    }
    else{
        self.justGotAligned = false;
    }
}

Ghost.prototype.goToTile = function (object, toTile) {
    var self = this;
    var objectTile = self.getObjectTile(object);
    var path = self.findPathToTile(objectTile, toTile);
    var turns = self.getTurnPointsFromPath(path);
    var nextTurn;
    var speed = self.speed;

    self.ghostPath = path;

    if (path.length > 1){
        turns.unshift(path[0])
    }
    self.ghostDestination = path[0];
    if (turns.length <= 0) {
        return;
    }
    self.ghostLastTurn = turns[turns.length - 1];
    nextTurn = turns.pop().split(',').map(Number);
    nextTurn = new Phaser.Point(nextTurn[0], nextTurn[1]);
    self.goingToTile = self.pointToTile(nextTurn);
    self.ghostTurns = turns;

    var debugPoint = new Phaser.Point(
            nextTurn.x * self.map.tileWidth + self.map.tileWidth / 2,
            nextTurn.y * self.map.tileHeight + self.map.tileHeight / 2);
    self.game.debug.geom(debugPoint, '#ffff00');

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


Ghost.prototype.carryOnGhost = function () {
    var self = this;
    var object = self.ghost;
    var objectTile = self.getObjectTile(object);
    var path = self.ghostPath;
    var turns = self.ghostTurns;
    var nextTurn;
    var speed = self.speed;

    if (turns.length <= 0) {
        return;
    }
    nextTurn = turns.pop().split(',').map(Number);
    nextTurn = new Phaser.Point(nextTurn[0], nextTurn[1]);
    self.goingToTile = self.pointToTile(nextTurn);
    self.ghostTurns = turns;

    if (objectTile.x < nextTurn.x) {
        object.body.velocity.x = speed;
        object.body.velocity.y = 0;
    }
    else if (objectTile.x > nextTurn.x) {
        object.body.velocity.x = -speed;
        object.body.velocity.y = 0;
    }
    else if (objectTile.y < nextTurn.y) {
        object.body.velocity.y = speed;
        object.body.velocity.x = 0;
    }
    else if (objectTile.y > nextTurn.y) {
        object.body.velocity.y = -speed;
        object.body.velocity.x = 0;
    }
}

