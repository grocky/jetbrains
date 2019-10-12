import fs from 'fs';
import sh from 'shelljs';
import chalk from 'chalk';

const ides = {
    phpStorm: 'PhpStorm',
    webStorm: 'WebStorm',
    intelliJ: 'IntelliJ',
    goLand: 'GoLand',
    cLion: 'CLion',
};

function openJetbrainsIde(directory) {
    fs.readdir(directory, (err, items) => {
        const projectStat = items.reduce(
            (acc, f) => ({
                projectFile: acc.projectFile || (isProjectFile(f) ? f : null),
                hasWebStormFiles: acc.hasWebStormFiles || isWebStormFile(f),
                hasPhpStormFiles: acc.hasPhpStormFiles || isPhpStormFile(f),
                hasGoLandFiles: acc.hasGoLandFiles || isGolandFile(f),
                hasCLionFiles: acc.hasCLionFiles || isCLionFile(f),
            }),
            {
                projectFile: null,
                hasWebStormFiles: false,
                hasPhpStormFiles: false,
                hasGoLandFiles: false,
                hasCLionFiles: false,
            }
        );

        let appName = '';
        if (projectStat.hasPhpStormFiles) {
            appName = ides.phpStorm;
        } else if (projectStat.hasWebStormFiles) {
            appName = ides.webStorm;
        } else if (projectStat.hasGoLandFiles) {
            appName = ides.goLand;
        } else if (projectStat.hasCLionFiles) {
            appName = ides.cLion;
        } else {
            appName = ides.intelliJ;
        }

        getJetBrainsApp(appName, (err, application) => openByApplication(err, application, projectStat.projectFile));
    });

    function isProjectFile(file) {
        const projectFilePatterns = [/pom\.xml/, /\.ipr/, /build\.xml/];
        let isProjectFile = false;

        projectFilePatterns.forEach(p => isProjectFile = isProjectFile || p.test(file));

        return isProjectFile;
    }

    function isWebStormFile(file) {
        return ['package.json', 'bower.json', 'gulpfile.json', 'gruntfile.json'].includes(file);
    }

    function isPhpStormFile(file) {
        return ['composer.json'].includes(file);
    }

    function isGolandFile(file) {
        return ['go.mod', 'main.go', 'Gopkg.lock'].includes(file);
    }

    function isCLionFile(file) {
        return ['platformio.ini'].includes(file);
    }

    function openByApplication(error, application, project) {

        if (error) {
            console.error(chalk.bold.red(error.message));
            process.exit(1);
        }

        let filename = null;
        if (application === '.idea') {
            filename = directory;
        } else {
            filename = project || directory;
        }

        console.log(chalk.green(`opening with ${application}`));
        sh.exec(`open -a "${application}" "${filename}"`, (code, stdout, stderr) => {
            if (code !== 0) {
                console.error(chalk.bold.red(`${stdout}`));
                console.error(chalk.bold.red(`${stderr}`));
                sh.exit(code);
            }
        });
    }

    function getJetBrainsApp(appName, callback) {
        const application = sh.ls('-d', `/Applications/${appName}*`).pop();

        if (!application) {
            callback(new Error(`Unable to find ${appName} application`));
        } else {
            callback(null, application.trim());
        }
    }
}

openJetbrainsIde.availableIdes = () => Object.keys(ides).map(k => ides[k]);

module.exports = openJetbrainsIde;
