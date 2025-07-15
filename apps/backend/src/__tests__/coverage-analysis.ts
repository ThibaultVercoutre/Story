import * as fs from 'fs';
import * as path from 'path';

interface CoverageData {
  file: string;
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  functions: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
  statements: {
    total: number;
    covered: number;
    percentage: number;
  };
}

interface CoverageSummary {
  totalFiles: number;
  averageCoverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  filesUnderThreshold: {
    lines: string[];
    functions: string[];
    branches: string[];
    statements: string[];
  };
  uncoveredFiles: string[];
}

class CoverageAnalyzer {
  private coverageDir: string;
  private sourceDir: string;
  private thresholds = {
    lines: 90,
    functions: 90,
    branches: 85,
    statements: 90,
  };

  constructor() {
    this.coverageDir = path.join(process.cwd(), 'coverage');
    this.sourceDir = path.join(process.cwd(), 'src');
  }

  /**
   * Analyse la couverture de code actuelle
   */
  public async analyzeCoverage(): Promise<CoverageSummary> {
    console.log('🔍 Analyse de la couverture de code...\n');

    const lcovFile = path.join(this.coverageDir, 'lcov.info');
    const jsonSummaryFile = path.join(this.coverageDir, 'coverage-summary.json');

    if (!fs.existsSync(lcovFile) || !fs.existsSync(jsonSummaryFile)) {
      throw new Error(
        'Fichiers de couverture non trouvés. Exécutez "npm run test:coverage" d\'abord.'
      );
    }

    const coverageData = this.parseCoverageData(jsonSummaryFile);
    const allSourceFiles = this.getAllSourceFiles();
    const coveredFiles = Object.keys(coverageData);
    const uncoveredFiles = allSourceFiles.filter(file => !coveredFiles.includes(file));

    const summary = this.generateSummary(coverageData, uncoveredFiles);
    
    this.printDetailedReport(coverageData, summary);
    this.generateRecommendations(summary);

    return summary;
  }

  /**
   * Parse les données de couverture depuis le fichier JSON
   */
  private parseCoverageData(jsonFile: string): { [file: string]: CoverageData } {
    const rawData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const coverageData: { [file: string]: CoverageData } = {};

    for (const [filePath, data] of Object.entries(rawData) as [string, any][]) {
      if (filePath === 'total') continue;

      const relativePath = path.relative(this.sourceDir, filePath);
      
      coverageData[relativePath] = {
        file: relativePath,
        lines: {
          total: data.lines?.total || 0,
          covered: data.lines?.covered || 0,
          percentage: data.lines?.pct || 0,
        },
        functions: {
          total: data.functions?.total || 0,
          covered: data.functions?.covered || 0,
          percentage: data.functions?.pct || 0,
        },
        branches: {
          total: data.branches?.total || 0,
          covered: data.branches?.covered || 0,
          percentage: data.branches?.pct || 0,
        },
        statements: {
          total: data.statements?.total || 0,
          covered: data.statements?.covered || 0,
          percentage: data.statements?.pct || 0,
        },
      };
    }

    return coverageData;
  }

