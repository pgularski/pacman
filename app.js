(function () {

    var game = new Phaser.Game(28 * 32, 37 * 32, Phaser.AUTO, "game");

    game.state.add('Boot', Pacman.Boot);
    game.state.add('Preloader', Pacman.Preloader);
    game.state.add('MainMenu', Pacman.MainMenu);
    game.state.add('Game', Pacman.Game);

    game.state.start('Boot');

})();
