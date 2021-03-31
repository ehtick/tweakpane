import {ViewProps} from '../../common/model/view-props';
import {Blade} from '../common/model/blade';
import {FolderController} from './controller/folder';

interface Config {
	blade: Blade;
	viewProps: ViewProps;

	expanded?: boolean;
	title?: string;
}

export class RootController extends FolderController {
	constructor(doc: Document, config: Config) {
		super(doc, {
			expanded: config.expanded,
			title: config.title || '',
			blade: config.blade,
			viewProps: config.viewProps,

			hidesTitle: config.title === undefined,
			viewName: 'rot',
		});
	}
}