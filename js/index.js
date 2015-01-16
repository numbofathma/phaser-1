// ---------------------------------------------------------------
//		Paramètre générale (taille du jeu,...)
// ---------------------------------------------------------------
var gameWidth = 540;
var gameHeight = 875;
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '', {preload: preload, create: create, update: update});

//importe les différentes ressources et définit des paramètres
function preload() {

    game.load.image('background1', 'img/background1.jpg');
    game.load.image('background2', 'img/background2.jpg');
    game.load.image('background3', 'img/background3.jpg');
    game.load.image('background4', 'img/background4.jpg');
    game.load.image('title', 'img/title.png');
    game.load.image('canon', 'img/canon.png');
    game.load.spritesheet('pointsCollection', 'img/points.png', 80, 98);
    game.load.spritesheet('boules', 'img/boules.png', 101, 115);
    game.load.image('pointer', 'img/pointer.png');
    game.load.image('warningLine', 'img/warningLine.png');

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();

}


// ---------------------------------------------------------------
//			All needed variables for title environment
// ---------------------------------------------------------------

// the pointer is only needed by some games
var tmpPointer = new Phaser.Pointer(this.game, 3);

// this includes all upperGate objects
var upperGate_Group;
// this includes all lowerGate objects
var lowerGate_Group;
var canon_Sprite;
// this group holds all hud Elements, that should appear after "opening"
var hud_Group;
var point0_Sprite;
var point1_Sprite;
var point2_Sprite;
var canonState = "init";

var points = 0;
var level = 0;

// this group only contains the single letters for a text that has shifted letters
var text_Group;
var text_BG;

// rotation of the device
var rotation;

var yOffsetPerPx = 150 / 1080;
var desktop_HitField;

// ---------------------------------------------------------------
//			The initial function that creates the scene
// ---------------------------------------------------------------

