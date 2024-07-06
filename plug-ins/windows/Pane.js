import { svg, update, click, text } from "/plug-ins/domek/index.js"
import {nest} from "/plug-ins/nest/index.js";

import Pan from "/plug-ins/meowse/Pan.js";
import Zoom from "/plug-ins/meowse/Zoom.js";
import Resize from "/plug-ins/meowse/Resize.js";
import Menu from "/plug-ins/meowse/Menu.js";

import Node from "/plug-ins/node/Node.js";
import {Instance} from "/plug-ins/object-oriented-programming/index.js";

import translateCursor from '/plug-ins/translate-cursor/index.js';

import Viewport from "/plug-ins/windows/Viewport.js";
import Container from "/plug-ins/windows/Container.js";
import Vertical from "/plug-ins/windows/Vertical.js";
import Horizontal from "/plug-ins/windows/Horizontal.js";

import Label from "/plug-ins/windows/Label.js";

const uuid = bundle['uuid'];
const cheerio = bundle['cheerio'];

import components from "/plug-ins/components/index.js";
import emitterNetwork from "/plug-ins/emitter-network/index.js";

const libraries = {
  'emitter-network': emitterNetwork,
};

const through = (...functions) => {
  return (data) => {
    let response = data;
    for (const funct of functions) {
      response = funct(response) ?? response;
    }
    return response;
  }
}

export default class Pane {

  static extends = [Vertical];

  properties = {
    contain:true,
    classes: '', // css classes
    feed: [],
  };

  observables = {
    url:null,
    library:null,

    panX: 0,
    panY: 0,
    zoom: .5,

    applications: [],
    elements: [],
    anchors: [],
    pipes: [],

    components:{...components},

  };

  traits = {

    async loadXml(url){
      if(!url) return;
      const xml = await (await fetch(url)).text();
      const $ = cheerio.load(xml, { xmlMode: true, decodeEntities: true, withStartIndices: true, withEndIndices: true });
      for (const el of $('Workspace').children()) {
        const node = new Instance(Node, { origin: this.getApplication().id });
        const data = {}; //? NOTE: this can use await...
        node.assign({type:el.name, ...el.attribs, }, data, [$, $(el).children()]);
        this.elements.create( node ); // -> see project #onStart for creation.
      }
    },

    loadElements([$, children]){
      if(!children) return;
      for (const el of children) {
        const node = new Instance(Node, { origin: this.getApplication().id });
        const data = {}; //? NOTE: this can use await...
        node.assign({type:el.name, ...el.attribs}, data, [$, $(el).children()]);
        this.elements.create( node ); // -> see project #onStart for creation.
      }
    },

    getXml(){
      const serializables =  'id x y w h'.split(' ');
      const $ = cheerio.load(``, { xmlMode: true, decodeEntities: true, withStartIndices: true, withEndIndices: true });
        for (const application of this.applications) {
          let body = "";
          if(application.pane){
            body = application.pane.getXml();
          }
          const attributes = (application.serializables||serializables).filter(key=>application[key]).map(key=>`${key}="${application[key]}"`).join(' ')
          $.root().append(`<${application.oo.name} ${attributes}>${body}</${application.oo.name}>`);
        }
      const xml = $.root().html();
      return xml;
    },

    createNode(meta, data, content){
      const node = new Instance(Node, { origin: this.getApplication().id });
      node.assign(meta, data, content);
      this.elements.create( node ); // -> see project #onStart for creation.
    },


  };

