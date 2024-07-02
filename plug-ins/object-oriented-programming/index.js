
//NOTE: Inheritance is instantiated at the top of instance
export class Inheritance {

  instance;
  root;

  constructor({Class, instance, specification}){
    this.instance = instance;
    this.instance.oo.extends.push(Class)
    this.collectClasses(Class.extends);

    console.log('PPP all', this.instance.oo.extends);
    //??? this.instance.oo.specifications.push(specification);
    this.instantiateSuperclasses()
    // console.log(this.instance);
  }

  collectClasses(list){
    if (!Array.isArray(list)) return;

    for (const Class of list.filter(o=>o)) {
      console.log(Class);
      this.instance.oo.extends.push(Class);
    }
    for (const Class of list.filter(o=>o)) {
      console.log(Class);
      this.collectClasses(Class.extends);
    }
  }

  instantiateSuperclasses(){
    let parent;
    for (const Class of this.instance.oo.extends) {
      // THIS IS WRONG: we are creating instconst instance = new Instance( Class, data, {superInstantiation:true, root:this.instance} );
      const instance = new Class(); // NOTE: this is standard instantiation as we only need the specification
      instance.name = Class.name;
      if(!instance.traits) instance.traits = [];
      if(!instance.methods) instance.methods = [];
      this.instance.oo.specifications.push( instance );
      instance.parent = parent;
      parent = instance;
    }
  }


}

export class Instance {

  /*
    do not put anything in the properties section,
    Instance is the class that is returned to the user.
  */

  constructor(Class, data){

    const specification = new Class(); // specification is the class we are instantiating.
    // console.log(`%cCreate Class (${specification.constructor.name})`, 'background: hsl(124, 50%, 60%); color: black;');

    this.oo = {}
    this.oo.scratch = {}; // space for extensions (cytoscape easter egg)
    this.oo.name = specification.constructor.name;
    this.oo.class = Class;
    this.oo.types = specification.types;
    this.oo.specification = specification;
    this.oo.attributes = [];

    this.oo.extends = [];
    this.oo.disposables = [];
    this.oo.specifications = [];

    new Inheritance({Class, instance:this, specification, root:this});

    // // Install Super
    // if(!dependency){
    //   const reverseStack = Array.from( this.oo.specifications ).reverse();
    //   // reverseStack.pop()
    //   console.log('reverseStack',reverseStack);
    //   let previous = undefined;
    //   for (const inherited of reverseStack ) {
    //     inherited.Superclass = previous;
    //     console.log('EE', inherited.Parent, inherited);
    //     previous = inherited;
    //   }
    //   this.Superclass = previous
    // }

    const defaultState = {
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
           run: 'clean destroy exit',
           can: 'initial'
         },

      };




    const ensureArray = function(input){ // convert string to array, and if it is array leave it alone
      if( Array.isArray(input) ) return input;
      return input.split(' ');
    }
    const isStateTransitionAllowed = function({from, to, state}){
      return ensureArray(state[from].can).includes(to);
    }




    // Install Properties
    for (const inherited of this.oo.specifications) {
      // begin at top, avoid properties that already exist.
      if(inherited.properties){
        for (const [propertyName, propertyValue] of Object.entries(inherited.properties)) {
          if(propertyName in this === false){
            Object.defineProperty(this, propertyName, {
              value: propertyValue,
              writable: true,
              enumerable: true,
              configurable: false,
            });
          }
        } // for properties
      } // if
    }

    // Install Traits (a trait is bound to the nice object)
    for (const inherited of this.oo.specifications) {
      // begin at top, avoid properties that already exist.
      if(inherited.traits){
        for (const [traitName, traitFunction] of Object.entries(inherited.traits)) {
          if(traitName in this === false){
            Object.defineProperty(this, traitName, {
              value: traitFunction.bind( this ),
              writable: true,
              enumerable: true,
              configurable: false,
            });
          }
        } // for properties
      } // if
    }

    // Install Methods (sensitive to method chains)

    // for (const inherited of this.oo.specifications) {
    //   if(inherited.methods){ // if methods property
    //     for (const [methodName, methodFunction] of Object.entries(inherited.methods)) {
    //
    //       if(methodName in this === true) continue; // method exists
    //
    //       Object.defineProperty(this, methodName, {
    //         value: methodFunction.bind(this),
    //         writable: true,
    //         enumerable: true,
    //         configurable: false,
    //       });
    //
    //       console.log(`DEFINED ${methodName} on ${this.constructor.name}`);
    //     console.log(methodName, this[methodName]);
    //
    //     } // for properties
    //   } // if
    // }



