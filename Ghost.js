'use strict';

// TODO: Move it somewhere else
var arrayToPoint = function (point_array) {
    return new Phaser.Point(point_array[0], point_array[1]);
};


Pacman.Ghost = function (pacmanGameState, game, x, y, chasingStrategy, corner, state) {
    var self = this;
    Phaser.Sprite.call(self, game, x, y, 'ghost');

    // FIXME: make game a game and state a state because it's hard to get to a state when it's needed.
    self.game = pacmanGameState;
    self.map = self.game.map;
    self.layer = self.game.layer;
    self.DEFAULT_SPEED = self.game.SPEED;
    self.FRIGHTENED_SPEED = self.DEFAULT_SPEED * 0.7;
    self.EATEN_SPEED = self.DEFAULT_SPEED * 1.5;

    self.anchor.set(0.5);
    self.animations.add('ghost', [0], 1, true);
    self.animations.add('ghost_frightened', [1], 1, true);
    self.animations.add('ghost_frightened_end', [1, 2], 2, true);
    self.animations.add('ghost_eaten', [3], 1, true);
    self.play('ghost');

    self.game.physics.arcade.enable(self);
    self.scale.x = 2;
    self.scale.y = 2;
    self.body.setSize(16, 16, 0, 0);

    self.tween = self.game.add.tween(self)

    self.speed = self.DEFAULT_SPEED;

    self.tileWalker = new Pacman.TileWalker(self);

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
            return self.game.getPointXYTile(arrayToPoint(point_array));
        })
    );

    self.randomTile = random.choice(self.game.safeTiles);
    self.homeTile = self.map.getTileWorldXY(self.game.homeDoor.x, self.game.homeDoor.y);

    self.state = state || 'stayAtHome';
    //self.state = 'stayAtHome';
    //self.state = 'doNothing';
    //self.state = 'goToCorner';
    //self.state = 'cruise';
    // TODO: Replace with Phaser.Time.
    self.counter = 0;
    self.tile = null;

};
Pacman.Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Pacman.Ghost.prototype.constructor = Pacman.Ghost;

Pacman.Ghost.prototype.updateOffset = function (point_array) {
    var self = this;
    return [point_array[0], point_array[1] + self.game.Y_OFFSET / self.map.tileHeight];
};

Pacman.Ghost.prototype.worldX = function () {
    var self = this;
    return self.x - (self.body.width * self.anchor.x);
};

Pacman.Ghost.prototype.worldY = function () {
    var self = this;
    return self.y - (self.body.height * self.anchor.y);
};

Pacman.Ghost.prototype.isMoving = function () {
    var self = this;
    return self.tileWalker.isMoving();
};


Pacman.Ghost.prototype.update = function () {
    var self = this;
    if (!self.game.physics.arcade.isPaused) {
        self.counter++;
    }

    switch (self.state) {
        case 'doNothing':
            break;
        case 'stayAtDoor':
            var tile = self.map.getTile(6, 15);
            self.tileWalker.goToTile(tile,
                    (function(state){
                        self.state=state;
                        self.counter=0;
                        console.log('state updated: ' + self.state);
                    }), 'goToCorner'
            );
            break
        case 'stayAtHome':
            if (self.counter === 1) {
                self.stayAtHome();
            }
            if (self.counter > 2e2) {
                self.state = 'leaveHome';
                self.counter = 0;
                console.log('state updated: ' + self.state);
            }
            break;

        case 'enterHome':
            if (self.counter === 1) {
                self.enterHome();
            }
        break;
        case 'leaveHome':
            if (self.counter === 1) {
                self.leaveHome(
                        function(){
                            self.state = 'goToCorner';
                            self.counter = 0;
                            console.log('state updated: ' + self.state);
                        });
            }
            break;
        case 'goToCorner':
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
        case 'walkRandomly':
            if (self.counter === 1 || !self.isMoving()) {
                self.walkRandomly();
            }
            self.tileWalker.goToTile(self.randomTile);

            if (self.counter > 4e2) {
                self.play('ghost_frightened_end');
            }
            if (self.counter > 6e2) {
                self.play('ghost');
                self.speed = self.DEFAULT_SPEED;
                self.state = 'chase';
                self.counter = 0;
                console.log('state updated: ' + self.state);
            }
            break;
        case 'chase':
            self.chasingStrategy.chase(self.game.pacman);
            if (self.counter > 6e2) {
                self.state = 'goToCorner';
                self.counter = 0;
                console.log('state updated: ' + self.state);
            }
            break;
        case 'goHome':
            self.goHome();
            break;
    }
};


