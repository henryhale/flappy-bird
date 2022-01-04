/* Flappy Bird by Henry Hale */

// Toast Plugin
var useToastText = false;
if (showToastFor) {
	useToastText = true;
	window.addEventListener("DOMContentLoaded", function () {
		// Welcoming User
		showToastFor('Flappy Bird by Henry Hale');
	}, false);
}

//console.log('Let\'s Get Started');



// Object to hold images needed
var imgAssets = new Object();
// The Background
imgAssets.background = null;
// The Foreground
imgAssets.foreground = null;
// The South Pole
imgAssets.southpole = null;
// The North Pole 
imgAssets.northpole = null;
// The Bird
imgAssets.bird = null;

// The names of the images to be loaded into the 'imgAssets'
var imgNames = new Object();
// Default Names
imgNames = [
    'bg.png', // Background
    'fg.png', // Foreground
    'pipeSouth.png', // South Pole
    'pipeNorth.png', // North Pole
    'bird.png' // Flappy Bird
];


// Our Canvas
var canvas = Dom.get('myCanvas');
// Drawing Context 
var ctx = canvas.getContext('2d');
// Dimensions
var canvasWidth = canvas.width, // Width
    canvasHeight = canvas.height; // Height
// Initial Bird Position
var initPosX = 50,
    initPosY = 100;
// Flappy bird - player
var newBird = new Bird(initPosX, initPosY, {
    lowLimit : canvasHeight*0.85,
    highLimit : initPosX
});
// Gravity on Bird
var gravity = 2; // Increases with speed
// Speed of flight
var speed = 0;
// MaxSpeed
var maxSpeed = 5;
// Speed Increment
var speedSize = 0.25;
// Length between poles in x moving in y
var segmentLength = canvasWidth - 5 - canvasWidth/3;
// Controls
var spaceKey = false;
// States
var playGame = true,
    pause = false;
// Game Score
var score = 0;
// poles
var poles = [];
// number of poles
var poleNum = 2;
// Sounds
var fly = Dom.get('flyingSound');
var over = Dom.get('scoreSound');
fly.loop = true;
fly.volume = 0.5; 
over.loop = false;
over.volume = 0.6; 
// Renderer
var Render = new Object();
// Drawing context
Render.context = ctx;
// Clearing everything
Render.clear = function () {
    // Clear everything
    this.context.save();
	this.context.clearRect(0, 0, canvasWidth, canvasHeight);
    this.context.restore();
};
// Guiding grid
Render.grid = function() {
    // From the helpers
    drawGrid(this.context);
};
// Background
Render.background = function() {
    if (imgAssets.background) {
        // save state
        this.context.save();
        // draw image
        this.context.drawImage(imgAssets.background, 0, 0);
        // restore state
        this.context.restore();
    } else {
        console.log('Background Image not loaded!');
    }
};
// Foreground
Render.foreground = function() {
    if (imgAssets.foreground) {
        //* save state
        this.context.save();
        // draw image
        this.context.drawImage(imgAssets.foreground, 0, canvasHeight*0.9);
        // restore state
        this.context.restore();
    } else {
        console.log('Foreground Image not loaded!');
    }
};
// Bird
Render.bird = function() {
    // If its image is loaded
    if (imgAssets.bird) {
        // update the bird object
        newBird.image = imgAssets.bird;
        // draw it now
        newBird.draw(this.context);
    } else {
        console.log('Flappy Bird Image not loaded!');
    }
};
// Add poles
Render.addPoles = function () {
    for (let k = 0; k < poleNum; k++) {
        const randSide = Calc.randomInt(0, 10);
        if (randSide % 2) {
            poles.push(new Pole(canvasWidth-5, 0, imgAssets.northpole, 0));
        } else {
            poles.push(new Pole(canvasWidth-5, 0.9*canvasHeight, imgAssets.southpole, 1));
        }
    }
};
// Poles
Render.poles = function() {
    // Pole image loaded
    if(imgAssets.northpole && imgAssets.southpole){
        // Limit Number of Poles
        // Cloning the poles
        let virtualPoles = []; 
        for (let g = 0; g < poles.length; g++) {
            virtualPoles.push(poles[g]);
        }
        // Then check the clone for a Pole that hit the Left Boundary
        for (let k = 0; k < virtualPoles.length; k++) {
            const aPole = virtualPoles[k];
            if (aPole.x <= -aPole.imageW) {
                // Then remove that Pole
                Render.removePoleByValueX(aPole, poles);
                // Update the score, bird has missed this pole
                score += 5;
                // Sound
                over.play();
                break;
            }
        }
        // Get the pole closet to the left boundary
		let closestPole = poles.reduce(function(a, b) {
            return Math.min(a.x, b.x);
        });
        // Check If the number of Poles is less 
        if (closestPole < canvasWidth/3) {
            // Then, Add poles
            Render.addPoles();
        }
        // Finally draw all poles
        for (let i = 0; i < poles.length; i++) {
            const pole = poles[i];
            pole.draw(Render.context);
            let speedFactor = 1;
            if (score>200) {
                speedFactor = 2;
            } else if (score>400) {
                speedFactor = 3;
            } else if (score > 600) {
                speedFactor = 4;
            }
            pole.move(speedFactor);
        }
    } else {
        console.log('North Pole & South Pole images not loaded!');
    }
}
// Remove Pole from Poles Array with value x eqaulity
Render.removePoleByValueX = function (val, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            arr.splice(i, 1);
            break;
        }
    }
};

