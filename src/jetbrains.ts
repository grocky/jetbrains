enum IDEs {
  PHPStorm = 'PhpStorm',
  WebStorm = 'WebStorm',
  IntelliJ = 'IntelliJ',
  GoLand = 'GoLand',
  CLion = 'CLion',
}

export interface IDETarget {
    ide: IDEs;
    target: string | null;
}

interface IProjectStat {
  projectFile: string | null;
  hasWebStormFiles: boolean;
  hasPhpStormFiles: boolean;
  hasGoLandFiles: boolean;
  hasCLionFiles: boolean;
}

const isProjectFile = (file: string): boolean => {
  const projectFilePatterns = [/pom\.xml/, /\.ipr/, /build\.xml/, /\.idea/];
  let isMatching = false;

  projectFilePatterns.forEach(p => (isMatching = isMatching || p.test(file)));

  return isMatching;
};

const isWebStormFile = (file: string): boolean =>
  [
    'package.json',
    'bower.json',
    'gulpfile.json',
    'gruntfile.json',
  ].includes(file);

const isPhpStormFile = (file: string): boolean =>
  [
    'composer.json'
  ].includes(file);

const isGoLandFile = (file: string): boolean =>
  [
    'go.mod',
    'main.go',
    'Gopkg.lock'
  ].includes(file);

const isCLionFile = (file: string): boolean =>
  [
    'platformio.ini'
  ].includes(file);

const reduceProjectFiles = (files: string[]): IProjectStat =>
  files.reduce(
      (acc: IProjectStat, f: string) => ({
        hasCLionFiles: acc.hasCLionFiles || isCLionFile(f),
        hasGoLandFiles: acc.hasGoLandFiles || isGoLandFile(f),
        hasPhpStormFiles: acc.hasPhpStormFiles || isPhpStormFile(f),
        hasWebStormFiles: acc.hasWebStormFiles || isWebStormFile(f),
        projectFile: acc.projectFile || (isProjectFile(f) ? f : null),
      }),
      {
        hasCLionFiles: false,
        hasGoLandFiles: false,
        hasPhpStormFiles: false,
        hasWebStormFiles: false,
        projectFile: null,
      },
  );

const convertProjectFilesToAppName = (projectFiles: IProjectStat): IDEs => {
    if (projectFiles.hasPhpStormFiles) {
        return IDEs.PHPStorm;
    } else if (projectFiles.hasGoLandFiles) {
        return IDEs.GoLand;
    } else if (projectFiles.hasCLionFiles) {
        return IDEs.CLion;
    } else if (projectFiles.hasWebStormFiles) {
        return IDEs.WebStorm;
    } else {
        return IDEs.IntelliJ;
    }
};

export const determineJetbrainsIDE = (projectFiles: string[]): IDETarget => {
  const projectStat = reduceProjectFiles(projectFiles);
  const ide = convertProjectFilesToAppName(projectStat);
  return {
      ide,
      target: projectStat.projectFile,
  };
};

export const availableIdes = (): string[] => Object.values(IDEs);
