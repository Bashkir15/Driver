const fs = require('fs');
const { resolve } = require('path');
const getRoot = require('app-root-dir').get;

function clean(dirPath) {
	let files;
	return new Promise((resolve, reject) => {
		try {
			files = fs.readdirSync(dirPath);
		} catch (e) {
			console.log(`Skipping clean. There was no directory found at: ${dirPath}`);
		}

		if (files && files.length > 0) {
			for (file of files) {
				const filePath = `${dirPath}/${file}`;
				if (fs.statSync(filePath).isFile()) {
					fs.unlinkSync(filePath);
				} else {
					rmDir(filePath);
				}
			}
			fs.rmdirSync(dirPath);
		}
		resolve();
	});
}

function cleanAll() {
	const ROOT = getRot();
	const devClean = clean(resolve(ROOT, 'build/dev'));
	const prodClean = clean(resolve(ROOT, 'build/prod'));
	return Promise.all([devClean, prodClean]);
}

module.exports = {
	clean,
	cleanAll,
};

