var imgSource;
var color = "#000000";
var color2 = "#000000";
var strokeWidth = 1;
var drawingTool = 'pencil';
var savedImages = [];
var removedImages = [];

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

function getData() {
	var canvas = document.getElementById('myCanvas');
	var strData = canvas.toDataURL("image/png");
	
	return strData;
}

function changeDrawTool(drawTool) {
	var obj = document.getElementById('dtool');
	obj.value = drawTool;
	drawingTool = drawTool;
	fireEvent(obj,'change');
}

function fireEvent(element,event){
	if (document.createEventObject){
		// dispatch for IE
		var evt = document.createEventObject();
		return element.fireEvent('on'+event,evt);
	}
	else{
		// dispatch for firefox + others
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(event, true, true ); // event type,bubbling,cancelable
		return !element.dispatchEvent(evt);
	}
}		

function setCanvasSize(width, height) {
	var canvas = document.getElementById('myCanvas');
	canvas.width = width;
	canvas.height = height;
	var tempCanvas = document.getElementById('myCanvasTemp');
	tempCanvas.width = width;
	tempCanvas.height = height;		
}

function resizeCanvas(width, height) {
	imgSource = getData();
	setCanvasSize(width, height);
	fireEvent(window,'load');
	window.location = "http://resizeCanvas/";
}	

function changeColor(hexColor) {
	var tempCanvas = document.getElementById('myCanvasTemp');
	var tempContext = tempCanvas.getContext('2d');
	color = hexColor;
	tempContext.strokeStyle = hexColor;
}

function changeFillColor(hexColor) {
	var tempCanvas = document.getElementById('myCanvasTemp');
	var tempContext = tempCanvas.getContext('2d');
	color2 = hexColor;
	tempContext.fillStyle = hexColor;
}

function changeStrokeWidth(lWidth) {
	var tempCanvas = document.getElementById('myCanvasTemp');
	var tempContext = tempCanvas.getContext('2d');
	strokeWidth = lWidth;
	tempContext.lineWidth = lWidth;
}

function undo () {
	removeImage();
	imgSource = savedImages.pop();
	loadImage(imgSource);
}

function redo () {
	saveImage();
	imgSource = removedImages.pop();
	loadImage(imgSource);
}

function saveImage() {
	var canvas = document.getElementById('myCanvas');
	var imgSrc = canvas.toDataURL("image/png");
	savedImages.push(imgSrc);
}

function removeImage() {
	var canvas = document.getElementById('myCanvas');
	var imgSrc = canvas.toDataURL("image/png");
	removedImages.push(imgSrc);
}

function clearCanvas() {
	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	window.location = "http://clearCanvas/";
}

function loadImage(imageSource) {
	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext('2d');
	var imageObject = new Image();
	imageObject.onload = function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(imageObject, 0, 0, canvas.width, canvas.height);
	};
	imageObject.src = imageSource;
}