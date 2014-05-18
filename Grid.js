// A Three-Dimensional container.
// Currently stores everything in naive, nested arrays.
// Indexed using 3D points / Vectors.

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

// Get the array of entities at a point (an Array).
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

// Adds an Entity at a specified point (an Array).
// If the point is not specified, defaults to entity.pos.round().
Grid.prototype.addEntity = function (entity, pos) {
  if (pos === undefined) {
    pos = entity.pos.round();
  }
  this.get(pos).push(entity);
};

// Removes an Entity at a specified point (an Array).
// If the point is not specified, defaults to entity.pos.round().
// Does nothing if the Entity is not present at that point.
Grid.prototype.removeEntity = function (entity, pos) {
  if (pos === undefined) {
    pos = entity.pos.round();
  }
  var entities = this.get(pos);
  var index = entities.indexOf(entity);
  if (index !== -1) {
    entities.splice(index, 1);
  }
};

// Call a function once for each cell in the Grid.
// The first argument to the function will be the Array of Entitys in that 
// cell.
// The second argument is cell's location as a Vector.
Grid.prototype.eachCell = function (func) {
  for (var k = 0; k < this.dims[2]; k++) {
    for (var i = 0; i < this.dims[0]; i++) {
      for (var j = 0; j < this.dims[1]; j++) {
        func(this.get([i, j, k]), Vector(i, j, k));
      }
    }
  }
};

// Call a function once for each Entity in the Grid.
// The first argument to the function will be the Entity.
// The second argument is Entity's location in the Grid as a Vector.
// This parameter is usually not needed, since it should equal 
// entity.pos.round().
Grid.prototype.eachEntity = function (func) {
  this.eachCell(function (entities, p) {
    entities.forEach(function (e) {
      func(e, p);
    });
  });
};

// Clone the Grid, including the Entitys in the Grid.
Grid.prototype.clone = function () {
  var g = new Grid(this.dims);
  this.eachEntity(function (entity, p) {
    g.addEntity(p, entity.clone());
  });
  return g;
}

// Clip a point (an Array) into the Grid's space.
// The second through fourth arguments are optional, and are distances from the 
// border of the Grid to use when clipping.
Grid.prototype.clipInto = function (p, xClip, yClip, zClip) {
  if (xClip === undefined) {
    xClip = 0;
  }
  if (yClip === undefined) {
    yClip = 0;
  }
  if (zClip === undefined) {
    zClip = 0;
  }
  var out = p;
  if (p[0] - xClip < 0 || isNaN(p[0])) {
    out = Vector(xClip, out[1], out[2]);
  } else if (p[0] + xClip >= this.dims[0]) {
    out = Vector(this.dims[0] - xClip, out[1], out[2]);
  }

  if (p[1] - yClip < 0 || isNaN(p[1])) {
    out = Vector(out[0], yClip, out[2]);
  } else if (p[1] + yClip >= this.dims[1]) {
    out = Vector(out[0], this.dims[1] - yClip, out[2]);
  }

  if (p[2] - zClip < 0 || isNaN(p[2])) {
    out = Vector(out[0], out[1], zClip);
  } else if (p[2] + zClip >= this.dims[2]) {
    out = Vector(out[0], out[1], this.dims[2] - zClip);
  }
  return out;
};
