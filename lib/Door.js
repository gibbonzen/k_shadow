'use strict'

const Device = require('./Device');

const DoorStatus = {
	CLOSED: 0x00, CLOSING: 0x01,
	OPENED: 0x02, OPENING: 0X04
};

module.exports = class Door extends Device {
	constructor(jsonBuffer) {
		super(jsonBuffer);
		this.actions = {
			"open": this.open,
			"close": this.close
		};
	}

	open(self) {
		self.connection.on();
		return "open the door.";
	}
	close(self) {
		self.connection.off();
		return "close the door.";
	}
}
