import pkg from "/package.json";

const uuid = bundle['uuid'];
const cheerio = bundle['cheerio'];

import {Instance} from "/plug-ins/object-oriented-programming/index.js";
import Window from "/plug-ins/components/Window.js";
import KeyboardMonitor from "/plug-ins/keyboard-monitor/KeyboardMonitor.js";

export default class Workspace {
  static extends = [Window];

  methods = {

    initialize(){
      console.log('Workspace Initialize!');
      // NOTE: this is the main keyboard handler that components may subscribe to via getRoot()
      this.keyboard = new KeyboardMonitor();
      this.addDisposable(this.keyboard);
    },

    saveXml(){
      const $ = cheerio.load(`<?xml version="1.0"?><${this.oo.name} name="${pkg.name}" description="${pkg.description}" version="${pkg.version}"></${this.oo.name}>`, { xmlMode: true, decodeEntities: true, withStartIndices: true, withEndIndices: true });
      if (this.pane) {
        $(this.oo.name).append(this.pane.getXml());
      }
      const xml = $.root().html();
      console.log(xml);
      return xml;
    },

  };
}
