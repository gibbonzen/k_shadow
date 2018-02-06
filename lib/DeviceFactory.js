'use strict'

const LOG = require('./LOG')
const Door = require('./Door');
const Camera = require('./Camera');

module.exports = class DeviceFactory {
	static createNewDevice(buffer) {
		deviceFind(buffer.name)

		switch(buffer.type) {
			case "Door":
				return new Door(buffer);
			case "Camera": 

				return new Camera(buffer);
			default:
				return undefined;
		}
	}
}

function deviceFind(name) {
	LOG.server(`Device [${name}] find.`)
}