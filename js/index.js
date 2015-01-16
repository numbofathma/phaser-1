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
    game.load.image('closeButton', 'img/close.png');
    game.load.image('pauseButton', 'img/pause.png');
    game.load.image('canon', 'img/canon.png');
    game.load.image('resetButton', 'img/reset.png');
    game.load.spritesheet('point', 'img/points.png', 80, 98);
    game.load.spritesheet('boules', 'img/boules.png', 101, 115);
    game.load.image('pointer', 'img/pointer.png');
    game.load.image('warningLine', 'img/warningLine.png');

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();
    
    scaleFactor = game.scale.width/gameWidth;

    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    game.scale.setUserScale(scaleFactor, scaleFactor, 0, 0);

}


// ---------------------------------------------------------------
//	On crée toutes les variables dont on aura besoin
// ---------------------------------------------------------------

//indique le sens de la boule
var tmpPointer = new Phaser.Pointer(this.game, 3);

//partie haute du jeu
var upperGate_Group;
//partie base du jeu
var lowerGate_Group;
//sprite du canon
var canon_Sprite;
var canonState = "init";
//partie menu du jeu (inclus dans la partie haute du jeu)
var hud_Group;
var point0_Sprite;
var point1_Sprite;
var point2_Sprite;
//défini le niveau initial ainsi que le nombre de points
var points = 0;
var level = 0;

//variable du score [0]=point [1]=nom [2]=date
var highscore;
var highscore_Group;
var highscore_Texts = [];
var highscoreMarker_Text;
var highscoreCongrat_Text;


var userInput = document.getElementById("username");
var userName = "-";

//Contient seulement des lettres à affichés
var text_Group;
var text_BG;

//calcule la rotation pour calculer la trajectoire
var rotation;

var yOffsetPerPx = 150 / 1080;
var desktop_HitField;

// ---------------------------------------------------------------
//     Les fonctions permettant la mise en place de l'interface
// ---------------------------------------------------------------

