// This file contains miscellaneous functions.
// Usually, they have to do with simple javascript tricks, or functionality 
// shared by some (but not all) Entitys.

// Get the current time as number of milliseconds since the 1970 Unix epoch.
function getTime() {
  return (new Date()).getTime();
}

// Return whether there is an Entity in grid at point p which is solid.
function hasSolid (grid, p) {
  var filled = false;
  grid.get(p).forEach(function (entity) {
    filled = filled || entity.solid;
  });
  return filled;
}

// Round the first argument to the nearest multiple of the second argument.
// If the second argument is not supplied, round to the nearest integer.
function round(val, amount) {
  if (amount === undefined) {
    return 0 | (val + 0.5);
  } else {
    return amount * (0 | ((val / amount) + 0.5));
  }
}
