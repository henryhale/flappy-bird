// If Loaded
console.log('Helpers Loaded!');


// load multiple images and callback when ALL images have loaded
loadImages = function(fpath, names, callback) { 
    var result = [];
    var count  = names.length;

    var onload = function() {
      if (--count == 0)
        callback(result);
    };

    for(var n = 0 ; n < names.length ; n++) {
      var name = names[n];
      result[n] = new Image();
      Dom.on(result[n], 'load', onload);
      result[n].src = fpath + name;
      //console.log(result[n]);
    }
}

//=========================================================================
// minimalist DOM helpers
//=========================================================================
var Dom = {

    get:  function(id)                     { return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id); },
    set:  function(id, html)               { Dom.get(id).innerHTML = html;                        },
    on:   function(ele, type, fn, capture) { Dom.get(ele).addEventListener(type, fn, capture);    },
    un:   function(ele, type, fn, capture) { Dom.get(ele).removeEventListener(type, fn, capture); },
    show: function(ele, type)              { Dom.get(ele).style.display = (type || 'block');      },
    blur: function(ev)                     { ev.target.blur();                                    },
  
    addClassName:    function(ele, name)     { Dom.toggleClassName(ele, name, true);  },
    removeClassName: function(ele, name)     { Dom.toggleClassName(ele, name, false); },
    toggleClassName: function(ele, name, on) {
      ele = Dom.get(ele);
      var classes = ele.className.split(' ');
      var n = classes.indexOf(name);
      on = (typeof on == 'undefined') ? (n < 0) : on;
      if (on && (n < 0))
        classes.push(name);
      else if (!on && (n >= 0))
        classes.splice(n, 1);
      ele.className = classes.join(' ');
    },
  
    storage: window.localStorage || {}

}


//=========================================================================
// general purpose helpers (mostly math)
//=========================================================================

var Calc = {

    timestamp:        function()                  { return new Date().getTime();                                    },
    toInt:            function(obj, def)          { if (obj !== null) { var x = parseInt(obj, 10); if (!isNaN(x)) return x; } return Util.toInt(def, 0); },
    toFloat:          function(obj, def)          { if (obj !== null) { var x = parseFloat(obj);   if (!isNaN(x)) return x; } return Util.toFloat(def, 0.0); },
    limit:            function(value, min, max)   { return Math.max(min, Math.min(value, max));                     },
    randomInt:        function(min, max)          { return Math.round(Calc.interpolate(min, max, Math.random()));   },
    randomChoice:     function(options)           { return options[Calc.randomInt(0, options.length-1)];            },
    percentRemaining: function(n, total)          { return (n%total)/total;                                         },
    accelerate:       function(v, accel, dt)      { return v + (accel * dt);                                        },
    interpolate:      function(a,b,percent)       { return a + (b-a)*percent                                        },
    easeIn:           function(a,b,percent)       { return a + (b-a)*Math.pow(percent,2);                           },
    easeOut:          function(a,b,percent)       { return a + (b-a)*(1-Math.pow(1-percent,2));                     },
    easeInOut:        function(a,b,percent)       { return a + (b-a)*((-Math.cos(percent*Math.PI)/2) + 0.5);        },
    exponentialFog:   function(distance, density) { return 1 / (Math.pow(Math.E, (distance * distance * density))); },
  
    increase:  function(start, increment, max) { // with looping
      var result = start + increment;
      while (result >= max)
        result -= max;
      while (result < 0)
        result += max;
      return result;
    }
  
  };
  

//==========================================================
// POLYFILL for requestAnimationFrame
//==========================================================

if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                   window.mozRequestAnimationFrame    || 
                                   window.oRequestAnimationFrame      || 
                                   window.msRequestAnimationFrame     || 
                                   function(callback, element) {
                                     window.setTimeout(callback, 1000 / 60);
                                   }
}

