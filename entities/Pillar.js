var Pillar = function (pos) {
  Entity.call(this, pos);
  this.solid = true;
};

Pillar.prototype = Object.create(Entity);
Pillar.prototype.constructor = Pillar;

Pillar.prototype.view = function (world, view) {
  var size = view.pxPerCell;
  var pxPos = view.getPx(this.pos);
  this.svg = view.snap.circle(pxPos[0] + size / 2, pxPos[1] + size / 2, size / 3);
  this.svg.attr({
    fill: '#000',
  });
};

Pillar.populate = function (world) {
  for (var i = 0; i < 40; i++) {
    var cell = this.randomCell();
    world.grid.push(new Pillar(Vector(cell[0], cell[1], 1), world));
  }
};