  /**
   * Récupère tous les fichiers source TypeScript
   */
  private getAllSourceFiles(): string[] {
    const files: string[] = [];
    
    const scanDirectory = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Ignorer certains dossiers
          if (!['__tests__', 'node_modules', 'coverage', 'dist'].includes(entry.name)) {
            scanDirectory(fullPath);
          }
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
          const relativePath = path.relative(this.sourceDir, fullPath);
          files.push(relativePath);
        }
      }
    };

    scanDirectory(this.sourceDir);
    return files;
  }

  /**
   * Génère un résumé de la couverture
   */
  private generateSummary(
    coverageData: { [file: string]: CoverageData },
    uncoveredFiles: string[]
  ): CoverageSummary {
    const files = Object.values(coverageData);
    const totalFiles = files.length + uncoveredFiles.length;

    // Calcul des moyennes
    const averageCoverage = {
      lines: files.reduce((sum, file) => sum + file.lines.percentage, 0) / files.length || 0,
      functions: files.reduce((sum, file) => sum + file.functions.percentage, 0) / files.length || 0,
      branches: files.reduce((sum, file) => sum + file.branches.percentage, 0) / files.length || 0,
      statements: files.reduce((sum, file) => sum + file.statements.percentage, 0) / files.length || 0,
    };

    // Fichiers sous le seuil
    const filesUnderThreshold = {
      lines: files.filter(f => f.lines.percentage < this.thresholds.lines).map(f => f.file),
      functions: files.filter(f => f.functions.percentage < this.thresholds.functions).map(f => f.file),
      branches: files.filter(f => f.branches.percentage < this.thresholds.branches).map(f => f.file),
      statements: files.filter(f => f.statements.percentage < this.thresholds.statements).map(f => f.file),
    };

    return {
      totalFiles,
      averageCoverage,
      filesUnderThreshold,
      uncoveredFiles,
    };
  }

  /**
   * Affiche un rapport détaillé
   */
  private printDetailedReport(
    coverageData: { [file: string]: CoverageData },
    summary: CoverageSummary
  ): void {
    console.log('📊 RAPPORT DE COUVERTURE DÉTAILLÉ\n');
    console.log('=' .repeat(60));

    // Résumé global
    console.log('\n📈 RÉSUMÉ GLOBAL:');
    console.log(`   Fichiers totaux: ${summary.totalFiles}`);
    console.log(`   Fichiers couverts: ${Object.keys(coverageData).length}`);
    console.log(`   Fichiers non couverts: ${summary.uncoveredFiles.length}`);
    
    console.log('\n🎯 COUVERTURE MOYENNE:');
    console.log(`   Lignes: ${summary.averageCoverage.lines.toFixed(2)}%`);
    console.log(`   Fonctions: ${summary.averageCoverage.functions.toFixed(2)}%`);
    console.log(`   Branches: ${summary.averageCoverage.branches.toFixed(2)}%`);
    console.log(`   Instructions: ${summary.averageCoverage.statements.toFixed(2)}%`);

    // Fichiers avec faible couverture
    console.log('\n⚠️  FICHIERS SOUS LE SEUIL:');
    
    if (summary.filesUnderThreshold.lines.length > 0) {
      console.log(`\n   📍 Lignes < ${this.thresholds.lines}%:`);
      summary.filesUnderThreshold.lines.forEach(file => {
        const data = coverageData[file];
        console.log(`      ${file}: ${data.lines.percentage.toFixed(2)}%`);
      });
    }

    if (summary.filesUnderThreshold.functions.length > 0) {
      console.log(`\n   🔧 Fonctions < ${this.thresholds.functions}%:`);
      summary.filesUnderThreshold.functions.forEach(file => {
        const data = coverageData[file];
        console.log(`      ${file}: ${data.functions.percentage.toFixed(2)}%`);
      });
    }

    if (summary.filesUnderThreshold.branches.length > 0) {
      console.log(`\n   🌿 Branches < ${this.thresholds.branches}%:`);
      summary.filesUnderThreshold.branches.forEach(file => {
        const data = coverageData[file];
        console.log(`      ${file}: ${data.branches.percentage.toFixed(2)}%`);
      });
    }

    // Fichiers non couverts
    if (summary.uncoveredFiles.length > 0) {
      console.log('\n🚫 FICHIERS NON COUVERTS:');
      summary.uncoveredFiles.forEach(file => {
        console.log(`   ${file}`);
      });
    }

    // Top des fichiers bien couverts
    console.log('\n✅ TOP 5 FICHIERS BIEN COUVERTS:');
    const sortedFiles = Object.values(coverageData)
      .sort((a, b) => b.lines.percentage - a.lines.percentage)
      .slice(0, 5);
    
    sortedFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.file}: ${file.lines.percentage.toFixed(2)}%`);
    });

    console.log('\n' + '=' .repeat(60));
  }

  /**
   * Génère des recommandations pour améliorer la couverture
   */
  private generateRecommendations(summary: CoverageSummary): void {
    console.log('\n💡 RECOMMANDATIONS POUR AMÉLIORER LA COUVERTURE:\n');

    if (summary.uncoveredFiles.length > 0) {
      console.log('1. 🎯 PRIORITÉ HAUTE - Créer des tests pour les fichiers non couverts:');
      summary.uncoveredFiles.slice(0, 5).forEach(file => {
        console.log(`   - ${file}`);
        
        // Suggestions spécifiques par type de fichier
        if (file.includes('service')) {
          console.log('     💼 Service: Tester toutes les méthodes CRUD et la gestion d\'erreurs');
        } else if (file.includes('controller')) {
          console.log('     🎮 Contrôleur: Tester tous les endpoints et codes de retour');
        } else if (file.includes('middleware')) {
          console.log('     🛡️  Middleware: Tester les cas valides et invalides');
        } else if (file.includes('util')) {
          console.log('     🔧 Utilitaire: Tester toutes les fonctions avec cas limites');
        }
      });
    }

    if (summary.filesUnderThreshold.functions.length > 0) {
      console.log('\n2. 🔧 PRIORITÉ MOYENNE - Améliorer la couverture des fonctions:');
      summary.filesUnderThreshold.functions.slice(0, 3).forEach(file => {
        console.log(`   - ${file}: Ajouter des tests pour les fonctions non couvertes`);
      });
    }

    if (summary.filesUnderThreshold.branches.length > 0) {
      console.log('\n3. 🌿 PRIORITÉ MOYENNE - Améliorer la couverture des branches:');
      summary.filesUnderThreshold.branches.slice(0, 3).forEach(file => {
        console.log(`   - ${file}: Tester tous les cas de conditions (if/else, try/catch)`);
      });
    }

    console.log('\n4. 📋 ACTIONS RECOMMANDÉES:');
    console.log('   ✓ Utiliser "npm run test:coverage" pour suivre les progrès');
    console.log('   ✓ Concentrer les efforts sur les services et contrôleurs');
    console.log('   ✓ Ajouter des tests d\'intégration pour les flux complets');
    console.log('   ✓ Tester les cas d\'erreur et les cas limites');
    console.log('   ✓ Viser 95%+ pour les utilitaires critiques');

    const overallCoverage = (
      summary.averageCoverage.lines +
      summary.averageCoverage.functions +
      summary.averageCoverage.branches +
      summary.averageCoverage.statements
    ) / 4;

    if (overallCoverage >= 90) {
      console.log('\n🎉 Excellente couverture ! Continuez comme ça !');
    } else if (overallCoverage >= 80) {
      console.log('\n👍 Bonne couverture, encore quelques efforts pour atteindre 90%');
    } else {
      console.log('\n⚠️  Couverture insuffisante, concentrez-vous sur les recommandations');
    }
  }

  /**
   * Génère un fichier de rapport détaillé
   */
  public generateDetailedReport(summary: CoverageSummary): void {
    const reportPath = path.join(this.coverageDir, 'coverage-analysis.md');
    
    const report = `# Rapport d'Analyse de Couverture de Code

