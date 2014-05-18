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
