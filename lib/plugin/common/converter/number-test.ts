import {assert} from 'chai';
import {describe, it} from 'mocha';

import {
	createNumberFormatter,
	numberFromUnknown,
	numberToString,
	parseNumber,
} from './number';

describe('converter/number', () => {
	[
		{
			arg: 3.14,
			expected: 3.14,
		},
		{
			arg: '1.4141356',
			expected: 1.4141356,
		},
		{
			arg: 'foobar',
			expected: 0,
		},
		{
			arg: {foo: 'bar'},
			expected: 0,
		},
	].forEach((testCase) => {
		context(`when ${JSON.stringify(testCase.arg)}`, () => {
			it(`should convert to ${testCase.expected}`, () => {
				assert.strictEqual(numberFromUnknown(testCase.arg), testCase.expected);
			});
		});
	});

	[
		{
			expected: '0.00',
			params: {
				digits: 2,
				value: 0,
			},
		},
		{
			expected: '3',
			params: {
				digits: 0,
				value: 3.14,
			},
		},
		{
			expected: '141.41',
			params: {
				digits: 2,
				value: 141.41356,
			},
		},
	].forEach((testCase) => {
		context(`when ${JSON.stringify(testCase.params)}`, () => {
			it(`it should format to ${JSON.stringify(testCase.expected)}`, () => {
				const f = createNumberFormatter(testCase.params.digits);
				assert.strictEqual(f(testCase.params.value), testCase.expected);
			});
		});
	});

	[-10, 0, 20, 100, 1000].forEach((digits) => {
		context(`when ${digits}`, () => {
			it(`it should format without error`, () => {
				const f = createNumberFormatter(digits);
				assert.doesNotThrow(() => {
					f(Math.PI);
				});
			});
		});
	});

	it('should convert number to string', () => {
		assert.strictEqual(numberToString(3.14), '3.14');
	});
});

describe(parseNumber.name, () => {
	it('should parse number', () => {
		assert.strictEqual(parseNumber('3.14'), 3.14);
		assert.strictEqual(parseNumber('abc'), null);
		assert.strictEqual(parseNumber('1e-3'), 0.001);
	});
});