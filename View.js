var View = function (originPx, pxPerCell) {
  this.originPx = Vector(originPx);
  this.pxPerCell = pxPerCell;
  this.speed = Vector(0, 0, 0);
};

View.prototype.getPx = function(p) {
  var x = p[0] * this.pxPerCell;
  var y = p[1] * this.pxPerCell;
  return Vector(x, y, p[2]);
};

View.prototype.getCell = function (p) {
  var x = p[0] / this.pxPerCell;
  var y = p[1] / this.pxPerCell;
  return Vector(x, y, p[2]);
};

View.prototype.accelerate = function (diff) {
  this.speed = this.speed.add(diff);
};

View.prototype.update = function (dT) {
  this.originPx = this.originPx.add(this.speed.scale(dT));
  this.refresh(dT);
};

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

View.prototype.move = function (diff) {
  this.originPx = this.originPx.add(diff);
  this.refresh();
};
