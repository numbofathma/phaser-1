// ---------------------------------------------------------------
//			All needed variables for individual game
// ---------------------------------------------------------------

var warningLine_Sprite;
var pointer_Sprite;

var myBox_Sprite;

var TOTAL_TARGET_COLORS = 5;
// this decides how many color you have at the beginning
var colorCount;
// this decides how many shots you have to get a new line
var shootsTilLine;
// this decides how many lines there are in the beginning
var startLines;
// this decides the frequency of black stones
var blackStones;
// this array holds how many stones there are left of one color (to know if a color is still present)
var colors_Left = [];

// for shooting
var shootingBox_Sprite;
var shootRate = 500;
var nextShoot = 0;
var currentShootingBox = 1;

var targets_Group;
// this gruop just blocks the ceiling
var ceilingBox_Group;
// this group holds all falling stones after successful hit
var fallingBox_Group;
// could be used to start a level further down
var starting_Block = 100;
var starting_Real = starting_Block + 57;

// needed to create the entire field
var bigOffsetAtTop = false;
var fieldWidth = 8;
var fieldHeight = 8;

// for recursive check if already visited
var fieldVisited = new Array(fieldHeight + 1);
for (var rowIdx = 0; rowIdx < fieldHeight + 1; ++rowIdx) {
    var emptyRow = new Array(fieldWidth);
    for (var columnIdx = 0; columnIdx < fieldWidth; ++columnIdx)
        emptyRow[columnIdx] = false;
    fieldVisited[rowIdx] = emptyRow;
}
var connected = false;

// particle emitter for hits
var emitter;

var shootCounter = 0;
// this counts only the currently flying shots
var shootCounterTmp = 0;




// ---------------------------------------------------------------
//			This function returns a valid color
// @param1 if color in counted into the overview of the target boxes
// @param2 if it should only pick a color of the available colors
// ---------------------------------------------------------------

function getValidColor(doCount, onlyAvailable) {
    onlyAvailable = typeof onlyAvailable !== 'undefined' ? onlyAvailable : false;

    var idx = game.rnd.integerInRange(1, colorCount);
    var realIdx = idx - 1;
    if (onlyAvailable) {
        var stonesLeft = 0;
        for (var j = 0; j < colorCount; ++j) {
            stonesLeft += colors_Left[j];
        }
        if (stonesLeft > 0) {
            while (colors_Left[realIdx] <= 0) {
                idx = game.rnd.integerInRange(1, colorCount);
                realIdx = idx - 1;
            }
        }
    }
    if (doCount) {
        colors_Left[realIdx]++;
    }
    return idx;
}



// ---------------------------------------------------------------
//		This function swaps exinsting lines and toggles a new one
// ---------------------------------------------------------------

function swapLines() {
    bigOffsetAtTop = !bigOffsetAtTop;
    targets_Group.forEach(function (item) {
        game.add.tween(item).to({y: item.y + 55}, 400, Phaser.Easing.Bounce.In, true);
    });
    setTimeout("createLine()", 400);
}

function createLine() {


    for (var i = 0; i < fieldWidth; ++i) {
        if (targets_Group.getAt((fieldHeight - 1) * fieldWidth + i).alive) {
            gameOver();
            return;
        }
    }

    var startIdxLastLine = (fieldHeight - 1) * fieldWidth;
    var endIdxLastLine = startIdxLastLine + fieldWidth - 1;
    targets_Group.removeBetween(startIdxLastLine, endIdxLastLine, true);
    for (var i = fieldWidth - 1; i >= 0; --i) {
        var xOffset = 67;

        if (!bigOffsetAtTop)
            xOffset = 35;
        var x = xOffset + i * 62;
        var y = (starting_Real) - x * yOffsetPerPx;

        var frameIdx = 0;
        var blackDecision = game.rnd.integerInRange(0, 5);
        if (blackDecision <= 5 - blackStones)
            frameIdx = getValidColor(true, true);

        var targetBox = game.add.sprite(x, y, 'boules', frameIdx);
        targetBox.anchor.set(0.5);
        targetBox.scale.set(0.5);
        targets_Group.addAt(targetBox, 0);
        targetBox.enableBody = true;
        game.physics.enable(targetBox, Phaser.Physics.ARCADE);
        targetBox.body.immovable = true;
    }

}



// ---------------------------------------------------------------
// This function checks the neighborhood for boxes with the same frame
// ---------------------------------------------------------------

