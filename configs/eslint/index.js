module.exports = {
	env: {
		browser: true,
		node: true,
		es6: true,
	},
	extends: [
		'prettier',
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
			modules: true,
		},
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: ['prettier', 'react', '@typescript-eslint'],
	settings: {
		react: {
			version: 'detect',
		},
	},
	rules: {
		'prettier/prettier': ['warn'],
		'@typescript-eslint/sort-type-union-intersection-members': ['warn'],
		'@typescript-eslint/explicit-function-return-type': [
			'warn',
			{
				allowExpressions: true,
			},
		],
		'@typescript-eslint/consistent-type-imports': [
			'warn',
			{
				prefer: 'type-imports',
				disallowTypeAnnotations: true,
			},
		],
	},
	overrides: [
		{
			files: ['*'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/ban-ts-comment': 'off',
				'@typescript-eslint/camelcase': 'off',
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/explicit-module-boundary-types': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
				'react/react-in-jsx-scope': 'off',
				'react/prop-types': 'off',
				'react/display-name': 'off',
				noImplicitAny: 'off',
				'@typescript-eslint/no-unused-vars': [
					'error',
					{
						argsIgnorePattern: '^_',
						varsIgnorePattern: '^_',
						caughtErrorsIgnorePattern: '^_',
					},
				],
			},
		},
		{
			files: ['**/*.test.ts', '**/*.test.tsx', 'jest.*.js'],
			env: {
				jest: true,
			},
		},
	],
};
