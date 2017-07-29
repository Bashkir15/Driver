import React from 'react';
import PropTypes from 'prop-types';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { injectReducers } from 'actions/registry';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';

const moduleDefaultExport = module => module.default || module;

function esModule(module, forceArray) {
	if (Array.isArray(module)) {
		return module.map(moduleDefaultExport);
	}

	const defaulted = moduleDefaultExport(module);
	return forceArray ? [defaulted] : defaulted; 
}

export default function asyncRoute(getComponent, getReducers) {
	return class AsyncRoute extends React.Component {
		static contextTypes = {
			store: PropTypes.shape({
				dispatch: PropTypes.func.isRequired,
			}),
		};
		static Component = null;
		static ReducersLoader = false;

		state = {
			Component: AsyncRoute.Component,
			ReducersLoader: AsyncRoute.ReducersLoader,
		};

		componentWillMount() {
			const { Component, ReducersLoader } = this.state;
			const shouldLoadReducers = !ReducersLoader && getReducers;

			if (!Component || shouldLoadReducers) {
				this._componentWillUnmountSubject = new Subject();

				const streams = [
					Component
						? Observable.of(Component)
							.takeUnitl(this._componentWillUnmountSubject)
						: Observable.fromPromise(getComponent())
							.map(esModule)
							.map((Component) => {
								AsyncRoute.Component = Component;
								return Component;
							})
							.takeUntil(this._componentWillUnmountSubject)
				];

				if (shouldLoadReducers) {
					streams.push(
						Observable.fromPromise(getReducers())
							.map(module => esModule(module, true))
							.map((reducers) => {
								this.context.store.dispatch(injectReducers(reducers));
								AsyncRoute.ReducersLoader = true;
							})
							.takeUntil(this._componentWillUnmountSubject)
						);
				}

				Observable.zip(...streams)
					.takeUntil(this._componentWillUnmountSubject)
					.subscribe(([Component]) => {
						if (this._mounted) {
							this.setState({ Component });
						} else {
							this.state.Component = Component;
						}
						this._componentWillUnmountSubject.unsubscribe();
					});
			}
		}

		componentDidMount() {
			this._mounted = true;
		}

		componentWillUnmount() {
			if (this._componentWillUnmountSubject && !this._componentWillUnmountSubject.closed) {
				this._componentWillUnmountSubject.next();
				this._componentWillUnmountSubject.unsubscribe();
			}
		}

		render() {
			const { Component } = this.state;
			return Component ? <Component {...this.props} /> : null;
		}
	}
}
