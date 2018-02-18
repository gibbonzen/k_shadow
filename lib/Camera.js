'use strict'

const Device = require('./Device')
const EventEmitter = require('events').EventEmitter
const fs = require('fs')
const path = require('path')
const os = require('os')
const chokidar = require('chokidar')
const RaspiCam = require('raspicam')

const Status = {
	STOPPED: 0x00,
	STARTED: 0x01,

	_get: function(status) {
		return Status[Object.keys(Status).filter(k => "_get" !== k).find(k => k === status)]
	}
};

module.exports = class Camera extends Device {
	constructor(jsonBuffer) {
		super(jsonBuffer)
		this.status = Status._get(jsonBuffer.status)
		this.options = jsonBuffer.options
		this.actions = {
			"start": this.start,
			"stop": this.stop
		}

		this.camera = null
		this.fileWatcher = null
	}

	start(self) {
		if(Status.STARTED === self.status) {
			return "Camera is already started."
		}
		else {
			self._buildStreamArgs()
			self.camera.start()
			self.status = Status.STARTED
			self._watch()
			self.emit('start')
			return "Start the camera."
		}
	}

	stop(self) {
		if(Status.STOPPED === self.status) {
			return "Camera is already stopped."
		}
		else {
			self.camera.stop()
			self.status = Status.STOPPED
			self._unWatch()
			return "Stop the camera."
		}
	}

	_buildStreamArgs() {
		this.folder = this.options.directory
		this.image = this.options.filename
		let fullPath = path.join(this.folder, this.image)
		this.camera = new RaspiCam({
			mode: "timelapse",
			output: fullPath,
			encoding: "jpg",
			timelapse: this.options.timelapse,
			timeout: this.options.timeout,
			width: this.options.width,
			height: this.options.height,
			quality: this.options.quality,
			rotation: this.options.rotation

		})
	}

	_watch() {
		let fullPath = path.join(this.folder, this.image)
		this.camera.on("read", (err, timestamp, filename) => {
			fs.readFile(fullPath, (err, data) => {
				if(err) return
				this.emit("image", data)
			})
		})
	}

	_unWatch() {
		this.camera.stop()
		this.emit('close')
	}

	Status() {
		return Status
	}
}

