const usedIDs = new Set();
const generateID = () => {
  const n = Math.random() * 1e15;
  const m = n.toString(36).toUpperCase();
  if (usedIDs.has(m)) return generateID();
  usedIDs.add(m);
  return m;
};

class Tosh3SyntaxError extends SyntaxError {}

const fail = (cond, message, cls = Tosh3SyntaxError) => {
  if (cond) throw new cls(message);
};

const assert = (cond, message, cls = Tosh3SyntaxError) => {
  if (!cond) throw new cls(message);
  return true;
};

module.exports = {generateID, fail, assert};