    // Gather All Methods
    const composite = this;
    const methods = [];
    for (const inherited of this.oo.specifications) {
      if(inherited.methods){ // if methods property
        for (const [methodName, methodFunction] of Object.entries(inherited.methods)) {
          methods.push(methodName);
        } // for properties
      } // if
    }
    function executeAll(name, arg, list){
      let response = null;
      const reversed = Array.from( list ).reverse();
      for (const inherited of reversed) {
        if(inherited.methods && inherited.methods[name]){
          response = inherited.methods[name].bind(composite)(...arg)
        }
      }
      return response;
    }
    for (const methodName of methods) {
      Object.defineProperty(this, methodName, {
        value: function(...arg){ return executeAll(methodName, arg, this.oo.specifications) },
        writable: true,
        enumerable: true,
        configurable: false,
      });
    }




    const observableData = {};
    this.oo.createObservable = (observableName, observableValue=undefined, internal=false) => {


      if(!internal){
        // this is a user defined observable
        this.oo.attributes.push(observableName);
      }



      const isArray = Array.isArray(observableValue)?true:false;
      const observableExists = observableData[observableName]; // (observableName in this === false);
      const propertyUpgrade = (!observableExists && (observableName in this === true))

      if(propertyUpgrade){
        console.info(`createObservable: property "${observableName}" converted to observable on class ${this.oo.name}`, this[observableName]);
      }

      if(!observableExists){

        if(isArray){
          // console.log('Creating array');
          observableData[observableName] = new List(observableName, observableValue);
          Object.defineProperty(this, observableName, {
            get: () => observableData[observableName].value,
            set: (value) => {throw new Error(`observable array "${observableName}" cannot be replaced`)},
            configurable: false,
          });
        }else{ // primitive
          // console.log('Creating primitive');
          observableData[observableName] = new Primitive(observableName, observableValue);
          Object.defineProperty(this, observableName, {
            get: () => observableData[observableName].value,
            set: (value) => observableData[observableName].value = value,
            configurable: false,
          });
        }

        // console.log('xx xx', observableData[observableName]);


      }
    }


    // Install Observables
    for (const inherited of this.oo.specifications) {
      // begin at top, avoid properties that already exist.
      if(inherited.observables){
        for (const [observableName, observableValue] of Object.entries(inherited.observables)) {
          this.oo.createObservable(observableName, observableValue, true);
        } // for properties
      } // if
    }

    // DISPOSABLES
    // Install Cleaning System, to enable tracking observers
    // INTERNAL VERSION
    const disposables = [];
    const disposable = function (...arg){
      disposables.push(...arg);
    }
    // EXTERNAL (USER) VERSION

    Object.defineProperty(this, 'disposable', {
      set: (value) => {throw new Error('Do not assign disposables this way use .oo.addDisposable')},
      configurable: false,
    });

    // FLUSH ALL
    this.dispose = ()=>{
      for (const disposable of disposables) {
        if(typeof disposable === "function"){
          disposable();
        }else{
          console.error('Bad Disposable', disposable)
        }
      }
      for (const disposable of this.oo.disposables) {
        if(typeof disposable === "function"){
          disposable();
        }else{
          console.error('Bad Disposable', disposable)
        }
      }
    }




    // REFLECTION API
    // NOTE: these are API/protocol functions - stable way to reliably get what you need

    const that = this;
    this.oo.getMethods = function(){
      const response = that.oo.specifications.map( ({name, methods})=>({name,data: Object.entries(methods)          .map( ([name,code]) => ({name,code: 'function ' + code.toString()}) )                }) );
      console.log(response);
      return response
    }
    this.oo.getTraits = function(){
      const response = that.oo.specifications.map( ({name, traits})=>({name,data: Object.entries(traits)          .map( ([name,code]) => ({name,code: 'function ' + code.toString()}) )                }) );
      console.log(response);
      return response
    }