function checkSimilarities(posX, posY, frame) {

    // to make sure recursion does not revisit fields
    for (var i = 0; i < fieldHeight; ++i) {
        for (var j = 0; j < fieldWidth; ++j) {
            fieldVisited[i][j] = false;
        }
    }

    // starts the recursive search
    var similarBoxCount = checkSimilaritiesRecursive(posX, posY, frame, false);
    // if three together -> destroy
    if (similarBoxCount >= 2) {

        // to make sure recursion does not revisit fields
        for (var i = 0; i < fieldHeight; ++i) {
            for (var j = 0; j < fieldWidth; ++j) {
                fieldVisited[i][j] = false;
            }
        }
        // this time with destruction
        checkSimilaritiesRecursive(posX, posY, frame, true);

        cleanUp(similarBoxCount);

    }

    for (var i = 0; i < fieldWidth; ++i) {
        if (targets_Group.getAt(fieldHeight * fieldWidth + i).alive) {
            gameOver();
            return;
        }
    }


    // only if the last shot has landed -> swap
    shootCounterTmp--;
    if (shootCounter % shootsTilLine == 0 && shootCounterTmp == 0) {
        setTimeout("swapLines()", 500);
    }
}



// ---------------------------------------------------------------
// 				This function erases the neighborhood
// ---------------------------------------------------------------

function eraseNeighbors(posX, posY) {
    var erasedBoules = 0;
    var offset = -1;
    if (targets_Group.getAt(posY * fieldWidth).x == 135) {
        offset = 0;
    }
    if (posY > 0) {
        if (targets_Group.getAt((posY - 1) * fieldWidth + (posX + offset)).alive) {
            erasedBoules++;
            removeBox((posY - 1) * fieldWidth + (posX + offset));
        }
        if (targets_Group.getAt((posY - 1) * fieldWidth + (posX + offset + 1)).alive) {
            erasedBoules++;
            removeBox((posY - 1) * fieldWidth + (posX + offset + 1));
        }
    }
    if (posY < fieldHeight) {
        if (targets_Group.getAt((posY + 1) * fieldWidth + (posX + offset)).alive) {
            erasedBoules++;
            removeBox((posY + 1) * fieldWidth + (posX + offset));
        }
        if (targets_Group.getAt((posY + 1) * fieldWidth + (posX + offset + 1)).alive) {
            erasedBoules++;
            removeBox((posY + 1) * fieldWidth + (posX + offset + 1));
        }
    }
    if (posX > 0) {
        if (targets_Group.getAt((posY) * fieldWidth + (posX - 1)).alive) {
            erasedBoules++;
            removeBox((posY) * fieldWidth + (posX - 1));
        }
    }
    if (posX < fieldWidth - 1) {
        if (targets_Group.getAt((posY) * fieldWidth + (posX + 1)).alive) {
            erasedBoules++;
            removeBox((posY) * fieldWidth + (posX + 1));
        }
    }

    // only if the last shot has landed -> swap
    shootCounterTmp--;
    if (shootCounter % shootsTilLine == 0 && shootCounterTmp == 0) {
        setTimeout("swapLines()", 500);
    }

    removeBox(posY * fieldWidth + posX);
    cleanUp(erasedBoules);
}



// ---------------------------------------------------------------
// 				This function erases an entire line
// ---------------------------------------------------------------

function eraseLine(posY) {
    var erasedBoules = 0;
    for (var i = 0; i < fieldWidth; ++i) {
        if (targets_Group.getAt(posY * fieldWidth + i).alive) {
            erasedBoules++;
            removeBox(posY * fieldWidth + i);
        }
    }

    // only if the last shot has landed -> swap
    shootCounterTmp--;
    if (shootCounter % shootsTilLine == 0 && shootCounterTmp == 0) {
        setTimeout("swapLines()", 500);
    }

    cleanUp(erasedBoules);
}



// ---------------------------------------------------------------
// 				This function cleans the entire grid
// ---------------------------------------------------------------

