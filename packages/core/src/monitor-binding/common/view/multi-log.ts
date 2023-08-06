import {Formatter} from '../../../common/converter/formatter.js';
import {BufferedValue} from '../../../common/model/buffered-value.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {ClassName} from '../../../common/view/class-name.js';
import {getCssVar} from '../../../common/view/css-vars.js';
import {View} from '../../../common/view/view.js';

interface Config<T> {
	formatter: Formatter<T>;
	rows: number;
	value: BufferedValue<T>;
	viewProps: ViewProps;
}

const cn = ClassName('mll');

/**
 * @hidden
 */
export class MultiLogView<T> implements View {
	public readonly element: HTMLElement;
	public readonly value: BufferedValue<T>;
	private readonly formatter_: Formatter<T>;
	private readonly textareaElem_: HTMLTextAreaElement;

	constructor(doc: Document, config: Config<T>) {
		this.onValueUpdate_ = this.onValueUpdate_.bind(this);

		this.formatter_ = config.formatter;

		this.element = doc.createElement('div');
		this.element.classList.add(cn());
		config.viewProps.bindClassModifiers(this.element);

		const textareaElem = doc.createElement('textarea');
		textareaElem.classList.add(cn('i'));
		textareaElem.style.height = `calc(var(${getCssVar(
			'containerUnitSize',
		)}) * ${config.rows})`;
		textareaElem.readOnly = true;
		config.viewProps.bindDisabled(textareaElem);
		this.element.appendChild(textareaElem);
		this.textareaElem_ = textareaElem;

		config.value.emitter.on('change', this.onValueUpdate_);
		this.value = config.value;

		this.update_();
	}

	private update_(): void {
		const elem = this.textareaElem_;
		const shouldScroll =
			elem.scrollTop === elem.scrollHeight - elem.clientHeight;

		const lines: string[] = [];
		this.value.rawValue.forEach((value) => {
			if (value !== undefined) {
				lines.push(this.formatter_(value));
			}
		});
		elem.textContent = lines.join('\n');

		if (shouldScroll) {
			elem.scrollTop = elem.scrollHeight;
		}
	}

	private onValueUpdate_(): void {
		this.update_();
	}
}
