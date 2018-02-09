'use strict'

const EventEmitter = require('events')
const ConnectionFactory = require('./ConnectionFactory')

module.exports = class Device extends EventEmitter {
	constructor(jsonBuffer) {
		super()
		this.type = "Unknown"
		this.name = "Unnamed"
		this.status = "NOS"
		this.actions = []
		this.connection = undefined

		if(jsonBuffer !== undefined) {
			this.type = jsonBuffer.type !== undefined ? jsonBuffer.type : this.type
			this.name = jsonBuffer.name !== undefined ? jsonBuffer.name : this.name
			this.status = jsonBuffer.status !== undefined ? jsonBuffer.status : this.status
			this.connection = jsonBuffer.connection != undefined ? ConnectionFactory.createConnection(jsonBuffer.connection) : this.connection
		}
	}

	toString() {
		return {
			"name": this.name,
			"status": this.status, 
			"actions": Object.keys(this.actions)
		}
	}

	exec(actionName) {
		let actionExec = this.actions[actionName]
		return actionExec(this)
	}
}