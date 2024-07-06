export class EventSystem {

  root = null;

  constructor(root, options){
      this.root = root;
  }

  create(name, type){
    console.info('EMITTER CREATE', this.root.id, name, type);
  }

  destroy(name){
    console.info('EMITTER DESTROY', name );
  }
}
