window.addEventListener("gameCreated", function(evt) {
    var gameCanvas = document.getElementById("game");
    gameCanvas.hidden = true;

    QUnit.test( "Test PacmanGame is defined", function( assert ) {
        assert.ok( PacmanGame, "PacmanGame game should be defined" );
    });

    QUnit.test( "Test game is defined", function( assert ) {
        assert.ok( game, "game should be defined" );
    });

    QUnit.test( "Test custom PacmanGame.map exists", function( assert ) {
        var testGame = game.state.states.Game;
        assert.ok( testGame.map, "testGame.map should be defined" );
    });

    QUnit.test( "Test Grid", function( assert ) {
        var grid = game.state.states.Game.grid;
        var point = [2, 5].toString();
        assert.ok( grid, "grid should be defined" );
        assert.notOk(grid.walls.has(point), "The point " + point + " mustn't be in self.walls");
    });

    QUnit.test( "Test Grid.inBounds", function( assert ) {
        var str = function(arr){
            return arr.toString();
        };
        var grid = game.state.states.Game.grid;
        var point;
        point = str([0, 0]);
        assert.ok( grid.inBounds(point), point +" should be in inBounds");
        point = str([-1, 0]);
        assert.notOk( grid.inBounds(point), point +" should be in inBounds");
    });

    QUnit.test( "Test Grid.neighbors", function( assert ) {
        var str = function(arr){
            return arr.toString();
        };
        var grid = game.state.states.Game.grid;
        var point;
        var result;

        point = str([1, 1]);
        expected = [ "2,1", "1,2" ];
        result = grid.neighbors(point);
        assert.deepEqual(result, expected);

        point = str([1, 5]);
        expected = [ "2,5", "1,4" ];
        result = grid.neighbors(point);
        assert.deepEqual(result, expected);
    });

    QUnit.test( "Test PacmanGame.isJunction", function( assert ) {
        var testGame = game.state.states.Game;
        var point;
        var gridPoint;
        var tile;
        var x, y;
        // [1, 1]
        x = 1 * testGame.map.tileWidth;
        y = 1 *testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.pointToTile(point);
        assert.notOk(testGame.isJunction(tile), tile + "is not a junction");

        // [5, 1]
        x = 5 * testGame.map.tileWidth;
        y = 1 *testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.pointToTile(point);
        assert.notOk(testGame.isJunction(tile), tile + "is not a junction");

        // [7, 1]
        x = 7 * testGame.map.tileWidth;
        y = 1 *testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.pointToTile(point);
        assert.notOk(testGame.isJunction(tile), tile + "is not a junction");

        // [6, 1]
        x = 6 * testGame.map.tileWidth;
        y = 1 *testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.pointToTile(point);
        assert.ok(testGame.isJunction(tile), tile + "is a junction");

        // [6, 3]
        x = 6 * testGame.map.tileWidth;
        y = 3 *testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.pointToTile(point);
        assert.ok(testGame.isJunction(tile), tile + "is a junction");

        // [6, 5]
        x = 6 * testGame.map.tileWidth;
        y = 5 * testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.pointToTile(point);
        assert.ok(testGame.isJunction(tile), tile + "is a junction");

        // [25, 28]
        x = testGame.map.tileWidth * (testGame.map.width - 3);
        y = testGame.map.tileHeight * (testGame.map.height - 3);
        point = new Phaser.Point(x, y);
        tile = testGame.pointToTile(point);
        assert.ok(testGame.isJunction(tile), tile + "is a junction");

        // [27, 30]
        x = testGame.map.tileWidth * (testGame.map.width - 1);
        y = testGame.map.tileHeight * (testGame.map.height - 1);
        point = new Phaser.Point(x, y);
        tile = testGame.pointToTile(point);
        assert.notOk(testGame.isJunction(tile), tile + "is not a junction");

    });
});