function create() {

    game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background1');

    upperGate_Group = game.add.group();
    lowerGate_Group = game.add.group();
    hud_Group = game.add.group();
    text_Group = game.add.group();

    createGame();

    // add a new graphics object (polygon)
    var lowerGate_backSh = game.add.graphics(0, 0);
    lowerGate_backSh.beginFill(0x000000);
    lowerGate_backSh.moveTo(0, game.world.height);
    lowerGate_backSh.lineTo(game.world.width, game.world.height);
    lowerGate_backSh.lineTo(game.world.width, 340);
    lowerGate_backSh.lineTo(0, 700);
    lowerGate_backSh.lineTo(0, 0);
    lowerGate_backSh.endFill();
    lowerGate_backSh.alpha = 0.2;

    // add a new graphics object (polygon)
    var upperGate_backSh = game.add.graphics(0, 0);
    upperGate_backSh.beginFill(0x000000);
    upperGate_backSh.moveTo(0, 0);
    upperGate_backSh.lineTo(game.world.width, 0);
    upperGate_backSh.lineTo(game.world.width, 360);
    upperGate_backSh.lineTo(0, 435);
    upperGate_backSh.lineTo(0, 0);
    upperGate_backSh.endFill();
    upperGate_backSh.alpha = 0.2;

    // add a new graphics object (polygon)
    var upperGate_back = new Phaser.Graphics(game, 0, 0);
    upperGate_back.beginFill(0xE5E5E5);
    upperGate_back.moveTo(0, 0);
    upperGate_back.lineTo(game.world.width, 0);
    upperGate_back.lineTo(game.world.width, 350);
    upperGate_back.lineTo(0, 425);
    upperGate_back.lineTo(0, 0);
    upperGate_back.endFill();

    // add the logo to the upperGate
    title = game.add.sprite(game.world.centerX, game.world.centerY - 250, 'title');
    title.anchor.set(0.5);
    title.scale.set(0.5);

    // add a new graphics object (polygon)
    var lowerGate_back = new Phaser.Graphics(game, 0, 0);
    lowerGate_back.beginFill(0xF3F3F3);
    lowerGate_back.moveTo(0, game.world.height);
    lowerGate_back.lineTo(game.world.width, game.world.height);
    lowerGate_back.lineTo(game.world.width, 349);
    lowerGate_back.lineTo(0, 424);
    lowerGate_back.lineTo(0, 0);
    lowerGate_back.endFill();

    // add the points display
    point0_Sprite = game.add.sprite(40, 65, 'pointsCollection', 0);
    point0_Sprite.anchor.set(0.5);
    point0_Sprite.scale.set(0.4, 0.55);
    point1_Sprite = game.add.sprite(75, 65 - 35 * yOffsetPerPx, 'pointsCollection', 0);
    point1_Sprite.anchor.set(0.5);
    point1_Sprite.scale.set(0.4, 0.55);
    point2_Sprite = game.add.sprite(110, 65 - 70 * yOffsetPerPx, 'pointsCollection', 0);
    point2_Sprite.anchor.set(0.5);
    point2_Sprite.scale.set(0.4, 0.55);

    // add the button to the lowerGate
    canon_Sprite = game.add.sprite(game.world.centerX, game.world.centerY - 35, 'canon');
    canon_Sprite.anchor.set(0.5);
    canon_Sprite.scale.setTo(0.425, 0.425);
    canon_Sprite.inputEnabled = true;
    canon_Sprite.events.onInputDown.add(canonPressed, this);
    canon_Sprite.input.enableDrag();
    canon_Sprite.events.onDragStop.add(dragStopped, this);

    canon_Sprite.input.allowVerticalDrag = false;
    canon_Sprite.input.allowHorizontalDrag = false;
    canon_Sprite.isMoving = false;

    // add all things into groups
    upperGate_Group.add(upperGate_backSh);
    upperGate_Group.add(upperGate_back);
    upperGate_Group.add(title);
    upperGate_Group.cacheAsBitmap = true;
    lowerGate_Group.add(lowerGate_backSh);
    lowerGate_Group.add(lowerGate_back);
    lowerGate_Group.add(canon_Sprite);
    hud_Group.add(point0_Sprite);
    hud_Group.add(point1_Sprite);
    hud_Group.add(point2_Sprite);

    createHUDGame();

    // hide shadows and hud
    upperGate_Group.getAt(0).visible = false;
    lowerGate_Group.getAt(0).visible = false;
    hud_Group.alpha = 0;


    text_BG = game.add.graphics(0, 0);
    text_BG.beginFill(0x000000);
    text_BG.moveTo(0, 0);
    text_BG.lineTo(game.world.width, -75);
    text_BG.lineTo(game.world.width, 75);
    text_BG.lineTo(0, 150);
    text_BG.lineTo(0, 0);
    text_BG.endFill();
    text_BG.alpha = 0;

    desktop_HitField = game.add.sprite(0, 75, 'background2');
    desktop_HitField.alpha = 0;
    desktop_HitField.inputEnabled = true;
    desktop_HitField.events.onInputDown.add(canonPressed, this);
    desktop_HitField.visible = true;

    game.world.bringToTop(upperGate_Group);
    game.world.bringToTop(lowerGate_Group);
    game.world.bringToTop(hud_Group);
}



// ---------------------------------------------------------------
//				This functions for handling dragging
// ---------------------------------------------------------------

function dragStopped() {

    if (!canon_Sprite.isMoving) {
        var xDiff = game.world.centerX - game.input.x;
        var yDiff = game.world.centerY - game.input.y;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            canon_Sprite.isMoving = true;
            if (xDiff < 0) {
                game.add.tween(canon_Sprite).to({x: game.world.centerX + 75}, 200, Phaser.Easing.Quadratic.Out, true, 0, 0, true);
            } else {
                game.add.tween(canon_Sprite).to({x: game.world.centerX - 75}, 200, Phaser.Easing.Quadratic.Out, true, 0, 0, true);
            }
            setTimeout("canon_Sprite.isMoving = false;", 401);
        }
        if (Math.abs(xDiff) < Math.abs(yDiff)) {
            canon_Sprite.isMoving = true;
            if (yDiff < 0) {
                game.add.tween(canon_Sprite).to({y: game.world.centerY - 35 + 75}, 200, Phaser.Easing.Quadratic.Out, true, 0, 0, true);
            } else {
                game.add.tween(canon_Sprite).to({y: game.world.centerY - 35 - 75}, 200, Phaser.Easing.Quadratic.Out, true, 0, 0, true);
            }
            setTimeout("canon_Sprite.isMoving = false;", 401);
        }

    }

    shoot();
}



// ---------------------------------------------------------------
//				This function resets the entire game
// ---------------------------------------------------------------

function resetAll() {

    // load local data
    loadSettings();
    loadProfile();

    updateColorGame();

    gameOver();

}


// ---------------------------------------------------------------
//				This function starts the next level
// 				it needs to reset any  game parameters
// ---------------------------------------------------------------

