#!/usr/bin/env node
import chalk from 'chalk';
import program from 'commander';
import Debug from 'debug';
import fs from 'fs';
import shelljs from 'shelljs';

import { version } from '../package.json';

import { availableIdes, determineJetbrainsIDE, IDETarget} from "./jetbrains";

const debug = Debug('jetbrains:cli');

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
            debug(ideTarget);

            const applicationPath = shelljs.ls('-d', `/Applications/${ideTarget.ide}*`).pop();
            if (!applicationPath) {
                process.stdout.write(chalk.red(`Unable to find ${ideTarget.ide} application\n`));
                process.exit(1);
            }

            process.stdout.write(chalk.green(`opening with ${applicationPath}\n`));

            const command = `open -a "${applicationPath}" "${directory}"`;
            debug(command);

            await new Promise((resolve, reject) =>
                shelljs.exec(command, {}, (code: number, stdout: string, stderr: string) => {
                    if (stderr) {
                        return reject(stderr)
                    }
                    resolve(stdout)
                }));
        } catch (e) {
            process.stderr.write(chalk.bold.red(e.message))
        }
    });

program.parse(process.argv);
