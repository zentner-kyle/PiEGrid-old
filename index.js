var Vector = function (x, y, z) {
  if (!(this instanceof Vector)) {
    return new Vector(x, y, z);
  }
  if (x === undefined) {
    return new Vector(0, 0, 0);
  }
  if (x[0] !== undefined) {
    var array = x;
    x = array[0];
    y = array[1];
    z = array[2];
  }
  if (z === undefined) {
    z = 0;
  }
  this.x = x;
  this.y = y;
  this.z = z;
  this[0] = x;
  this[1] = y;
  this[2] = z;
};

Vector.prototype = Object.create(Array);
Vector.prototype.constructor = Vector;

Vector.prototype.add = function(other) {
  var d = [];
  for (var i = 0; i < 3; i++) {
    if (other[i] === undefined) {
      d.push(this[i]);
    } else {
      d.push(other[i] + this[i]);
    }
  }
  return new Vector(d[0], d[1], d[2]);
};

Vector.prototype.neg = function() {
  //console.log(this);
  return new Vector(-this[0], -this[1], -this[2]);
};

Vector.prototype.sub = function (other) {
  return this.add(Vector(other).neg());
};

Vector.prototype.scale = function (scalar) {
  return Vector(this.x * scalar, this.y * scalar, this.z * scalar);
};

function round(val, amount) {
  return 0 | (val - (val % amount));
}

Vector.prototype.round = function (amount) {
  if (amount === undefined) {
    amount = 1;
  }
  return new Vector(round(this[0], amount),
                    round(this[1], amount),
                    round(this[2], amount));
};


var Grid = function (dims) {
  if (!(this instanceof Grid)) {
    return new Grid(dims);
  }
  if (dims === undefined) {
    throw 'Undefined dimensions to grid.';
  }
  this.dims = dims;
  var i, j, k;
  data = [];
  for (i = 0; i < this.dims[0]; i++) {
    data[i] = [];
    for (j = 0; j < this.dims[1]; j++) {
      data[i][j] = [];
      for (k = 0; k < this.dims[2]; k++) {
        data[i][j][k] = [];
      }
    }
  }
  this._data = data;
};

Grid.prototype.get = function (p) {
  if (p[2] === undefined) {
    p = Vector(p.concat([0]));
  }
  if (p[0] < 0 || p[0] >= this.dims[0] ||
      p[1] < 0 || p[1] >= this.dims[1] ||
      p[2] < 0 || p[2] >= this.dims[2]) {
    return [];
  }
  return this._data[p[0]][p[1]][p[2]];
};

Grid.prototype.push = function (entity) {
  this.addEntity(entity.pos.round(), entity);
};

Grid.prototype.pop = function (entity) {
  this.removeEntity(entity.pos.round(), entity);
};

Grid.prototype.addEntity = function (pos, entity) {
  this.get(pos).push(entity);
};

Grid.prototype.removeEntity = function (pos, entity) {
  var entities = this.get(pos);
  var index = entities.indexOf(entity);
  if (index !== -1) {
    entities.splice(index, 1);
  }
};

Grid.prototype.eachCell = function (func) {
  for (var k = 0; k < this.dims[2]; k++) {
    for (var i = 0; i < this.dims[0]; i++) {
      for (var j = 0; j < this.dims[1]; j++) {
        func(this.get([i, j, k]), Vector(i, j, k));
      }
    }
  }
};

Grid.prototype.eachEntity = function (func) {
  this.eachCell(function (entities, p) {
    entities.forEach(function (e) {
      func(e, p);
    });
  });
};

Grid.prototype.clone = function () {
  var g = new Grid(this.dims);
  this.eachEntity(function (entity, p) {
    g.addEntity(p, entity.clone());
  });
  return g;
}

Grid.prototype.clipInto = function (p, r) {
  if (r === undefined) {
    r = 0;
  }
  var out = p;
  if (p[0] - r < 0 || isNaN(p[0])) {
    out = Vector(0, out[1], out[2]);
  } else if (p[0] + r >= this.dims[0]) {
    out = Vector(this.dims[0] - r, out[1], out[2]);
  }

  if (p[1] - r < 0 || isNaN(p[1])) {
    out = Vector(out[0], 0, out[2]);
  } else if (p[1] + r >= this.dims[1]) {
    out = Vector(out[0], this.dims[1] - r, out[2]);
  }

  if (p[2] - r < 0 || isNaN(p[2])) {
    out = Vector(out[0], out[1], 0);
  } else if (p[2] + r >= this.dims[2]) {
    out = Vector(out[0], out[1], this.dims[2] - r);
  }
  return out;
};


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

var Entity = function (pos) {
  if (pos === undefined ||
      pos[0] === undefined ||
      pos[1] === undefined ||
      pos[2] === undefined) {
    throw 'Entity at unknown position!';
  }
  this.pos = pos;
};

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

var Orbitter = function (pos, world) {
  Entity.call(this, pos);
  this.refreshRate = 0 | (world.prng() * 10);
  this.target = this.findTarget(world);
};

Orbitter.prototype = Object.create(Entity);
Orbitter.prototype.constructor = Orbitter;

