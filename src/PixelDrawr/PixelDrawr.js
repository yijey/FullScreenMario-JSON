/* PixelDrawr.js
 * A FullScreenMario-specific object that draws Things 
 * External requirements:
 * * getCanvas
 * * window.canvas
 * * window.context
 * * innerWidth
 */

function PixelDrawr(settings) {
    "use strict";
    if(this === window) {
        return new PixelDrawr(settings);
    }
    var self = this,
        
        // A PixelRender object used to obtain raw sprite data and canvases
        PixelRender,
        
        // The canvas object each refillGlobalCanvas call goes to
        canvas,
        
        // The 2D canvas context each refillGlobalCanvas call goes to
        context,
        
        // Arrays of Array[Thing]s that are to be drawn in each refillGlobalCanvas
        thing_arrays,
        
        // Utility function to create a canvas (typically taken from EightBittr)
        getCanvas,
        
        // The known viewport width, beyond which nothing should be drawn
        innerWidth,
        
        unitsize,
        
        // A utility function to generate a class key to get an object sprite
        generateObjectKey,
        
        // Whether self.refillGlobalCanvas should skip redrawing the main canvas
        // every time.
        no_refill,
        
        // For refillQuadrant, an Array of string names to refill (bottom-to-top)
        group_names;
    
    self.reset = function(settings) {
        PixelRender = settings.PixelRender;
        getCanvas = settings.getCanvas;
        unitsize = settings.unitsize || 4;
        no_refill = settings.no_refill;
        innerWidth = settings.innerWidth;
        group_names = settings.group_names;
        
        generateObjectKey = settings.generateObjectKey || function (object) {
            return object.toString();
        };
    }
    
    
    
    /* Simple sets
    */
    
    /**
     * 
     */
    self.setThingArrays = function (arrays) {
        thing_arrays = arrays;
    }
    
    /**
     * 
     */
    self.setCanvas = function (canvasNew) {
        canvas = canvasNew;
        context = canvas.getContext("2d");
        self.drawThingOnCanvasBound = self.drawThingOnCanvas.bind(self, context);
    }
    
    /**
     * 
     */
    self.setInnerWidth = function (width) {
        innerWidth = width;
    };
    
    /**
     * 
     */
    self.setNoRefill = function (enabled) {
        no_refill = enabled;
    };
    
    
    /* Core rendering
    */
    
    /**
     * Goes through all the motions of find and parsing a thing's sprite
     * This should be called whenever the sprite's appearance changes
     * 
     * @param {Thing} thing   A thing whose sprite must be updated
     * @return {Self}
     */
    self.setThingSprite = function(thing) {
        // If it's set as hidden, or doesn't have a title, don't bother updating it
        if(thing.hidden || !thing.title) {
            return;
        }
        
        // PixelRender does most of the work in fetching the rendered sprite
        thing.sprite = PixelRender.decode(generateObjectKey(thing), thing);
        
        // To do: remove dependency on .num_sprites and sprite_type
        if(thing.sprite.multiple) {
          thing.sprite_type = thing.sprite.type;
          refillThingCanvasMultiple(thing, thing.sprite);
        }
        else {
          thing.num_sprites = 1;
          thing.sprite_type = "normal";
          refillThingCanvasSingle(thing, thing.sprite);
        }
        
        return self;
    }
    
    /**
     * Simply draws a thing's sprite to its canvas by getting and setting
     * a canvas::imageData object via context.getImageData(...).
     * 
     * @param {Thing} thing   A thing whose .canvas must be updated
     * @return {Self}
     * @private
     */
    function refillThingCanvasSingle(thing) {
        if(thing.width < 1 || thing.height < 1) {
            return;
        }
        
        var canvas = thing.canvas,
            context = thing.context,
            imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        PixelRender.memcpyU8(thing.sprite, imageData.data);
        context.putImageData(imageData, 0, 0);
        
        return self;
    }
    
    /**
     * For SpriteMultiples, this copies the sprite information for
     * each sub-sprite into its own canvas, and sets thing.sprites
     * 
     * @param {Thing} thing   A thing whose .canvas and .sprites must be updated
     * @return {Self}
     * @private
     */
    function refillThingCanvasMultiple(thing) {
        var sprites_raw = thing.sprite,
            canvases = thing.canvases = {
                "direction": sprites_raw.direction,
                "multiple": true 
            },
            canvas, context, imageData, i;

        thing.num_sprites = 1;

        for(i in sprites_raw.sprites) {
            // Make a new sprite for this individual component
            canvas = getCanvas(thing.spritewidth * unitsize, thing.spriteheight * unitsize);
            context = canvas.getContext("2d");

            // Copy over this sprite's information the same way as refillThingCanvas
            imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            PixelRender.memcpyU8(sprites_raw.sprites[i], imageData.data);
            context.putImageData(imageData, 0, 0);

            // Record the canvas and context in thing.sprites
            canvases[i] = {
                canvas: canvas,
                context: context
            }
            thing.num_sprites += 1;
        }
      
      return canvases;
    }
    
    
    /* Core drawing
    */
    
    /**
     * Called every upkeep to refill the entire main canvas. All Thing arrays
     * are made to call self.refillThingArray in order.
     * 
     * @param {string} background   The background to refill the context with
     *                              before drawing anything, unless no_refill is
     *                              enabled.
     * 
     * @return {Self}
     */
    self.refillGlobalCanvas = function (background) {
        if(!no_refill) {
            context.fillStyle = background;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        thing_arrays.forEach(self.refillThingArray);
        
        return self;
    };
    
    /**
     * 
     * 
     * 
     */
    self.refillThingArray = function (array) {
        array.forEach(self.drawThingOnCanvasBound);
    };
    
    /**
     * 
     */
    self.refillQuadrants = function (quadrants, background) {
        for(var i = 0; i < quadrants.length; i += 1) {
            if(quadrants[i].changed) {
                self.refillQuadrant(quadrants[i], background);
                context.drawImage(quadrants[i].canvas, quadrants[i].left, quadrants[i].top);
            }
        }
    };
    
    /**
     * 
     */
    self.refillQuadrant = function (quadrant, background) {
        var group, i, j;
        
        if(!no_refill) {
            quadrant.context.fillStyle = background;
            quadrant.context.fillRect(0, 0, quadrant.canvas.width, quadrant.canvas.height);
        }
        
        for(i = group_names.length - 1; i >= 0; i -= 1) {
            group = quadrant.things[group_names[i]];
            
            for(j = 0; j < group.length; j += 1) {
                self.drawThingOnQuadrant(group[j], quadrant);
            }
        }
        
        quadrant.changed = false;
    };
    
    /**
     * General function to draw a Thing to a context
     * This will call drawThingOnCanvas[Single/Multiple] with more arguments
     * 
     * @return {Self}
     */
    self.drawThingOnCanvas = function(context, thing) {
        if(thing.hidden || thing.right < 0 || thing.left > innerWidth) {
            return;
        }
        
        // If there's just one sprite, it's pretty simple
        if(thing.num_sprites === 1) {
            return drawThingOnCanvasSingle(context, thing.canvas, thing, thing.left, thing.top);
        }
        // For multiple sprites, some calculations will be needed
        else {
            return drawThingOnCanvasMultiple(context, thing.canvases, thing, thing.left, thing.top);
        }
    }
    
    /**
     * 
     */
    self.drawThingOnQuadrant = function (thing, quadrant) {
        if(thing.hidden) {
            return;
        }
        
        // If there's just one sprite, it's pretty simple
        if(thing.num_sprites === 1) {
            return drawThingOnCanvasSingle(quadrant.context, thing.canvas, thing, thing.left - quadrant.left, thing.top - quadrant.top);
        }
        // For multiple sprites, some calculations will be needed
        else {
            return drawThingOnCanvasMultiple(quadrant.context, thing.canvases, thing, thing.left - quadrant.left, thing.top - quadrant.top);
        }
    };
    
    /**
     * Draws a Thing's single canvas onto a context (called by self.drawThingOnCanvas).
     * 
     * @param {CanvasRenderingContext2D} context    
     * @param {Canvas} canvas
     * @param {Thing} thing
     * @param {Number} leftc
     * @param {Number} topc
     * @return {Self}
     * @private
     */
    function drawThingOnCanvasSingle(context, canvas, thing, leftc, topc) {
        // If the sprite should repeat, use the pattern equivalent
        if(thing.repeat) {
            drawPatternOnCanvas(context, canvas, leftc, topc, thing.unitwidth, thing.unitheight, thing.opacity || 1);
        }
        // Opacities not equal to one must reset the context afterwards
        else if(thing.opacity != 1) {
            context.globalAlpha = thing.opacity;
            context.drawImage(canvas, leftc, topc);
            context.globalAlpha = 1;
        } else {
            context.drawImage(canvas, leftc, topc);
        }
        
        return self;
    }
    
    /**
     * Draws a Thing's multiple canvases onto a context (called by self.drawThingOnCanvas)
     * 
     * @return {Self}
     * @private
     */
    function drawThingOnCanvasMultiple(context, canvases, thing, leftc, topc) {
        var sprite = thing.sprite,
            topreal = topc,
            leftreal = leftc,
            rightreal = leftc + thing.unitwidth,
            bottomreal = topc + thing.unitheight,
            widthreal = thing.unitwidth,
            heightreal = thing.unitheight,
            spritewidthpixels = thing.spritewidthpixels,
            spriteheightpixels = thing.spriteheightpixels,
            opacity = thing.opacity,
            sdiff, canvasref;
        
        // Vertical sprites may have 'top', 'bottom', 'middle'
        switch(canvases.direction) {
            case "vertical":
                // If there's a bottom, draw that and push up bottomreal
                if((canvasref = canvases.bottom)) {
                    sdiff = sprite.bottomheight || spriteheightpixels;
                    drawPatternOnCanvas(context, canvasref.canvas, leftreal, bottomreal - sdiff, widthreal, Math.min(heightreal, spriteheightpixels), opacity);
                    bottomreal -= sdiff;
                    heightreal -= sdiff;
                }
                // If there's a top, draw that and push down topreal
                if((canvasref = canvases.top)) {
                    sdiff = sprite.topheight || spriteheightpixels;
                    drawPatternOnCanvas(context, canvasref.canvas, leftreal, topreal, widthreal, Math.min(heightreal, spriteheightpixels), opacity);
                    topreal += sdiff;
                    heightreal -= sdiff;
                }
            break;
            // Horizontal sprites may have 'left', 'right', 'middle'
            case "horizontal":
                // If there's a left, draw that and push up leftreal
                if((canvasref = canvases.left)) {
                    sdiff = sprite.leftwidth || spritewidthpixels;
                    drawPatternOnCanvas(context, canvasref.canvas, leftreal, topreal, Math.min(widthreal, spritewidthpixels), heightreal, opacity);
                    leftreal += sdiff;
                    widthreal -= sdiff;
                }
                // If there's a right, draw that and push back rightreal
                if((canvasref = canvases.right)) {
                    sdiff = sprite.rightwidth || spritewidthpixels;
                    drawPatternOnCanvas(context, canvasref.canvas, rightreal - sdiff, topreal, Math.min(widthreal, spritewidthpixels), heightreal, opacity);
                    rightreal -= sdiff;
                    widthreal -= sdiff;
                }
            break;
        }
        
        // If there's still room/*, and it exists*/, draw the actual canvas
        if((canvasref = canvases.middle) && topreal < bottomreal && leftreal < rightreal) {
            drawPatternOnCanvas(context, canvasref.canvas, leftreal, topreal, widthreal, heightreal, opacity);
        }
        
        return self;
    }
    
    
    /* Utilities
    */
    
    /**
     * Macro to draw a pattern onto a canvas because of how
     * often it's used by the regular draw functions.
     * Not a fan of this lack of control over pattern source coordinates...
     */
    function drawPatternOnCanvas(context, source, leftc, topc, width, height, opacity) {
        context.globalAlpha = opacity;
        context.translate(leftc, topc);
        context.fillStyle = context.createPattern(source, "repeat");
        context.fillRect(0, 0, width, height);
        context.translate(-leftc, -topc);
        context.globalAlpha = 1;
    }
    
    self.reset(settings || {});
}