    this.on = function(eventPath, observerCallback, options, control){
      const [name, path] = eventPath.split('.', 2);
      // if(!observableData[name]) console.info(`property "${name}" not defined on ${this.oo.name} (${Object.keys(observableData).join(', ')})`);
      const observableMissing = (name in this === false);

      if(!observableData[name]){
        // console.log(`Observable ${name}`, observableData[name], this[name]);
        // console.warn(`property "${name}" not defined on ${this.oo.name} (${Object.keys(observableData).join(', ')})`);
        // console.log(`Creating a dynamic "${name}" observable via .on`, observableData, observableData[name]);
        this.oo.createObservable(name, this[name] );
        // console.log(`Created a dynamic "${name}" observable via .on`, observableData[name]);
        if(!observableData[name]){
          console.log(this);
          throw new Error(`Failed to create a dynamic observable "${name}" via .on on object ${this.oo.name}`)
        }
      }


      if(control?.manualDispose || options?.manual){
        return observableData[name].observe(path||name, observerCallback, options);
      }else{
        disposable( observableData[name].observe(path||name, observerCallback, options) );
      }
    }

    this.any = function(observables, ...functions){
      disposable(...this.anyManual(observables, ...functions));
    }

    this.all = function(observables, ...functions){
      disposable(...this.allManual(observables, ...functions));
    }


    this.anyManual = function(observables, ...functions){
      if(typeof observables === 'string') observables = observables.split(' ');
      const callback2 = ()=>{
        const entries = observables.map(key => [key, this[key]])
        const packet = Object.fromEntries(entries);
        functions.map(ƒ=>ƒ(packet));
      }
      // console.info('must manually dispose!');
      return observables.map(event=>this.on(event, callback2, undefined, {manualDispose: true}));
    }

    this.allManual = function(observables, ...functions){
      if(typeof observables === 'string') observables = observables.split(' ');

      const callback2 = ()=>{
        const entries = observables.map(key => [key, this[key]])
        const packet = Object.fromEntries(entries);
        const isReady = Object.values(packet).every(value=>value!==undefined)
        if(isReady) functions.map(ƒ=>ƒ(packet));
;
      }
      // console.info('must manually dispose!');
      return observables.map(event=>this.on(event, callback2, undefined, {manualDispose: true}));
    }

    // Install State (must come after methods as it may call come of them)
    const stateConstraints = {};
    const stateConstraint = function(constraints, constraintName){
      // console.log('TESTING', constraintName, constraints[constraintName]);
      if(constraints[constraintName]){
      constraints[constraintName].forEach(({ test, message }) => {
        const verdict = test();
        if (verdict?.error) {
          throw new Error(`🍔 state constraint error: ${message} - ${verdict.error} (attempted to execute ${constraintName})`);
        }
      });
      }
    }

    const state = specification.state || defaultState;
    const stateNames = Object.entries(state).filter(([stateName, stateValue])=>stateName!=='current');
    for (const [stateName, stateValue] of stateNames) {

      if(stateName in this === false){

        const stateFunction = function(){
          // check if in this state this function can run
          const currentState = state.current;
          const from = currentState;
          const to = stateName;
          // console.log({from, to,});

          const transitionAllowed = isStateTransitionAllowed({
            from, to, state
          })

          if(!transitionAllowed){
              throw new Error(`Cannot transition state from ${from} (current) to ${to}, only ${ensureArray(state[currentState].can).join(", ")} allowed.`)
          }

          if(transitionAllowed){
              // console.log(`Transitioniong ${specification.constructor.name} state from ${from} -> ${to} `);
          }

          // execute methods specified in run
          const stateFunctions = ensureArray(state[stateName].run);
          // console.log('LLL stateFunctions', stateFunctions);
          for (const functionName of stateFunctions) {
            // const lookup = specification;
            // if(!lookup || !lookup[functionName]) throw new Error(`State Change: Class ${specification.constructor.name} has no function named ${functionName}`)
            // stateConstraint(stateConstraints, functionName);
            // lookup[functionName].bind(this)();
            //
            if(functionName in this === false){
              console.info(`Initialize: Class ${specification.constructor.name} has no function named ${functionName}`)
            }else{
              stateConstraint(stateConstraints, functionName);
              this[functionName]();
            }

          }
          // switch state
          state.current = stateName;
        }.bind(this);
        // console.log(`Creating state function ${stateName}`);
        Object.defineProperty(this, stateName, {
          value: stateFunction,
          writable: true,
          enumerable: true,
          configurable: false,
        });
      }else{
        throw new Error(`Lol, state name "${stateName}" is used for something else in Class ${this.oo.name}. That is absolutley not allowed, as switching between states would have been destroyed. Other reserved names are: ${stateNames.map(([stateName, configuration])=>`${stateName} (runs: ${ensureArray(configuration.run)})`).join(', ')}.`);
      }
    } // for properties




