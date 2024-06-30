import createDisposableListener from "/plug-ins/disposable/index.js";

export default class Container {


  traits = {

    // Low-level Object Oriented Programming Helpers For Windows

    addDisposable(disposable){

      if(disposable.destroy) {
        this.oo.disposables.push( ()=>disposable.destroy() );
      }else if(typeof disposable === 'function'){
        this.oo.disposables.push( disposable);
      }else{
        throw new Error('Malformed Disposable')
      }

    },


    // Utils

    addDisposableFromMethods(object, names) {
      for (const methodName of names.split(' ').map(o=>o.trim()).filter(o=>o)){
        this.addDisposable(()=>object[methodName]());
      }
    },

    addDisposableFromEvent(element, eventType, callback, options) {
      this.addDisposable( createDisposableListener(element, eventType, callback, options) );
    },

    addDisposableFromSmartEmitter(emitter, eventName, callback, options) {
      this.addDisposable( emitter.on(eventName, callback, options) );
    }


  }

}
