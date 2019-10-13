#!/usr/bin/env node


const program = require('commander');
const fs = require('fs');
const shelljs = require('shelljs');
const chalk = require('chalk');

const version = require('../package.json').version;
import { determineJetbrainsIDE, IDETarget, availableIdes} from "./jetbrains";

program
    .version(version)
    .description(`
    open a project using a JetBrains IDE

    Available IDEs: ${availableIdes().join(', ')}
    `)
    .action(async () => {
        let directory = program.args[0] || '.';
        if (directory === '.') {
            directory = process.cwd();
        }

        try {
            const files = fs.readdirSync(directory);
            const ideTarget: IDETarget = determineJetbrainsIDE(files);
            const applicationPath = shelljs.ls('-d', `/Applications/${ideTarget.ide}*`).pop();
            if (!applicationPath) {
                console.error(chalk.red(`Unable to find ${ideTarget.ide} application`));
                process.exit(1);
            }

            console.log(chalk.green(`opening with ${applicationPath}`));

            const command = `open -a "${applicationPath}" "${ideTarget.target}"`;

            await new Promise((resolve, reject) =>
                shelljs.exec(command, {}, (code: number, stdout: string, stderr: string) => {
                    if (stderr) {
                        return reject(stderr)
                    }
                    resolve(stdout)
                }));
        } catch (e) {
            console.error(chalk.bold.red(e.message))
        }
    });

program.parse(process.argv);
