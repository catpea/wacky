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
        console.log('LLL children.created');
        child.scene = this.scene;
        child.start(); // <- state machine, calls otehr functions
        this.layout.manage(child);
      }, {replay: true});

      this.on("children.removed", (child) => {
        console.log('LLL children.removed', child.oo.name);
        child.stop(); // <- state machine, calls otehr functions
        this.layout.forget(child);
      });

    },

    clean(){
      console.log('LLL Destroy Container Children');
      this.children.map( ({id})=>this.children.remove(id) );
    },

    destroy(){
    },
    exit(){
    },



  }

}
