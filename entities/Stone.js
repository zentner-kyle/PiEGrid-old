var Stone = function (pos) {
  Entity.call(this, pos);
  this.solid = true;
};

Stone.prototype = Object.create(Entity);
Stone.prototype.constructor = Stone;

Stone.prototype.view = function (world, view) {
  var size = view.pxPerCell;
  var pxPos = view.getPx(this.pos);
  var back = view.snap.rect(0, 0, size, size);
  back.attr({
    fill: '#000',
  });
  var front = view.snap.rect(1, 1, size - 2, size - 2);
  front.attr({
    fill: '#888',
  });
  this.svg = view.snap.group(back, front);
  this.svg.transform('T' + pxPos[0] + ',' + pxPos[1])
};

Stone.populate = function (world) {
  world.grid.eachCell(function (cell, pos) {
    if (pos.z === 0) {
      cell.push(new Stone(pos, world));
    }
  });
};
