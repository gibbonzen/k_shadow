'use strict'

const Connection = require('./AbstractConnection')
const child_process = require('child_process')
const path = require('path')

module.exports = class ProcessConnection extends Connection {
	constructor(launcher, absolutePath, script) {
		super()
		this.launcher = launcher
		this.absolutePath = absolutePath !== undefined ? absolutePath : ''
		this.script = script !== undefined ? script : ''
		this.process = ''
	}

	spawn(args) {
		if(this.launcher !== undefined && this.launcher !== '') {
			this.process = child_process.spawn(this.launcher, [path.resolve(path.join(this.absolutePath, this.script)), args])
		}
		else {
			this.launcher = path.resolve(path.join(this.absolutePath, this.script))
			this.process = child_process.spawn(this.launcher, args)
		}

		this.process.on('close', function (code){
			this.kill()
		})
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
