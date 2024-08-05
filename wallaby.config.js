module.exports = (wallaby) => ({
	files: [ '*.js', 'src/**/*', 'test/**/*', '!test/**/*.test.js', '!config.json', '!src/data/*.json' ],

	tests: [ 'test/**/*.test.js' ],

	env: {
		type: 'node',
		runner: 'node'
	},

	testFramework: 'ava',

	setup: () => require('babel-polyfill'),

	compilers: {
		'**/*.js': wallaby.compilers.babel()
	}
});
