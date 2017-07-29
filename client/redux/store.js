import { createStore as _createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { createLogger } from 'redux-logger';
import baseReducers from './reducers';
// import baseEpics from './epics';
import Registry from './registry/registry';
import registryMiddleware from './registry/middleware';

export default function createStore(initialState = {}) {
	const registry = new Registry(baseReducers);
	const logger = createLogger({ collapsed: true });
	let finalCreateStore = applyMiddleware(registryMiddleware(registry), logger);

	if (window.REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
		finalCreateStore = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(finalCreateStore);
	}

	const store = finalCreateStore(_createStore)(
		registry.initialReducers,
		initialState
	);

	registry.store = store;
	return store;
}
