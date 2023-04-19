import {bindFoldable, Foldable} from '../../../blade/common/model/foldable.js';
import {PopupController} from '../../../common/controller/popup.js';
import {TextController} from '../../../common/controller/text.js';
import {ValueController} from '../../../common/controller/value.js';
import {Formatter} from '../../../common/converter/formatter.js';
import {Parser} from '../../../common/converter/parser.js';
import {findNextTarget, supportsTouch} from '../../../common/dom-util.js';
import {Value} from '../../../common/model/value.js';
import {ValueMap} from '../../../common/model/value-map.js';
import {connectValues} from '../../../common/model/value-sync.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {PickerLayout} from '../../../common/params.js';
import {forceCast} from '../../../misc/type-util.js';
import {ColorType} from '../model/color-model.js';
import {IntColor} from '../model/int-color.js';
import {ColorView} from '../view/color.js';
import {ColorPickerController} from './color-picker.js';
import {ColorSwatchController} from './color-swatch.js';

interface Config {
	colorType: ColorType;
	expanded: boolean;
	formatter: Formatter<IntColor>;
	parser: Parser<IntColor>;
	pickerLayout: PickerLayout;
	supportsAlpha: boolean;
	value: Value<IntColor>;
	viewProps: ViewProps;
}

/**
 * @hidden
 */
export class ColorController implements ValueController<IntColor, ColorView> {
	public readonly value: Value<IntColor>;
	public readonly view: ColorView;
	public readonly viewProps: ViewProps;
	private readonly swatchC_: ColorSwatchController;
	private readonly textC_: TextController<IntColor>;
	private readonly pickerC_: ColorPickerController;
	private readonly popC_: PopupController | null;
	private readonly foldable_: Foldable;

	constructor(doc: Document, config: Config) {
		this.onButtonBlur_ = this.onButtonBlur_.bind(this);
		this.onButtonClick_ = this.onButtonClick_.bind(this);
		this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this);
		this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this);

		this.value = config.value;
		this.viewProps = config.viewProps;

		this.foldable_ = Foldable.create(config.expanded);

		this.swatchC_ = new ColorSwatchController(doc, {
			value: this.value,
			viewProps: this.viewProps,
		});
		const buttonElem = this.swatchC_.view.buttonElement;
		buttonElem.addEventListener('blur', this.onButtonBlur_);
		buttonElem.addEventListener('click', this.onButtonClick_);

		this.textC_ = new TextController(doc, {
			parser: config.parser,
			props: ValueMap.fromObject({
				formatter: config.formatter,
			}),
			value: this.value,
			viewProps: this.viewProps,
		});

		this.view = new ColorView(doc, {
			foldable: this.foldable_,
			pickerLayout: config.pickerLayout,
		});
		this.view.swatchElement.appendChild(this.swatchC_.view.element);
		this.view.textElement.appendChild(this.textC_.view.element);

		this.popC_ =
			config.pickerLayout === 'popup'
				? new PopupController(doc, {
						viewProps: this.viewProps,
				  })
				: null;

		const pickerC = new ColorPickerController(doc, {
			colorType: config.colorType,
			supportsAlpha: config.supportsAlpha,
			value: this.value,
			viewProps: this.viewProps,
		});
		pickerC.view.allFocusableElements.forEach((elem) => {
			elem.addEventListener('blur', this.onPopupChildBlur_);
			elem.addEventListener('keydown', this.onPopupChildKeydown_);
		});
		this.pickerC_ = pickerC;

		if (this.popC_) {
			this.view.element.appendChild(this.popC_.view.element);
			this.popC_.view.element.appendChild(pickerC.view.element);

			connectValues({
				primary: this.foldable_.value('expanded'),
				secondary: this.popC_.shows,
				forward: (p) => p,
				backward: (_, s) => s,
			});
		} else if (this.view.pickerElement) {
			this.view.pickerElement.appendChild(this.pickerC_.view.element);

			bindFoldable(this.foldable_, this.view.pickerElement);
		}
	}

	get textController(): TextController<IntColor> {
		return this.textC_;
	}

	private onButtonBlur_(e: FocusEvent) {
		if (!this.popC_) {
			return;
		}

		const elem = this.view.element;
		const nextTarget: HTMLElement | null = forceCast(e.relatedTarget);
		if (!nextTarget || !elem.contains(nextTarget)) {
			this.popC_.shows.rawValue = false;
		}
	}

	private onButtonClick_() {
		this.foldable_.set('expanded', !this.foldable_.get('expanded'));
		if (this.foldable_.get('expanded')) {
			this.pickerC_.view.allFocusableElements[0].focus();
		}
	}

	private onPopupChildBlur_(ev: FocusEvent): void {
		if (!this.popC_) {
			return;
		}

		const elem = this.popC_.view.element;
		const nextTarget = findNextTarget(ev);
		if (nextTarget && elem.contains(nextTarget)) {
			// Next target is in the picker
			return;
		}
		if (
			nextTarget &&
			nextTarget === this.swatchC_.view.buttonElement &&
			!supportsTouch(elem.ownerDocument)
		) {
			// Next target is the trigger button
			return;
		}

		this.popC_.shows.rawValue = false;
	}

	private onPopupChildKeydown_(ev: KeyboardEvent): void {
		if (this.popC_) {
			if (ev.key === 'Escape') {
				this.popC_.shows.rawValue = false;
			}
		} else if (this.view.pickerElement) {
			if (ev.key === 'Escape') {
				this.swatchC_.view.buttonElement.focus();
			}
		}
	}
}
