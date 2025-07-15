import * as fs from 'fs';
import * as path from 'path';

interface SecurityVulnerability {
  type: 'high' | 'medium' | 'low' | 'info';
  category: string;
  description: string;
  file: string;
  line?: number;
  recommendation: string;
}

interface SecurityReport {
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
}

class SecurityScanner {
  private sourceDir: string;
  private vulnerabilities: SecurityVulnerability[] = [];

  constructor() {
    this.sourceDir = path.join(process.cwd(), 'src');
  }

  /**
   * Lance un scan de sécurité complet
   */
  public async scanSecurity(): Promise<SecurityReport> {
    console.log('🔍 Lancement du scan de sécurité...\n');

    this.vulnerabilities = [];

    // Différents types de scans
    await this.scanHardcodedSecrets();
    await this.scanSqlInjectionVulnerabilities();
    await this.scanXssVulnerabilities();
    await this.scanAuthenticationWeaknesses();
    await this.scanInsecureConfigurations();
    await this.scanDependencyVulnerabilities();
    await this.scanPasswordSecurity();
    await this.scanDataExposure();

    const report = this.generateReport();
    this.printReport(report);

    return report;
  }

  /**
   * Scan pour les secrets hardcodés
   */
  private async scanHardcodedSecrets(): Promise<void> {
    console.log('🔐 Recherche de secrets hardcodés...');

    const sensitivePatterns = [
      { pattern: /password\s*[:=]\s*['"]\w+['"]/, desc: 'Mot de passe hardcodé' },
      { pattern: /secret\s*[:=]\s*['"]\w+['"]/, desc: 'Secret hardcodé' },
      { pattern: /api[_-]?key\s*[:=]\s*['"]\w+['"]/, desc: 'Clé API hardcodée' },
      { pattern: /token\s*[:=]\s*['"]\w+['"]/, desc: 'Token hardcodé' },
      { pattern: /jwt[_-]?secret\s*[:=]\s*['"]\w+['"]/, desc: 'Secret JWT hardcodé' },
      { pattern: /db[_-]?password\s*[:=]\s*['"]\w+['"]/, desc: 'Mot de passe DB hardcodé' },
    ];

    await this.scanFilesWithPatterns(sensitivePatterns, 'Secrets Hardcodés', 'high');
  }

  /**
   * Scan pour les vulnérabilités d'injection SQL
   */
  private async scanSqlInjectionVulnerabilities(): Promise<void> {
    console.log('💉 Recherche de vulnérabilités d\'injection SQL...');

    const sqlPatterns = [
      { 
        pattern: /query\s*\(\s*['"]\s*\+/, 
        desc: 'Concaténation directe dans les requêtes SQL' 
      },
      { 
        pattern: /\$\{.*\}.*WHERE/i, 
        desc: 'Interpolation de template dans clause WHERE' 
      },
      { 
        pattern: /req\.(query|params|body)\.\w+.*WHERE/i, 
        desc: 'Paramètres utilisateur directement dans SQL' 
      },
    ];

    await this.scanFilesWithPatterns(sqlPatterns, 'Injection SQL', 'high');
  }

  /**
   * Scan pour les vulnérabilités XSS
   */
  private async scanXssVulnerabilities(): Promise<void> {
    console.log('🌐 Recherche de vulnérabilités XSS...');

    const xssPatterns = [
      { 
        pattern: /innerHTML\s*=\s*.*req\.(query|params|body)/, 
        desc: 'Insertion directe de données utilisateur dans HTML' 
      },
      { 
        pattern: /eval\s*\(/, 
        desc: 'Utilisation dangereuse d\'eval()' 
      },
      { 
        pattern: /dangerouslySetInnerHTML/, 
        desc: 'Utilisation de dangerouslySetInnerHTML' 
      },
    ];

    await this.scanFilesWithPatterns(xssPatterns, 'Cross-Site Scripting (XSS)', 'high');
  }

  /**
   * Scan pour les faiblesses d'authentification
   */
  private async scanAuthenticationWeaknesses(): Promise<void> {
    console.log('🔒 Recherche de faiblesses d\'authentification...');

    const authPatterns = [
      { 
        pattern: /jwt\.sign\([^,]+,\s*['"]\w{1,10}['"]/, 
        desc: 'Secret JWT trop court (< 32 caractères recommandés)' 
      },
      { 
        pattern: /bcrypt\.hash\(\w+,\s*[1-9]\)/, 
        desc: 'Rounds bcrypt trop faibles (< 10 recommandés)' 
      },
      { 
        pattern: /session\s*:\s*{\s*secret\s*:\s*['"]\w{1,15}['"]/, 
        desc: 'Secret de session trop court' 
      },
    ];

    await this.scanFilesWithPatterns(authPatterns, 'Authentification', 'medium');
  }

  /**
   * Scan pour les configurations non sécurisées
   */
  private async scanInsecureConfigurations(): Promise<void> {
    console.log('⚙️ Recherche de configurations non sécurisées...');

    const configPatterns = [
      { 
        pattern: /cors\(\{\s*origin\s*:\s*['"]\*['"]/, 
        desc: 'CORS configuré pour accepter toutes les origines' 
      },
      { 
        pattern: /app\.use\(express\.static\(.*\)\).*\/\*/, 
        desc: 'Serveur de fichiers statiques trop permissif' 
      },
      { 
        pattern: /helmet\(\)/, 
        desc: 'Headers de sécurité manquants (utiliser helmet.js)',
        invert: true 
      },
    ];

    await this.scanFilesWithPatterns(configPatterns, 'Configuration', 'medium');
  }

  /**
   * Scan pour les vulnérabilités de dépendances
   */
  private async scanDependencyVulnerabilities(): Promise<void> {
    console.log('📦 Vérification des dépendances...');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Vérifier les dépendances obsolètes ou vulnérables
      const vulnerableDeps = [
        'request', // Deprecated
        'moment', // Vulnérabilités connues, utiliser dayjs
        'lodash', // Versions anciennes vulnérables
      ];

      for (const dep of vulnerableDeps) {
        if (dependencies[dep]) {
          this.vulnerabilities.push({
            type: 'medium',
            category: 'Dépendances',
            description: `Dépendance potentiellement vulnérable: ${dep}`,
            file: 'package.json',
            recommendation: `Mettre à jour ou remplacer ${dep} par une alternative sécurisée`,
          });
        }
      }
    }
  }

  /**
   * Scan pour la sécurité des mots de passe
   */
  private async scanPasswordSecurity(): Promise<void> {
    console.log('🔑 Vérification de la sécurité des mots de passe...');

    const passwordPatterns = [
      { 
        pattern: /password.*length.*[1-7]/, 
        desc: 'Exigence de longueur de mot de passe trop faible' 
      },
      { 
        pattern: /md5|sha1(?!ng)/, 
        desc: 'Algorithme de hachage faible (MD5/SHA1)' 
      },
      { 
        pattern: /password.*===.*password/, 
        desc: 'Comparaison de mot de passe non sécurisée' 
      },
    ];

    await this.scanFilesWithPatterns(passwordPatterns, 'Sécurité des Mots de Passe', 'high');
  }

  /**
   * Scan pour l'exposition de données sensibles
   */
  private async scanDataExposure(): Promise<void> {
    console.log('🔍 Recherche d\'exposition de données sensibles...');

    const exposurePatterns = [
      { 
        pattern: /console\.log\(.*password.*\)/, 
        desc: 'Mot de passe potentiellement loggé' 
      },
      { 
        pattern: /res\.json\(.*password.*\)/, 
        desc: 'Mot de passe potentiellement envoyé en réponse' 
      },
      { 
        pattern: /JSON\.stringify\(user\)/, 
        desc: 'Objet utilisateur complet sérialisé (peut exposer des données)' 
      },
    ];

    await this.scanFilesWithPatterns(exposurePatterns, 'Exposition de Données', 'medium');
  }

  /**
   * Scan générique avec patterns
   */
  private async scanFilesWithPatterns(
    patterns: Array<{ pattern: RegExp; desc: string; invert?: boolean }>,
    category: string,
    severity: SecurityVulnerability['type']
  ): Promise<void> {
    const files = this.getAllTypeScriptFiles();

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (const { pattern, desc, invert = false } of patterns) {
        lines.forEach((line, index) => {
          const matches = pattern.test(line);
          if ((!invert && matches) || (invert && !matches && index === 0)) {
            this.vulnerabilities.push({
              type: severity,
              category,
              description: desc,
              file: path.relative(this.sourceDir, file),
              line: index + 1,
              recommendation: this.getRecommendation(category, desc),
            });
          }
        });
      }
    }
  }

  /**
   * Récupère tous les fichiers TypeScript
   */
  private getAllTypeScriptFiles(): string[] {
    const files: string[] = [];

    const scanDirectory = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!['node_modules', 'coverage', 'dist', '__tests__'].includes(entry.name)) {
            scanDirectory(fullPath);
          }
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    };

    scanDirectory(this.sourceDir);
    return files;
  }

  /**
   * Génère des recommandations spécifiques
   */
  private getRecommendation(category: string, description: string): string {
    const recommendations: { [key: string]: string } = {
      'Secrets Hardcodés': 'Utiliser des variables d\'environnement (.env) pour les secrets',
      'Injection SQL': 'Utiliser des requêtes préparées ou un ORM avec paramètres bindés',
      'Cross-Site Scripting (XSS)': 'Valider et échapper toutes les entrées utilisateur',
      'Authentification': 'Utiliser des secrets forts et des algorithmes robustes',
      'Configuration': 'Appliquer le principe du moindre privilège',
      'Dépendances': 'Mettre à jour les dépendances et utiliser npm audit',
      'Sécurité des Mots de Passe': 'Utiliser bcrypt avec au moins 12 rounds',
      'Exposition de Données': 'Ne jamais logger ou exposer de données sensibles',
    };

    return recommendations[category] || 'Consulter les bonnes pratiques de sécurité OWASP';
  }

  /**
   * Génère le rapport final
   */
  private generateReport(): SecurityReport {
    const summary = {
      total: this.vulnerabilities.length,
      high: this.vulnerabilities.filter(v => v.type === 'high').length,
      medium: this.vulnerabilities.filter(v => v.type === 'medium').length,
      low: this.vulnerabilities.filter(v => v.type === 'low').length,
      info: this.vulnerabilities.filter(v => v.type === 'info').length,
    };

    const recommendations = [
      'Implémenter helmet.js pour les headers de sécurité',
      'Configurer CSP (Content Security Policy)',
      'Utiliser HTTPS en production',
      'Implémenter la journalisation de sécurité',
      'Effectuer des audits de sécurité réguliers',
      'Mettre en place un pipeline de sécurité CI/CD',
      'Former l\'équipe aux bonnes pratiques de sécurité',
    ];

    return {
      summary,
      vulnerabilities: this.vulnerabilities,
      recommendations,
    };
  }

  /**
   * Affiche le rapport de sécurité
   */
  private printReport(report: SecurityReport): void {
    console.log('\n🛡️ RAPPORT DE SÉCURITÉ\n');
    console.log('=' .repeat(60));

    // Résumé
    console.log('\n📊 RÉSUMÉ:');
    console.log(`   Total: ${report.summary.total} problèmes détectés`);
    console.log(`   🔴 Critique: ${report.summary.high}`);
    console.log(`   🟡 Moyen: ${report.summary.medium}`);
    console.log(`   🟢 Faible: ${report.summary.low}`);
    console.log(`   ℹ️ Info: ${report.summary.info}`);

    // Vulnérabilités par catégorie
    const byCategory = report.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.category] = (acc[vuln.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    console.log('\n📋 PAR CATÉGORIE:');
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    // Détails des vulnérabilités critiques
    const criticalVulns = report.vulnerabilities.filter(v => v.type === 'high');
    if (criticalVulns.length > 0) {
      console.log('\n🔴 VULNÉRABILITÉS CRITIQUES:');
      criticalVulns.forEach((vuln, index) => {
        console.log(`\n   ${index + 1}. ${vuln.description}`);
        console.log(`      📁 Fichier: ${vuln.file}${vuln.line ? `:${vuln.line}` : ''}`);
        console.log(`      💡 Recommandation: ${vuln.recommendation}`);
      });
    }

    // Recommandations générales
    console.log('\n💡 RECOMMANDATIONS GÉNÉRALES:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    // Score de sécurité
    const securityScore = Math.max(0, 100 - (
      report.summary.high * 10 +
      report.summary.medium * 5 +
      report.summary.low * 2 +
      report.summary.info * 1
    ));

    console.log(`\n📈 SCORE DE SÉCURITÉ: ${securityScore}/100`);

    if (securityScore >= 90) {
      console.log('✅ Excellente sécurité !');
    } else if (securityScore >= 70) {
      console.log('⚠️ Sécurité acceptable, améliorations recommandées');
    } else {
      console.log('❌ Problèmes de sécurité critiques à résoudre');
    }

    console.log('\n' + '=' .repeat(60));
  }

  /**
   * Sauvegarde le rapport
   */
  public saveReport(report: SecurityReport, outputPath: string): void {
    const reportContent = {
      timestamp: new Date().toISOString(),
      summary: report.summary,
      vulnerabilities: report.vulnerabilities,
      recommendations: report.recommendations,
    };

    fs.writeFileSync(outputPath, JSON.stringify(reportContent, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${outputPath}`);
  }
}

// Exécution du script si appelé directement
if (import.meta.url === new URL(process.argv[1], import.meta.url).href) {
  const scanner = new SecurityScanner();
  
  scanner.scanSecurity()
    .then(report => {
      const outputPath = path.join(process.cwd(), 'coverage', 'security-report.json');
      scanner.saveReport(report, outputPath);
      
      // Code de sortie basé sur les vulnérabilités critiques
      if (report.summary.high > 0) {
        console.log('\n❌ Vulnérabilités critiques détectées');
        process.exit(1);
      } else if (report.summary.medium > 5) {
        console.log('\n⚠️ Trop de vulnérabilités moyennes');
        process.exit(1);
      } else {
        console.log('\n✅ Scan de sécurité réussi');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Erreur lors du scan de sécurité:', error.message);
      process.exit(1);
    });
}

export { SecurityScanner }; 