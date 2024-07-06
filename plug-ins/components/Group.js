import {Instance} from "/plug-ins/object-oriented-programming/index.js";
import Application from "/plug-ins/windows/Application.js";
import Pane from "/plug-ins/windows/Pane.js";


export default class Group {
  static extends = [Application];

  properties = {
    serializables: 'id x y w h showMenu showStatus zoom library'.split(' ')
  };

  traits = {

  };

  methods = {

    initialize(){
      this.createSocket('in', 0);
      this.createSocket('out', 1);
    },

    mount(){

      this.pane = new Instance(Pane, {library: this.library});

      this.on("node", (node) => {
        node.on("url", url => this.pane.url = url);
        node.on("zoom", zoom => this.pane.zoom = zoom);
        this.pane.on("zoom", zoom => this.zoom = zoom);
      });

      this.createWindowComponent( this.pane );

    },

    clean(){
    },

    destroy(){
    },
  };
}
