'use strict'

const ConnectionFactory = require('./ConnectionFactory');

module.exports = class Device {
	constructor(jsonBuffer) {
		this.name = "Unnamed";
		this.status = "NOS";
		this.actions = [];
		this.connection = undefined;

		if(jsonBuffer !== undefined) {
			this.name = jsonBuffer.name !== undefined ? jsonBuffer.name : this.name;
			this.status = jsonBuffer.status !== undefined ? jsonBuffer.status : this.status;
			this.connection = jsonBuffer.connection != undefined ? ConnectionFactory.createConnection(jsonBuffer.connection) : this.connection;
		}
	}

	toString() {
		return {
			"name": this.name,
			"status": this.status, 
			"actions": Object.keys(this.actions), 
			"connection": this.connection
		}
	}

	exec(actionName) {
		let actionExec = this.actions[actionName];
		return actionExec(this);
	}
}