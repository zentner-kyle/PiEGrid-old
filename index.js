var theView;
var theWorld;

// Convert wasd hjkl keys into view accelerations.
function keyToAccel(key) {
  var speed = theView.pxPerCell * 15.0;
  switch (key) {
    case 'h': // Fallthrough
    case 'a':
      return Vector(speed, 0);
      break;
    case 'k': // Fallthrough
    case 'w':
      return Vector(0, speed);
      break;
    case 'l': // Fallthrough
    case 'd':
      return Vector(-speed, 0);
      break;
    case 'j': // Fallthrough
    case 's':
      return Vector(0, -speed);
      break;
  }
  return Vector(0, 0);
}

// Setup the page.
$(document).ready(function () {
  theView = new View([0, 0], 64, Snap("#mainSvg"));
  theWorld = new World(true);
  var entityPrototypes = [
    Stone,
    Pillar,
    Orbitter
  ];
  for (var i in entityPrototypes) {
    theWorld.addEntityType(entityPrototypes[i]);
  }
  theWorld.populate();
  theWorld.grid.eachEntity(function (entity) {
    entity.view(theWorld, theView);
  });
  var fpsText = theView.snap.text(0, -10, "FPS: ");
  var tpsText = theView.snap.text(80, -10, "TPS: ");

  var fpsCount = 0;
  var secondStart = getTime();
  var start = getTime();
  function redraw (timestamp) {
    var dT = timestamp - start;
    start = timestamp;
    ++fpsCount;
    if (getTime() - secondStart >= 1000) {
      secondStart = getTime();
      fpsText.attr({
        fill: '#fff',
        text: 'FPS: ' + fpsCount,
      });
      fpsCount = 0;
    }
    var dT = dT + 0.1;
    if (dT >= 2) {
      theView.update(dT / 1000);
    }
    window.requestAnimationFrame(redraw);
  }
  redraw();

  // Update the world.
  var targetTPS = 20;
  var tpsCount = 0;
  var ticksSecondStart = getTime();
  function update () {
    ++tpsCount;
    if (getTime() - ticksSecondStart >= 1000) {
      ticksSecondStart = getTime();
      tpsText.attr({
        fill: '#fff',
        text: 'TPS: ' + tpsCount,
      });
      tpsCount = 0;
    }
    theWorld.update(theView, 1 / targetTPS);
  }
  setInterval(update, 1000 / targetTPS);

  // Handle keyboard input.
  var downKeys = {};

  $(document).keypress(function (evt) {
    // Work around Chrome, etc. not implementing DOM L3.
    var key = evt.key || String.fromCharCode(evt.charCode);
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
