import {Instance} from "/plug-ins/object-oriented-programming/index.js";
import { front } from "/plug-ins/domek/index.js"

import Horizontal from "/plug-ins/windows/Horizontal.js";
import Control from "/plug-ins/windows/Control.js";
import Label from "/plug-ins/windows/Label.js";
// import Anchor from "/plug-ins/windows/Anchor.js";

import debounce from "/plug-ins/debounce/index.js";
import { svg, update, click } from "/plug-ins/domek/index.js"
import {nest} from "/plug-ins/nest/index.js";

export default class Caption {

  static extends = [Control];

  properties = {
    handle:null,
  };

  observables = {
    text: '',
  };

  constraints = {
    mount: {
      '.scene is required to start the universe': function(){ if(!this.scene){return {error:'.svg not found'}} },
    }
  }

  traits = {



  };

  methods = {

    initialize(){
      // console.log(`%cComponent.initialize!`, 'background: hsl(180, 80%, 60%); color: black;', this);

    },

    mount(){

      const [horizontal, [ info1, maximizeButton ]] = nest(Horizontal, {parent:this, scene:this.scene, s:2  }, [
        [Label, {h: 24,       text: this.text, parent:this, r:3}, (c,p)=>{
          p.children.create(c)
          // this.addDisposableFromMethods(c, 'stop destroy')
        }],
        [Label, {h: 24, W:24, text: '++', parent:this , r:3}, (c,p)=>{
          p.children.create(c)
          // this.addDisposableFromMethods(c, 'stop destroy')
        }],
      ], (c)=>{
        // this.addDisposableFromMethods(c, 'stop destroy')
      }

  ); // <-- once created components are sent here, they can be added to garbage collection

      this.handle = info1.el.Container;
      this.horizontal = horizontal;
      this.horizontal.start();

      this.on("selected", selected => selected?info1.el.Container.classList.add('selected'):info1.el.Container.classList.remove('selected'));
      this.on('text',  text=>info1.text=text, );
      this.any(['x','y','w','h',  ],  ({x,y,w,h})=>Object.assign(this.horizontal, {x,y,w,h }));

      let maximized = false;
      const parent = this.getApplication().parent?this.getApplication().parent.getApplication():this.getRootContainer();
      const current = this.getApplication();
      const bottle = [
        [parent.pane, 'zoom', null],
        [parent.pane, 'panX', null],
        [parent.pane, 'panY', null],
        [current, 'x', null],
        [current, 'y', null],
        [current, 'w', null],
        [current, 'h', null],
      ];
      let unwatch;

      const windowToggle = function (e){
        // TODO: this is just a test, finish it
        e.stopPropagation();
        front(current.scene)
        if(maximized){ // restore/minimize
          unwatch.map(x=>x())
          for (const [i,[o,k,v]] of bottle.entries()) {
            o[k] = v;
          }
          maximized = false;
        }else{ // save/maximize

          for (const [i,[o,k,v]] of bottle.entries()) {
            bottle[i][2] = o[k];
          }
          // maximization protocol
            parent.pane.zoom = 1;
            parent.pane.panX = 0;
            parent.pane.panY = 0;
            current.x = 0;
            current.y = 0;
            // current.w = parent.pane.viewport.w/parent.pane.viewport.zoom;
            // current.h = parent.pane.viewport.h/parent.pane.viewport.zoom;
            unwatch = parent.pane.viewport.any(['w','h'], ({w,h})=>{
              current.w = parent.pane.viewport.w/parent.pane.viewport.zoom;
              current.h = parent.pane.viewport.h/parent.pane.viewport.zoom;
            })
          // maximization protocol
          maximized = true;
        }
      }

      this.addDisposableFromEvent( maximizeButton.handle, 'click', windowToggle); // maximize button






    },

    clean(){
      console.log('LLL Caption got clean');
      this.horizontal.stop(); // state machine it calls clean destroy and exit
    },

    destroy(){
      console.log('LLL Caption got destroy');
    },


  }

}
