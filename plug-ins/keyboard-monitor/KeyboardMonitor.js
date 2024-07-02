import CuteEmitter from "/plug-ins/cute-emitter/CuteEmitter.js";
import chart from "./keyboard.json";

export default class KeyboardMonitor extends CuteEmitter {

	source;

	constructor(configuration) {

		super();

		const defaults = {
			source: globalThis.window,
		};
		const options = Object.assign({}, defaults, configuration)

		this.source = options.source;

    this.mount();
  }

  mount(){

		const self = this;

		this.keyDownListener = function(e){
			// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
			console.log(chart[e.key]);
			self.emit(chart[e.key], e)
		}

		console.log('BBB MONITOR UP');
		this.source.addEventListener('keydown', this.keyDownListener);
	}

	destroy() {
		this.handle.removeEventListener('keydown', this.keyDownListener);
	}


}
