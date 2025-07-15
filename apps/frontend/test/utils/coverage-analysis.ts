import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface CoverageReport {
  total: {
    lines: { total: number; covered: number; skipped: number; pct: number }
    functions: { total: number; covered: number; skipped: number; pct: number }
    statements: { total: number; covered: number; skipped: number; pct: number }
    branches: { total: number; covered: number; skipped: number; pct: number }
  }
  [key: string]: any
}

interface CoverageAnalysis {
  summary: {
    totalFiles: number
    averageCoverage: number
    thresholdsMet: boolean
  }
  details: {
    lines: number
    functions: number
    statements: number
    branches: number
  }
  files: {
    name: string
    coverage: {
      lines: number
      functions: number
      statements: number
      branches: number
    }
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
  }[]
  recommendations: string[]
}

export class CoverageAnalyzer {
  private coverageData: CoverageReport | null = null
  private thresholds = {
    excellent: 95,
    good: 85,
    needsImprovement: 70,
    poor: 0
  }

  constructor(private coveragePath: string = './coverage/coverage-summary.json') {}

  async loadCoverageData(): Promise<void> {
    try {
      const coverageContent = readFileSync(this.coveragePath, 'utf-8')
      this.coverageData = JSON.parse(coverageContent)
    } catch (error) {
      throw new Error(`Impossible de charger les données de coverage: ${error}`)
    }
  }

  analyzeCoverage(): CoverageAnalysis {
    if (!this.coverageData) {
      throw new Error('Aucune donnée de coverage chargée')
    }

    const { total } = this.coverageData
    const files = Object.keys(this.coverageData)
      .filter(key => key !== 'total')
      .map(filePath => {
        const fileData = this.coverageData![filePath]
        const avgCoverage = (
          fileData.lines.pct +
          fileData.functions.pct +
          fileData.statements.pct +
          fileData.branches.pct
        ) / 4

        return {
          name: filePath,
          coverage: {
            lines: fileData.lines.pct,
            functions: fileData.functions.pct,
            statements: fileData.statements.pct,
            branches: fileData.branches.pct
          },
          status: this.getStatusFromCoverage(avgCoverage)
        }
      })

    const averageCoverage = (
      total.lines.pct +
      total.functions.pct +
      total.statements.pct +
      total.branches.pct
    ) / 4

    const thresholdsMet = this.checkThresholds(total)
    const recommendations = this.generateRecommendations(files, total)

    return {
      summary: {
        totalFiles: files.length,
        averageCoverage,
        thresholdsMet
      },
      details: {
        lines: total.lines.pct,
        functions: total.functions.pct,
        statements: total.statements.pct,
        branches: total.branches.pct
      },
      files,
      recommendations
    }
  }

  private getStatusFromCoverage(coverage: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
    if (coverage >= this.thresholds.excellent) return 'excellent'
    if (coverage >= this.thresholds.good) return 'good'
    if (coverage >= this.thresholds.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  private checkThresholds(total: CoverageReport['total']): boolean {
    return (
      total.lines.pct >= 90 &&
      total.functions.pct >= 90 &&
      total.statements.pct >= 90 &&
      total.branches.pct >= 85
    )
  }

  private generateRecommendations(
    files: CoverageAnalysis['files'],
    total: CoverageReport['total']
  ): string[] {
    const recommendations: string[] = []

    // Recommandations générales
    if (total.branches.pct < 85) {
      recommendations.push('Améliorer la couverture des branches (conditions if/else, switch)')
    }

    if (total.functions.pct < 90) {
      recommendations.push('Ajouter des tests pour les fonctions non couvertes')
    }

    if (total.lines.pct < 90) {
      recommendations.push('Augmenter la couverture des lignes de code')
    }

    // Recommandations spécifiques aux fichiers
    const poorFiles = files.filter(f => f.status === 'poor')
    if (poorFiles.length > 0) {
      recommendations.push(`Prioriser les tests pour: ${poorFiles.map(f => f.name).join(', ')}`)
    }

    const needsImprovementFiles = files.filter(f => f.status === 'needs-improvement')
    if (needsImprovementFiles.length > 0) {
      recommendations.push(`Améliorer les tests pour: ${needsImprovementFiles.map(f => f.name).join(', ')}`)
    }

    // Recommandations par type de fichier
    const componentFiles = files.filter(f => f.name.includes('/components/'))
    const lowCoverageComponents = componentFiles.filter(f => 
      Object.values(f.coverage).some(cov => cov < 85)
    )
    if (lowCoverageComponents.length > 0) {
      recommendations.push('Ajouter des tests d\'interaction pour les composants')
    }

    const serviceFiles = files.filter(f => f.name.includes('/services/'))
    const lowCoverageServices = serviceFiles.filter(f => 
      Object.values(f.coverage).some(cov => cov < 95)
    )
    if (lowCoverageServices.length > 0) {
      recommendations.push('Améliorer les tests des services (gestion d\'erreurs, edge cases)')
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellente couverture de test ! Maintenir ce niveau de qualité.')
    }

    return recommendations
  }

  generateReport(): string {
    const analysis = this.analyzeCoverage()
    
    let report = `
# 📊 Analyse de Couverture de Test Frontend

## 📈 Résumé
- **Fichiers analysés**: ${analysis.summary.totalFiles}
- **Couverture moyenne**: ${analysis.summary.averageCoverage.toFixed(2)}%
- **Seuils respectés**: ${analysis.summary.thresholdsMet ? '✅ Oui' : '❌ Non'}

## 📋 Détails par Type
- **Lignes**: ${analysis.details.lines.toFixed(2)}%
- **Fonctions**: ${analysis.details.functions.toFixed(2)}%
- **Instructions**: ${analysis.details.statements.toFixed(2)}%
- **Branches**: ${analysis.details.branches.toFixed(2)}%

## 📁 État des Fichiers
`

    const statusEmojis = {
      excellent: '🟢',
      good: '🟡',
      'needs-improvement': '🟠',
      poor: '🔴'
    }

    analysis.files.forEach(file => {
      const emoji = statusEmojis[file.status]
      report += `${emoji} **${file.name}** (${Object.values(file.coverage).reduce((a, b) => a + b, 0) / 4}%)\n`
    })

    report += `\n## 🎯 Recommandations\n`
    analysis.recommendations.forEach(rec => {
      report += `- ${rec}\n`
    })

    return report
  }

  saveReport(outputPath: string = './coverage/coverage-analysis.md'): void {
    const report = this.generateReport()
    writeFileSync(outputPath, report, 'utf-8')
    console.log(`📄 Rapport de couverture généré: ${outputPath}`)
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const analyzer = new CoverageAnalyzer()
  
  analyzer.loadCoverageData()
    .then(() => {
      analyzer.saveReport()
      console.log('✅ Analyse de couverture terminée')
    })
    .catch(error => {
      console.error('❌ Erreur lors de l\'analyse:', error.message)
      process.exit(1)
    })
}