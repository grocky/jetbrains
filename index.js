'use strict';

var _ = require('lodash');
var exec = require('child_process').exec;
var fs = require('fs');

var webStormFiles = ['package.json', 'bower.json', 'gulpfile.json', 'gruntfile.json'];
var phpStormFiles = ['composer.json'];
var projectFilePatterns = [/pom\.xml/, /\.ipr/, /build\.xml/];

module.exports = {
    openByDirectory: openByDirectory
};

function openByDirectory(directory) {

    fs.readdir(directory, function(err, items) {
        var hasWebstormFiles = _.intersection(items, webStormFiles).length > 0;
        var hasPhpStormFiles = _.intersection(items, phpStormFiles).length > 0;

        var project = _.find(items, function(item) {
            var hasProjectFile = false;
            _.each(projectFilePatterns, function(pattern) {
                hasProjectFile = hasProjectFile || pattern.test(item);
            });
            return hasProjectFile;
        });

        var appName = '';
        if (hasPhpStormFiles) {
            appName = 'PhpStorm';
        } else if (hasWebstormFiles) {
            appName = 'WebStorm';
        } else {
            appName = 'IntelliJ';
        }

        getJetBrainsApp(appName, project, openByApplication);
    });
}

function openByApplication(error, application, project) {

    if (error) {
        console.error(error.stderr.error);
        process.exit(error.code);
    }

    var filename = null;
    if (application === '.idea') {
        filename = directory;
    } else {
        filename = project || directory;
    }

    execute('open -a "' + application + '" "' + filename + '"', common.dryRun, function(error, stdout) {
        if (error) {
            console.error(error.stderr.error);
            process.exit(error.code);
        }
        console.log(stdout.info);
    });
}

function getJetBrainsApp(appName, project, callback) {
    console.log('opening with %s'.info, appName);
    execute('ls -1d /Applications/' + appName + '* | tail -n1', function(error, application) {
        if (error) callback(error);

        application = application.replace(/\s+$/g, '');
        callback(null, application, project);
    });
}

function execute(command, dryRun, callback) {
    var args = [].slice.call(arguments);
    command = args.shift();
    callback = args.pop();
    dryRun = args[0] || false;

    var prefix = 'execute: '.debug;
    if (dryRun) prefix = 'DRY_RUN '.warn + prefix;

    //console.log(prefix + command);

    if (!dryRun) {
        var options = { cwd: process.cwd() };
        exec(command, options, function(error, stdOut, stdErr) {
            if (error) {
                error.stdout = stdOut;
                error.stderr = stdErr;
                callback(error);
            }
            callback(null, stdOut);
        });
    }
}
