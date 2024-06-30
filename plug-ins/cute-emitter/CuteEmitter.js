
export default class CuteEmitter {
 constructor() {
   this.events = new Map();
 }

 on(event, listener) {
   if (!this.events.has(event)) {
     this.events.set(event, []);
   }
   this.events.get(event).push(listener);

   return {
     destroy: () => this.off(event, listener)
   };
 }

 emit(event, ...args) {
   this.events.get(event)?.forEach(listener => listener(...args));
 }

 off(event, listener) {
   if (this.events.has(event)) {
     const listeners = this.events.get(event).filter(l => l !== listener);
     this.events.set(event, listeners);
   }
 }
}
