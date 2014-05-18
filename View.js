// The view, which manages the diplay of an svg using Snap.

// Takes three mandatory arguments. The pixel in the svg to consider the 
// origin, the number of pixels per cell in a grid, and the snap element used 
// for rendering.
var View = function (originPx, pxPerCell, snap) {
  this.originPx = Vector(originPx);
  this.pxPerCell = pxPerCell;
  this.speed = Vector(0, 0, 0);
  this.snap = snap;
};

// Get the pixel coordinates from cell coordinates.
// Is not affected by the location of the origin.
View.prototype.getPx = function(p) {
  var x = p[0] * this.pxPerCell;
  var y = p[1] * this.pxPerCell;
  return Vector(x, y, p[2]);
};

// Get the cell coordinates from pixel coordinates.
// Is not affected by the location of the origin.
View.prototype.getCell = function (p) {
  var x = p[0] / this.pxPerCell;
  var y = p[1] / this.pxPerCell;
  return Vector(x, y, p[2]);
};

// Accelerates the movement of the viewpoint origin.
View.prototype.accelerate = function (diff) {
  this.speed = this.speed.add(diff);
};

// Moves the viewpoint based on the current speed.
View.prototype.update = function (dT) {
  this.originPx = this.originPx.add(this.speed.scale(dT));
  this.refresh(dT);
};

// Updates the view if the when the origin has moved.
View.prototype.refresh = function (dT) {
  var svg = this.snap.node;
  var box = svg.getBBox();
  var cells = 20;
  var size = Vector(box.width, box.height)
             .scale(cells / ((box.width + box.height) / this.pxPerCell));
  svg.setAttribute('viewBox', [-this.originPx.x,
                               -this.originPx.y,
                               size.x,
                               size.y].join(' '));
};

// Move the view origin some amount relative to its current location.
View.prototype.move = function (diff) {
  this.originPx = this.originPx.add(diff);
  this.refresh();
};
