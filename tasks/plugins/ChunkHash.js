const { getHashDigest } = require('loader-utils');

const HASH_TYPE = 'sha256';
const DIGEST_TYPE = 'base62';
const DIGEST_LENGTH = 8;

function compareModules(left, right) {
    if (left.resource < right.resource) {
        return -1;
    }
    if (left.resource > right.resource) {
        return 1;
    }
    return 0;
}

function getModuleSource(module) {
    const source = module._source || {};
    return source._value || '';
}

function concatenateSource(result, moduleSource) {
    return result + moduleSource;
}

class ChunkHash {
    apply(compiler) {
        compiler.plugin('compilation', (compilation) => {
            return compilation.plugin('chunk-hash', (chunk, chunkHash) => {
                const source = chunk.mapModules(module => module)
                    .sort(compareModules)
                    .map(getModuleSource)
                    // Provide an initialValue because the source can contain
                    // empty modules : Ref - http://es5.github.io/#x15.4.4.21
                    .reduce(concatenateSource, '');
                const generatedHash = getHashDigest(source, HASH_TYPE, DIGEST_TYPE, DIGEST_LENGTH);

                chunkHash.digest = () => generatedHash;
            });
        });
    }
}

module.exports = ChunkHash;
