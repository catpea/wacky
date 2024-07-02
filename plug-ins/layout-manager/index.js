/* README

  parent has a layout manager associated with it
	layout managers are needed to allow HBox and VBox calculations
  component addition triggers registration/addition and from there it is all reactive.
  Component's setBounds called: and component is positioned

	VBox Layout manager, ultimatley wants to correctly set its own .h,
	it is civen all the children for that purpose, and it will use the H of the children.

	A child either has a pre-set height as the case is with controls,
	or a height that may change as the case it with parents that may receive more children.

	BUT THEY MANAGE THEIR OWN HEIGHT,
	NEVER CHANGE THE HEIGHT OF A CHILD,
	just set their x and y in relation to the H of other children
	and then set your own H.

*/



const BOTH_SIDES = 2

export class Layout {

	parent;
	source;

	constructor(parent, {source} = {source: 'children'}){
		this.parent = parent;
		this.source = source;
	}

	manage(child) {
		// called whn a child is added
		console.log('TODO: layout manage child');
	}
	forget(child) {
		// called whn a child is added
		console.log('TODO: layout forget child');
	}

	calculateChildW() {
		// NOTE: this width is the widh of litte UI inside a node
		// to calculate the width of a child, you need to look at the space the parent has
		return 320 * Math.random();
	}
	calculateH() {
		//NOTE: this height is the height of a litte UI component inside the node UI
		// often a child will set its own height, but look at the area parent has and number of children in HBox case
		return 200 * Math.random();
	}
	calculateChildX(parent, child) {
		// NOTE: this x is not the x of the visual programming node, this x is that of nested UI components within it
		// x is relative to the parent x
		return 800 * Math.random();
	}
	calculateChildY(parent, child) {
		// NOTE: this y is not the y of the visual programming node, this y is that of nested UI components within it
		return 600 * Math.random();
	}

	above(parent, child, f=x=>true) {
		 return parent[this.source].filter(o=>f(o)).slice(0, parent[this.source].filter(o=>f(o)).indexOf(child));
	}

	#cleanup = [];
	cleanup(...arg){ this.#cleanup.push(...arg); }

}

export class VerticalLayout extends Layout {



	manage(child) {

		// you are the layout manager for this.component
		// you have 2 DIFFERENT responsobilities
		// RESPOSIBILITY #1: set the x and y of children - THIS IS THE MAIN THING THAT LAYOUT MANAGERS DO!
		// RESPOSIBILITY #2: set the h of this parent to correctly contain the newly layed out children
		//                   set the w of this component...

		child.x = this.calculateChildX(child);
		child.y = this.calculateChildY(child);
		child.w = this.calculateChildW(child);

		// at the same time, be aware that parent will set your X/Y
		// so monotor it!
		this.parent.on('x', () => child.x = this.calculateChildX(child) );
		this.parent.on('y', () => child.y = this.calculateChildY(child) );
		this.parent.on('w', () => child.w = this.calculateChildW(child) );



		// child.properties.observe('H', () => this.parent.h = this.calculateH() );
		// this.parent.on('H', () => child.y = this.calculateChildY(child) );

		// when a child changes size update the parent height
		child.on('h', () => {
			// XXX; this.parent.h = this.calculateH()
		});

		// when parent changes size, this child needs to update its Y.
		this.parent.on('h', () => child.y = this.calculateChildY(child) );




		this.parent.on('h', () => {
			if(child.flexible) child.h = this.calculateGrowChildH(child);

		});









	}

	calculateChildW(child) {
		const response =
			this.parent.w -
			((this.parent.b + this.parent.p) * BOTH_SIDES) // REMOVE SPACE USED BY PARENT PADDING

		return response;
	}

	calculateH() {
		let heightOfChildren = 0;

		const children = this.parent[this.source];

		heightOfChildren = children.reduce((total, c) => total + (c.h), 0) +
				((this.parent.s * 2) * (children.length > 0 ? children.length - 1 : 0 /* not counting gap in last child as it does not have one*/ ))


		let response =
			this.parent.b +
			this.parent.p +
			heightOfChildren +
		  this.parent.p +
			this.parent.b;

	 		if(response < this.parent.H){
				response = this.parent.H; // hard height (min-height)
			}

		return response;
	}

	calculateChildX() {
		const response =
		  this.parent.x + // use my own x
			this.parent.b + // add border
			this.parent.p; // add padding
		return response; // that is the child x
	}

	calculateChildY(child) {
		const response =
			this.parent.y +
			this.parent.b +
			this.parent.p +
			this.above(this.parent, child).reduce((total, child) => total + child.h, 0) +
			((this.parent.s * 2) * this.above(this.parent, child).length);

		return response;
	}

	calculateGrowChildH(flexibleChild){

		let response = flexibleChild.h;

		// if (flexibleChild.oo.name === 'Viewport') console.log();

		const onlyChild = this.parent.children.length === 1;

		if(onlyChild){
			return this.parent.h;
		}


		const children = this.parent.children.filter(c=>c!==flexibleChild);
		const childrenHeight = children.reduce((total, c) => total + (c.h), 0);

		const childrenHeightGaps = (this.parent.s * 1) * this.parent.children.length;
		// let childrenHeightGaps = ((this.parent.s * 2) * (children.length > 0 ? children.length - 1 : 0  ))

	  const freeSpace = this.parent.h - childrenHeight - (this.parent.b*2) - (this.parent.p*2) - childrenHeightGaps;

		// console.table('flexibleChild.h', {
		// 	application:this.parent.getApplication().oo.name,
		// 	'application.h': this.parent.getApplication().h,
		// 	h:flexibleChild.h,
		// 	'this.parent.h': this.parent.h,
		// 	size: children.length,
		// 	freeSpace,
		// });



		if( children.length && freeSpace){
			return freeSpace;
		}

		return response;

	}
}

export class HorizontalLayout extends Layout {

