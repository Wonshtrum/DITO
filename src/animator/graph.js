'use strict';


const Parameter = {
	loop(parameter, max) {
		return state => {
			state[parameter] = parameter in state ? (state[parameter]+1)%max : 1;
		};
	},
	set(parameter, value) {
		return state => {
			state[parameter] = value;
		};
	},
	once(parameter, max) {
		return state => {
			state[parameter] = parameter in state ? state[parameter]+1 : 1;
			if (state[parameter] >= max) {
				state[parameter] = max-1;
			}
		};		
	},
	decrease(parameter) {
		return state => {
			state[parameter] = parameter in state ? state[parameter]-1 : 0;
			if (state[parameter] < 0) {
				state[parameter] = 0;
			}
		};
	},
	generate(name) {
		let args = ["param", "arg0", "arg1", "arg2"];
		for (let i = 0 ; i < arguments.length-1 ; i++) {
			arguments[i] = arguments[i+1];
		}
		delete arguments[arguments.length];
		let f = this[name](...arguments);
		for (let i = 0 ; i < arguments.length ; i++) {
			f[args[i]] = arguments[i];
		}
		f.type = name;
		return f;
	}
};

function animate(parameter, frames, updates) {
	updates = updates === undefined ? [Parameter.generate("loop", parameter, frames.length)] : updates;
	return new Switch(parameter, frames.map(frame => new Leaf(frame, updates.copy())));
};

class Leaf {
	constructor(frame, updates = []) {
		this.frame = frame;
		this.updates = updates;
	}
	addUpdate(update) {
		this.updates.push(update);
	}
	visit(state) {
		for (let update of this.updates) {
			update(state);
		}
		return this.frame;
	}
};

class Switch {
	constructor(parameter, branches, fallback = 0, updates = []) {
		this.parameter = parameter;
		this.branches = branches;
		this.fallback = fallback;
		this.updates = updates;
	}
	addBranch(key, branch) {
		this.branches[key] = branch;
	}
	addUpdate(update) {
		this.updates.push(update);
	}
	map(func) {
		this.branches.map((branch, i) => func(branch, i));
	}
	mapLeaves(func) {
		this.branches.map((branch, i) => { if(branch instanceof Leaf) { func(branch, i); } });
	}
	visit(state) {
		for (let update of this.updates) {
			update(state);
		}
		let key = this.parameter in state && state[this.parameter] in this.branches ? state[this.parameter] : this.fallback;
		return this.branches[key].visit(state);
	}
};