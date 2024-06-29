import Properties from "/plug-ins/properties/Properties.js";
import Node from "/plug-ins/node/Node.js";

import {Instance} from "/plug-ins/object-oriented-programming/index.js";


import Keyboard from "/plug-ins/keyboard/index.js";
import Pan from "/plug-ins/pan/index.js";
import Zoom from "/plug-ins/zoom/outer.js";

import {svg} from "/plug-ins/domek/index.js";

// Begin UI

// User
import RelationBuilder from "/plug-ins/applications/RelationBuilder.js";

import ColorPicker from "/plug-ins/applications/ColorPicker.js";
import ThemeBuilder from "/plug-ins/applications/ThemeBuilder.js";
import VisualProgram from "/plug-ins/applications/VisualProgram.js";
import CodeEditor from "/plug-ins/applications/CodeEditor.js";
import Junction from "/plug-ins/windows/Junction.js";
import Line from "/plug-ins/windows/Line.js";
import RemoteApplication from "/plug-ins/applications/RemoteApplication.js";

// Developer
import ElementDebugger from "/plug-ins/developer/ElementDebugger.js";
import ApplicationDebugger from "/plug-ins/developer/ApplicationDebugger.js";
import AnchorDebugger from "/plug-ins/developer/AnchorDebugger.js";
import PipeDebugger from "/plug-ins/developer/PipeDebugger.js";
import ZoomPanDebugger from "/plug-ins/developer/ZoomPanDebugger.js";

// End UI



