import { svg, update, click } from "/plug-ins/domek/index.js"
import {nest} from "/plug-ins/nest/index.js";

import Pan from "/plug-ins/pan/index.js";
import Zoom from "/plug-ins/zoom/inner.js";

import Node from "/plug-ins/node/Node.js";
import {Instance} from "/plug-ins/object-oriented-programming/index.js";


import Container from "/plug-ins/windows/Container.js";
import Vertical from "/plug-ins/windows/Vertical.js";
import Horizontal from "/plug-ins/windows/Horizontal.js";

import Junction from "/plug-ins/windows/Junction.js";
import Line from "/plug-ins/windows/Line.js";

import Label from "/plug-ins/windows/Label.js";
import { RelativeLayout } from "/plug-ins/layout-manager/index.js";

const uuid = bundle['uuid'];

export default class VisualEditor {

  static extends = [Vertical];

  properties = {
    contain:true,
  };

  observables = {
    panX: 0,
    panY: 0,
    zoom: 1,

    applications: [],
    elements: [],
    anchors: [],
    pipes: [],
    types: [ Junction, Line ],
  };

  methods = {

    initialize(){


      console.info('Line must detect the g it should be placed into');
      this.h = 400;
      this.subLayout = new RelativeLayout(this);
      this.el.Group = svg.g()

      this.childrenGroup = svg.g({style:{'transform-origin': 'top left'}})
      this.el.Group.appendChild(this.childrenGroup);

      globalThis.project.origins.create({ id: this.getRootContainer().id, root: this, scene:this.el.Group })

      this.on('panX', v=> requestAnimationFrame(() => { this.childrenGroup.style.transform = `translate(${this.panX}px, ${this.panY}px)` }));
      this.on('panY', v=> requestAnimationFrame(() => { this.childrenGroup.style.transform = `translate(${this.panX}px, ${this.panY}px)` }));
      this.on('zoom', v=> requestAnimationFrame(() => { this.childrenGroup.style.scale = this.zoom }));

      this.on("elements.created", (node) => {
        const Ui = this.types.find(o=>o.name==node.type); // concept as in conceptmap is a component as it is a GUI thing.
        if(!Ui) return console.warn(`Skipped Unrecongnized Component Type "${node.type}"`);
        const ui = new Instance(Ui, {id:node.id, node, scene: this.childrenGroup});
        this.applications.create(ui);
        ui.start()
        this.subLayout.manage(ui);
      }, {replay:true});

      this.on("elements.removed", ({id}) => {
        this.applications.get(id).stop();
        this.applications.get(id).destroy();
        this.applications.remove(id);
      });

    },

    mount(){


      const centerCircle = svg.circle({style:{'pointer-events': 'none'}, stroke:'red', r:5})
      this.childrenGroup.appendChild(centerCircle);

      const outlineRectangle = svg.rect({style:{'pointer-events': 'none'}, stroke:'blue', fill:'none'})
      this.childrenGroup.appendChild(outlineRectangle);

      const x1 = svg.line({style:{'pointer-events': 'none'}, stroke:'gold', fill:'none'})
      const x2 = svg.line({style:{'pointer-events': 'none'}, stroke:'gold', fill:'none'})
      this.childrenGroup.appendChild(x1);
      this.childrenGroup.appendChild(x2);

      const area = new Instance(Container, {h: 600, parent: this});
      this.children.create( area );
      area.draw()

      area.any(['x','y','w','h'], ({x,y,w,h})=>{
        update(x1, {x1:x, y1:y, x2:x+w, y2:y+h} );
        update(x2, {x1:x, y1:y+h, x2:x+w, y2:y} );
        update(centerCircle, {cx:x+w/2,cy:y+h/2 } );
        update(outlineRectangle, {x,y,width:w,height:h} );
      })

      this.parent.any(['x','y','w','h'], ({x,y,w:width,h:height})=>{

      })

      const [horizontal, [ addButton, delButton, vplCanvas ]] = nest(Horizontal, [
        [Label, {h: 32, W:32, text: 'Add', parent:this}, (c,p)=>p.children.create(c)],
        [Label, {h: 32, W:32, text: 'Del', parent:this}, (c,p)=>p.children.create(c)],
      ], (c)=>this.children.create(c))







      this.el.ClipPath = svg.clipPath({
        id: `clip-path-${this.id}`,
      });
      const clipPathRect = svg.rect({ // this gets synchronized with the control that is actually registered to the layout manager
        x: this.parent.x,
        y: this.parent.y,
        width: this.parent.w,
        height: this.parent.h,
      });

      area.any(['x','y','w', 'h'], ({x,y,w:width,h:height})=>{
        update(clipPathRect, {x,y,width,height} );
      })

      this.el.ClipPath.appendChild(clipPathRect);
      update(this.el.Group, {'clip-path': `url(#clip-path-${this.id})`} );
      this.appendElements();

      this.disposable = click(addButton.handle, e=>{
        const id = uuid();
        const node = new Instance( Node, {id, origin:this.getRootContainer().id, type: "Junction", x: 300, y: 300, data:{}} );
        this.elements.create(node);
      })

      const pan = new Pan({
        component: this,
        handle: area.el.Container,
        zone: window,
        // XXX: transformMovement: (v)=>v/globalThis.project.zoom,
      }); this.destructable = ()=>pan.destroy()


      const cursorProbe = svg.circle({style:{'pointer-events': 'none'}, stroke:'cyan'})
      this.childrenGroup.appendChild(cursorProbe);


    const zoom = new Zoom({
      component: this,
      area: area,
      element: area.el.Container,
      zone: area.el.Container,
      // transformMovement: (v)=>v/globalThis.project.zoom,
      probe: ({cursor})=>{
        update(cursorProbe, {cx:cursor.x, cy:cursor.y, r:10} );

      },
    }); this.destructable = ()=>zoom.destroy()

    console.log(this.parent.parent);
    const transforms = this.getTransforms(this);
    console.table(transforms)


    }
  }

}
