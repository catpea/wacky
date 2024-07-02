import {Instance} from "/plug-ins/object-oriented-programming/index.js";
import Socket from "/plug-ins/windows/Socket.js";
import { SocketLayout } from "/plug-ins/layout-manager/index.js";
import EventEmitter from "/plug-ins/event-emitter/EventEmitter.js";

export default class Sockets {
  static extends = [];

  observables = {
    socketRegistry: [],
    sockets: [],
  };




  traits = {

    createSocket(name, side){
      if(!name) throw new Error(`It is not possible to create an socket without an socket name.`);
      if(!side===undefined) throw new Error(`It is not possible to create an socket without specifying a side, 0 or 1.`);
      const id = [this.id, name].join('/');
      const socket = new Instance(Socket, { id, name, side, parent: this.parent, control:this, scene: this.scene } )
      this.sockets.create(socket);
    },

    removeSocket(id){
      console.log('LLL BEFORE this.sockets.remove', id, this.sockets.map(o=>o.id).join(', '));
      this.sockets.remove(id);
      console.log('LLL AFTER this.sockets.remove!', id, this.sockets.map(o=>o.id).join(', '));
    },

    send(name, packet){
      this.pipe.emit(name, packet);
    },

    pipe(name){
      const id = [name, this.getRootContainer().id].join(':');
      const origin = globalThis.project.origins.get(this.getRootContainer().node.origin); // root container always has a node, node always has an origin, origin has a root
      const pipe = origin.root.pipes.get(id);
      return pipe;
    },

  };

  methods = {

    initialize(){

      this.pipe = new EventEmitter();
      this.socketLayout = new SocketLayout(this, {source: 'sockets'});

      // NOTE: WARNING! Parent of a socket is not the wiondow it is attached to!!! Thst is its siblink. The parent of a cocket is the same as the parent of the window it is attached to.
      let parent;
      if(this.parent){
        parent = this.parent.getApplication(); // get out of local application (if isApplication)
      }else{
        // possible root
        parent = this.getApplication()
      }

      this.on("sockets.created", (socket) => {
        console.log('LLL sockets.created');
        socket.start(); //<-- state machine cals multiple functions
        this.socketLayout.manage(socket);
        parent.getApplication().socketRegistry.create(socket);
      }, {replay: true} );

      console.log('GGG Registering this.on("sockets.removed"....');
      this.on("sockets.removed", (socket) => {
        console.log('LLL $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  sockets.removed');
        socket.stop(); //<-- state machine cals multiple functions
        parent.getApplication().socketRegistry.remove(socket.id);

        // this.removeControlAnchor(socket.id);
        // this.socketLayout.forget(socket);
      });

    },

    clean(){
      this.sockets.map( ({id})=>this.removeSocket(id) );
    },





  };
}
