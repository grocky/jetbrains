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

interface ProjectStat {
  projectFile: string | null;
  hasWebStormFiles: boolean;
  hasPhpStormFiles: boolean;
  hasGoLandFiles: boolean;
  hasCLionFiles: boolean;
}

const isProjectFile = (file: string): boolean => {
  const projectFilePatterns = [/pom\.xml/, /\.ipr/, /build\.xml/, /\.idea/];
  let isProjectFile = false;

  projectFilePatterns.forEach(p => (isProjectFile = isProjectFile || p.test(file)));

  return isProjectFile;
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

const reduceProjectFiles = (files: string[]): ProjectStat =>
  files.reduce(
      (acc: ProjectStat, f: string) => ({
        projectFile: acc.projectFile || (isProjectFile(f) ? f : null),
        hasWebStormFiles: acc.hasWebStormFiles || isWebStormFile(f),
        hasPhpStormFiles: acc.hasPhpStormFiles || isPhpStormFile(f),
        hasGoLandFiles: acc.hasGoLandFiles || isGoLandFile(f),
        hasCLionFiles: acc.hasCLionFiles || isCLionFile(f),
      }),
      {
        projectFile: null,
        hasWebStormFiles: false,
        hasPhpStormFiles: false,
        hasGoLandFiles: false,
        hasCLionFiles: false,
      },
  );

const convertProjectFilesToAppName = (projectFiles: ProjectStat): IDEs => {
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

export const availableIdes = (): String[] => Object.values(IDEs);