function create() {

    game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background4');

    pause_Group = game.add.group();
    upperGate_Group = game.add.group();
    lowerGate_Group = game.add.group();
    hud_Group = game.add.group();
    highscore_Group = game.add.group();
    text_Group = game.add.group();

    createGame();

    //crée la partie haute du jeu (celle avec le score)
    var upperGate_back = new Phaser.Graphics(game, 0, 0);
    upperGate_back.beginFill(0xF3F3F3);
    upperGate_back.moveTo(0, 0);
    upperGate_back.lineTo(game.world.width, 0);
    upperGate_back.lineTo(game.world.width, 350);
    upperGate_back.lineTo(0, 425);
    upperGate_back.lineTo(0, 0);
    upperGate_back.endFill();

    //crée le titre du jeu
    title = game.add.sprite(game.world.centerX, game.world.centerY - 250, 'title');
    title.anchor.set(0.5);
    title.scale.set(0.6);

    //crée la planche basse du niveau (celle composé du lanceur)
    var lowerGate_back = new Phaser.Graphics(game, 0, 0);
    lowerGate_back.beginFill(0xF3F3F3);
    lowerGate_back.moveTo(0, game.world.height);
    lowerGate_back.lineTo(game.world.width, game.world.height);
    lowerGate_back.lineTo(game.world.width, 349);
    lowerGate_back.lineTo(0, 424);
    lowerGate_back.lineTo(0, 0);
    lowerGate_back.endFill();
    
    //crée le bouton reset
    reset_Sprite = game.add.sprite(450, 25, 'resetButton', 0);
    reset_Sprite.anchor.set(0.5);
    reset_Sprite.scale.set(0.4);
    
    var pause_bg = game.add.graphics(0, 0);
    pause_bg.beginFill(0x000000);
    pause_bg.moveTo(0, 0);
    pause_bg.lineTo(game.world.width, 0);
    pause_bg.lineTo(game.world.width, game.world.height);
    pause_bg.lineTo(0, game.world.height);
    pause_bg.lineTo(0, 0);
    pause_bg.endFill();
    pause_bg.alpha = 0.8;
    pause_Group.add(pause_bg);

    // add the close button
    var close_Sprite = game.add.sprite(510, 25, 'closeButton', 0);
    close_Sprite.anchor.set(0.5);
    close_Sprite.scale.set(0.4);
    close_Sprite.inputEnabled = true;
    close_Sprite.events.onInputDown.add(closeButtonPressed, this);
    pause_Group.add(close_Sprite);

    pause_Group.y = game.world.height;
    
    //crée le bouton pause
    pause_Sprite = game.add.sprite(510, 25, 'pauseButton', 0);
    pause_Sprite.anchor.set(0.5);
    pause_Sprite.scale.set(0.4);
    
    userInput.style.left = (game.scale.offset.x + (325 * scaleFactor)) + "px";
    userInput.style.top = (game.scale.offset.y + (100 * scaleFactor)) + "px";
    userInput.style.width = (125 * scaleFactor) + "px";
    userInput.style.height = (25 * scaleFactor) + "px";
    userInput.style.borderRadius = (20 * scaleFactor) + "px";


    //crée le score
    point0_Sprite = game.add.sprite(40, 65, 'point', 0);
    point0_Sprite.anchor.set(0.5);
    point0_Sprite.scale.set(0.4, 0.55);
    point1_Sprite = game.add.sprite(75, 65 - 35 * yOffsetPerPx, 'point', 0);
    point1_Sprite.anchor.set(0.5);
    point1_Sprite.scale.set(0.4, 0.55);
    point2_Sprite = game.add.sprite(110, 65 - 70 * yOffsetPerPx, 'point', 0);
    point2_Sprite.anchor.set(0.5);
    point2_Sprite.scale.set(0.4, 0.55);

    //ajoute le canon à la partie basse
    canon_Sprite = game.add.sprite(game.world.centerX, game.world.centerY - 35, 'canon');
    canon_Sprite.anchor.set(0.5);
    canon_Sprite.scale.setTo(0.425, 0.425);
    canon_Sprite.inputEnabled = true;
    canon_Sprite.events.onInputDown.add(canonPressed, this);
    canon_Sprite.input.enableDrag();
    canon_Sprite.events.onDragStop.add(shoot, this);

    canon_Sprite.input.allowVerticalDrag = false;
    canon_Sprite.input.allowHorizontalDrag = false;
    canon_Sprite.isMoving = false;

    //ajoute tout les composants aux différentes parties
    upperGate_Group.add(upperGate_back);
    upperGate_Group.add(title);
    upperGate_Group.cacheAsBitmap = true;
    lowerGate_Group.add(lowerGate_back);
    lowerGate_Group.add(canon_Sprite);
    hud_Group.add(point0_Sprite);
    hud_Group.add(point1_Sprite);
    hud_Group.add(point2_Sprite);
    hud_Group.add(reset_Sprite);
    hud_Group.add(pause_Sprite);

    createHUDGame();

    //cache les élements du menu lorsque le panneau est fermé
    hud_Group.alpha = 0;


    var highscore_bgTrans = game.add.graphics(0, 0);
    highscore_bgTrans.beginFill(0x000000);
    highscore_bgTrans.moveTo(0, 0);
    highscore_bgTrans.lineTo(game.world.width, 0);
    highscore_bgTrans.lineTo(game.world.width, game.world.height);
    highscore_bgTrans.lineTo(0, game.world.height);
    highscore_bgTrans.lineTo(0, 0);
    highscore_bgTrans.endFill();
    highscore_bgTrans.alpha = 0.8;
    highscore_Group.add(highscore_bgTrans);

    var highscore_bg = game.add.graphics(0, 0);
    highscore_bg.beginFill(0x000000);
    highscore_bg.moveTo(50, 50);
    highscore_bg.lineTo(game.world.width - 50, 50);
    highscore_bg.lineTo(game.world.width - 50, 525);
    highscore_bg.lineTo(50, 525);
    highscore_bg.lineTo(50, 50);
    highscore_bg.endFill();
    highscore_bg.alpha = 0.8;
    highscore_Group.add(highscore_bg);

    var highscoreText_HL = game.add.text(game.world.centerX, 75, "HIGHSCORE", {font: "50pt PoetsenOne-Regular", fill: "#CECECE"});
    highscoreText_HL.anchor.x = 0.5;
    highscore_Group.add(highscoreText_HL);

    var highscoreP_Text = game.add.text(82, 175, "", {font: "24pt PoetsenOne-Regular", fill: "#CECECE"});
    highscore_Group.add(highscoreP_Text);
    highscore_Texts[0] = highscoreP_Text;
    var highscoreU_Text = game.add.text(165, 175, "", {font: "24pt PoetsenOne-Regular", fill: "#CECECE"});
    highscore_Group.add(highscoreU_Text);
    highscore_Texts[1] = highscoreU_Text;
    var highscoreD_Text = game.add.text(293, 175, "", {font: "24pt PoetsenOne-Regular", fill: "#CECECE"});
    highscore_Group.add(highscoreD_Text);
    highscore_Texts[2] = highscoreD_Text;

    highscoreMarker_Text = game.add.text(62, 175, "", {font: "24pt PoetsenOne-Regular", fill: "#CECECE"});
    highscore_Group.add(highscoreMarker_Text);

    highscoreCongrat_Text = game.add.text(game.world.centerX, 425, "", {font: "26pt PoetsenOne-Regular", fill: "#CECECE"});
    highscoreCongrat_Text.anchor.x = 0.5;
    highscore_Group.add(highscoreCongrat_Text);

    // add the close button
    var closeHighscore_Sprite = game.add.sprite(game.world.width - 50, 50, 'closeButton');
    closeHighscore_Sprite.anchor.set(0.5);
    closeHighscore_Sprite.scale.set(0.4);
    closeHighscore_Sprite.inputEnabled = true;
    closeHighscore_Sprite.events.onInputDown.add(hideHighscore, this);
    highscore_Group.add(closeHighscore_Sprite);
    highscore_Group.visible = false;

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

    highscore = [0, "Nacim", "-", 0, "Bastien", "-", 0, "Yann", "-"];

    game.world.bringToTop(upperGate_Group);
    game.world.bringToTop(lowerGate_Group);
    game.world.bringToTop(hud_Group);
}

