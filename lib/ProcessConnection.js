'use strict'

const Connection = require('./AbstractConnection')
const child_process = require('child_process')
const path = require('path')

module.exports = class ProcessConnection extends Connection {
	constructor(launcher, absolutePath, script) {
		super()
		this.launcher = launcher
		this.absolutePath = absolutePath
		this.script = script
		this.process = ''
	}

	spawn(args) {
		this.process = child_process.spawn(this.launcher, [path.join(this.absolutePath, this.script), args])
	}

	exec(args) {
		let cmd = this.launcher + " " + path.join(this.absolutePath, this.script) + " "
		this.process = child_process.exec(cmd, args)
	}

	kill() {
		this.process.kill()
		this.process = null
	}

}