// Render game objects
var RenderGame = function () {
    // Background
    Render.background();

    // Poles
    Render.poles();

    // Background
    Render.foreground();

    // Bird
    Render.bird();
    
    // Grid  
    //Render.grid();
};

// Game Score
Render.score = function () {
    // save state
    this.context.save();
    // draw score
    this.context.font = "italic small-caps bold 14px Helvetica, Arial, sans-serif";
    this.context.textAlign = "left"
    this.context.fillText("Score : "+score,10,25);
    // restore
    this.context.restore();
};

// Game State
Render.state = function (state) {
    // save state
    this.context.save();
    // draw score
    this.context.font = "italic small-caps bold 28px Helvetica, Arial, sans-serif";
    this.context.textAlign = "center"
    this.context.fillText(state,canvasWidth/2,canvasHeight/2);
    // restore
    this.context.restore();
};

// Resize Mobile
Render.touchFly = function () {
    var touchable = 'ontouchstart' in window || 'createTouch' in document;
    function pageWidth() {
        return window.innerWidth != null? window.innerWidth : document.documentElement &&
            document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body != null
            ? document.body.clientWidth : null;
    }
    function pageHeight() {
        return window.innerHeight != null? window.innerHeight : document.documentElement &&
            document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body !=
            null? document.body.clientHeight : null;
    }
    let wW = pageWidth();
    let hH = pageHeight();
    if (touchable && Dom.get('mobileControl')) {
        // Show Controls
        Dom.get('mobileControl').style.display = 'block';
    //if (touchable && (wW && wW <=720)) {
        // Listener to button clicks
        if (Dom.get('toggleFly')) {
            Dom.on('toggleFly','click',function (e) {
                e.preventDefault();
                spaceKey = spaceKey ? !spaceKey : true;
            }, false);
        }
        if (Dom.get('togglePlay')) {
            Dom.on('togglePlay','click',function (e) {
                e.preventDefault();
                pause = pause ? !pause : true;
            }, false);
        }
    }
};

// Updating game state
var UpdateGame = function () {
    // Increase speed
    speed = Calc.increase(speed,speedSize,maxSpeed);
    // Bird's position and direction
    if (spaceKey) {
        // Adjust
        newBird.angle = -0; // Rotate Upwards
        newBird.y -= gravity+speed; // Fly high
        // Play sound
        //fly.play();
    } else {
        // Reset
        newBird.angle = 15; // Rotate Downwards
        newBird.y += gravity+speed; // Fly down
        // Pause Sound
        //fly.pause();
    }
    // Bird hitting the ground
    if (newBird.y >= newBird.vertLimits.low) {
        EndGame(); 
    }

    // Check Boundaries - Limits - Collisions
    newBird.checkLimits();

    // clone poles
    let clonePoles = [];
    for (let r = 0; r < poles.length; r++) {
        const anyPole = poles[r];
        // Centres
        var centB = {x: newBird.x + newBird.width/2, y: newBird.y + newBird.height/2};
        var centP = {x: anyPole.x + anyPole.width/2, y: anyPole.y + anyPole.randomOffsetY/2};
        var centDist = Math.sqrt(Math.pow(centP.x-centB.x,2)+Math.pow(centP.y-centB.y,2)) || 0; 
        // Only taking poles infront of the bird
        if(anyPole.x >= newBird.x-newBird.width*4 ){
            clonePoles.push({
                pole : anyPole,
                distance : Math.floor(centDist)
            });
        }
    }
    // Get the pole closet distance to the Bird
    let closestToBird = clonePoles.reduce(function(a, b) {
        return Math.min(a.distance, b.distance) ?  Math.min(a.distance, b.distance) : 0;
    });
    // The Pole
    let thePole = null;
    for (let c = 0; c < clonePoles.length; c++) {
        const anyPole = clonePoles[c];
        // The closet pole
        if (anyPole.distance === closestToBird) {
            thePole = anyPole.pole;
            break;
        }
    }
    // If it is not null
    if (thePole) {
        //looping through the sides of the pole
        // Vertically
        for (let py = thePole.y; py < thePole.y + thePole.height - thePole.randomOffsetY; py+=5) {
            // this arc (==circle) is not draggable!!
            //let nn = thePole.x;
            /*ctx.save();
            ctx.beginPath();
            ctx.arc(nn, py, 2, 0, Math.PI*2);
            ctx.fillStyle='gray';
            ctx.fill();
            ctx.restore();*/
            for (let px = thePole.x; px < thePole.x+thePole.width; px+=2) {
                let cordX = px - newBird.x - newBird.width;
                let cordY = py - newBird.y - newBird.height;
                let cordZ = Math.floor(Math.sqrt(cordX*cordX + cordY*cordY));
                
                if (newBird.x > px-newBird.width*1.2125) {
                    if (newBird.y >= thePole.y-thePole.randomOffsetY && thePole.y-thePole.randomOffsetY > 0) {
                        EndGame();
                        break;
                    }
                    if (newBird.y <= thePole.height-thePole.randomOffsetY && thePole.y-thePole.randomOffsetY < 0) {
                        EndGame();
                        break;
                    }
                }

            }  
            //nn+=2;  
        }
    }
};

