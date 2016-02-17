window.addEventListener("gameCreated", function(evt) {
    var gameCanvas = document.getElementById("game");
    gameCanvas.hidden = true;

    QUnit.test( "a basic test example", function( assert ) {
        var value = "hello";
        assert.equal( value, "hello", "We expect value to be hello" );
    });

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

    QUnit.test( "Test Grid is defined", function( assert ) {
        var grid = game.state.states.Game.grid;
        assert.ok( grid, "grid should be defined" );
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
});
