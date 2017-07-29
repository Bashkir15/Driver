const express = require('express');
const shrinkRay = require('shrink-ray');
const uuid = require('uuid');
const parameterProtection = require('hpp');
const helmet = require('helmet');
const PrettyError = require('pretty-error');
const createLocaleMiddleware = require('express-locale');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const getRoot = require('app-root-dir').get;
const path = require('path');
const env = process.env.NODE_ENV;

const pretty = new PrettyError();

//pretty.skipNodeFiles();
//pretty.skipPackage('express');

module.exports = () => {
	const ROOT = getRoot();
	const app = express();
    const enableCSP = env === 'production' ? true : false;

	/* if moving to SSR, we will need to attach a unique "nonce" to every response. This allows us to declare
	   inline scripts as being safe for execution against our content security policy.
	   https://helmetjs.github.io/docs/csp/

	   app.use((request, response, next) => {
			response.locals.nonce = uuid();
			next();
	   })

	app.use((error, request, response, next) => {
		console.log(pretty.render(error));
		next();
	}); */

	// Don't expose any software information to haxors.
	app.disable('x-powered-by');
	app.use(parameterProtection());

	const cspConfig = enableCSP ? {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: [
				"'self'",
				(request, response) => {
					// Required for eval-source-maps devtool in webpack
					process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''
				}
			].filter(value => value !== ''),
			styleSrc: ["'self'", "'unsafe-inline'", "blob:"],
			imgSrc: ["'self'", "data:"],
			fontSrc: ["'self'", "data:"],

			// Unfortunately setting this to stricter than * breaks the service worker :c
			// I will need to figure out how to get around this, so if you know of a safer
			// implementation that is kinder to service workers please let me know.
			// ["'self'", 'ws: '],
			connectSrc: ["*"],
			childSrc: ["'self'"]
		}
	} : null;

	if (cspConfig) {
		app.use(helmet.contentSecurityPolicy(cspConfig));
	}

	// prevent XSS, clickjacking attacking, IE doing dumb things with executing download, and sniffing Mimetype
	// middleware
	app.use(helmet.xssFilter());
	app.use(helmet.frameguard('deny'));
	app.use(helmet.ieNoOpen());
	app.use(helmet.noSniff());

	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	// dev compression
	app.use(shrinkRay());
	

	const BuildPath = path.join(ROOT, 'build');
	const TemplatePath = env === 'development' || null
		? `${BuildPath}/dev/index.html`
		: `${BuildPath}/prod/index.html`

	app.set('port_https', process.env.SERVER_PORT);
	app.use(express.static(`${BuildPath}/dev`));
	app.use(express.static(`${BuildPath}/prod`));
	app.use('*', (req, res) => {
		if (req.secure) {
			res.sendFile(path.join(ROOT, TemplatePath));
		}
		res.redirect(`https://${req.hostname}:${app.get('port_https')}`);
	});

	return app;

}

