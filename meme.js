var Meme = ( function (window, undefined) {

  function Meme (options) {
    this.options = options;

    this.top = this.options.top || '';
    this.bottom = this.options.bottom || '';
    this.options.crop = this.options.crop || 'original';

    this.canvas = this.get_canvas(this.options.canvas);
    this.context = this.canvas.getContext('2d');
    this.image = this.get_image(this.options.image);

    var that = this;
    this.image.onload = this.setup_canvas.bind(this, this.options.ready);
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
      if (length > 206) {
        size = Math.round(Math.max(((1 / (Math.pow((length - 160), 0.125))) * 40 + 2), 14));
      }
      else if (length > 90) {
        size = Math.round(Math.max(((1 / (Math.pow((length - 80), 0.125))) * 40 + 5), 14));
      }
      else if (length > 20) {
        size = Math.round(Math.max(((1 / (Math.pow(length, 0.125))) * 40 + 13), 14));
      }
      else if (length > 10) {
        size = Math.round(Math.max(((1 / (Math.pow(length, 0.14285714285714285714285714285714))) * 50 + 10), 14));
      }
      else {
        size = this.captionLengthToFontSize[length];
      }
      return (this.width/540) * size * 1.3;
    },

    /*
    Draw a centered meme string
    */

    drawText : function(text, topOrBottom, y, fontSize) {
      topOrBottom = topOrBottom || 'top';

      // Set up text variables
      this.context.fillStyle = 'white';
      this.context.strokeStyle = 'black';
      this.context.lineWidth = 2;
      this.context.textAlign = 'center';
      this.context.textBaseline = topOrBottom == 'bottom' ? 'bottom' : 'top';
      this.context.font = fontSize + 'px Impact';

      // Variable setup
      var x = this.canvas.width / 2;
      var fontPaddingRatio = 0.3;
      if (typeof y === 'undefined') {
        y = topOrBottom == 'top' ?
          fontSize * fontPaddingRatio
          :
          this.canvas.height - fontSize*fontPaddingRatio
        ;
      }


      // Should we split it into multiple lines?
      if (this.context.measureText(text).width > (this.canvas.width * 1.0)) {

        // Split word by word
        var words = text.split(' ');
        var wordsLength = words.length;

        if (words.length == 1) { alert('Use your words!'); return; }

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
      this.set_crop(this.options.crop);

      this.draw_image();

      ready();
    },

    set_crop : function (crop) {
      this['crop_'+crop]();
      this.setCanvasDimensions(this.width, this.height);
    },

    update_crop : function (crop) {
      this.set_crop(crop);
      this.draw();
    },

    crop_original : function () {
      this.width = this.image.width;
      this.height = this.image.height;
    },

    crop_square_letterbox: function () {
      var side = this.image.width > this.image.height ? this.image.width : this.image.height;
      this.width = this.height = side;
    },

    crop_square : function () {
      var side = this.image.width > this.image.height ? this.image.height : this.image.width;
      this.width = this.height = side;
    },

    draw_image : function () {
      this.context.fillStyle = 'black';
      this.context.fillRect(0,0,this.width,this.height);
      // Draw the imaged
      this.context.drawImage(this.image, (this.width-this.image.width)/2, (this.height-this.image.height)/2);
    },

    update : function (options) {
      for (var option in options) {
        if( options.hasOwnProperty( option ) ) {
          this[option] = options[option];
        }
      }
      this.draw();
    },

    draw : function (top, bottom) {
      this.draw_image();
      // Draw them!
      this.drawText(this.top, 'top', undefined, this.determineCaptionFontSize(this.top));
      this.drawText(this.bottom, 'bottom', undefined, this.determineCaptionFontSize(this.bottom));
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