    // Install State Constraints
    for (const [stateName, stateValue] of Object.entries(state).filter(([stateName, stateValue])=>stateName!=='current')) {
      for (const keyName of ensureArray(stateValue.run)) {
        if(specification.constraints && specification.constraints[keyName]){
          for (const [constraintName, constraintValue] of Object.entries(specification.constraints[keyName])) {
            //console.log(keyName, [constraintName, constraintValue] );
            if(!stateConstraints[keyName]) stateConstraints[keyName] = [];
              stateConstraints[keyName].push({message:constraintName, test:constraintValue.bind(this)});
          }
        }
      }
    }







    // Install Observable Constraints
    for (const inherited of this.oo.specifications) {
      if(inherited.constraints && inherited.observables){
        for (const [constraintName, constraintValue] of Object.entries(inherited.constraints).filter(([constraintName, constraintValue])=>inherited.observables[constraintName])) {
          if(constraintName in observableData === false) throw new Error(`Unable to observable constrain "${constraintName}" becasue it is not defined in ${specification.constructor.name}`);
          for (const [message, test] of Object.entries(constraintValue)) {
            observableData[constraintName].constraints.push({message, test:test.bind(this)});
            observableData[constraintName].constrain(observableData[constraintName].value, true);
          }
        } // for constraints
      } // if constraints
    }


    // appply constructor data
    if(data){
      for (const [name, value] of Object.entries(data)) {
        // console.log(`CONSTRUCTOR DATA setting ${name} to`, value);
          this[name] = value;
      }
    }

    // execute functions defined in initial state
    const stateName = state.current;
    const stateFunctions = ensureArray(state[stateName].run);

    for (const functionName of stateFunctions) {
      if(functionName in this === false) throw new Error(`Initialize: Class ${specification.constructor.name} has no function named ${functionName}`)
      stateConstraint(stateConstraints, functionName);
      this[functionName]();
    }
  }






}



export class Primitive {
  name = null;
  #value = null;

  constraints = [];

  constructor(name, value) {
    this.name = name;
    this.#value = value;
  }

