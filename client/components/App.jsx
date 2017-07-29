import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { RouteTransition } from 'react-router-transition';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import asyncRoute from './asyncRoute';

const HomePage = asyncRoute(() => import('./home/Home'));

class App extends React.Component {
	static propTypes = {
		isAuthenticated: PropTypes.bool.isRequired,
		permissions: PropTypes.arrayOf(PropTypes.String),
	};

	renderRoutes = (location) => {
		const { isAuthenticated } = this.props;
		if (!isAuthenticated || isAuthenticated === null) {
			return (
				<Switch key={location.key} location={location}>
					<Route exact path="/" component={HomePage} />
				</Switch>
			);
		} 
		return (
			<Switch key={location.key} location={location}>
				<Route exact path="/" component={HomePage} />
			</Switch>
		);
	};

	render() {
		return (
			<BrowserRouter>
				<section className="application-view">
					<Route render={({ location, history, match }) => {
						return (
							<RouteTransition
								pathname={location.pathname}
								atEnter={{ opacity: 0 }}
								atLeave={{ opacity: 0 }}
								atActive={{ opacity: 1 }}
							>
								{this.renderRoutes(location)}
							</RouteTransition>
						);
					}} />
				</section>
			</BrowserRouter>	
		);
	}
}

const mapStateToProps = (state) => {
	return {
		isAuthenticated: state.auth.isAuthenticated,
		permissions: state.auth.permissions,
	};
};

export default connect(mapStateToProps)(App);
