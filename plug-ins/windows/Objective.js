import createDisposableListener from "/plug-ins/disposable/index.js";

export default class Objective {


  traits = {

    // Low-level Object Oriented Programming Helpers For Windows
    getRandomIntInclusive(min, max) {
      const minCeiled = Math.ceil(min);
      const maxFloored = Math.floor(max);
      return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
    },

  }

}
