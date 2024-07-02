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

    selected: false,

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

      this.el.PrimaryBg = svg.line({
        name: this.name,
        class: 'editor-connector-zone',
        'vector-effect': 'non-scaling-stroke',
      });

      this.el.Primary = svg.line({
        name: this.name,
        class: 'editor-connector',
        'vector-effect': 'non-scaling-stroke',
        style:{'pointer-events': 'none'},
      });

      this.el.Midpoint = svg.circle({
        name: this.name,
        class: 'editor-connector-midpoint',
        'vector-effect': 'non-scaling-stroke',
        style:{'pointer-events': 'none'},
        r:4,
      });

      this.on("selected", selected => selected?this.el.Primary.classList.add('selected'):this.el.Primary.classList.remove('selected'));
      this.on("selected", selected => selected?this.el.Midpoint.classList.add('selected'):this.el.Midpoint.classList.remove('selected'));


      const select = new Select({
        component: this,
        handle: this.el.PrimaryBg,
      });
      this.addDisposable(select);

      this.on('name',  name=>update(this.el.Primary,{name}), );

      this.on("node", (node) => {
        node.on("from", v => this.from = v);
        node.on("to", v => this.to = v);
        node.on("out", v => this.out = v);
        node.on("in", v => this.in = v);
      });


      this.any('from out', ({from:nodeId, out:portName})=>{
        const socketId = [nodeId, portName].join('/');
        console.log('from out', socketId, this.getApplication().id);
        console.log(`this.any from out (application=${this.getApplication().id})`, this.getApplication().pane.elements.raw.map(o=>o.id));
        console.log(`this.any from out (application=${this.getApplication().id})`, this.getApplication().socketRegistry.raw.map(o=>o.id));

        const socket = this.getApplication().socketRegistry.get(socketId);
        socket.on('x', x=>this.x1=x)
        socket.on('y', y=>this.y1=y)
      });

      this.any('to in', ({to:nodeId, in:portName})=>{
        const socketId = [nodeId, portName].join('/');
        console.log('to in', socketId);
        const socket = this.getApplication().socketRegistry.get(socketId);
        socket.on('x', x=>this.x2=x)
        socket.on('y', y=>this.y2=y)
      });

      this.connectionId = null;
      this.all('from out to in', o=>{

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
          this.addDisposableFromEmitter(control1.pipe, o.out, packet=>control2.pipe.emit(o.in, packet));
          this.connectionId = connectionId;
        }else{
          console.log('DISCO', [o.from, o.out, o.to, o.in]);
        }


      })

      this.any(['x1','y1','x2','y2'], packet=> update(this.el.Midpoint, midpoint(packet)));

      this.any(['x1','y1','x2','y2'], ({x1, y1, x2, y2}) => {
        const [x3,y3] = edgepoint(x1, y1, 12, x1, y1, x2, y2);
        const [x4,y4] = edgepoint(x2, y2, -12, x1, y1, x2, y2);
        update(this.el.PrimaryBg, {x1:x3, y1:y3, x2:x4, y2:y4})
        update(this.el.Primary, {x1:x3, y1:y3, x2:x4, y2:y4})
      });


      this.appendElements();
    },



  }

}
