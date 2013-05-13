//called on window load.
if(window.addEventListener) {
	window.addEventListener('load', function () {
		var tempCanvas, contextTemp, canvas, context;
		// The active tool instance.
		var tool;
		var tool_default = drawingTool;
		
		function init () {
		// Find the canvas element.
		canvas = document.getElementById('myCanvas');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		if (!canvas) {
			alert('Error: canvas element not found!');
			return;
		}

		if (!canvas.getContext) {
			alert('Error: no canvas.getContext!');
			return;
		}

		// Get the 2D canvas context.
		context = canvas.getContext('2d');
		if (!context) {
			alert('Error: failed to get context!');
			return;
		}

		// Add the temporary canvas.
		var container = canvas.parentNode;
		tempCanvas = document.createElement('canvas');
		if (!tempCanvas) {
			alert('Error: cannot create a new canvas element!');
			return;
		}

		tempCanvas.id     = 'myCanvasTemp';
		tempCanvas.width  = canvas.width;
		tempCanvas.height = canvas.height;
		container.appendChild(tempCanvas);

		contextTemp = tempCanvas.getContext('2d');


		// Get the tool select input.
		var tool_select = document.getElementById('dtool');
		if (!tool_select) {
			alert('Error: failed to get the dtool element!');
			return;
		}
		tool_select.addEventListener('change', ev_tool_change, false);


		// Activate the default tool.
		if (tools[tool_default]) {
			tool = new tools[tool_default]();
			tool_select.value = tool_default;
		}

		// Attach the mousedown, mousemove and mouseup event listeners.
		tempCanvas.addEventListener('mousedown', ev_canvas, false);
		tempCanvas.addEventListener('mousemove', ev_canvas, false);
		tempCanvas.addEventListener('mouseup',   ev_canvas, false);
		
		//load imgSource
		var imageObject = new Image();
		imageObject.onload = function() {
			context.drawImage(imageObject, 0, 0, canvas.width, canvas.height);
		};
							
		if(imgSource){
			imageObject.src = imgSource;
		}
							
		contextTemp.strokeStyle = color;
		contextTemp.lineWidth = strokeWidth;
	
		}

		// The general-purpose event handler. This function just determines the mouse 
		// position relative to the canvas element.
		function ev_canvas (ev) {
			if (ev.layerX || ev.layerX == 0) { // Firefox
				ev._x = ev.layerX;
				ev._y = ev.layerY;
			} else if (ev.offsetX || ev.offsetX == 0) { // Opera
				ev._x = ev.offsetX;
				ev._y = ev.offsetY;
			}

			// Call the event handler of the tool.
			var func = tool[ev.type];
			if (func) {
				func(ev);
			}
		}


		// The event handler for any changes made to the tool selector.
		function ev_tool_change (ev) {
			if (tools[this.value]) {
				tool = new tools[this.value]();
			}
		}



		// This function draws the temp canvas on top of myCanvas, after which 
		// the temp canvas is cleared. This function is called each time a 
		// a drawing operation is completed.
		function img_update () {
			context.drawImage(tempCanvas, 0, 0);
			contextTemp.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
		}

		// This object holds the implementation of each drawing tool.
		var tools = {};

		// The drawing pencil.
		tools.pencil = function () {
			var tool = this;
			this.started = false;

			// This is called when you start holding down the mouse button.
			// This starts the pencil drawing.
			this.mousedown = function (ev) {
				contextTemp.beginPath();
				contextTemp.moveTo(ev._x, ev._y);
				tool.started = true;
				saveImage();
			};

			// This function is called when the mouse moves
			this.mousemove = function (ev) {
				//only run code if mouse button is being held down
				if (tool.started) {
					contextTemp.lineTo(ev._x, ev._y);
					contextTemp.stroke();
				}
			};

			// This is called when you release the mouse button.
			this.mouseup = function (ev) {
				if (tool.started) {
					tool.mousemove(ev);
					tool.started = false;
					img_update();
				}
			};
		};

		// The rectangle tool.
		tools.rect = function () {
			var tool = this;
			this.started = false;

			this.mousedown = function (ev) {
				tool.started = true;
				saveImage();
				tool.x0 = ev._x;
				tool.y0 = ev._y;
			};

			this.mousemove = function (ev) {
			  if (!tool.started) {
				return;
			  }

			  var x = Math.min(ev._x,  tool.x0),
				  y = Math.min(ev._y,  tool.y0),
				  w = Math.abs(ev._x - tool.x0),
				  h = Math.abs(ev._y - tool.y0);

				contextTemp.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

				if (!w || !h) {
					return;
				}

				contextTemp.beginPath();
				contextTemp.rect(x, y, w, h);
				contextTemp.stroke();
			};

			this.mouseup = function (ev) {
				if (tool.started) {
					tool.mousemove(ev);
					tool.started = false;
					img_update();
				}
			};
		};

		// The line tool.
		tools.line = function () {
			var tool = this;
			this.started = false;

			this.mousedown = function (ev) {
				tool.started = true;
				saveImage();
				tool.x0 = ev._x;
				tool.y0 = ev._y;
			};

			this.mousemove = function (ev) {
				if (tool.started) {
					contextTemp.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
				
					contextTemp.beginPath();
					contextTemp.moveTo(tool.x0, tool.y0);
					contextTemp.lineTo(ev._x,   ev._y);
					contextTemp.stroke();
					contextTemp.closePath();
				}
			};

			this.mouseup = function (ev) {
			  if (tool.started) {
				tool.mousemove(ev);
				tool.started = false;
				img_update();
			  }
			};
		};
		
		// The circle tool.
		tools.circle = function () {
			var tool = this;
			this.started = false;
			
			this.mousedown = function (ev) {
				tool.started = true;
				saveImage();
				tool.x0 = ev._x;
				tool.y0 = ev._y;
			};
			
			this.mousemove = function (ev) {
				if (tool.started) {
					contextTemp.clearRect(0, 0, tempCanvas.width,tempCanvas.height);
				
					contextTemp.beginPath();
					contextTemp.arc(tool.x0, tool.y0, Math.abs(tool.x0-ev._x), 0, 2*Math.PI);
					contextTemp.stroke();
					contextTemp.closePath();
				}
			};
			
			this.mouseup = function (ev) {
				if (tool.started) {
					tool.mousemove(ev);
					tool.started = false;
					img_update();
				}
			};
		
		};
		
		// The eraser tool.
		tools.eraser = function () {
			var tool = this;
			this.started = false;
			var tempColor = color;

			this.mousedown = function (ev) {
				contextTemp.beginPath();
				contextTemp.moveTo(ev._x, ev._y);
				color = "#FFFFFF"
				contextTemp.strokeStyle = color;
				tool.started = true;
				saveImage();
			};

			// This function is called every time you move the mouse. 
			this.mousemove = function (ev) {
				if (tool.started) {
					contextTemp.lineTo(ev._x, ev._y);
					contextTemp.stroke();
				}
			};

			// This is called when you release the mouse button.
			this.mouseup = function (ev) {
				if (tool.started) {
					tool.mousemove(ev);
					tool.started = false;
					color = tempColor
					contextTemp.strokeStyle = color;
					img_update();
				}
			};
		
		};
		
		// The filled rectangle tool.
		tools.rectFill = function () {
			var tool = this;
			this.started = false;

			this.mousedown = function (ev) {
				tool.started = true;
				saveImage();
				tool.x0 = ev._x;
				tool.y0 = ev._y;
			};

			this.mousemove = function (ev) {
				if (!tool.started) {
					return;
				}

				var x = Math.min(ev._x,  tool.x0),
				  y = Math.min(ev._y,  tool.y0),
				  w = Math.abs(ev._x - tool.x0),
				  h = Math.abs(ev._y - tool.y0);

				contextTemp.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

				if (!w || !h) {
					return;
				}

				contextTemp.beginPath();
				contextTemp.rect(x, y, w, h);
							
				contextTemp.strokeStyle = color;
				contextTemp.fillStyle = color;
				contextTemp.fill();
				contextTemp.stroke();
			};

			this.mouseup = function (ev) {
				if (tool.started) {
					tool.mousemove(ev);
					tool.started = false;
					img_update();
				}
			};
		};
							
		// The filled rectangle tool with stroke.
		tools.rectFillStroke = function () {
		var tool = this;
		this.started = false;
		
		this.mousedown = function (ev) {
		tool.started = true;
		saveImage();
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		};
		
		this.mousemove = function (ev) {
		if (!tool.started) {
		return;
		}
		
		var x = Math.min(ev._x,  tool.x0),
		y = Math.min(ev._y,  tool.y0),
		w = Math.abs(ev._x - tool.x0),
		h = Math.abs(ev._y - tool.y0);
		
		contextTemp.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
		
		if (!w || !h) {
		return;
		}
		
		contextTemp.beginPath();
		contextTemp.rect(x, y, w, h);
							
		contextTemp.strokeStyle = color;
		contextTemp.fillStyle = color2;					
		contextTemp.fill();
		contextTemp.stroke();
		};
		
		this.mouseup = function (ev) {
		if (tool.started) {
		tool.mousemove(ev);
		tool.started = false;
		img_update();
		}
		};
		};					
		
		// The filled circle tool.
		tools.circleFill = function () {
			var tool = this;
			this.started = false;
			
			this.mousedown = function (ev) {
				tool.started = true;
				saveImage();
				tool.x0 = ev._x;
				tool.y0 = ev._y;
			};
			
			this.mousemove = function (ev) {
				if (!tool.started) {
					return;
				}
				
				contextTemp.clearRect(0, 0, tempCanvas.width,tempCanvas.height);
				
				contextTemp.beginPath();
				contextTemp.arc(tool.x0, tool.y0, Math.abs(tool.x0-ev._x), 0, 2*Math.PI);
				contextTemp.fillStyle = color;
				contextTemp.fill();
				contextTemp.stroke();
				contextTemp.closePath();
			};
			
			this.mouseup = function (ev) {
				if (tool.started) {
					tool.mousemove(ev);
					tool.started = false;
					img_update();
				}
			};
		
		};

							
		// The filled circle tool.
		tools.circleFillStroke = function () {
		var tool = this;
		this.started = false;
		
		this.mousedown = function (ev) {
		tool.started = true;
		saveImage();
		tool.x0 = ev._x;
		tool.y0 = ev._y;
		};
		
		this.mousemove = function (ev) {
		if (!tool.started) {
		return;
		}
		
		contextTemp.clearRect(0, 0, tempCanvas.width,tempCanvas.height);
		
		contextTemp.beginPath();
		contextTemp.arc(tool.x0, tool.y0, Math.abs(tool.x0-ev._x), 0, 2*Math.PI);
		contextTemp.strokeStyle = color;
		contextTemp.fillStyle = color2;					
		contextTemp.fill();
		contextTemp.stroke();
		contextTemp.closePath();
		};
		
		this.mouseup = function (ev) {
		if (tool.started) {
		tool.mousemove(ev);
		tool.started = false;
		img_update();
		}
		};
		
		};
							
		init();

	}, false); 
	
}