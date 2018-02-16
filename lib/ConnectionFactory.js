
const GPIOConnection = require('./GPIOConnection');
const ProcessConnection = require('./ProcessConnection')

module.exports = class ConnectionFactory {
	static createConnection(connection) {
		let type = connection.type;
		let properties  = connection.properties;

		switch(type) {
			case 'GPIO':
				let numero = properties.numero;
				let way = properties.way;

				if(numero !== undefined && way !== undefined) { 
					return new GPIOConnection(numero, way);
				}
				else {
					throw ConnectionException(connection);
				}
				break;
			case 'PROCESS':
				let launcher = properties.launcher
				let path = properties.path
				let script = properties.script

				if(launcher !== undefined || (path !== undefined && script != undefined)) {
					return new ProcessConnection(launcher, path, script)
				}
				else {
					throw ConnectionException(connection)
				}
				break
			default:
				return undefined;
		}
	}
}