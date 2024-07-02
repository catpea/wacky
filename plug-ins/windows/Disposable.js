import createDisposableListener from "/plug-ins/disposable/index.js";
import Objective from "/plug-ins/windows/Objective.js";

export default class Disposable {
  static extends = [Objective];

  traits = {

    // Low-level Object Oriented Programming Helpers For Windows

    addDisposable(disposable){
      if(disposable.destroy) {
        this.oo.disposables.push( ()=>disposable.destroy() );
      }else if(disposable.dispose){
        this.oo.disposables.push( ()=>disposable.dispose() ); // NOTE: used in xtermjs https://xtermjs.org/docs/api/terminal/interfaces/idisposable/
      }else if(typeof disposable === 'function'){
        this.oo.disposables.push( disposable);
      }else{
        throw new Error('Malformed Disposable')
      }
    },

    // Utils

    addDisposableFromMethods(object, names) {
      const methods = names.split(' ').map(o=>o.trim()).filter(o=>o);
      for (const methodName of methods){
        console.log(`HHH INIT addDisposableFromMethods for ${object.id} ${methodName}`);
        this.addDisposable({
          description: `addDisposableFromMethods for ${object.id} ${methodName}`,
          destroy(){
            console.log(`HHH DESTROY addDisposableFromMethods for ${object.id} ${methodName}`);
            object[methodName]();
          }
        });
      }
    },

    addDisposableFromEvent(element, eventType, callback, options) {
      this.addDisposable( createDisposableListener(element, eventType, callback, options) );
    },

    addDisposableFromEmitter(emitter, eventName, callback, options) {
      emitter.on(eventName, callback);
      this.addDisposable({
        destroy(){
          emitter.off(eventName, callback);
        }
      });
    },

    addDisposableFromSmartEmitter(emitter, eventName, callback, options) {
      this.addDisposable( emitter.on(eventName, callback, options) );
    }


  }

}
