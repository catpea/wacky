import Component from "/plug-ins/windows/Component.js";
import Select from "/plug-ins/select/index.js";
import { svg, update } from "/plug-ins/domek/index.js"
import { midpoint } from "/plug-ins/geometrique/index.js";
import { edgepoint } from "/plug-ins/geometrique/index.js";

export default class Connector {

  static extends = [Component];

  properties = {
  };

  observables = {
    from: null,
    to: null,
    out: null,
    in: null,

    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,

  };

  constraints = {
    mount: {
      '.scene is required to start the universe': function(){ if(!this.scene){return {error:'.svg not found'}} },
    }
  }

  methods = {

    initialize(){
    },

    mount(){

      this.el.Primary = svg.line({
        name: this.name,
        class: 'editor-connector',
        'vector-effect': 'non-scaling-stroke',
      });

      this.el.Midpoint = svg.circle({
        name: this.name,
        class: 'editor-connector-midpoint',
        'vector-effect': 'non-scaling-stroke',
        r:4,
      });

      // this.on("selected", selected => selected?this.el.Primary.classList.add('selected'):this.el.Primary.classList.remove('selected'));
      // this.on("selected", selected => selected?this.el.Midpoint.classList.add('selected'):this.el.Midpoint.classList.remove('selected'));


      // const select = new Select({
      //   component: this,
      //   handle: this.el.Primary,
      // }); this.destructable = ()=>focus.destroy()

      this.on('name',  name=>update(this.el.Primary,{name}), );

      this.on("node", (node) => {
        node.on("from", v => this.from = v);
        node.on("to", v => this.to = v);
        node.on("out", v => this.out = v);
        node.on("in", v => this.in = v);
      });


      this.desctructible = this.any('from out', ({from:nodeId, out:portName})=>{
        const socketId = [nodeId, portName].join('/');
        console.log('from out', socketId, this.getApplication().id);
        console.log(`this.any from out (application=${this.getApplication().id})`, this.getApplication().pane.elements.raw.map(o=>o.id));
        console.log(`this.any from out (application=${this.getApplication().id})`, this.getApplication().socketRegistry.raw.map(o=>o.id));

        const socket = this.getApplication().socketRegistry.get(socketId);
        socket.on('x', x=>this.x1=x)
        socket.on('y', y=>this.y1=y)
      });

      this.desctructible = this.any('to in', ({to:nodeId, in:portName})=>{
        const socketId = [nodeId, portName].join('/');
        console.log('to in', socketId);
        const socket = this.getApplication().socketRegistry.get(socketId);
        socket.on('x', x=>this.x2=x)
        socket.on('y', y=>this.y2=y)
      });

      this.connectionId = null;
      this.desctructible = this.all('from out to in', o=>{

        let connectionId = [o.from, o.out, o.to, o.in].join('+');

        if(this.connectionId == connectionId) {
          console.log('DUPE', this.connectionId);
          return;
        }

        let connect = [o.from, o.out, o.to, o.in].every(i=>i);

        if(connect){
          const socket1 = [o.from, o.out].join('/');
          const socket2 = [o.to, o.in].join('/');
          const control1 = this.getApplication().socketRegistry.get(socket1).control;
          const control2 = this.getApplication().socketRegistry.get(socket2).control;
          control1.pipe.on(o.out, packet=>control2.pipe.emit(o.in, packet));
          this.connectionId = connectionId;
        }else{
          console.log('DISCO', [o.from, o.out, o.to, o.in]);
        }


      })

      // this.on('source', id=>{
      //   if(!id) throw new Error(`Primary requires source id`);
      //   if(!id.includes(':')) throw new Error(`Id must contain ":".`);
      //   // const component = id.includes(':')?globalThis.project.anchors.get( id ):globalThis.project.applications.get( id );
      //   const origin = globalThis.project.origins.get(this.getRootContainer().node.origin); // root container always has a node, node always has an origin, origin has a root
      //
      //   const component = origin.root.anchors.get( id );
      //   component.on('x', x=>this.x1=x)
      //   component.on('y', y=>this.y1=y)
      //
      //
      // });
      //
      // this.on('target',  id=>{
      //   if(!id) throw new Error(`Primary requires target id`);
      //   if(!id.includes(':')) throw new Error(`Id must contain ":".`);
      //   // const component = id.includes(':')?globalThis.project.anchors.get( id ):globalThis.project.applications.get( id );
      //   const origin = globalThis.project.origins.get(this.getRootContainer().node.origin); // root container always has a node, node always has an origin, origin has a root
      //   const component = origin.root.anchors.get( id );
      //   component.on('x', x=>this.x2=x)
      //   component.on('y', y=>this.y2=y)
      // });
      //
      //
      // this.all(['source', 'target'], ({source, target})=>{
      //   const origin = globalThis.project.origins.get(this.getRootContainer().node.origin); // root container always has a node, node always has an origin, origin has a root
      //   globalThis.project.pipe(origin, source, target );
      // })
      // // ;


      // this.on('x1',      x1=>update(this.el.Primary,{x1}),     );
      // this.on('y1',      y1=>update(this.el.Primary,{y1}),     );
      // this.on('x2',      x2=>update(this.el.Primary,{x2}),     );
      // this.on('y2',      y2=>update(this.el.Primary,{y2}),     );
      //
      // this.on('x1',      x1=>update(this.el.Primary,{x1}),     );
      // this.on('y1',      y1=>update(this.el.Primary,{y1}),     );
      // this.on('x2',      x2=>update(this.el.Primary,{x2}),     );
      // this.on('y2',      y2=>update(this.el.Primary,{y2}),     );

      // this.any(['x1','y1','x2','y2'], packet=> update(this.el.Primary, packet));
      this.any(['x1','y1','x2','y2'], packet=> update(this.el.Midpoint, midpoint(packet)));

      this.any(['x1','y1','x2','y2'], ({x1, y1, x2, y2}) => {
        const [x3,y3] = edgepoint(x1, y1, 12, x1, y1, x2, y2);
        const [x4,y4] = edgepoint(x2, y2, -12, x1, y1, x2, y2);
        update(this.el.Primary, {x1:x3, y1:y3, x2:x4, y2:y4})
        // console.log(this.el.Primary, {x1:x3, y1:y3, x2:x4, y2:y4});
      });


      this.appendElements();
    },

    destroy(){
      this.removeElements()
    }

  }

}
