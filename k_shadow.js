'use strict'

const fs = require('fs')
const path = require('path')
const Tools = require('./lib/Tools')
const LOG = require('./lib/LOG')
const Device = require('./lib/Device')
const DeviceFactory = require('./lib/DeviceFactory')
const Door = require('./lib/Door')
const DeviceNotFoundException = require('./lib/CustomException').DeviceNotFoundException

const express = require('express')
const app = express()
const server = require('http').Server(app)
const bodyParser = require('body-parser')

const socket = require('socket.io')
const EventEmitter = require('events').EventEmitter

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// App config
let config = Tools.loadJsonFile('config.json')


// MODE DEV // 
global.MODE_DEV = process.argv.find(arg => arg === "MODE_DEV")

// -------------------------------------------
// Loading all device from json files
const devices = []
let devicesPath = './devices/'
Tools.readDir(devicesPath) // Read all devices into directory 
	.filter(f => path.extname(f).match(/json/)) // Filter json files
	.forEach(f => devices.push(
		DeviceFactory.createNewDevice( 
			Tools.loadJsonFile(path.resolve(devicesPath + f)))
		)
	)
// -------------------------------------------


// SERVER // 
function sendResponseStatus(res, status, body) {
	res.removeHeader('x-powered-by')
	res = Tools.buildHeaderJson(res, status)
	res.json(body)
	res.end()
}

function sendResponse(res, body) {
	sendResponseStatus(res, 200, body)
}

function sendError(res, msg) {
	let errorMsg = {
		"message": msg
	}
	sendResponseStatus(res, 404, msg)

	LOG.server(msg)
}

// -----------------------------------------------

// Door manager
app.get('/door', (request, response) => {
	execDeviceOrDetail("Door", request.body.action, response, sendResponse, sendError)
})
.post('/door', (req, res) => {
	execDeviceOrDetail("Door", req.body.action, res, sendResponse, sendError)	
})

// -----------------------------------------------
// Camera manager

const socketListener = new EventEmitter()
var camera = getDevice("Camera")

camera.on('start', () => {
	LOG.device(camera, 'Start streaming.')
	socketListener.emit('start')
})

camera.on('close', () => {
	LOG.device(camera, 'Stop streaming.')
	socketListener.emit('end')
})
camera.on('image', (strBuffer) => {
	//LOG.device(camera, 'New image send')
	socketListener.emit('newImage', strBuffer)
})

// route /camera return device details
app.get('/camera', (req, res) => {
	detailFor(camera, res)
})
// route /camera/stream
.get('/camera/stream', (req, res) => {
	// launch and send camera stream
	detailFor(camera, res)
})
.post('/camera/stream', (req, res) => {
	// start or stop the stream
	let currentStatus = camera.status

	let action = req.body.action
	executeFor(camera, action, res)

	if("stop" === action) {
		if(currentStatus === camera.Status().STARTED) {
			closeSocket()
		}
	}
})

// -----------------------------------------------

// 404
app.use((req, res, next) => {
	res.setHeader('Content-Type', 'text/plain')
	res.status(404).send('Page introuvable')
})

// -----------------------------------------------

server.listen(config.port, config.host, () => 
	LOG.log(LOG.LEVEL.INFO, `Server running at http://${config.host}:${config.port}`))

// -----------------------------------------------

const io = socket(server)
const streamNamespace = io.of('/stream')
LOG.server('Stream socket in waiting for connect user.')
streamNamespace.on('connect', (socket) => {
	LOG.server('New client connected in stream')

	socketListener.on('start', () => {
		socket.emit('streamStart')
	})	

	socketListener.on('newImage', (imgBuffer) => {
		socket.emit('newImage', imgBuffer)
	})

	socketListener.on('end', () => {
		closeSocket()
	})
})

function closeSocket() {
	if(streamNamespace.connected.length == 0) {
		LOG.server('Stream socket close.')
		io.emit('disconnect')
	}
}

// -----------------------------------------------


// Return the device
function getDevice(name) {
	let device = devices.find(d => name === d.name)
	if(device === undefined) {
		throw new DeviceNotFoundException(name)
	}
	else {
		return device
	}
}

// Door manager functions
function execDeviceOrDetail(name, action, res, next, error) {
	try {
		let theDevice = getDevice(name)

		if(theDevice !== undefined) {
			if(action !== undefined) {
				LOG.client(`execute action ${action} on [Door]...`)

				let executed = theDevice.exec(action)
				next(res, executed)

				LOG.server(executed)
			}
			else {
				LOG.client(`Client ask for [Door] details...`)
				LOG.server(`Sending [Door] details...`)
				next(res, theDevice.toString())
			}
		}
		else {
			error(res, "Any [Door] find in configured [Devices]")
		}
	} catch(e) { // DeviceNotFoundException
		error(res, e.message)
	}
}

function executeFor(device, action, response) {
	if(device === undefined || action === undefined) return

	LOG.client(`execute action ${action} on ${device.type}`)
	let executedAction = device.exec(action)
	sendResponse(response, device.toString())
	LOG.server(executedAction)
}

function detailFor(device, response) {
	if(device === undefined) return

	LOG.client(`detail for ${device.name}`)
	let detail = device.toString()
	sendResponse(response, detail)
	LOG.server(`Sending ${device.type} details...`)
}