Orbitter.populate = function (world) {
  for (var i = 0; i < world.grid.dims[0] / 2; i++) {
    var cell = world.randomCell();
    cell = Vector(cell[0], cell[1], 2);
    if (!hasSolid(world.grid, cell)) {
      world.addEntity(cell, new Orbitter(cell, world));
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
  var dR = dT * 2 * Math.PI * (1 / this.refreshRate);
  r += dR;
  var dP = Vector(Math.cos(r), Math.sin(r), 2).scale(0.6 + 5 * dist / 8);
  var newPos = world.grid.clipInto(this.target.pos.add(dP), 1);
  if (!hasSolid(world.grid, newPos.round())) {
    world.grid.pop(this);
    this.pos = newPos;
    world.grid.push(this);
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


function hasSolid (grid, p) {
  var filled = false;
  grid.get(p).forEach(function (entity) {
    filled = filled || entity.solid;
  });
  return filled;
}

var World = function (inPlace) {
  this.inPlace = inPlace;
  this.grid = new Grid([40, 40, 3]);
  this.prng = new Math.seedrandom('WorldSeed');
  this.refreshList = [];
  this.tick = 0;
  this.entityPrototypes = [];
};

World.prototype.getTime = getTime;

World.prototype.addEntityPrototype = function (proto) {
  this.entityPrototypes.push(proto);
};

World.prototype.addEntity = function (p, entity) {
  if (entity.refreshRate) {
    this.refreshList.push([entity.refreshRate, entity, this.getTime()]);
  }
  this.grid.addEntity(p, entity);
};

World.prototype.update = function (view) {
  ++this.tick;
  for (var i = 0; i < this.refreshList.length; i++) {
    if (this.tick % this.refreshList[i][0] === 0) {
      this.refreshList[i][1].update(this, view,
          (this.getTime() - this.refreshList[i][2]) / 1000);
      this.refreshList[i][2] = this.getTime();
    }
  }
};

World.prototype.populate = function () {
  var world = this;
  for (var i in this.entityPrototypes) {
    world = this.change(this.entityPrototypes[i].populate);
  }
  return world;
};

World.prototype.randomCell = function () {
  var x = this.prng();
  var y = this.prng();
  var z = this.prng();
  return Vector(this.grid.dims[0] * x,
                this.grid.dims[1] * y,
                this.grid.dims[2] * z).round();
};

World.prototype.clone = function () {
  var out = new World();
  out.grid = this.grid.clone();
  out.prng = new Math.seedrandom(this.prng);
  return out;
};

World.prototype.change = function (func) {
  if (this.inPlace) {
    var next = this;
  } else {
    var next = this.clone();
  }
  func.call(next, next);
  return next;
};

var theView;
var theWorld;

function keyToAccel(key) {
  var speed = theView.pxPerCell * 15.0;
  switch (key) {
    case 'a':
      return Vector(speed, 0);
      break;
    case 'w':
      return Vector(0, speed);
      break;
    case 'd':
      return Vector(-speed, 0);
      break;
    case 's':
      return Vector(0, -speed);
      break;
  }
  return Vector(0, 0);
}

function getTime() {
  return (new Date()).getTime();
}

$(document).ready(function () {
  theView = new View([0, 0], 64);
  theView.snap = Snap("#mainSvg");
  theWorld = new World(true);
  var entityPrototypes = [
    Stone,
    Pillar,
    Orbitter
  ];
  for (var i in entityPrototypes) {
    theWorld.addEntityPrototype(entityPrototypes[i]);
  }
  theWorld.populate();
  theWorld.grid.eachEntity(function (entity) {
    entity.view(theWorld, theView);
  });
  var fpsText = theView.snap.text(0, -10, "FPS: ");
  var tpsText = theView.snap.text(80, -10, "TPS: ");
  var INTERVAL = 10;
  var count = 0;
  var secondStart = getTime();
  var start = getTime();
  function redraw (timestamp) {
    var dT = timestamp - start;
    start = timestamp;
    ++count;
    if (getTime() - secondStart >= 1000) {
      secondStart = getTime();
      fpsText.attr({
        fill: '#fff',
        text: 'FPS: ' + count,
      });
      count = 0;
    }
    var dT = dT + 0.1;
    if (dT >= 2) {
      theView.update(dT / 1000);
    }
    window.requestAnimationFrame(redraw);
  }
  redraw();

  var ticks = 0;
  var ticksSecondStart = getTime();
  function update () {
    ++ticks;
    if (getTime() - ticksSecondStart >= 1000) {
      ticksSecondStart = getTime();
      tpsText.attr({
        fill: '#fff',
        text: 'TPS: ' + ticks,
      });
      ticks = 0;
    }
    theWorld.update(theView);
  }
  setInterval(update, 50);

  var downKeys = {};

  $(document).keypress(function (evt) {
    // Work around Chrome, etc. not implementing DOM L3.
    var key = String.fromCharCode(evt.charCode);
    if (!downKeys[key]) {
      if (key !== 'F5' && !evt.ctrlKey) {
        evt.preventDefault();
      }
      downKeys[key] = true;
      theView.accelerate(keyToAccel(key));
    }
  });

  $(document).keyup(function (evt) {
    // Work around Chrome, etc. not implementing DOM L3.
    var key = evt.key || String.fromCharCode(evt.keyCode).toLowerCase();
    theView.accelerate(keyToAccel(key).scale(-1));
    downKeys[key] = false;
  });
});
