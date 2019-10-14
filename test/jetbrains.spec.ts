import 'mocha'
import {expect} from 'chai';

import { availableIdes, determineJetbrainsIDE } from '../src/jetbrains';

describe('jetbrains', async () => {
    describe('availableIdes', () => {
        it('should provide all available IDEs', () => {
            expect(availableIdes()).to.include.members([
                'PhpStorm',
                'WebStorm',
                'IntelliJ',
                'GoLand',
                'CLion',
            ])
        });
    });
    describe('determinJetbrainsIDE', () => {
        it('should open IntelliJ by default', async () => {
            const ideTarget = determineJetbrainsIDE([]);
            expect(ideTarget.target).to.be.null;
            expect(ideTarget.ide).to.be.equal('IntelliJ');
        });
        [
            { expectedApplication: 'IntelliJ', expectedTarget: 'pom.xml', files: ['pom.xml'] },
            { expectedApplication: 'IntelliJ', expectedTarget: '.ipr', files: ['.ipr'] },
            { expectedApplication: 'IntelliJ', expectedTarget: 'build.xml', files: ['build.xml'] },
            { expectedApplication: 'IntelliJ', expectedTarget: '.idea', files: ['.idea'] },
            { expectedApplication: 'WebStorm', expectedTarget: null, files: ['package.json'] },
            { expectedApplication: 'WebStorm', expectedTarget: null, files: ['bower.json'] },
            { expectedApplication: 'WebStorm', expectedTarget: null, files: ['gulpfile.json'] },
            { expectedApplication: 'WebStorm', expectedTarget: null, files: ['gruntfile.json'] },
            { expectedApplication: 'PhpStorm', expectedTarget: null, files: ['composer.json'] },
            { expectedApplication: 'PhpStorm', expectedTarget: null, files: ['composer.json', 'package.json'] },
            { expectedApplication: 'GoLand', expectedTarget: null, files: ['go.mod'] },
            { expectedApplication: 'GoLand', expectedTarget: null, files: ['go.mod', 'package.json'] },
            { expectedApplication: 'GoLand', expectedTarget: null, files: ['main.go'] },
            { expectedApplication: 'GoLand', expectedTarget: null, files: ['Gopkg.lock'] },
            { expectedApplication: 'CLion', expectedTarget: null, files: ['platformio.ini'] },
            { expectedApplication: 'CLion', expectedTarget: null, files: ['platformio.ini', 'package.json'] },
        ].forEach(tc =>
            it('should open ' + tc.expectedApplication + ' with a target of ' + tc.expectedTarget, () => {
                const ideTarget = determineJetbrainsIDE(tc.files);
                expect(ideTarget.target).to.equal(tc.expectedTarget);
                expect(ideTarget.ide).to.equal(tc.expectedApplication);
            })
        );
    });
});
