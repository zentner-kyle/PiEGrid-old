// A little, bird-like triangle which likes to orbit other Entitys.
// Flys on the third floor.
// Not solid.
// Created by Kyle Zentner.

var Orbitter = function (pos, world) {
  Entity.call(this, pos);
  this.refreshRate = world.prng() * 0.01;
  this.target = this.findTarget(world);
};

Orbitter.prototype = Object.create(Entity);
Orbitter.prototype.constructor = Orbitter;

Orbitter.populate = function (world) {
  for (var i = 0; i < world.grid.dims[0] / 2; i++) {
    var cell = world.randomCell();
    cell = Vector(cell[0], cell[1], 2);
    if (!hasSolid(world.grid, cell)) {
      world.addEntity(new Orbitter(cell, world), cell);
    }
  }
};

Orbitter.prototype.view = function (world, view) {
  var size = view.pxPerCell;
  var pxPos = view.getPx(this.pos);
  this.svg = view.snap.polygon([size / 3, size / 3],
      [1.5 * size / 3, 1.5 * size / 3], [2 * size / 3, size / 3]);
  this.svg.attr({
    fill: '#12a',
    opacity: 0.8,
  });
  this.update(world, view, 0);
};

Orbitter.prototype.update = function (world, view, dT) {
  var oldPos = this.pos;
  var d = this.pos.sub(this.target.pos)
  var dist = Math.sqrt(d[0] * d[0] + d[1] * d[1]);
  var r = Math.atan2(d[1], d[0]);
  var oldR = r;
  var dR = dT * 2 * Math.PI * (0.001 / this.refreshRate);
  r += dR;
  var dP = Vector(Math.cos(r), Math.sin(r), 2).scale(0.6 + 5 * dist / 8);
  var newPos = world.grid.clipInto(this.target.pos.add(dP), 1, 1);
  if (!hasSolid(world.grid, newPos.round())) {
    world.grid.removeEntity(this);
    this.pos = newPos;
    world.grid.addEntity(this);
  }
  var pxPos = view.getPx(this.pos);
  var oldPxPos = view.getPx(oldPos);
  this.svg.transform('r' + Snap.deg(oldR) + 'T' + oldPxPos[0] + ',' + oldPxPos[1]);
  this.svg.stop().animate({
    transform: 'r' + Snap.deg(r) + 'T' + pxPos[0] + ',' + pxPos[1],
  }, dT * 1000);
};

Orbitter.prototype.findTarget = function (world) {
  for (var r = 0; r < Math.max(world.grid.dims[0], world.grid.dims[1]); r++) {
    for (var i = this.pos[0] - r; i < this.pos[0] + r; i++) {
      for (var j = this.pos[1] - r; j < this.pos[1] + r; j++) {
        if (i === this.pos[0] && j === this.pos[1]) {
          continue;
        }
        var entities = world.grid.get(Vector(i, j, 2));
        if (entities.length > 0) {
          return entities[0 | (entities.length * world.prng())];
        } else {
          entities = world.grid.get(Vector(i, j, 1));
          if (entities.length > 0) {
            return entities[0 | (entities.length * world.prng())];
          }
        }
      }
    }
  }
  return this;
};
