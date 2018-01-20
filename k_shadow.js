'use strict'

const fs = require('fs');
const path = require('path');
const Tools = require('./lib/Tools');
const LOG = require('./lib/LOG');
const Device = require('./lib/Device');
const DeviceFactory = require('./lib/DeviceFactory');
const Door = require('./lib/Door');
const DeviceNotFoundException = require('./lib/CustomException').DeviceNotFoundException;

const server = require('express')();
const bodyParser = require('body-parser');

(function initBodyParser() {
	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({extended: true}));
}());


// App config
let config = Tools.loadJsonFile('config.json');


// MODE DEV // 
global.MODE_DEV = process.argv.find(arg => arg === "MODE_DEV");


// SERVER // 
function sendResponseStatus(res, status, body) {
	res.removeHeader('x-powered-by');
	res = Tools.buildHeaderJson(res, status);
	res.json(body);
	res.end();
}

function sendResponse(res, body) {
	sendResponseStatus(res, 200, body);
}

function sendError(res, msg) {
	let errorMsg = {
		"message": msg
	};
	sendResponseStatus(res, 404, msg);

	LOG.server(msg);
}

// Door manager
server.get('/door', (request, response) => {
	execDeviceOrDetail("Door", request.body.action, response, sendResponse, sendError);
})
.post('/door', (req, res) => {
	execDeviceOrDetail("Door", req.body.action, res, sendResponse, sendError);	
});

// 404
(function error404() {
	server.use((req, res, next) => {
		res.setHeader('Content-Type', 'text/plain');
		res.status(404).send('Page introuvable');
	});
}());


server.listen(config.port, config.host, () => 
	LOG.log(LOG.LEVEL.INFO, `Server running at http://${config.host}:${config.port}`));



// Loading all device from json files
const devices = [];
let devicesPath = 'devices/';
Tools.readDir(devicesPath) // Read all devices into directory 
	.filter(f => path.extname(f).match(/json/)) // Filter json files
	.forEach(f => devices.push(
		DeviceFactory.createNewDevice( 
			Tools.loadJsonFile(path.resolve(devicesPath + f)))
		)
	);

// Return the device
function getDevice(name) {
	let device = devices.find(d => name === d.name);
	if(device === undefined) {
		throw new DeviceNotFoundException(name);
	}
	else {
		return device;
	}
}

// Door manager functions
function execDeviceOrDetail(name, action, res, next, error) {
	try {
		let theDevice = getDevice(name);

		if(theDevice !== undefined) {
			if(action !== undefined) {
				LOG.client(`execute action ${action} on [Door]...`);

				let executed = theDevice.exec(action);
				next(res, executed);

				LOG.server(executed);
			}
			else {
				LOG.client(`Client ask for [Door] details...`);
				LOG.server(`Sending [Door] details...`);
				next(res, theDevice.toString());
			}
		}
		else {
			error(res, "Any [Door] find in configured [Devices]");
		}
	} catch(e) { // DeviceNotFoundException
		error(res, e.message);
	}
}
