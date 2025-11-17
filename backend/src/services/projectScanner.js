const fs = require('fs');
const path = require('path');

class ProjectScanner {
  constructor() {
    // Path to the parent Projetos folder
    this.projectsRoot = path.resolve(__dirname, '../../../../');
  }

  /**
   * Scan the Projetos folder to detect all projects
   * @returns {Array} List of detected projects with their details
   */
  scanProjects() {
    try {
      const projects = [];
      const entries = fs.readdirSync(this.projectsRoot, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !this.shouldIgnoreFolder(entry.name)) {
          const projectPath = path.join(this.projectsRoot, entry.name);
          const projectInfo = this.detectProjectType(entry.name, projectPath);
          
          if (projectInfo) {
            projects.push(projectInfo);
          }
        }
      }

      return projects;
    } catch (error) {
      console.error('Error scanning projects:', error);
      return [];
    }
  }

  /**
   * Determine if a folder should be ignored
   */
  shouldIgnoreFolder(folderName) {
    const ignoredFolders = [
      'node_modules',
      '.git',
      'venv',
      '__pycache__',
      'fabrica-de-testes', // Don't scan itself
      'RaFeltrim' // Profile folder
    ];
    
    return ignoredFolders.includes(folderName) || folderName.startsWith('.');
  }

  /**
   * Detect project type and return project info
   */
  detectProjectType(projectName, projectPath) {
    const info = {
      name: projectName,
      path: projectPath,
      type: 'unknown',
      testFrameworks: []
    };

    // Check for package.json (Node.js projects)
    if (fs.existsSync(path.join(projectPath, 'package.json'))) {
      info.type = 'nodejs';
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8')
      );
      
      // Detect test frameworks
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (deps.jest) info.testFrameworks.push('jest');
      if (deps.vitest) info.testFrameworks.push('vitest');
      if (deps.cypress) info.testFrameworks.push('cypress');
      if (deps.playwright || deps['@playwright/test']) info.testFrameworks.push('playwright');
      if (deps.mocha) info.testFrameworks.push('mocha');
    }

    // Check for pom.xml (Maven/Java projects)
    if (fs.existsSync(path.join(projectPath, 'pom.xml'))) {
      info.type = 'maven';
      info.testFrameworks.push('junit');
    }

    // Check for requirements.txt (Python projects)
    if (fs.existsSync(path.join(projectPath, 'requirements.txt'))) {
      info.type = 'python';
      const requirements = fs.readFileSync(
        path.join(projectPath, 'requirements.txt'),
        'utf8'
      );
      if (requirements.includes('pytest')) info.testFrameworks.push('pytest');
      if (requirements.includes('robotframework')) info.testFrameworks.push('robot');
      if (requirements.includes('unittest')) info.testFrameworks.push('unittest');
    }

    // Check for manage.py (Django projects)
    if (fs.existsSync(path.join(projectPath, 'manage.py'))) {
      info.type = 'django';
      info.testFrameworks.push('django-test');
    }

    return info;
  }

  /**
   * Get formatted project list for display
   */
  getProjectList() {
    const projects = this.scanProjects();
    return projects.map(p => ({
      name: p.name,
      type: p.type,
      frameworks: p.testFrameworks.join(', ') || 'none detected',
      suggestedSuiteName: this.generateSuiteName(p)
    }));
  }

  /**
   * Generate suggested suite name for a project
   */
  generateSuiteName(project) {
    const framework = project.testFrameworks[0] || 'Tests';
    return `${project.name} - ${framework.charAt(0).toUpperCase() + framework.slice(1)} Tests`;
  }
}

module.exports = new ProjectScanner();