function cleanUp(erasedBoules) {
    // now have a recursive check for connections and let all others fall down
    fallingBox_Group.removeAll(true);
    fallingBox_Group.y = 0;
    var fallingBoules = 0;
    for (var a = 0; a < fieldHeight; ++a) {
        for (var b = 0; b < fieldWidth; ++b) {
            connected = false;
            // to make sure recursion does not revisit fields
            for (var i = 0; i < fieldHeight; ++i) {
                for (var j = 0; j < fieldWidth; ++j) {
                    fieldVisited[i][j] = false;
                }
            }
            var idx = a * fieldWidth + b;
            if (targets_Group.getAt(idx).alive) {
                checkConnectionRecursive(b, a);
                if (connected == false) {
                    createFallingBox(b, a);
                    fallingBoules++;
                }
            }
        }
    }
    game.add.tween(fallingBox_Group).to({y: 600}, 750, Phaser.Easing.Quadratic.In, true, 200);

    // update points
    var newPoints = Math.floor((erasedBoules + 1) / 3);
    points += newPoints;
    updatePoints();

    // if we still have a color that is no longer available -> change it
    if (colors_Left[currentShootingBox - 1] <= 0) {
        currentShootingBox = getValidColor(false, true);
        myBox_Sprite.loadTexture('boules');
        myBox_Sprite.frame = currentShootingBox;
    }

    // check for possible next level
    var stonesLeft = 0;
    for (var j = 0; j < colorCount; ++j) {
        stonesLeft += colors_Left[j];
    }

    // create new level and increase colorCount if
    if (stonesLeft <= 0) {
        nextShoot = game.time.now + 2000;
        setTimeout("nextLevel()", 1000);
    }

    return fallingBoules;
}



// ---------------------------------------------------------------
// 				This function removes a box at an index
// ---------------------------------------------------------------

function removeBox(idx) {
    colors_Left[targets_Group.getAt(idx).frame - 1]--;
    targets_Group.getAt(idx).kill();
    targets_Group.getAt(idx).frame = 0;

    emitter.x = targets_Group.getAt(idx).x;
    emitter.y = targets_Group.getAt(idx).y;
    emitter.start(true, 1000, null, 5);
    emitter.update();
}



// ---------------------------------------------------------------
// 			This function creates a falling box at pos
// ---------------------------------------------------------------

function createFallingBox(posX, posY) {
    var idx = posY * fieldWidth + posX;
    var x = targets_Group.getAt(idx).x;
    var y = targets_Group.getAt(idx).y;

    var fallingBox = game.add.sprite(x, y, 'boules', targets_Group.getAt(idx).frame);
    fallingBox.anchor.set(0.5);
    fallingBox.scale.set(0.5);
    fallingBox_Group.add(fallingBox);

    removeBox(idx);
}



// ---------------------------------------------------------------
// 	This function recursively checks the neighbors for similarity
// ---------------------------------------------------------------

function checkSimilaritiesRecursive(posX, posY, frame, destroy) {
    var similarCount = 0;

    // depending on the shift it has to check current+left or right+current above and below
    var shifted = false;
    if (posY % 2 != bigOffsetAtTop)
        shifted = true;

    fieldVisited[posY][posX] = true;

    if (destroy) {
        var idx = posY * fieldWidth + posX;
        removeBox(idx);
    }

    if (posY + 1 < fieldHeight) {
        if (targets_Group.getAt((posY + 1) * fieldWidth + posX).frame == frame && !fieldVisited[posY + 1][posX]) {
            similarCount++;
            var temp = checkSimilaritiesRecursive(posX, posY + 1, frame, destroy);
            similarCount += temp;
        }
        if (shifted) {
            if (posX + 1 < fieldWidth) {
                if (targets_Group.getAt((posY + 1) * fieldWidth + posX + 1).frame == frame && !fieldVisited[posY + 1][posX + 1]) {
                    similarCount++;
                    var temp = checkSimilaritiesRecursive(posX + 1, posY + 1, frame, destroy);
                    similarCount += temp;
                }
            }
        } else {
            if (posX > 0) {
                if (targets_Group.getAt((posY + 1) * fieldWidth + posX - 1).frame == frame && !fieldVisited[posY + 1][posX - 1]) {
                    similarCount++;
                    var temp = checkSimilaritiesRecursive(posX - 1, posY + 1, frame, destroy);
                    similarCount += temp;
                }
            }
        }
    }
    if (posX > 0) {
        if (targets_Group.getAt(posY * fieldWidth + posX - 1).frame == frame && !fieldVisited[posY][posX - 1]) {
            similarCount++;
            var temp = checkSimilaritiesRecursive(posX - 1, posY, frame, destroy);
            similarCount += temp;
        }
    }
    if (posX + 1 < fieldWidth) {
        if (targets_Group.getAt(posY * fieldWidth + posX + 1).frame == frame && !fieldVisited[posY][posX + 1]) {
            similarCount++;
            var temp = checkSimilaritiesRecursive(posX + 1, posY, frame, destroy);
            similarCount += temp;
        }
    }
    if (posY > 0) {
        if (targets_Group.getAt((posY - 1) * fieldWidth + posX).frame == frame && !fieldVisited[posY - 1][posX]) {
            similarCount++;
            var temp = checkSimilaritiesRecursive(posX, posY - 1, frame, destroy);
            similarCount += temp;
        }
        if (shifted) {
            if (posX + 1 < fieldWidth) {
                if (targets_Group.getAt((posY - 1) * fieldWidth + posX + 1).frame == frame && !fieldVisited[posY - 1][posX + 1]) {
                    similarCount++;
                    var temp = checkSimilaritiesRecursive(posX + 1, posY - 1, frame, destroy);
                    similarCount += temp;
                }
            }
        } else {
            if (posX > 0) {
                if (targets_Group.getAt((posY - 1) * fieldWidth + posX - 1).frame == frame && !fieldVisited[posY - 1][posX - 1]) {
                    similarCount++;
                    var temp = checkSimilaritiesRecursive(posX - 1, posY - 1, frame, destroy);
                    similarCount += temp;
                }
            }
        }
    }

    return similarCount;
}



