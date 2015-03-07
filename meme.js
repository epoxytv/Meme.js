var Meme = ( function (window, undefined) {

  function Meme (image, canvas, ready) {
    this.canvas = this.get_canvas(canvas);
    this.context = this.canvas.getContext('2d');
    this.image = this.get_image(image);

    var that = this;
    this.image.onload = this.setup_canvas.bind(this, ready);
  }

  Meme.prototype = {

    // Cribbed from memedad
    captionLengthToFontSize: {
      1: 70,
      2: 68,
      3: 66,
      4: 64,
      5: 62,
      6: 61,
      7: 60,
      8: 55,
      9: 50,
      10: 45,
    },
    // Set the proper width and height of the canvas
    setCanvasDimensions : function(w, h) {
      this.canvas.width = w;
      this.canvas.height = h;
    },

    // Cribbed from memedad
    determineCaptionFontSize : function (caption) {
      var length = caption.length;
      var size;
      if (length > 10) {
        size = Math.round(Math.max(((1 / (Math.pow(length, 0.14285714285714285714285714285714))) * 50 + 10), 14));
      }
      else if (length > 20) {
        size = Math.round(Math.max(((1 / (Math.pow(length, 0.125))) * 40 + 13), 14));
      }
      else if (length > 90) {
        size = Math.round(Math.max(((1 / (Math.pow((length - 80), 0.125))) * 40 + 5), 14));
      }
      else if (length > 206) {
        size = Math.round(Math.max(((1 / (Math.pow((length - 160), 0.125))) * 40 + 2), 14));
      }
      else {
        size = this.captionLengthToFontSize[length];
      }
      return size;
    },

    /*
    Draw a centered meme string
    */

    drawText : function(text, topOrBottom, y, fontSize) {

      // Variable setup
      topOrBottom = topOrBottom || 'top';
      var x = this.canvas.width / 2;
      if (typeof y === 'undefined') {
        y = fontSize * 1.5;
        if (topOrBottom === 'bottom')
          y = this.canvas.height - (fontSize/2);
      }

      this.context.font = fontSize + 'px Impact';

      // Should we split it into multiple lines?
      if (this.context.measureText(text).width > (this.canvas.width * 1.0)) {

        // Split word by word
        var words = text.split(' ');
        var wordsLength = words.length;

        // Start with the entire string, removing one word at a time. If
        // that removal lets us make a line, place the line and recurse with
        // the rest. Removes words from the back if placing at the top;
        // removes words at the front if placing at the bottom.
        if (topOrBottom === 'top') {
          var i = wordsLength;
          while (i --) {
            var justThis = words.slice(0, i).join(' ');
            if (this.context.measureText(justThis).width < (this.canvas.width * 1.0)) {
              this.drawText(justThis, topOrBottom, y, fontSize);
              this.drawText(words.slice(i, wordsLength).join(' '), topOrBottom, y + fontSize, fontSize);
              return;
            }
          }
        }
        else if (topOrBottom === 'bottom') {
          for (var i = 0; i < wordsLength; i ++) {
            var justThis = words.slice(i, wordsLength).join(' ');
            if (this.context.measureText(justThis).width < (this.canvas.width * 1.0)) {
              this.drawText(justThis, topOrBottom, y, fontSize);
              this.drawText(words.slice(0, i).join(' '), topOrBottom, y - fontSize, fontSize);
              return;
            }
          }
        }

      }

      // Draw!
      this.context.fillText(text, x, y, this.canvas.width * .9);
      this.context.strokeText(text, x, y, this.canvas.width * .9);

    },

    setup_canvas : function (ready) {
      // Set dimensions
      this.setCanvasDimensions(this.image.width, this.image.height);

      this.draw_image();

      // Set up text variables
      this.context.fillStyle = 'white';
      this.context.strokeStyle = 'black';
      this.context.lineWidth = 2;
      this.context.textAlign = 'center';

      ready();
    },

    draw_image : function () {
    	// Draw the image
      this.context.drawImage(this.image, 0, 0);
    },

    draw : function (top, bottom) {
    	this.draw_image();
      // Draw them!
      this.drawText(top, 'top', undefined, this.determineCaptionFontSize(top));
      this.drawText(bottom, 'bottom', undefined, this.determineCaptionFontSize(bottom));
    },

    get_image : function (image) {
      if (!image)
        image = 0;

      // Convert it from a string
      if (image.toUpperCase) {
        var src = image;
        image = new Image();
        image.src = src;
      }
      return image;
    },

    get_canvas : function (canvas) {
      // If it's nothing, set it to a dummy value to trigger error
      if (!canvas) {
        canvas = 0;
      }

      // If it's a string, conver it
      if (canvas.toUpperCase) {
        canvas = document.getElementById(canvas);
      }

      // If it's jQuery or Zepto, convert it
      if (($) && (canvas instanceof $)) {
        canvas = canvas[0];
      }

      // Throw error
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error('No canvas selected');
      }

      return canvas;
    },
  };

  return Meme;

})(window);