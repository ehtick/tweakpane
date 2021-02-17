import {assert} from 'chai';
import {describe, it} from 'mocha';

import {TestUtil} from '../../misc/test-util';
import {InputValue} from '../../model/input-value';
import {ViewModel} from '../../model/view-model';
import {SliderInputController} from './slider';

describe(SliderInputController.name, () => {
	it('should dispose', () => {
		const doc = TestUtil.createWindow().document;
		const c = new SliderInputController(doc, {
			baseStep: 1,
			value: new InputValue(0),
			viewModel: new ViewModel(),
		});
		c.viewModel.dispose();
		assert.strictEqual(c.viewModel.disposed, true);
	});
});
