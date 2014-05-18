function getTime() {
  return (new Date()).getTime();
}

function hasSolid (grid, p) {
  var filled = false;
  grid.get(p).forEach(function (entity) {
    filled = filled || entity.solid;
  });
  return filled;
}
