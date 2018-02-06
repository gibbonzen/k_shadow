'use strict'

const Device = require('./Device')
const EventEmitter = require('events').EventEmitter
const fs = require('fs')
const path = require('path')
const os = require('os')

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
		this.actions = {
			"start": this.start,
			"stop": this.stop
		}

		this.fileWatcher = null
	}

	start(self) {
		if(Status.STARTED === self.status) {
			return "Camera is already started."
		}
		else {
			let args = self._buildStreamArgs()
			self.connection.spawn(args)
			self.status = Status.STARTED
			self._watch()
			return "start the camera."
		}
	}

	stop(self) {
		if(Status.STOPPED === self.status) {
			return "Camera is already stopped."
		}
		else {
			self.connection.kill()
			self.status = Status.STOPPED
			self._unWatch()
			return "stop the camera."
		}
	}

	_buildStreamArgs() {
		this.folder = os.tmpdir()
		this.image = 'stream.jpg'
		let width = 720
		let height = 640
		let timeout = 250
		let quality = 75
		let rotation = 0
		let fullPathToImg = path.resolve(path.join(this.folder, this.image))
		return `-o ${fullPathToImg} -w ${width} -h ${height} -t ${timeout} -q ${quality} -rot ${rotation}`
	}

	_watch() {
		this.folder = '/media/gibbon/Data/developpement/nodejs/stream/tmp/'
		this.image = 'image.jpg'

		this.fileWatcher = fs.watch(this.folder, (event, filename) => {
			if('change' === event && this.image === filename) {
				fs.readFile(path.join(this.folder, this.image), (err, data) => {
					if(err) return
					this.emit("image", data)
				})
			}
		})
	}

	_unWatch() {
		if(this.fileWatcher) {
			this.fileWatcher.close()
			this.fileWatcher = null

			this.emit('close')
		}
	}

	Status() {
		return Status
	}
}

