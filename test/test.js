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
        tile = testGame.getPointTile(point);
        assert.notOk(testGame.isJunction(tile), tile + "is not a junction");

        // [5, 1]
        x = 5 * testGame.map.tileWidth;
        y = 1 *testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.getPointTile(point);
        assert.notOk(testGame.isJunction(tile), tile + "is not a junction");

        // [7, 1]
        x = 7 * testGame.map.tileWidth;
        y = 1 *testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.getPointTile(point);
        assert.notOk(testGame.isJunction(tile), tile + "is not a junction");

        // [6, 1]
        x = 6 * testGame.map.tileWidth;
        y = 1 *testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.getPointTile(point);
        assert.ok(testGame.isJunction(tile), tile + "is a junction");

        // [6, 3]
        x = 6 * testGame.map.tileWidth;
        y = 3 *testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.getPointTile(point);
        assert.ok(testGame.isJunction(tile), tile + "is a junction");

        // [6, 5]
        x = 6 * testGame.map.tileWidth;
        y = 5 * testGame.map.tileHeight;
        point = new Phaser.Point(x, y);
        tile = testGame.getPointTile(point);
        assert.ok(testGame.isJunction(tile), tile + "is a junction");

        // [25, 28]
        x = testGame.map.tileWidth * (testGame.map.width - 3);
        y = testGame.map.tileHeight * (testGame.map.height - 3);
        point = new Phaser.Point(x, y);
        tile = testGame.getPointTile(point);
        assert.ok(testGame.isJunction(tile), tile + "is a junction");

        // [27, 30]
        x = testGame.map.tileWidth * (testGame.map.width - 1);
        y = testGame.map.tileHeight * (testGame.map.height - 1);
        point = new Phaser.Point(x, y);
        tile = testGame.getPointTile(point);
        assert.notOk(testGame.isJunction(tile), tile + "is not a junction");

    });

    QUnit.test( "Test getTurnPointsFromPath", function( assert ) {
        var stringToXY = function(elem){
            return elem.split(',').map(Number);
        };

        var testGame = game.state.states.Game;
        var path;
        var expectedTurns;
        // no turns
        path = ['12,1', '11,1', '10,1', '9,1', '8,1', '7,1', '6,1', '5,1', '4,1', '3,1', '2,1', '1,1'];
        path = path.map(stringToXY);
        expectedTurns = [];
        assert.deepEqual(testGame.getTurnPointsFromPath(path), expectedTurns);

        // one turn
        path = ['6,5', '6,4', '6,3', '6,2', '6,1', '5,1', '4,1', '3,1', '2,1', '1,1']
        path = path.map(stringToXY);
        expectedTurns = ['6,1'];
        expectedTurns = expectedTurns.map(stringToXY);
        assert.deepEqual(testGame.getTurnPointsFromPath(path), expectedTurns);

        // two turns
        path = ['14,7', '13,7', '12,7', '12,6', '12,5', '12,4', '12,3', '12,2',
                '12,1', '11,1', '10,1', '9,1', '8,1', '7,1', '6,1', '5,1',
                '4,1', '3,1', '2,1', '1,1']
        path = path.map(stringToXY);
        expectedTurns = ['12,7', '12,1'];
        expectedTurns = expectedTurns.map(stringToXY);
        assert.deepEqual(testGame.getTurnPointsFromPath(path), expectedTurns);
    });

});
