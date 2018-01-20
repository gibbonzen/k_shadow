'use strict'

class CustomException {
	constructor() {
		this.name = "Exception";
		this.message = "";
	}
}

class DeviceNotFoundException extends CustomException {
	constructor(device) {
		super();
		this.name = "DeviceNotFoundException";
		this.message = `[${device}] is not a known device.`;
	}

	getMessage() {
		return this.message;
	}
}

class ConnectionException extends CustomException {
	constructor(connection) {
		super();
		this.name = "ConnectionException";
		this.message = `Connection ${connection.type} failed.`;
	}
}

module.exports = {
	DeviceNotFoundException: DeviceNotFoundException,
	ConnectionException: ConnectionException
}