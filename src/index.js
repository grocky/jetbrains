module.exports = openJetbrainsIde;

function openJetbrainsIde(directory) {

    const _ = require('lodash');
    const fs = require('fs');

    const webStormFiles = ['package.json', 'bower.json', 'gulpfile.json', 'gruntfile.json'];
    const phpStormFiles = ['composer.json'];

    fs.readdir(directory, (err, items) => {

        const projectFile = _.find(items, isProjectFile);
        const hasWebstormFiles = _.intersection(items, webStormFiles).length > 0;
        const hasPhpStormFiles = _.intersection(items, phpStormFiles).length > 0;

        let appName = '';
        if (hasPhpStormFiles) {
            appName = 'PhpStorm';
        } else if (hasWebstormFiles) {
            appName = 'WebStorm';
        } else {
            appName = 'IntelliJ';
        }

        getJetBrainsApp(appName, projectFile, openByApplication);
    });

    function isProjectFile(file) {
        const projectFilePatterns = [/pom\.xml/, /\.ipr/, /build\.xml/];
        let isProjectFile = false;

        _.forEach(projectFilePatterns, pattern => isProjectFile = isProjectFile || pattern.test(file));

        return isProjectFile;
    }

    function openByApplication(error, application, project) {

        if (error) {
            console.error(error.stderr.error);
            process.exit(error.code);
        }

        let filename = null;
        if (application === '.idea') {
            filename = directory;
        } else {
            filename = project || directory;
        }

        console.log(`opening with ${application}`);
        execute(`open -a "${application}" "${filename}"`, (error, stdout) => {
            if (error) {
                console.error(error.stderr.error);
                process.exit(error.code);
            }
            console.log(stdout);
        });
    }

    function getJetBrainsApp(appName, project, callback) {
        execute(`ls -1d /Applications/${appName}* | tail -n1`, (error, application) => {
            if (error) callback(error);

            application = application.replace(/\s+$/g, '');
            callback(null, application, project);
        });
    }

    function execute(command, callback) {
        const exec = require('child_process').exec;
        const options = { cwd: process.cwd() };
        exec(command, options, (error, stdOut, stdErr) => {
            if (error) {
                error.stdout = stdOut;
                error.stderr = stdErr;
                callback(error);
            }
            callback(null, stdOut);
        });
    }
}