	manage(child) {

		const children = this.parent[this.source];
		const childCount = children.length;
		const siblingCount = this.above(this.parent, child).length;

		child.x = this.calculateChildX(child);
		child.y = this.calculateChildY(child);
		child.w = this.calculateChildW(child)

		this.parent.on('x', () => child.x = this.calculateChildX(child) );
		this.parent.on('y', () => child.y = this.calculateChildY(child) );
		this.parent.on('h', () => child.y = this.calculateChildY(child) );

		this.parent.on('children.changed', list => list.forEach(child=>{
			child.w = this.calculateChildW(child);
			child.x = this.calculateChildX(child);
		}));

		this.parent.on('w', ()=>{
			child.w = this.calculateChildW(child);
			child.x = this.calculateChildX(child);
		});

		child.on('h', () => this.parent.h = this.calculateH() );

	}

	calculateChildX(child){
		const response =
			this.parent.x +
			this.parent.b +
			this.parent.p +
			this.above(this.parent, child).reduce((total, child) => total + child.w, 0) +
			((this.parent.s * 2) * this.above(this.parent, child).length);
			return response;
	}

	calculateChildW1(child){
		const children = this.parent[this.source];
		const childCount = children.length;
		const siblingCount = this.above(this.parent, child).length;
		let response = this.parent.w / childCount;
		return response;
	}

	calculateChildW(child){
		if(!(child.W===undefined)) return (child.W<1?this.parent.w*child.W:child.W);
		const children = this.parent[this.source];
		let softElements = children.filter(child=>child.W===undefined);
		let hardElements = children.filter(child=>!(child.W===undefined));
		let hardSpace = hardElements.reduce((total, child) => total + (child.W<1?this.parent.w*child.W:child.W), 0);

		let spacers = ((this.parent.s * 2) * (children.length > 0 ? children.length - 1 : 0  ))

		let availableSoftSpace = this.parent.w - hardSpace - spacers;
 		let softUnit = availableSoftSpace / (softElements.length||1);
		return softUnit;
	}

	calculateChildY(child){
		const response =
			this.parent.y +
			this.parent.b +
			this.parent.p;
		return response;
	}

	calculateH() {
		let heightOfChildren = 0;
		const children = this.parent[this.source];
		heightOfChildren = children.reduce((max, c) =>     c.h>max?c.h:max, 0) ;

		let response =
			this.parent.b +
			this.parent.p +
			heightOfChildren +
			this.parent.p +
			this.parent.b;
			if(response < this.parent.H) response = this.parent.H; // hard height (min-height)
		return response;
	}

}

export class ManualLayout extends Layout {

}

export class RelativeLayout extends Layout {

	children = new WeakMap();

	manage(child) {
		if(!child.node) throw	new Error('RelativeLayout requires that all children have a valid .node attached.');
		this.parent.on('x', () => child.x = this.calculateChildX(child) );
		this.parent.on('y', () => child.y = this.calculateChildY(child) );
		child.node.on('x', () => child.x = this.calculateChildX(child) );
		child.node.on('y', () => child.y = this.calculateChildY(child) );
	}

	calculateChildX(child){
		return this.parent.x + child.node.x;
	}
	calculateChildY(child){
		return this.parent.y + child.node.y;
	}

}

export class AnchorLayout extends Layout {

	manage(child) {

		child.x = this.calculateChildX(child);
		child.y = this.calculateChildY(child);

		this.parent.on('x', () => child.x = this.calculateChildX(child) );
		this.parent.on('y', () => child.y = this.calculateChildY(child) );
		this.parent.on('w', () => child.x = this.calculateChildX(child) );

		this.parent.on('h', () => child.y = this.calculateChildY(child) );

	}

	calculateChildX(child){
		if(!child.side){ // LEFT or 0 side
			return this.parent.x - child.r - child.s;
		}else{ // RIGHT or "1" side
			return this.parent.x + this.parent.w + child.r + child.s;
		}
		this.parent.b + this.parent.p
	}

	calculateChildY(child){
		const response =
			this.parent.y +
			this.parent.b +
			this.parent.p +
			child.r +
			this.above(this.parent, child).filter(o=>o.side==child.side).reduce((total, child) => total + child.h, 0) +
			((this.parent.s * 2) * this.above(this.parent, child).length);

		return response;
	}

}

export class SocketLayout extends Layout {

	manage(child) {

		child.x = this.calculateChildX(child);
		child.y = this.calculateChildY(child);

		this.parent.on('x', () => child.x = this.calculateChildX(child) );
		this.parent.on('y', () => child.y = this.calculateChildY(child) );
		this.parent.on('w', () => child.x = this.calculateChildX(child) );

		this.parent.on('h', () => child.y = this.calculateChildY(child) );

	}

	calculateChildX(child){
		if(!child.side){ // LEFT or 0 side
			return this.parent.x - child.r - child.s;
		}else{ // RIGHT or "1" side
			return this.parent.x + this.parent.w + child.r + child.s;
		}
		this.parent.b + this.parent.p
	}

	calculateChildY(child){
		const response =
			this.parent.y +
			this.parent.b +
			this.parent.p +
			child.r +
			this.above(this.parent, child, o=>o.side==child.side).reduce((total, child) => total + child.h, 0) +
			((this.parent.s * 2) * this.above(this.parent, child, o=>o.side==child.side).length);
		return response;
	}

}
