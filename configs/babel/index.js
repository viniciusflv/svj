module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'entry',
				corejs: '2',
				targets: { node: 'current' },
			},
		],
		[
			'@babel/preset-react',
			{
				runtime: 'automatic',
			},
		],
		'@babel/preset-typescript',
	],
	plugins: [
		function () {
			return {
				visitor: {
					MetaProperty(path) {
						path.replaceWithSourceString('process');
					},
				},
			};
		},
	],
};
