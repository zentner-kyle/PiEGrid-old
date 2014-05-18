var World = function (inPlace, seed) {
  if (seed === undefined) {
    seed = 'WorldSeed';
  }
  this.inPlace = inPlace;
  this.grid = new Grid([40, 40, 3]);
  this.prng = new Math.seedrandom(seed);
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
