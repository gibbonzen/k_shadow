'use strict'

const Device = require('./Device');
const ConnectionFactory = require('./ConnectionFactory');

const CameraStatus = {
	STOPPED: 0x00,
	STARTED: 0x01	
};

module.exports = class Camera extends Device {
	constructor(jsonBuffer) {
		super();
	}
}