## Résumé Global
- **Fichiers totaux**: ${summary.totalFiles}
- **Fichiers non couverts**: ${summary.uncoveredFiles.length}
- **Couverture moyenne**: ${summary.averageCoverage.lines.toFixed(2)}%

## Fichiers Non Couverts
${summary.uncoveredFiles.map(file => `- \`${file}\``).join('\n')}

## Fichiers Sous le Seuil
### Lignes < 90%
${summary.filesUnderThreshold.lines.map(file => `- \`${file}\``).join('\n')}

### Fonctions < 90%
${summary.filesUnderThreshold.functions.map(file => `- \`${file}\``).join('\n')}

### Branches < 85%
${summary.filesUnderThreshold.branches.map(file => `- \`${file}\``).join('\n')}

## Recommandations
1. Créer des tests pour les fichiers non couverts
2. Améliorer la couverture des fonctions et branches
3. Ajouter des tests d'intégration
4. Tester les cas d'erreur et cas limites

---
*Rapport généré le ${new Date().toLocaleString('fr-FR')}*
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Rapport détaillé sauvegardé: ${reportPath}`);
  }
}

// Exécution du script si appelé directement
if (import.meta.url === new URL(process.argv[1], import.meta.url).href) {
  const analyzer = new CoverageAnalyzer();
  
  analyzer.analyzeCoverage()
    .then(summary => {
      analyzer.generateDetailedReport(summary);
      
      // Code de sortie basé sur la couverture
      const overallCoverage = (
        summary.averageCoverage.lines +
        summary.averageCoverage.functions +
        summary.averageCoverage.branches +
        summary.averageCoverage.statements
      ) / 4;
      
      if (overallCoverage < 80) {
        console.log('\n❌ Couverture insuffisante (<80%)');
        process.exit(1);
      } else if (overallCoverage < 90) {
        console.log('\n⚠️  Couverture acceptable mais peut être améliorée');
        process.exit(0);
      } else {
        console.log('\n✅ Excellente couverture !');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Erreur lors de l\'analyse:', error.message);
      process.exit(1);
    });
}

export { CoverageAnalyzer }; 