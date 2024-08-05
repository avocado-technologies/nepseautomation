var nconf = require('nconf');
var fs = require('fs');
nconf.argv().env().file({ file: './config.json' });
export function setCon(key, value) {
	nconf.set(key, value);
}
export function getCon(key) {
	return nconf.get(key);
}

export function save() {
	nconf.save();
}
