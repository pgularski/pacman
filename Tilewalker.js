'use strict';

Pacman.TileWalker = function (object) {
    var self = this;
    self.object = object;
    self.game = object.game;
    self.map = object.map;
    self.state = self._buildStateMachine();
    self.hasTarget = false;
    self.hasArrived = false;
    self.targetTile = null;
    self.checkpoints = [];
    self.currentCheckpoint = null;
    self.isPatroling = false;
    self.pathIterator = null;

    self.MAX_DISTANCE = 3;
};


Pacman.TileWalker.prototype._buildStateMachine = function () {
    var self = this;
    var state = new sm.StateMachine('m');
    var stopped = new sm.State('stopped');
    var moving = new sm.State('moving');
    state.addState(stopped, true);
    state.addState(moving);
    state.addTransition(stopped, moving, ['go']);
    state.addTransition(moving, stopped, ['arrived'], null, null, null, null, function(s, e) { /* after */ self.object.stateMachine.dispatch(new sm.Event('arrived')); } );
    state.addTransition(moving, moving, ['go']);
    state.initialize();

    moving.handlers = {
        'enter': function(s, e) {
            self.targetTile = e.cargo.sourceEvent.cargo.targetTile;
            self.updateCheckPoints(self.targetTile);
            self.currentCheckpoint = self.checkpoints.pop();
            self.setDirection();
        },
        'go': function(s, e) {
            self.setDirection();
        },
        'checkpointReached': function(s, e) {
            self.setDirection();
        },
    };

    stopped.handlers = {
        'enter': function(s, e) {
            self.object.body.velocity.setTo(0, 0);
        }
    };
    return state;
};

// TODO: should it be a state?
Pacman.TileWalker.prototype.isCheckPointReached = function () {
    var self = this;
    if(!self.currentCheckpoint){
        return true;
    }

    var checkpointX = self.currentCheckpoint.x * self.map.tileWidth;
    var checkpointY = self.currentCheckpoint.y * self.map.tileHeight;
    var distance = self.game.math.distance(
            self.object.worldX(), self.object.worldY(),
            checkpointX, checkpointY);

    if (distance <= self.MAX_DISTANCE) {
        return true;
    }
    return false;
};

Pacman.TileWalker.prototype.update = function () {
    var self = this;
    if (self.isCheckPointReached())
    {
        self.game.alignToTile(self.object);
        self.currentCheckpoint = self.checkpoints.pop();
        if (!self.currentCheckpoint)
        {
            self.state.dispatch(new sm.Event('arrived'));
        }
        self.state.dispatch(new sm.Event('checkpointReached'));
    }
};

Pacman.TileWalker.prototype.goToTile = function (targetTile, callback, callbackArgs) {
    var self = this;
    self.state.dispatch(new sm.Event('go', null, null, {'targetTile': targetTile, 'callback': callback, 'callbackArgs': callbackArgs }));
};


Pacman.TileWalker.prototype.updateCheckPoints = function (targetTile) {
    var self = this;
    //self.object.body.velocity.setTo(0, 0);
    var objectTile = self.game.getObjectTile(self.object);
    var path = self.game.findPathToTile(objectTile, targetTile);
    var checkpoints = self.game.getTurnPointsFromPath(path);
    checkpoints = checkpoints.map(arrayToPoint);
    checkpoints.unshift(arrayToPoint([targetTile.x, targetTile.y]));
    self.checkpoints = checkpoints;
};


Pacman.TileWalker.prototype.setDirection = function () {
    var self = this;
    var speed = self.object.speed;
    var anchorValue = {x: self.object.body.width * self.object.anchor.x,
                       y: self.object.body.height * self.object.anchor.y}
    var x = self.currentCheckpoint.x * self.map.tileWidth + anchorValue.x;
    var y = self.currentCheckpoint.y * self.map.tileHeight + anchorValue.y;
    //self.game.physics.arcade.moveToXY(self.object, x, y, speed);

    if (self.object.x < x){
        self.object.body.velocity.x = speed;
    }
    else if (self.object.x > x) {
        self.object.body.velocity.x = -speed;
    }
    else if (self.object.y < y) {
        self.object.body.velocity.y = speed;
    }
    else if (self.object.y > y) {
        self.object.body.velocity.y = -speed;
    }
};