//==========================================================
//A GRID FOR GUIDENCE
//==========================================================
function drawGrid(ctx) {
	// minor lines
	minor = 10;
	// major lines
	major = minor * 5;
	// canvas border
	stroke = "#00ff00";
	// canvas bgcolor
	fill = '#009900';

	// let's save what ever that is on our canvas
	ctx.save();

	// apply color
	ctx.strokeStyle = stroke;
	ctx.fillStyle = fill;

	// get and store canvas dimensions
	let width = ctx.canvas.width;
	let height = ctx.canvas.height;

	// Draw vertical lines (of x)
	for(var x = 0; x < width; x += minor) {
		// begin  drawing
		ctx.beginPath();
		// starting point
		ctx.moveTo(x,0);
		// ending point
		ctx.lineTo(x,height);
		// width of the line => how broad
		ctx.lineWidth = (x % major == 0) ? 0.5 : 0.25;
		// color this line
		ctx.stroke();
		// if it is a major line, show Label
		if(x % major == 0) {
			ctx.fillText(x,x,10);
		}
	}

	// Draw horizontal lines (of y)
	for(var y = 0; y < height; y += minor) {
		// begin drawing
		ctx.beginPath();
		// starting point
		ctx.moveTo(0,y);
		// ending point
		ctx.lineTo(width, y);
		// width of the line => how broad
		ctx.lineWidth = (y % major == 0) ? 0.5 : 0.25;
		// color this line
		ctx.stroke();
		// if it is a major line, show label
		if(y % major == 0) {
			ctx.fillText(y,0,y+10);
		}
	}

	// restore the current actions, save the drawing
	ctx.restore();

}


//==========================================================
// FLAPPY BIRD
//==========================================================
var Bird = function (x, y, options) {
    this.x          = x; // Position in X
    this.y          = y; // Position in Y
    this.image      = {}; // Image
	this.height 	= this.image.height || 27; // Height
	this.width 		= this.image.width || 38; // Width
    this.eRadius    = 10; // Approximate Image size
    this.angle      = 0; // Angle of Rotation => 30deg(down) or -15deg(up)
    this.vertLimits = {
        high : options.highLimit || this.eRadius,
        low  : options.lowLimit || 5*this.eRadius 
    }
};
// Drawing the Bird
Bird.prototype.draw = function (context) {
    // save state
    context.save();

    /* Render the image */
    context.globalCompositeOperation='source-atop';
    // draw the image rotated by 30deg(down) or -15deg(up) in radians
    context.translate(this.x + this.eRadius, this.y + this.eRadius);
    context.rotate(this.angle * Math.PI / 180);
    context.translate(-this.x - this.eRadius, -this.y - this.eRadius);
    context.drawImage(this.image, this.x, this.y);
    context.setTransform(1,0,0,1,0,0);
    
    // set the composite operation
    context.globalCompositeOperation ='saturation';
    context.fillStyle = "red";
    context.globalAlpha = 0; // alpha 0 = no effect 1 = full effect
    context.fillRect(this.x, this.y, this.image.width, this.image.height);

    // restore state
    context.restore();
};
// Vertical limits of the Bird
Bird.prototype.checkLimits = function () {
    // If the bird reaches the top limit
    if(this.y <= this.vertLimits.high) {
        // reset to maximum
        this.y = this.vertLimits.high;
    } else if (this.y >= this.vertLimits.low) {
        // reset to minimum
        this.y = this.vertLimits.low;
    }
};


//==========================================================
// POLES
//==========================================================
var Pole = function (x,y, image, side) {
    this.x      = x; // Position in X
    this.y      = y; // Position in Y
    this.vx     = 2; // Velocity in X
    this.vy     = 0; // Velocity in Y
    this.side   = side; // Is Image North or South
    this.image  = image; // Pole Image
    this.imageH = this.image.height; // Image height
    this.imageW = this.image.width; // Image Width
    this.minY   = 0; // Minimum height 
    this.maxY   = 0.5 * this.imageH; // Maximum height 
    this.randY  = Calc.randomInt(this.minY, this.maxY); // Random Vertical Offset 
	this.randomOffsetY = Calc.limit(this.randY, this.minY, this.maxY); // Limiting the pole's height displayed
	this.height = this.image.height; //this.randomOffsetY; // height
	this.width 	= this.image.width; //this.imageW; // width
};
// Drawing the Pole
Pole.prototype.draw = function (context) { 
    // Negative/Positive => so that image is facing up or down
    //var randomOffsetY = this.side === 0 ? -this.randY : this.randY; 
    
    // save state
    context.save();
	
	//context.globalCompositeOperation='source-atop';
	context.drawImage(this.image, this.x, this.y-this.randomOffsetY);
	// set the composite operation
	//context.globalCompositeOperation ='saturation';
	//context.fillStyle = "red";
	//context.globalAlpha = 0; // alpha 0 = no effect 1 = full effect
	
    if( this.side === 0 ){
    	//context.fillRect(this.x, this.y, this.width, this.randomOffsetY);
    } else {
    	//context.fillRect(this.x, this.y-this.randomOffsetY, this.width, this.height);
    }
    
    // restore state
    context.restore();
}; 
// Moving Poles
Pole.prototype.move = function (amount) {
    // Decrease the offset in x 
    this.x -= this.vx*amount;
};