// Running Game
var startDrawing = function () {

    // Clear everything
	Render.clear();

    // Render Game Objects
    RenderGame();

    // Update Game Objects
    UpdateGame();

    // Show Score
    Render.score();

};

// how many 'update' frames per second
var fps           	= 60;     
// how long is each frame (in seconds)                 
var step        	= 1/fps; 
// play/puased
var playGame = true;
var pause = false;
var gameOver = false;

// Starting game
var startGame = function () {
    // Add poles
    Render.addPoles();
    // Control Key Listeners
    Dom.on(document, 'keydown', function(ev) { 
        if(ev.keyCode === 32 || ev.which === 32) spaceKey = true;
        if(ev.keyCode === 27) pause = pause ? false : true;
    });
    Dom.on(document, 'keyup',   function(ev) { 
        if(ev.keyCode === 32 || ev.which === 32) spaceKey = false;
    });
    // Starting the Game
    function start() {
        requestAnimationFrame(start);
        if(playGame){
            if(pause){
                // Game State
                Render.state('PAUSED');
                // Sound
                try {
                    fly.pause(); 
                } catch (error) {
                    console.log(error);
                }
            }else{
                // Draw & Update
        	    startDrawing();
                // Sound
                try {
                    fly.play(); 
                } catch (error) {
                    console.log(error);
                }
            }
        }else if(gameOver){
            // Game State
            Render.state('GAME OVER');
            // Sound
            try {
                fly.pause(); 
            } catch (error) {
                console.log(error);
            }
            //over.play();
            // Restart Game
            if(spaceKey){
                //over.pause();
                playGame = true;
                gameOver = false;
                setTimeout(function(){resetGame()},1250);
            }
        }else{
        	//uiStart.show();
        }
        //window.scrollTo(0, 30);
    }
    start();
    // Sounds
    // Play sound
    fly.play();
    // Resize
    Render.touchFly();
};
// End Game and Reset
var EndGame = function () {
    playGame = false;
    gameOver = true;
}
// Reset Game
var resetGame = function () {
    // Clear Everything
    Render.clear();
    // No poles
    poles = [];
    // No score
    score = 0;
    // Add poles
    Render.addPoles();
    // Reset Bird Position // Commented for the Bird to contiunue
    //newBird.x = initPosX;
    //newBird.y = initPosY;
    // Render Game Objects
    RenderGame();
}

//=============================================================================
// START => When All Required Images are loaded 
//=============================================================================
loadImages('images/', imgNames, function(images) {
    // Store Images
    // console.log(images);
    imgAssets.background    = images[0]; // Background
    imgAssets.foreground    = images[1]; // Foreground
    imgAssets.southpole     = images[2]; // South Pole
    imgAssets.northpole     = images[3]; // North Pole
    imgAssets.bird          = images[4]; // Flappy Bird
    
    // Start Game
    // console.log('Images Loaded, Start Game!');
    startGame();
    //ctx.drawImage(imgAssets.southpole, 0, 0 - 50);
});


// Mobiles
/*Dom.on(Dom.get('toggleFly'),'click',)
var touchable = 'ontouchstart' in window || 'createTouch' in document;
if (touchable && window.clientWidth <=720) {
    window.document.addEventListener('touchstart', onTouchStart, false);
    window.document.addEventListener('touchend', onTouchEnd, false);
    window.document.addEventListener("touchcancel", onTouchCancel, false);
}
var onTouchStart = function (e) {
    e.preventDefault();
    
    spaceKey = true;
};
var onTouchEnd = function (e) {
    e.preventDefault();

    spaceKey = false;
};
var onTouchCancel = function (e) {
    e.preventDefault();
    
    if(!pause){
        pause=true;
    } else {
        pause=false;
    }
};*/

function toggleFullScreen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
        (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
}
if (Dom.get('toggleScreen')) {
    Dom.on('toggleScreen','click',toggleFullScreen,false);
}