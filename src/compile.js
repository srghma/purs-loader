'use strict';

const Promise = require('bluebird');

const spawn = require('cross-spawn');

const debug_ = require('debug');

const debug = debug_('purs-loader');

const debugVerbose = debug_('purs-loader:verbose');

const dargs = require('./dargs');

module.exports = function compile(psModule) {
  const options = psModule.options

  const compileCommand = options.psc || 'purs';

  const compileArgs = (options.psc ? [] : [ 'compile' ]).concat(dargs(Object.assign({
    _: options.src,
    output: options.output,
  }, options.pscArgs)))

  debug('compile %s %O', compileCommand, compileArgs)

  return new Promise((resolve, reject) => {
    debug('compiling PureScript...')

    const compilation = spawn(compileCommand, compileArgs)

    let stdout = ''
    let stderr = ''

    compilation.stdout.on('data', data => {
      stdout += data
    });

    compilation.stderr.on('data', data => {
      stderr += data
    });

    compilation.on('close', code => {
      debug('finished compiling PureScript.')

      process.stdout.write(stdout + '\n');
      process.stderr.write(stderr + '\n');

      if (code !== 0) {
        if (options.watch) {
          resolve(psModule);
        }
        else {
          reject(new Error('compilation failed'))
        }
      } else {
        resolve(psModule)
      }
    })
  });
};
