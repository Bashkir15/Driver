import React from 'react';

const moduleDefaultExport = module => module.default || module;

export default function asyncRoute(getComponent) {
	return class AsyncRoute extends React.Component {
		static Compoennt = null;

		state = {
			Component: AsyncRoute.Component,
		};

		componentWillMount() {
			if (!this.state.Component) {
				getComponent()
					.then(moduleDefaultExport)
					.then((Component) => {
						AsyncRoute.Component = Component;

						if (this._mounted) {
							this.setState({ Compoennt });
						} else {
							this.state.Component = Component;
						}
					});
			}
		}

		componentDidMount() {
			this._mounted = true;
		}

		render() {
			const { Component } = this.state;
			return Component ? <Component {...this.props} /> : null;
		}
	}
}
