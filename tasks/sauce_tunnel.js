/*
 * ysb-grunt-sauce-tunnel
 * https://github.com/raghulraj/ysb-grunt-sauce-tunnel
 *
 * Licensed under the MIT license.
 */

'use strict';

(function () {
	var SauceTunnel = require('ysb-sauce-tunnel'),
	tunnels =  {};

	module.exports = function (grunt) {
		function configureLogEvents(tunnel) {
			var methods = ['write', 'writeln', 'error', 'ok', 'debug'];
			methods.forEach(function (method) {
				tunnel.on('log:' + method, function (text) {
					grunt.log[method](text);
				});
				tunnel.on('verbose:' + method, function (text) {
					grunt.verbose[method](text);
				});
			});
		}

		grunt.registerMultiTask('ysb_sauce_tunnel_stop', 'Stop the Sauce Labs tunnel', function () {
			// Merge task-specific and/or target-specific options with these defaults.
			var options = this.options({
				username: process.env.SAUCE_USERNAME,
				key: process.env.SAUCE_ACCESS_KEY
				});

			var done = null,
			tunnel = null;

			// try to find active tunnel
			tunnel = tunnels[options.identifier];

			if(!tunnel){
				tunnel = new SauceTunnel(
					options.username,
					options.key,
					options.identifier,
					false, // tunneled = true
					['-v']
				);
			}
			else
			{
				delete tunnels[options.identifier];
			}


			done = grunt.task.current.async();


			var finished = function(err){
				if(err){
					grunt.fail.warn(err);
				}
				if (done) {
					done();
					done = null;
				}

			};

			tunnel.stop(finished);

		});

		grunt.registerMultiTask('ysb_sauce_tunnel', 'Runs the Sauce Labs tunnel', function () {
			// Merge task-specific and/or target-specific options with these defaults.
			var options = this.options({
				username: process.env.SAUCE_USERNAME,
				key: process.env.SAUCE_ACCESS_KEY
			});

			var done = null,
				tunnel = null;

			var finished = function () {
				if (done) {
					done();
					done = null;
				}
			};

			function start(options) {
				if (tunnel) {
					stop();

					if (grunt.task.current.flags.stop) {
						finished();
						return;
					}
				}

				done = grunt.task.current.async();
				var pidport,sidport;
                                options.scproxy == "" ? pidport = 29999 : pidport = options.scproxy;
                                options.seport == "" ? sidport = 4666 : sidport = options.seport;
				if( options.pac != "" ){
				tunnel = new SauceTunnel(
					options.username,
					options.key,
					options.identifier,
					true, // tunneled = true
					['-v','--pac',options.pac,'-B', 'ALL', '-X', pidport, '-P', sidport, '-t', options.tunneldomains, '-D', options.directdomains]
					);
				}
				else
				{
					tunnel = new SauceTunnel(
                                        options.username,
                                        options.key,
                                        options.identifier,
                                        true, // tunneled = true
					['-v','-X', pidport, '-P', sidport]
                                        );
				}
				// keep actives tunnel in memory for stop task
				tunnels[tunnel.identifier] = tunnel;

				configureLogEvents(tunnel);

				grunt.log.writeln('Open'.cyan + ' Sauce Labs tunnel: ' + tunnel.identifier.cyan);

				tunnel.start(function (status) {
					if (status === false) {
						grunt.fatal('Failed'.red + ' to open Sauce Labs tunnel: ' + tunnel.identifier.cyan);
					}

					grunt.log.ok('Successfully'.green + ' opened Sauce Labs tunnel: ' + tunnel.identifier.cyan);
					finished();
				});

				tunnel.on('exit', finished);
				tunnel.on('exit', stop);
			}

			function stop() {
				if (tunnel && tunnel.stop) {
					grunt.log.writeln('Stopping'.cyan + 'Sauce Labs tunnel: ' + tunnel.identifier.cyan);
					tunnel.stop(function () {
						grunt.log.writeln('Stopped'.red + 'Sauce Labs tunnel: ' + tunnel.identifier.cyan);
						tunnel = null;
						finished();
					});
				} else {
					finished();
				}
			}

			start(options);
		});
	};
})();