// ---------------------------------------------------------------
//	Cette fonction recommence une partie
// ---------------------------------------------------------------

function resetAll() {

    updateColorGame();

    gameOver(false);

}

// ---------------------------------------------------------------
//	Cette fonction affiche le menu de pause
// ---------------------------------------------------------------

function pauseButtonPressed(){
    pause_Group.y = 0;
    game.world.bringToTop(pause_Group);
    userInput.style.visibility = "visible";
}

function closeButtonPressed(){
	pause_Group.y = game.world.height;
	userInput.style.visibility = "hidden";
	userName = userInput.value.substring(0,7);
	userInput.value = userName;
	localStorage.setItem("userName", userName);
}


// ---------------------------------------------------------------
//	change de niveau, remet les élements à leur place
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
//	Permet d'écrire penché
// ---------------------------------------------------------------

function writeText(textComplete) {
    for (var j = 0; j < textComplete.length; ++j) {
        var letter = game.add.text(0, -10 - (j * 50) * yOffsetPerPx, textComplete.substr(j, 1));
        letter.x = j * 50;
        //Centrer
        letter.anchor.x = 0.5;

        //Font
        letter.font = 'PoetsenOne-Regular';
        letter.fontSize = 50;

        //Epaisseur
        letter.stroke = '#000000';
        letter.strokeThickness = 3;
        letter.fill = '#CECECE';
        text_Group.add(letter);
    }
}

// ---------------------------------------------------------------
//     Cette fonction est appellé après clic sur le bouton bleu
// ---------------------------------------------------------------

