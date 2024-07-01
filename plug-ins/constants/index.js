export default function(CONSTANTS){
  const constants = Object.fromEntries(CONSTANTS.split(' ').map(o=>o.trim()).filter(o=>o).map(o=>[o,o]));
  return new Proxy(constants, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    } else {
      throw new Error(`Attempt to access undefined constant '${prop}'. Check for typos!`);
    }
  }
  });
}
