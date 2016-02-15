var game = new Phaser.Game(28 * 32, 31 * 32, Phaser.AUTO, "");

var PacmanGame = function() {
    var self = this;
    self.map = null;
}

PacmanGame.prototype.init = function () {
    var self = this;
    self.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    self.scale.pageAlignVertically = true;
    self.scale.pageAlignHorizontally = true;
    Phaser.Canvas.setImageRenderingCrisp(self.game.canvas);
    self.physics.startSystem(Phaser.Physics.ARCADE);
}

PacmanGame.prototype.preload = function () {
    var self = this;
    self.load.image("tiles", "assets/tiles.png");
    self.load.tilemap("map", "assets/map.json", null, Phaser.Tilemap.TILED_JSON);

}

PacmanGame.prototype.create = function () {
    var self = this;
    self.map = self.add.tilemap("map");
    self.map.addTilesetImage("tiles");
    self.layer = self.map.createLayer("Tile Layer 1");
}

PacmanGame.prototype.update = function () {
    var self = this;
}

game.state.add("Game", PacmanGame, true);
