var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/world.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/ruby.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.image('diamond', 'assets/wind.png');

}

var Player = function(name, x) {
    this.name = name;
    this.lives = 3;
    // this.x = Math.random()*100;
    // this.y = Math.random()*100;
    // this.damageTaken =
    this.settings = {
        x: x,
        bounce: 0.2,
        gravity: 300,
        collideWorldBounds: true
    };
};

function setPlayer (settings) {
    playerView = game.add.sprite(settings.x, game.world.height - 150, 'dude');
    game.physics.arcade.enable(playerView);
    playerView.body.bounce.y = settings.bounce;
    playerView.body.gravity.y = settings.gravity;
    playerView.body.collideWorldBounds = settings.collideWorldBounds;
    return playerView;
}

var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;
var playerOne = new Player('one', 32);
var playerTwo = new Player('two', 700);
var diamonds;
var diamondTime = 0;
var diamond;

function create() {
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(500, 300, 'ground');
    ledge.body.immovable = true;

    playerOneView = setPlayer(playerOne.settings);
    playerTwoView = setPlayer(playerTwo.settings);

    //  Our two animations, walking left and right.

    playerOneView.animations.add('left', [0, 1, 2, 3], 10, true);
    playerOneView.animations.add('right', [5, 6, 7, 8], 10, true);

    playerTwoView.animations.add('left', [0, 1, 2, 3], 10, true);
    playerTwoView.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    diamonds = game.add.group();
    diamonds.enableBody = true;

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    playerOneKeys = {
        w: game.input.keyboard.addKey(87),
        a: game.input.keyboard.addKey(65),
        s: game.input.keyboard.addKey(83),
        d: game.input.keyboard.addKey(68),

    };
    cursors = game.input.keyboard.createCursorKeys();

    //Firing keys
    x = game.input.keyboard.addKey(88);
    n = game.input.keyboard.addKey(78);
}

function update() {
    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(playerOneView, platforms);
    game.physics.arcade.collide(playerTwoView, platforms);
    game.physics.arcade.collide(stars, platforms);
    // Collide the two players
    game.physics.arcade.collide(playerOneView, playerTwoView);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(playerOneView, stars, collectStar);
    game.physics.arcade.overlap(playerTwoView, stars, collectStar);
    //  Reset the players velocity (movement)
    playerOneView.body.velocity.x = 0;
    playerTwoView.body.velocity.x = 0;


    //////////////////////
    ///   Player One   ///
    //////////////////////


    if (playerOneKeys.a.isDown){
        //  Move to the left
        playerOneView.body.velocity.x = -150;

        playerOneView.animations.play('left');
    }
    else if (playerOneKeys.d.isDown)
    {
        //  Move to the right
        playerOneView.body.velocity.x = 150;

        playerOneView.animations.play('right');
    }
    else
    {
        //  Stand still
        playerOneView.animations.stop();

        playerOneView.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (playerOneKeys.w.isDown && playerOneView.body.touching.down)
    {
        playerOneView.body.velocity.y = -350;
    }

    if (x.isDown) {
        //console.log(diamond.body);
        fireOne();
    }

    //////////////////////
    ///   Player Two   ///
    //////////////////////


    if (cursors.left.isDown)
    {
        //  Move to the left
        playerTwoView.body.velocity.x = -150;

        playerTwoView.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        playerTwoView.body.velocity.x = 150;

        playerTwoView.animations.play('right');
    }
    else
    {
        //  Stand still
        playerTwoView.animations.stop();

        playerTwoView.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && playerTwoView.body.touching.down)
    {
        playerTwoView.body.velocity.y = -350;
    }

    if (n.isDown){
        fireTwo();
    }

}

function collectStar (player, star) {

  // Removes the star from the screen
  star.kill();

  //  Add and update the score
  score += 10;
  scoreText.text = 'Score: ' + score;

}

function fireOne() {
  if (game.time.now > diamondTime){
    var diamond = diamonds.create(playerOneView.x, playerOneView.y, 'diamond');
    if(playerOneView.animations.currentFrame.index>=5){
        diamond.body.velocity.x = 400;
    }else if (playerOneView.animations.currentFrame.index<=3) {
        diamond.body.velocity.x = -400;
    }else{
        diamond.body.velocity.y = -400;
    }
    diamondTime = game.time.now + 200;
  }
}

function fireTwo() {
  if (game.time.now > diamondTime){
    var diamond = diamonds.create(playerTwoView.x, playerTwoView.y, 'diamond');
    if(playerTwoView.animations.currentFrame.index>=5){
        diamond.body.velocity.x = 400;
    }else if (playerTwoView.animations.currentFrame.index<=3) {
        diamond.body.velocity.x = -400;
    }else{
        diamond.body.velocity.y = -400;
    }
    diamondTime = game.time.now + 200;
  }
}

