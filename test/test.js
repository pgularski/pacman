window.onload = hideGame;

function hideGame(){
    var gameCanvas = document.getElementById("game");
    gameCanvas.hidden = true;
}

QUnit.test( "a basic test example", function( assert ) {
    var value = "hello";
    assert.equal( value, "hello", "We expect value to be hello" );
});

QUnit.test( "Test PacmanGame is defined", function( assert ) {
    assert.ok( PacmanGame, "PacmanGame game should be defined" );
});

QUnit.test( "Test custom PacmanGame.map exists", function( assert ) {
    var testGame = new PacmanGame();
    testGame.preload();
    testGame.create();
    assert.ok( testGame.map, "testGame.map should be defined" );
});
