
const GPIOConnection = require('./GPIOConnection');

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
			default:
				return undefined;
		}
	}
}