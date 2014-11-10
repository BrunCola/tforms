'use strict';

var paths = {
    js: ['*.js', 'server/**/*.js', '!server/config/**', 'public/**/*.js', 'test/**/*.js', '!test/coverage/**', '!public/system/lib/**', 'packages/**/*.js', '!public/system/services/global.js', '!public/system/assets/js/*.js'],
    html: ['public/**/views/**', 'server/views/**', 'packages/**/public/**/views/**', 'packages/**/server/views/**'],
    css: ['public/**/css/*.css', '!public/system/lib/**', '!public/system/assets/**', '!public/auth/assets/**', 'packages/**/public/**/css/*.css']
};

module.exports = function(grunt) {

    if (process.env.NODE_ENV !== 'production') {
        require('time-grunt')(grunt);
        grunt.loadNpmTasks('grunt-bump');
    }

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        assets: grunt.file.readJSON('server/config/assets.json'),
        watch: {
            js: {
                files: paths.js,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: paths.html,
                options: {
                    livereload: true
                }
            },
            css: {
                files: paths.css,
                tasks: ['csslint'],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            all: {
                src: paths.js,
                options: {
                    jshintrc: true
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            production: {
                files: '<%= assets.js %>'
            }
        },
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            src: paths.css
        },
        cssmin: {
            combine: {
                files: '<%= assets.css %>'
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    args: [],
                    ignore: ['public/**', 'node_modules/**', 'config/meanio/**'],
                    ext: 'js,html',
                    nodeArgs: ['--debug'],
                    delayTime: 1,
                    env: {
                        PORT: require('./server/config/config').port
                    },
                    cwd: __dirname
                }
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'], // '-a' for all files
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        },
        mochaTest: {
            options: {
                reporter: 'spec',
                require: 'server.js'
            },
            src: ['test/mocha/**/*.js']
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma/karma.conf.js'
            }
        }
    });

    //Load NPM tasks
    require('load-grunt-tasks')(grunt);

    //Default task(s).
    if (process.env.NODE_ENV === 'production') {
        grunt.registerTask('default', ['cssmin', 'uglify', 'concurrent']);
    } else {
        grunt.registerTask('default', ['jshint', 'csslint', 'concurrent']);
    }

    //Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);

    // For Heroku users only.
    // Docs: https://github.com/linnovate/mean/wiki/Deploying-on-Heroku
    // grunt.registerTask('heroku:production', ['cssmin', 'uglify']);
};