  constrain(data, initialization) {
    if(initialization) return;
    this.constraints.forEach(({ test, message }) => {
      const verdict = test(data, this.#value);
      if (verdict?.error) {
        throw new Error(`🍔 constraint error: ${message} - ${verdict.error} (attempted to set ${this.name} to ${data})`);
      }
    });
  }

  // Getter And Setter

  get value() {
    return this.#value;
  }

  set value(data) {
    if (this.#value == data) return;
    this.constrain(data);
    const previousValue = this.#value;
    // if(data !== undefined) console.log(`Setting ${this.name} to "${data}" was: `, this.#value);
    if(data !== undefined) this.notify(`${this.name}.before`, this.#value, previousValue);
    this.#value = data;
    if(data !== undefined) this.notify(this.name, this.#value, previousValue);

  }


  // Install Observer Functionality

  #observers = {};
  observe(eventName, observerCallback, configuration) {
    const defaults = { autorun: true };
    const options = Object.assign(defaults, configuration);

    if (typeof observerCallback !== "function") throw new TypeError("observer must be a function.");
    if (!Array.isArray(this.#observers[eventName])) this.#observers[eventName] = []; // If there isn't an observers array for this key yet, create it
    this.#observers[eventName].push(observerCallback);
    // console.log(`this.#observers.${eventName}`, this.#observers[eventName]);
    if (options.autorun && this.#value !== undefined) observerCallback(this.#value);
    return () => {
      console.log(`UNOBSERVING ${eventName}`);
      this.unobserve(eventName, observerCallback);
    };
  }
  unobserve(eventName, observerCallback) {
    this.#observers[eventName] = this.#observers[eventName].filter((obs) => obs !== observerCallback);
  }

  notify(eventName, eventData, ...extra) {
    if (Array.isArray(this.#observers[eventName])){
      // console.log(`Event ${eventName} has ${this.#observers[eventName].length} observer(s)`);
      this.#observers[eventName].forEach((observerCallback) => observerCallback(eventData, ...extra));
    }else{
      // console.log(`${eventName} has no observers`);
    }
  }
  status(){

    return {
      observerCount: Object.values(this.#observers).flat().length,
    }
  }
}

export class List {
  name = null;
  #value = [];

  constraints = [];

  constructor(name, value) {
    this.name = name;
    this.#value.push(...value);
    this.constrain();
  }

  constrain(data, initialization) {
    if(initialization) return;
    for (const data of this.#value) {
      this.constraints.forEach(({ test, message }) => {
        const verdict = test(data, this.#value);
        if (verdict?.error) {
          throw new Error(`🍔 constraint error: ${message} - ${verdict.error} (attempted to set ${this.name} to ${data})`);
        }
      });
    }
  }


  get value() {
    return this; // NOTE: returning PropertyList as it is the array that wraps the simple array
  }




  // Install Observer Functionality

  #observers = {};
  observe(eventName, observerCallback, configuration) {
    const defaults = {initialize:false, autorun: true, replay: false};
    const options = Object.assign(defaults, configuration);

    if (typeof observerCallback !== "function") throw new TypeError("observer must be a function.");
    if (!Array.isArray(this.#observers[eventName])) this.#observers[eventName] = []; // If there isn't an observers array for this key yet, create it

    // AUTORUN LOGIC
    const pureEvent = eventName == this.name;
    if( pureEvent ){ // will not spew for xxx.created or xxx.deleted just xxx
      if(options.autorun){
        for (const item of this.#value) { observerCallback(item) }
      }
    }

    // REPLAY, applies to all events (autorun only applies to non-dot events)
    // if .created needs a feed to initialize
    if( options.initialize ){
        observerCallback(this.#value)
    }

    if( options.replay ){
      for (const item of this.#value) { observerCallback(item) }
    }

    this.#observers[eventName].push(observerCallback);

    return () => {
      this.unobserve(eventName, observerCallback);
    };
  }

  unobserve(eventName, observerCallback) {
    this.#observers[eventName] = this.#observers[eventName].filter((obs) => obs !== observerCallback);
  }

  notify(eventName, eventData, ...extra) {

    if(this.#observers[eventName]){
      console.log(`GGG We have ${this.#observers[eventName].length} for ${this.name}.${eventName}`)
    }else{
      console.log(`GGG We have NO OBSERVERS for ${this.name}.${eventName}`)

    }

    if (Array.isArray(this.#observers[eventName])){
      for (const observerCallback of this.#observers[eventName]) {
        observerCallback(eventData, ...extra)
      }
    }
  }

  status(){
    return {
      observerCount: Object.values(this.#observers).flat().length,
    };
  }




  // Data Editing Functions

  create(...items) {

    for(const item of items) {
      this.constrain(item);
      // if(!((Container.prototype.isPrototypeOf(item)) || (Control.prototype.isPrototypeOf(item)))) throw new Error(`Must be a Container or Control.`);
      this.#value.push(item);
      this.notify("created", item);
      this.notify("changed", this.#value);
    }
  }

  remove(input){
    let id;
    if(typeof input === 'string'){
      id = input;
    }else{
      if(!input.id) throw new Error('Only stingId and onbect with an id property is supported');
      id = input.id;
    }
    const item = this.#value.find(o => o.id === id);
    this.#value = this.#value.filter(o => o !== item);
    console.log(`LLL Notify removeal of ${item?.id}`);
    this.notify("removed", item);
    this.notify("changed", this.#value);
  }


  // Data Reading Functions



  	[Symbol.iterator]() {
  		return this.#value[Symbol.iterator]();
  	}
  	find(callback) {
  		if(typeof callback !== "function") throw new TypeError("Needs a function.");
  		return this.#value.find(callback);
  	}
  	get(id) {
  		return this.#value.find(o=>o.id===id);
  	}
  	map(callback) {
  		if(typeof callback !== "function") throw new TypeError("Needs a function.");
  		return this.#value.map(callback);
  	}
  	reduce(callback, initialValue) {
  		if(typeof callback !== "function") throw new TypeError("Needs a function.");
  		return this.#value.reduce(callback, initialValue);
  	}
  	filter(callback) {
  		if(typeof callback !== "function") throw new TypeError("Needs a function.");
  		return this.#value.filter(callback);
  	}
  	forEach(callback) {
  		if(typeof callback !== "function") throw new TypeError("Needs a function.");
  		return this.#value.forEach(callback);
  	}
  	indexOf(item) {
  		return this.#value.indexOf(item);
  	}
  	slice(...argv) {
  		return this.#value.slice(...argv);
  	}

  	get length(){
  		return this.#value.length
  	}
  	get raw(){
  		return this.#value;
  	}


}