// ---------------------------------------------------------------
// 	This function recursively checks the connectivity
// ---------------------------------------------------------------

function checkConnectionRecursive(posX, posY) {
    // if black -> not connected
    if (!targets_Group.getAt(posY * fieldWidth + posX).alive)
        return;

    var xOffset = targets_Group.getAt(posY * fieldWidth + posX).x % 62;
    var shifted = false;
    if (xOffset == 5) //TODO ugly, but 10 means 135 offset
        shifted = true;

    fieldVisited[posY][posX] = true;

    // if at top -> connected
    if (posY == 0) {
        connected = true;
        return;
    }

    if (posY + 1 < fieldHeight) {
        if (!fieldVisited[posY + 1][posX]) {
            checkConnectionRecursive(posX, posY + 1);
        }
        if (shifted) {
            if (posX + 1 < fieldWidth) {
                if (!fieldVisited[posY + 1][posX + 1]) {
                    checkConnectionRecursive(posX + 1, posY + 1);
                }
            }
        } else {
            if (posX > 0) {
                if (!fieldVisited[posY + 1][posX - 1]) {
                    checkConnectionRecursive(posX - 1, posY + 1);
                }
            }
        }
    }
    if (posX > 0) {
        if (!fieldVisited[posY][posX - 1]) {
            checkConnectionRecursive(posX - 1, posY);
        }
    }
    if (posX + 1 < fieldWidth) {
        if (!fieldVisited[posY][posX + 1]) {
            checkConnectionRecursive(posX + 1, posY);
        }
    }
    if (posY > 0) {
        if (!fieldVisited[posY - 1][posX]) {
            checkConnectionRecursive(posX, posY - 1);
        }
        if (shifted) {
            if (posX + 1 < fieldWidth) {
                if (!fieldVisited[posY - 1][posX + 1]) {
                    checkConnectionRecursive(posX + 1, posY - 1);
                }
            }
        } else {
            if (posX > 0) {
                if (!fieldVisited[posY - 1][posX - 1]) {
                    checkConnectionRecursive(posX - 1, posY - 1);
                }
            }
        }
    }
}



// ---------------------------------------------------------------
// 			This function shoots the current block
// ---------------------------------------------------------------

function shoot() {
    // if we are allowed to shoot and there are shootingBoules (should always be true)
    if (game.time.now > nextShoot && !shootingBox_Sprite.alive)
    {
        shootCounter++;
        shootCounterTmp++;

        nextShoot = game.time.now + shootRate;

        // if we swap, do not allow new shoots
        if (shootCounter % shootsTilLine == 0) {
            nextShoot = game.time.now + 2000;
        }

        shootingBox_Sprite.hasCollided = false;
        shootingBox_Sprite.reset(pointer_Sprite.x, pointer_Sprite.y);
        shootingBox_Sprite.loadTexture(myBox_Sprite.key);
        shootingBox_Sprite.frame = currentShootingBox;

        // calculate "mouse" position on top by angle
        var posX = Math.tan(rotation) * shootingBox_Sprite.y;
        tmpPointer.x = posX + pointer_Sprite.x;
        tmpPointer.y = 0;

        game.physics.arcade.moveToPointer(shootingBox_Sprite, 1800, tmpPointer);

        currentShootingBox = getValidColor(false, true);
        myBox_Sprite.loadTexture('boules');
        myBox_Sprite.frame = currentShootingBox;
    }
}