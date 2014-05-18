// Represents a grid world.

// Create a new World.
// inPlace is optional, and specifies whether updates to the world produce new 
// worlds, or modify the current one.
// seed is a seed used to start the pseudo-random number generator.
// It is also optional, and defaults to 'WorldSeed'.
// Currently, the world size is hard-coded to 40, 40, 3.
var World = function (inPlace, seed) {
  if (seed === undefined) {
    seed = 'WorldSeed';
  }
  this.inPlace = inPlace;
  this.grid = new Grid([40, 40, 3]);
  this.prng = new Math.seedrandom(seed);
  this.refreshList = [];
  this.tick = 0;
  this.entityTypes = [];
  this.totalTime = 0;
};

// Get the current world age in seconds.
World.prototype.age = function () {
  return this.totalTime;
}

// Add a new type of Entity to the world.
// All such types will be used to populate the world.
World.prototype.addEntityType = function (proto) {
  this.entityTypes.push(proto);
};

// Add an entity to the world.
World.prototype.addEntity = function (entity, p) {
  if (entity.refreshPeriod) {
    this.refreshList.push({
      entity: entity,
      lastUpdate: this.age(),
      nextUpdate: this.age() + entity.refreshPeriod
    });
  }
  this.grid.addEntity(entity, p);
};

// Update the world, where the first argument is the View, and the second is 
// the second is the change in time of the update in seconds.
World.prototype.update = function (view, dT) {
  return this.change(function () {
    this.totalTime += dT;
    ++this.tick;
    for (var i = 0; i < this.refreshList.length; i++) {
      var ref = this.refreshList[i];
      if (this.totalTime >= ref.nextUpdate) {
        ref.entity.update(this, view,
            (this.totalTime - ref.lastUpdate));
        ref.lastUpdate = this.age();
        ref.nextUpdate = this.age() + ref.entity.refreshPeriod;
      }
    }
  });
};

// Populate the world, using all the entity tpes types that have been added to 
// the world.
World.prototype.populate = function () {
  var world = this;
  for (var i in this.entityTypes) {
    world = this.change(this.entityTypes[i].populate);
  }
  return world;
};

// Pick a random cell in the world.
World.prototype.randomCell = function () {
  var x = this.prng();
  var y = this.prng();
  var z = this.prng();
  var dims = Vector(1, 1, 1).neg().add(this.grid.dims);
  return Vector(dims[0] * x,
                dims[1] * y,
                dims[2] * z).round();
};

// Create a (deep) clone of this world.
World.prototype.clone = function () {
  var out = new World();
  out.grid = this.grid.clone();
  out.prng = new Math.seedrandom(this.prng);
  return out;
};

// Calls a function with the this parameter and the first argument set to 
// either a clone of this world or this world itself, if this world is in 
// place.
World.prototype.change = function (func) {
  if (this.inPlace) {
    var next = this;
  } else {
    var next = this.clone();
  }
  func.call(next, next);
  return next;
};
