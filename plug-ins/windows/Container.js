import Component from "/plug-ins/windows/Component.js";

import { svg, update } from "/plug-ins/domek/index.js"

export default class Container {
  static extends = [Component];

  properties = {
    layout: null,
  };

  observables = {
    children: [],
  };



  methods = {

    initialize(){

      this.on("children.created", (child) => {
        child.scene = this.scene;
        child.start(); // <- state machine, calls otehr functions
        this.layout.manage(child);
      }, {replay: true});

      this.on("children.removed", (child) => {
        child.stop(); // <- state machine, calls otehr functions
        this.layout.forget(child);
      });

    },

    clean(){
      this.children.map( ({id})=>this.children.remove(id) );
    },

    destroy(){
    },
    exit(){
    },



  }

}
