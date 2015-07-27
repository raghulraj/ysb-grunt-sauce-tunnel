/*
 * ysb-grunt-sauce-tunnel
 * https://github.com/civitaslearning/grunt-sauce-tunnel
 *
 * Copyright (c) 2013 Dan Harbin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    
   // Configuration to be run (and then tested).
    ysb_sauce_tunnel: {
      custom_options: {
	options: {
	 username: 'your sauce username',
	 key: 'your sauce key'
	 tunnelTimeout: 120,
	 pac: 'pac_url.pac'
  	},server: {}
	}
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['ysb_sauce_tunnel']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['test']);

};
