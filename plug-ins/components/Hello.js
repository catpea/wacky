import {Instance} from "/plug-ins/object-oriented-programming/index.js";
import Application from "/plug-ins/windows/Application.js";
import Foreign from "/plug-ins/windows/Foreign.js";
import stopWheel from '/plug-ins/stop-wheel/index.js';

import Interface from "/plug-ins/components/hello/index.svelte";


export default class Hello {
  static extends = [Application];

  properties = {
  };

  methods = {
    initialize(){
      this.createSocket('out', 1);
    },
    mount(){

      this.foreign = new Instance(Foreign);
      this.createWindowComponent( this.foreign );

      this.component = new Interface({
          target: this.foreign.body,
          props: {
          }
      });

    this.addDisposable( stopWheel(this.foreign.body) );
    },

    destroy(){
      this.component.$destroy();
    },

  };
}
