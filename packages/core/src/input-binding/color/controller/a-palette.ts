import {ValueController} from '../../../common/controller/value.js';
import {Value, ValueChangeOptions} from '../../../common/model/value.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {getHorizontalStepKeys, getStepForKey} from '../../../common/ui.js';
import {
	PointerData,
	PointerHandler,
	PointerHandlerEvents,
} from '../../../common/view/pointer-handler.js';
import {IntColor} from '../model/int-color.js';
import {getKeyScaleForColor} from '../util.js';
import {APaletteView} from '../view/a-palette.js';

interface Config {
	value: Value<IntColor>;
	viewProps: ViewProps;
}

/**
 * @hidden
 */
export class APaletteController
	implements ValueController<IntColor, APaletteView>
{
	public readonly value: Value<IntColor>;
	public readonly view: APaletteView;
	public readonly viewProps: ViewProps;
	private readonly ptHandler_: PointerHandler;

	constructor(doc: Document, config: Config) {
		this.onKeyDown_ = this.onKeyDown_.bind(this);
		this.onKeyUp_ = this.onKeyUp_.bind(this);
		this.onPointerDown_ = this.onPointerDown_.bind(this);
		this.onPointerMove_ = this.onPointerMove_.bind(this);
		this.onPointerUp_ = this.onPointerUp_.bind(this);

		this.value = config.value;
		this.viewProps = config.viewProps;

		this.view = new APaletteView(doc, {
			value: this.value,
			viewProps: this.viewProps,
		});

		this.ptHandler_ = new PointerHandler(this.view.element);
		this.ptHandler_.emitter.on('down', this.onPointerDown_);
		this.ptHandler_.emitter.on('move', this.onPointerMove_);
		this.ptHandler_.emitter.on('up', this.onPointerUp_);

		this.view.element.addEventListener('keydown', this.onKeyDown_);
		this.view.element.addEventListener('keyup', this.onKeyUp_);
	}

	private handlePointerEvent_(d: PointerData, opts: ValueChangeOptions): void {
		if (!d.point) {
			return;
		}

		const alpha = d.point.x / d.bounds.width;

		const c = this.value.rawValue;
		const [h, s, v] = c.getComponents('hsv');
		this.value.setRawValue(new IntColor([h, s, v, alpha], 'hsv'), opts);
	}

	private onPointerDown_(ev: PointerHandlerEvents['down']): void {
		this.handlePointerEvent_(ev.data, {
			forceEmit: false,
			last: false,
		});
	}

	private onPointerMove_(ev: PointerHandlerEvents['move']): void {
		this.handlePointerEvent_(ev.data, {
			forceEmit: false,
			last: false,
		});
	}

	private onPointerUp_(ev: PointerHandlerEvents['up']): void {
		this.handlePointerEvent_(ev.data, {
			forceEmit: true,
			last: true,
		});
	}

	private onKeyDown_(ev: KeyboardEvent): void {
		const step = getStepForKey(
			getKeyScaleForColor(true),
			getHorizontalStepKeys(ev),
		);
		if (step === 0) {
			return;
		}

		const c = this.value.rawValue;
		const [h, s, v, a] = c.getComponents('hsv');
		this.value.setRawValue(new IntColor([h, s, v, a + step], 'hsv'), {
			forceEmit: false,
			last: false,
		});
	}

	private onKeyUp_(ev: KeyboardEvent): void {
		const step = getStepForKey(
			getKeyScaleForColor(true),
			getHorizontalStepKeys(ev),
		);
		if (step === 0) {
			return;
		}

		this.value.setRawValue(this.value.rawValue, {
			forceEmit: true,
			last: true,
		});
	}
}
