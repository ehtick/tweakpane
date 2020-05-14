import {Formatter} from '../../formatter/formatter';
import {TypeUtil} from '../../misc/type-util';
import {Color} from '../../model/color';
import {Disposable} from '../../model/disposable';
import {InputValue} from '../../model/input-value';
import {Parser} from '../../parser/parser';
import {RgbTextInputView} from '../../view/input/rgb-text';
import {ControllerConfig} from '../controller';
import * as UiUtil from '../ui-util';
import {InputController} from './input';

interface Config extends ControllerConfig {
	formatter: Formatter<number>;
	parser: Parser<string, number>;
	value: InputValue<Color>;
}

const STEP = 1;

/**
 * @hidden
 */
export class RgbTextInputController implements InputController<Color> {
	public readonly disposable: Disposable;
	public readonly value: InputValue<Color>;
	public readonly view: RgbTextInputView;
	private parser_: Parser<string, number>;

	constructor(document: Document, config: Config) {
		this.onInputChange_ = this.onInputChange_.bind(this);
		this.onInputKeyDown_ = this.onInputKeyDown_.bind(this);

		this.parser_ = config.parser;
		this.value = config.value;

		this.disposable = config.disposable;
		this.view = new RgbTextInputView(document, {
			disposable: this.disposable,
			formatter: config.formatter,
			value: this.value,
		});
		this.view.inputElements.forEach((inputElem) => {
			inputElem.addEventListener('change', this.onInputChange_);
			inputElem.addEventListener('keydown', this.onInputKeyDown_);
		});
	}

	private findIndexOfInputElem_(inputElem: HTMLInputElement): number | null {
		const inputElems = this.view.inputElements;
		for (let i = 0; i < inputElems.length; i++) {
			if (inputElems[i] === inputElem) {
				return i;
			}
		}
		return null;
	}

	private updateComponent_(index: number, newValue: number): void {
		const comps = this.value.rawValue.getComponents('rgb');
		const newComps = comps.map((comp, i) => {
			return i === index ? newValue : comp;
		});
		this.value.rawValue = new Color(
			[newComps[0], newComps[1], newComps[2]],
			'rgb',
		);

		this.view.update();
	}

	private onInputChange_(e: Event): void {
		const inputElem: HTMLInputElement = TypeUtil.forceCast(e.currentTarget);

		const parsedValue = this.parser_(inputElem.value);
		if (TypeUtil.isEmpty(parsedValue)) {
			return;
		}
		const compIndex = this.findIndexOfInputElem_(inputElem);
		if (TypeUtil.isEmpty(compIndex)) {
			return;
		}
		this.updateComponent_(compIndex, parsedValue);
	}

	private onInputKeyDown_(e: KeyboardEvent): void {
		const step = UiUtil.getStepForKey(STEP, e);
		if (step === 0) {
			return;
		}

		const inputElem: HTMLInputElement = TypeUtil.forceCast(e.currentTarget);
		const parsedValue = this.parser_(inputElem.value);
		if (TypeUtil.isEmpty(parsedValue)) {
			return;
		}
		const compIndex = this.findIndexOfInputElem_(inputElem);
		if (TypeUtil.isEmpty(compIndex)) {
			return;
		}
		this.updateComponent_(compIndex, parsedValue + step);
	}
}