  methods = {

    initialize(){

      this.name = 'pane';

      if(this.library){
        this.library.split(',').map(s=>s.trim()).filter(s=>s).forEach((name)=>{
          if(libraries[name]){
            this.components = {...libraries[name], ...components, }
          }else{
            console.info('No such library', name);
          }
        })
      }

      if(this.getRootContainer().isRootWindow) return;

      this.flexible = true; // NOTE: panes are "flexible" by default - they grow as sapce becomes available.

    },

    mount(){
      // this.parent.elements = this.elements;

      this.addDisposableFromSmartEmitter( this.getRoot().keyboard, 'Remove', ()=>this.getApplication().removeApplication() );



      // Add Viewport
      const paneBody = new Instance(Viewport, { parent: this, classes:this.classes, flexible:true} );
      // this.on('h', h=> paneBody.h = h)

      this.viewport = paneBody;
      this.getApplication().viewport = paneBody;

      this.children.create( paneBody );
      this.getRoot().origins.create({ id: this.getRootContainer().id, root: this, scene:paneBody.el.Mask })

      // NOTE: CODE ANOMALY FOR ROOT EDGECASE
      if(this.parent.isRootWindow){
        this.parent.on('h', parentH=>{
          const childrenHeight = this.children.filter(c=>!(c===paneBody)).reduce((total, c) => total + (c.h), 0);
          const spacers = ((this.parent.s * 1) * (this.children.length > 0 ? this.children.length - 1 : 0  )) //XXX: just top spacer not *2 right?
          const freeSpace = parentH - childrenHeight - (this.parent.b*2) - (this.parent.p*2) - spacers;
          paneBody.h = freeSpace;
          paneBody.H = freeSpace;
        })
      };

      // Based on pan and zoom adjust the viewport.
      this.on('panX', panX=>paneBody.panX=panX);
      this.on('panY', panY=>paneBody.panY=panY);
      this.on('zoom', zoom=>paneBody.zoom=zoom);

      this.on("elements.created", (node) => {

        const Ui = this.components[node.type]||this.components['Hello'];
        if(!Ui) return console.warn(`Skipped Unrecongnized Component Type "${node.type}"`);

        let root = svg.g({ id:node.id, name: 'element' });
        paneBody.content.appendChild(root);
        const options = { node, scene: root, parent: this, id:node.id, content:node.content, library:node.library };
        const attributes = {};
        for (const name of node.oo.attributes) { attributes[name] = node[name] }
        const ui = new Instance(Ui, Object.assign(attributes, options));
        this.applications.create(ui);
        ui.start();

      }, {replay:true});

      this.on("elements.removed", ({id}) => {
        this.applications.get(id).stop();
        this.applications.get(id).destroy();
        this.applications.remove(id);
      });

      this.appendElements();

      // Attach context menu to background
      // NOTE: this uses meowse/Menu, triggers openMenu on root window, which will open /windows/menu

      const menu = new Menu({
        area: paneBody.body,
        transforms: ()=>this.getTransforms(this),
        show: ({x,y,tx,ty})=>{ // NOTE: tx and ty are translated

          const availableComponents = Object.keys(this.components)
          .map(className=>({
            x,y,
            root: this.getApplication().node.id,
            text: `New ${className}`,
            value: className,
            action:()=>{
              const node = new Instance(Node, {
                id:uuid(),
                origin: this.getApplication().id,
                type:className,
                x:tx,
                y:ty,
                w:170,
                h:256,
              });
              const data = {}; //? NOTE: this can use await...
              node.assign({ }, data);
              this.elements.create( node ); // -> see project #onStart for creation.
            }
          }));

          const rootWindow = this.getRoot();
          rootWindow.openMenu({ x, y, options: { data: availableComponents, } });


        },
      });

      this.addDisposable(menu);

      const pan = new Pan({
        area: window,
        handle: paneBody.background,
        scale: ()=>this.getParentScale(this),
        movement: ({x,y})=>{
          this.panX -= x;
          this.panY -= y;
        },
      });
      this.addDisposable(pan);

      const zoom = new Zoom({
        magnitude: 0.1,
        // area: paneBody.background, // this does just the background
        area: paneBody.Viewport, // this zooms over everything and requires a stop in the zoom system
        component: paneBody,
        handle: paneBody.background,
        getter: (key)=>this[key],
        transforms: ()=>this.getTransforms(this),
        before: ()=>{
        },
        change: ({zoom,panX,panY})=>{
          this.zoom = zoom;
          this.panX = panX;
          this.panY = panY;
        },
        feedback: (debug) => {
        },
        after: (data,debug)=>{
        },
      });
      this.addDisposable(zoom);

      this.on('url', url=>this.loadXml(this.url));

      // TODO: Kludge the flow must be fixed
      if(this.getApplication().content) this.loadElements(this.getApplication().content /* this passes on the cheerio tuple */ )

    },

    clean(){
      this.elements.map( ({id})=>this.elements.remove(id) );
      // done by elements this.applications.map( ({id})=>this.applications.remove(id) );
      this.anchors.map( ({id})=>this.anchors.remove(id) );
      this.pipes.map( ({id})=>this.pipes.remove(id) );


    },

 

  }

}