// Debounce function to limit the rate at which the `onResize` function is called
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default class Project {

  // extends = [];

  state = {
    current: 'initial',

    initial: {
       run: 'initialize',
       can: 'start'
     },

     start: {
       run: 'mount',
       can: 'stop'
     },

     stop: {
       run: ['destroy'],
       can: 'start'
     },

  };

  properties = {
    meta: {},
    types: [
      RelationBuilder,
      ColorPicker, ThemeBuilder, VisualProgram, Junction, Line, RemoteApplication, CodeEditor,
      ElementDebugger, ApplicationDebugger, AnchorDebugger, PipeDebugger, ZoomPanDebugger,
    ], // What can the project instantiate?


  };

  observables = {

    svg: undefined,
    scene: undefined,
    background: undefined,
    file: undefined,
    name: "Bork",

    origins: [],
    archetypes: [],

    // PRIMARY DATA, note Line component represents edges, these must come second, forst take care of non-Line, then Line
    elements: [], // use instead of old .nodes

    // SECONDATY LOOKUP DATA - registry for fast lookup purposes
    applications: [], // NOTE: root windowID

    anchors: [], // NOTE: format is portName:rootID (not component id, but the root window)
    pipes: [],
    //

    w:0,
    h:0,

    panX: 0,
    panY: 0,
    zoom: 1,
    iframe: true, // controls if iframe content is visible, iframes interefere with dragging

  };

  constraints = {
    started: {
      '.svg is required to start the universe': function(){ if(!this.svg){return {error:'.svg not found'}} },
      '.scene is required to start the universe': function(){ if(!this.scene){return {error:'.scene not found'}} },
      '.background is required to start the universe': function(){ if(!this.background){return {error:'.background not found'}} },
      '.file is required to start the universe': function(){ if(!this.file){return {error:'file url required'}} },
    }
  }


methods = {

  getTransforms(element, list=[]) {

    list.unshift({name:this.oo.name, x:this.panX, y:this.panY, z:this.zoom, element: this});
    return list
  },

  initialize() {

    this.origins.create({ id:0, root: this, scene:this.scene })

    this.on('zoom', v=> requestAnimationFrame(() => { this.scene.style.scale = this.zoom }));
    this.on('panX', v=> requestAnimationFrame(() => { this.scene.style.transform = `translate(${this.panX/this.zoom}px, ${this.panY/this.zoom}px)` }));
    this.on('panY', v=> requestAnimationFrame(() => { this.scene.style.transform = `translate(${this.panX/this.zoom}px, ${this.panY/this.zoom}px)` }));

    this.on('name', v=> {
      if(v) document.querySelector('title').innerText = v;
    });

    this.on('file', async v=> {
    });

    // this.on("elements.created", (node) => {
    //   const Ui = this.types.find(o=>o.name==node.type); // concept as in conceptmap is a component as it is a GUI thing.
    //   if(!Ui) {
    //     console.warn(`Skipped Unrecongnized Component Type "${node.type}"`);
    //     return;
    //   }
    //
    //   let scene = this.scene;
    //   if(node.scene) scene = node.scene;
    //
    //   const g = svg.g({id:node.id, class:'component'});
    //   scene.appendChild(g)
    //
  	// 	const ui = new Instance(Ui, {id:node.id, node, scene:g, parent:this});
    //   this.applications.create(ui);
    //   ui.start()
    // }, {replay:true});

    // this.on("elements.removed", ({id}) => {
    //   this.applications.get(id).stop();
    //   this.applications.get(id).destroy();
    //   this.applications.remove(id);
    // });

  }, // initialize

  pipe(origin, sourceId, targetId){

    if(!origin) throw new Error('origin is required');
    if(!sourceId) throw new Error('sourceId is required');
    if(!targetId) throw new Error('targetId is required');

    const source = origin.root.pipes.get(sourceId);
    const target = origin.root.pipes.get(targetId);

    source.on('data', (data)=>target.emit('data', data));
  },

  createNode({meta, data}){
    const node = new Instance(Node, {...meta, data});
    const origin = this.origins.get(node.origin);
    origin.root.elements.create(node);
  },

  remove(id){
    const node = this.nodes.get(id);
    project.elements.remove( node );
    node.stop();
    node.destroy();
  },

  removeSelected(){
    for (const application of this.applications) {
      if(application.selected){
        this.remove(id);
      }
    }
  },

  async mount (){

    // const onResize = () => { this.w = this.svg.clientWidth; this.h = this.svg.clientHeight; };
    // const debouncedOnResize = debounce(onResize, 69);
    // window.addEventListener('resize', debouncedOnResize);
    // onResize()
    // this.any(['zoom', 'panX', 'panY'], ()=>{
    //   onResize()
    //
    // });
    // // window.removeEventListener('resize', debouncedOnResize);

    //
    //
    // // features that need to be installed after DOM nodes are created
    // // pan(this);
    // const keyboard = new Keyboard({
    //   component: this,
    //   handle: window, // set to caption above to react to window captions only
    // }); this.destructable = ()=>keyboard.destroy()
    //
    // const zoom = new Zoom({
    //   component: this,
    //   element: this.background,
    //   zone: this.background,
    // }); this.destructable = ()=>zoom.destroy()
    //
    // const pan = new Pan({
    //   component: this,
    //   handle: this.background,
    //   zone: window,
    // }); this.destructable = ()=>pan.destroy()
    //


    // TODO: simplify code below with a rehydrator
    // const rehydrated = await rehydrator();

    // XXX: const rehydrated = await (await fetch(this.file)).json();
    // XXX: this.meta = rehydrated.meta;
    // XXX: for (const {meta, data} of rehydrated.data) {
      // XXX: const node = new Instance(Node, {origin:0});
      // XXX: node.assign(meta, data);
      // XXX: project.elements.create( node ); // -> see project #onStart for creation.
    // XXX: }





  },

  async save(filename="project.json", meta={}){
    const packageJson = await (await fetch('package.json')).json();
    const {version:compatibility } = packageJson;
    let objects = {
      meta: Object.assign(this.meta, meta, {compatibility }),
      data:[],
    }
    for (const concept of project.elements) {
      const object = concept.toObject();
      objects.data.push( object );
    }
    const str = JSON.stringify(objects, null, 2);
    console.log(str);
  },

  destroy(){
    for (const {id} of this.elements) {
      this.applications.get(id).stop();
      this.applications.remove(id);
    } // for every tray
    // shut down all properties...
    this.dispose();
  },

  }

}
