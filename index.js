const https = require('https');
const fs = require('fs');
const dotenv = require('dotenv');
const app = require('./server/express')();
const SSL = {
	key: fs.readFileSync('./server/ssl/dev.key'),
	cert: fs.readFileSync('./server/ssl/dev.pem')
};

dotenv.load({
	path: '.env',
});

const { env } = process;
const appConfig = Object.assign({}, {
	SERVER_HOST: env.SERVER_HOST,
	SERVER_PORT: env.SERVER_PORT,
	SERVER_LATENCY: env.SERVER_LATENCY,
	SERVER_LATENCY_MIN: env.SERVER_LATENCY_MIN,
	SERVER_LATENCY_MAX: env.SERVER_LATENCY_MAX,
	REFRESH_TOKEN_COOKIE_MAX_AGE: env.REFRESH_TOKEN_COOKIE_MAX_AGE,
	SECRET_STATUS_EXPIRATION: env.SECRET_STATUS_EXPIRATION,
	TOKEN_DEFAULT_AUDIENCE: env.TOKEN_DEFAULT_AUDIENCE,
	TOKEN_DEFAULT_ISSUER: env.TOKEN_DEFAULT_ISSUER,
	ACCESS_SECRET: env.ACCESS_SECRET,
	REFRESH_SECRET: env.REFRESH_SECRET,
	DB_HOST: env.DB_HOST,
	DB_PASSWORD: env.DB_PASSWORD,
	DB_URI: env.DB_URI,
	AWS_CLIENT_ID: env.AWS_CLIENT_ID,
	AWS_SECRET_KEY: env.AWS_SECRET_KEY,
});

const Server = https.createServer(SSL, app);
Server.listen(appConfig.SERVER_PORT, () => {
	console.log(`The application is running at ${appConfig.SERVER_HOST}${appConfig.SERVER_PORT} and the environment is currently
		${env.NODE_ENV}
	`);
});

global.config = appConfig;
