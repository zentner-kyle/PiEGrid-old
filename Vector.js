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