function nextLevel() {

    level++;

    text_BG.y = 300;


    var levelText = "LEVEL " + level;

    text_Group.removeAll();
    writeText(levelText);
    text_Group.x = game.world.centerX - (levelText.length - 1) * 25;
    text_Group.y = 335;
    text_Group.alpha = 0;

    text_BG.alpha = 0.5;
    text_Group.alpha = 1;
    game.world.bringToTop(text_Group);
    game.add.tween(text_BG).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 2000);
    game.add.tween(text_Group).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 2000);

    if (level > 1) {
        points += 10;
        updatePoints();
    }

    canon_Sprite.x = game.world.centerX;
    canon_Sprite.y = game.world.centerY - 35;

    nextLevelGame();
}


// ---------------------------------------------------------------
//				This function allows to write angled text
// ---------------------------------------------------------------

function writeText(textComplete) {
    for (var j = 0; j < textComplete.length; ++j) {
        var letter = game.add.text(0, -10 - (j * 50) * yOffsetPerPx, textComplete.substr(j, 1));
        letter.x = j * 50;
        // letter.align = 'center';
        letter.anchor.x = 0.5;

        //	Font style
        letter.font = 'PoetsenOne-Regular';
        letter.fontSize = 50;

        //	Stroke color and thickness
        letter.stroke = '#000000';
        letter.strokeThickness = 3;
        letter.fill = '#CECECE';
        text_Group.add(letter);
    }
}

// ---------------------------------------------------------------
//		This function has all calls if the button is pressed
// ---------------------------------------------------------------

function canonPressed() {
    // for the initial state
    if (canonState == "init") {

        if (game.device.desktop)
            desktop_HitField.visible = true;

        var lowerGate = game.add.tween(lowerGate_Group);
        lowerGate.to({y: 350}, 1500, Phaser.Easing.Bounce.Out);
        lowerGate.start();

        var raiseGate = game.add.tween(upperGate_Group);
        raiseGate.to({y: -300}, 1500, Phaser.Easing.Bounce.Out);
        raiseGate.start();

        // show shadows
        upperGate_Group.getAt(0).visible = true;
        lowerGate_Group.getAt(0).visible = true;

        // show hud
        game.add.tween(hud_Group).to({alpha: 1}, 1500, Phaser.Easing.Linear.None, true, 1500);

        // Reset level and points
        points = 0;
        updatePoints();

        level = 0;

        canonPressedGame();
        canonState = "open";

        setTimeout("nextLevel();", 1000);

    } else if (canonState == "open") {

        canonPressedGame();

    }
}



// ---------------------------------------------------------------
//		This function is always called by phaser on repaint
// ---------------------------------------------------------------

function update() {
    if (canon_Sprite.input.isDragged) {
        rotation = game.physics.arcade.angleToPointer(pointer_Sprite) + Math.PI / 2;
    }

    if (!canonState == "open") {
        if (canon_Sprite.x < 0)
            canon_Sprite.x = 0;
        if (canon_Sprite.x > game.world.width)
            canon_Sprite.x = game.world.width;

        if (canon_Sprite.input.isDragged) {
            canon_Sprite.x = game.input.x;
            canon_Sprite.y = game.world.centerY - 35 - yOffsetPerPx * (canon_Sprite.x - game.world.centerX);
        }
    }

    updateGame();
}



// ---------------------------------------------------------------
//		This function is called if the last line has a boules
// ---------------------------------------------------------------

function gameOver() {

    var lowerGate = game.add.tween(lowerGate_Group);
    lowerGate.to({y: 0}, 1500, Phaser.Easing.Bounce.Out);
    lowerGate.start();

    var raiseGate = game.add.tween(upperGate_Group);
    raiseGate.to({y: 0}, 1500, Phaser.Easing.Bounce.Out);
    raiseGate.start();

    // hide shadows
    upperGate_Group.getAt(0).visible = false;
    lowerGate_Group.getAt(0).visible = false;

    // hide hud
    hud_Group.alpha = 0;

    canonState = "init";

    game.add.tween(canon_Sprite).to({x: game.world.centerX, y: game.world.centerY - 35}, 1000, Phaser.Easing.Quadratic.In, true);
}


// ---------------------------------------------------------------
// 				This function updates the points
// ---------------------------------------------------------------

function updatePoints() {

    point0_Sprite.frame = Math.floor(points / 100);
    point1_Sprite.frame = Math.floor((points % 100) / 10);
    point2_Sprite.frame = points % 10;

}