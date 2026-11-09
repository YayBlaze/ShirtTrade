module.exports = {
	apps: [
		{
			name: 'ShirtTrade',
			script: 'bun',
			args: 'build/index.js',
			interpreter: 'none',
			env: {
				PORT: 5310,
				HOST: '0.0.0.0'
			}
		}
	]
};
