const fs = require('fs');

module.exports = class Tools {
	static readDir(path, options) {
		return fs.readdirSync(path, options);
	}

	static loadJsonFile(path) {
		return JSON.parse(fs.readFileSync(path, 'utf8'));
	}

	static readJsonFile(file) {
		return JSON.parse(file);
	}

	static getStringEnum(e, name) {
		for(var [key, value] of Object.entries(e)) {
			if(value === name) {
				return key;
			}
		}
		return name;
	}

	static buildHeaderJson(response, status) {
		response.set("Content-Type", "application/json");
		response.set(status);
		return response;
	}

	static buildResponseBody(data) {
		return JSON.stringify(data);
	}
}