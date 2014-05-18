var Entity = function (pos) {
  if (pos === undefined ||
      pos[0] === undefined ||
      pos[1] === undefined ||
      pos[2] === undefined) {
    throw 'Entity at unknown position!';
  }
  this.pos = pos;
};
