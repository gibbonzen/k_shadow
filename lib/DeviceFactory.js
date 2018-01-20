'use strict'

const Door = require('./Door');
const Camera = require('./Camera');

module.exports = class DeviceFactory {
	static createNewDevice(buffer) {
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