Pacman.Ghost.prototype.onBigDotEaten = function () {
    var self = this;
    if (!arraytools.inArray(['walkRandomly', 'cruise', 'chase', 'stayAtDoor', 'goToCorner'], self.state)) {
        return;
    }
    self.play('ghost_frightened');
    self.speed = self.FRIGHTENED_SPEED;
    self.state = 'walkRandomly';
    self.counter = 0;
    console.log('state updated: ' + self.state);
};

Pacman.Ghost.prototype.onGhostEaten = function () {
    var self = this;
    self.tileWalker.targetTile = null;
    self.play('ghost_eaten');
    self.speed = self.EATEN_SPEED;
    self.state = 'goHome';
    self.counter = 0;
    console.log('state updated: ' + self.state);
};


Pacman.Ghost.prototype.cruise = function () {
    var self = this;
    self.tileWalker.patrol(self.cornerPath);
};


Pacman.Ghost.prototype.walkPath = function (tilePath) {
    var self = this;
    self.tileWalker.walkPath(tilePath);
};


Pacman.Ghost.prototype.goHome = function () {
    var self = this;
    var ghostTile = self.map.getTileWorldXY(self.x, self.y, undefined, undefined, self.layer);
    var distance = self.game.math.distance(
            self.x, self.y,
            self.game.homeDoor.x, self.game.homeDoor.y);
    var max_distance = 10

    if (distance <= max_distance)
    {
        self.body.velocity.setTo(0, 0);
        self.position.setTo(self.game.homeDoor.x, self.game.homeDoor.y);
        self.counter = 0;
        self.state = 'enterHome';
    }

    else if ( ghostTile === self.map.getTile(14, 15) || ghostTile === self.map.getTile(13, 15))
    {
        self.game.physics.arcade.moveToXY(self, self.game.homeDoor.x, self.game.homeDoor.y, self.speed);
    }
    else if (!self.isMoving()) {
        self.tileWalker.goToTile(self.map.getTile(13, 15));
    }
    else
    {
        self.tileWalker.goToTile(self.homeTile);
    }
};


Pacman.Ghost.prototype.walkRandomly = function () {
    var self = this;
    self.randomTile = random.choice(self.game.safeTiles);
    self.tileWalker.goToTile(self.randomTile);
};


Pacman.Ghost.prototype.enterHome = function () {
    var self = this;
    console.log('Entering home');
    self.tween.stop();
    self.tween = self.game.add.tween(self);
    self.tween
        .to({x: self.game.homeArea2.x, y: self.game.homeArea2.y}, 300, null);
    self.tween.reverse = false;
    self.tween.start();
    self.tween.onComplete.addOnce(function()
                { self.state = 'leaveHome',
                  self.counter = 0;
            });
};


Pacman.Ghost.prototype.leaveHome = function (onComplete) {
    var self = this;
    self.play('ghost');
    self.speed = self.DEFAULT_SPEED;
    self.tween.stop();
    self.tween = self.game.add.tween(self);
    self.tween
        .to({y: self.game.homeArea2.y}, 600)
        .to({x: self.game.homeArea2.x}, 600)
        .to({y: self.game.homeDoor.y}, 600);
    self.tween.reverse = false;
    self.tween.start();
    self.tween.onComplete.addOnce(onComplete, self);
};


Pacman.Ghost.prototype.stayAtHome = function (val) {
    var self = this;
    self.tween.stop();
    self.tween = self.game.add.tween(self);
    if ((self.x !== self.game.homeArea1.x && self.y !== self.game.homeArea1.y) ||
        (self.x !== self.game.homeArea2.x && self.y !== self.game.homeArea2.y) ||
        (self.x !== self.game.homeArea3.x && self.y !== self.game.homeArea3.y))
    {
        return;
    }
    self.tween.to({y: self.y - 16},
            500,
            function(k) {
                return Math.sin(Math.PI * 2 * k);
            });
    self.tween.reverse = false;
    self.tween.start();

};
