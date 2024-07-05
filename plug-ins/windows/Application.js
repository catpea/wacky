import {Instance} from "/plug-ins/object-oriented-programming/index.js";
import Window from "/plug-ins/windows/Window.js";
import EventEmitter from "/plug-ins/event-emitter/EventEmitter.js";

export default class Application {
  static extends = [Window];

  properties = {
    isApplication: true,
  };

  observables = {
    origins: [],
    applications: [],
    url: null,
  };

  traits = {


      removeApplication(){


        for (const o of this.pane.applications.filter(o=>o.selected)) {
          console.log('EEE',o.oo.name);
          if(o.oo.name == 'Pipe'){
            this.pane.elements.remove(o.id);
          }else{ //
            for (const relatedPipe of this.pane.applications.filter(x=>x.oo.name == 'Pipe').filter(x=>(x.to==o.id||x.from==o.id))) {
              console.log('EEE pipe', relatedPipe);

              this.pane.elements.remove(relatedPipe.id);
            }
            this.pane.elements.remove(o.id);
          }
        }

      },

    /**
    connectObservableToWritable USAGE:
    this.xWritable = writable(0);
    this.yWritable = writable(0);
    this.component = new Interface({
        target: this.foreign.body,
        props: {
          x: this.xWritable,
          y: this.yWritable,
          object: null,
          paneItems: stores.getPaneItems( this.getRoot() )
        }
    });
    this.connectObservableToWritable( object, 'x', this, 'xWritable', (v)=>v.toFixed(2))
    this.connectObservableToWritable( object, 'y', this, 'yWritable', (v)=>v.toFixed(2))

    **/
    connectObservableToWritable(fromObject /* CUSTOM OPP NOT A STANDARD OBJECT */, observableName, toObject, writableName, transform){
      if(!this.oo.scratch.couplers){
        this.oo.scratch.couplers = {};
        this.addDisposable({
          description: `clean any remaining couplers when component is shut down`,
          destroy(){Object.values(this.oo.scratch.couplers).map(f=>f())}
        });
      }
      let id = observableName;
      if(this.oo.scratch.couplers[id]) this.oo.scratch.couplers[id](); // execute destructable
      const disposable = fromObject.on(observableName, (v)=>toObject[writableName].set(transform?transform(v):v),{autorun:true},{manualDispose:true});
      this.oo.scratch.couplers[id] = disposable;

    },
  };

  methods = {

    initialize(){
      this.controller = new EventEmitter();
      this.getRoot().applications.create(this);
    },

    destroy(){
      console.log('LLL Application Destroy');
    }

  };
}
