'use strict'

const Connection = require('./AbstractConnection');
const GPIO = require('onoff').Gpio;

const WAY = {
	IN: 'in',
	OUT: 'out'
};

module.exports = class GPIOConnection extends Connection {
	constructor(numero, way) {
		super();
		this.type = "GPIO";
		this.numero = numero;
		this.way = way;

		if(!global.MODE_DEV) {
			this.pin = new GPIO(numero, WAY[way]);
		}
	}

	off() {
		this.pin.writeSync(0);
	}

	on() {
		this.pin.writeSync(1);
	}

	release() {
		this.pin.off();
		this.pin.unexport();
	}
}