function canonPressed() {
    //Ouvre les panneaux après clic
    if (canonState == "init") {

        desktop_HitField.visible = true;

        var lowerGate = game.add.tween(lowerGate_Group);
        lowerGate.to({y: 350}, 1500, Phaser.Easing.Bounce.Out);
        lowerGate.start();

        var raiseGate = game.add.tween(upperGate_Group);
        raiseGate.to({y: -300}, 1500, Phaser.Easing.Bounce.Out);
        raiseGate.start();

        // show hud
        game.add.tween(hud_Group).to({alpha: 1}, 1500, Phaser.Easing.Linear.None, true, 1500);

        // Reset level and points
        points = 0;
        updatePoints();
        
        //action lors de clic sur bouton reset
        reset_Sprite.inputEnabled = true;
	reset_Sprite.events.onInputDown.add(resetAll, this);
        //action lors de clic sur bouton pause
        pause_Sprite.inputEnabled = true;
	pause_Sprite.events.onInputDown.add(pauseButtonPressed, this);

        level = 0;

        canonPressedGame();
        canonState = "open";

        setTimeout("nextLevel();", 1000);

    } else if (canonState == "open") {

        canonPressedGame();

    }
}

// ---------------------------------------------------------------
//	Appellé après chaque tir
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
//	Fonction de perdant
// ---------------------------------------------------------------

function gameOver(showScore) {

    if(showScore){
        postHighScore();
    }

    var lowerGate = game.add.tween(lowerGate_Group);
    lowerGate.to({y: 0}, 1500, Phaser.Easing.Bounce.Out);
    lowerGate.start();

    var raiseGate = game.add.tween(upperGate_Group);
    raiseGate.to({y: 0}, 1500, Phaser.Easing.Bounce.Out);
    raiseGate.start();

    // hide hud
    hud_Group.alpha = 0;

    canonState = "init";

    game.add.tween(canon_Sprite).to({x: game.world.centerX, y: game.world.centerY - 35}, 1000, Phaser.Easing.Quadratic.In, true);
}


// ---------------------------------------------------------------
// 	Mets à jour le score
// ---------------------------------------------------------------

function updatePoints() {

    point0_Sprite.frame = Math.floor(points / 100);
    point1_Sprite.frame = Math.floor((points % 100) / 10);
    point2_Sprite.frame = points % 10;

}

// ---------------------------------------------------------------
// 	Cette fonction permet un tableau de score
// ---------------------------------------------------------------

function postHighScore() {
    var date = new Date();

    if (points > highscore[0]) {
        highscoreMarker_Text.alpha = 1;
        highscore = [points, userName, date.toLocaleDateString("en-GB"), highscore[0], highscore[1], highscore[2], highscore[3], highscore[4], highscore[5]];
        highscoreMarker_Text.text = "\n>                                                       <";
        game.add.tween(highscoreMarker_Text).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 0, 4, true);
        highscoreCongrat_Text.text = "Nouveau record";
    } else if (points > highscore[3]) {
        highscoreMarker_Text.alpha = 1;
        highscore = [highscore[0], highscore[1], highscore[2], points, userName, date.toLocaleDateString("en-GB"), highscore[3], highscore[4], highscore[5]];
        highscoreMarker_Text.text = "\n\n>                                                       <";
        game.add.tween(highscoreMarker_Text).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 0, 4, true);
        highscoreCongrat_Text.text = "Excellent";
    } else if (points > highscore[6]) {
        highscoreMarker_Text.alpha = 1;
        highscore[6] = points;
        highscore[7] = userName;
        highscore[8] = date.toLocaleDateString("en-GB");
        highscoreMarker_Text.text = "\n\n\n>                                                       <";
        game.add.tween(highscoreMarker_Text).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 0, 4, true);
        highscoreCongrat_Text.text = "Bien";
    }

    showHighscore();
}

function showHighscore() {
    game.world.bringToTop(highscore_Group);
    var score0 = ('000000000' + highscore[0]).substr(-3);
    var score1 = ('000000000' + highscore[3]).substr(-3);
    var score2 = ('000000000' + highscore[6]).substr(-3);
    highscore_Texts[0].text = "\n" + score0 + "\n" + score1 + "\n" + score2;
    highscore_Texts[1].text = "\n" + highscore[1] + "\n" + highscore[4] + "\n" + highscore[7];
    highscore_Texts[2].text = "\n" + highscore[2] + "\n" + highscore[5] + "\n" + highscore[8];

    highscore_Group.visible = true;
}

function hideHighscore() {
    highscore_Group.visible = false;
}