Ghost = function (pacmanGameState, game, x, y) {
    var self = this;
    Phaser.Sprite.call(self, game, x, y, 'ghost');

    // FIXME: make game a game and state a state becaus it's hard to get to a state when it's needed.
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

    self.marker = new Phaser.Point();
    self.destination = null;
    self.path = [];
    self.justGotAligned = false;
    self.goingToTile = null;
    self.turns = [];
    self.lastTurn = null;


}
Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.update = function () {
    var self = this;
    // It's in the grid coordinates, not in pixels
    self.marker = self.game.getObjectGridPoint(self);

    //var ghostDirection = self.checkDirection();
    self.move();
}

Ghost.prototype.checkDirection = function () {
    var x = self.marker.x;
    var y = self.marker.y;

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

    if (!self.destination || (self.game.isJunction(self.game.getObjectTile(self)) && self.game.isInTurnPoint(self))) {
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
        nextTurnTile = self.map.getTile.apply(self.map, self.lastTurn.split(','));

        if ((self.game.getObjectTile(self) === nextTurnTile) && self.game.isInTurnPoint(self)) {
            self.game.alignToTile(self, true);
            self.justGotAligned = true;
            self.goToTile(self, self.game.getObjectTile(self.game.pacman));
        }
    }
    else{
        self.justGotAligned = false;
    }
}

Ghost.prototype.goToTile = function (object, toTile) {
    var self = this;
    var objectTile = self.game.getObjectTile(object);
    var path = self.game.findPathToTile(objectTile, toTile);
    var turns = self.game.getTurnPointsFromPath(path);
    var nextTurn;
    var speed = self.speed;

    self.path = path;

    if (path.length > 1){
        turns.unshift(path[0])
    }
    self.destination = path[0];
    if (turns.length <= 0) {
        return;
    }
    self.lastTurn = turns[turns.length - 1];
    nextTurn = turns.pop().split(',').map(Number);
    nextTurn = new Phaser.Point(nextTurn[0], nextTurn[1]);
    self.goingToTile = self.game.pointToTile(nextTurn);
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
