// A 3D Vector class.
// "Inherits" from Array.

// Construct a Vector.
// If called with a this pointer which is not a Vector, calls itself as a 
// constructor.
// If not provided a dimension, that dimension defaults to 0.
// If the first argument is an Array, unpacks the Array in creating the Vector.
var Vector = function (x, y, z) {
  if (!(this instanceof Vector)) {
    return new Vector(x, y, z);
  }
  if (x instanceof Array || x instanceof Vector) {
    var array = x;
    x = array[0];
    y = array[1];
    z = array[2];
  }
  if (x === undefined) {
    x = 0;
  }
  if (z === undefined) {
    z = 0;
  }
  if (y === undefined) {
    y = 0;
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

// Add an Array to this Vector.
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

// Calculate the negative of this vector.
Vector.prototype.neg = function() {
  return new Vector(-this[0], -this[1], -this[2]);
};

// Subtract an Array from this Vector.
Vector.prototype.sub = function (other) {
  return this.add(Vector(other).neg());
};

// Multiply this vector by a scalar amount.
Vector.prototype.scale = function (scalar) {
  return Vector(this.x * scalar, this.y * scalar, this.z * scalar);
};

// Round this vector the the nearest multiple of the first argument.
// If the first argument is not given, round to the nearest integer.
Vector.prototype.round = function (amount) {
  return new Vector(round(this[0], amount),
                    round(this[1], amount),
                    round(this[2], amount));
};
