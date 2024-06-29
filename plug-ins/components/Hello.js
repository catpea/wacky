import {Instance} from "/plug-ins/object-oriented-programming/index.js";
import Application from "/plug-ins/windows/Application.js";
import Foreign from "/plug-ins/windows/Foreign.js";

import Test from "/plug-ins/components/hello/index.svelte";


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

      new Test({
          target: this.foreign.body,
      });


      this.on('h', (h)=>{
        // console.log({h});
      });


    },

    stop(){
      console.log('todo: stopping root application');
    },

    destroy(){
      console.log('todo: destroying root application');
      this.dispose()
    },

  };
}
