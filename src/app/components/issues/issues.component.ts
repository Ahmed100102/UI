import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogService } from '../../services/LogService';

// Minimal interface for logs to replace any[]
interface Log {
  '@timestamp'?: string;
  level?: string;
  message?: string;
  log_message?: string;
  source?: string;
  _id?: string;
  _index?: string;
  [key: string]: any; // Allow additional properties
}

// Interface for Observix results with related logs
interface ObservixResultWithLog {
  log_id?: string;
  relatedLog?: Log | null;
  error_details?: any;
  rca_details?: any;
  remediation_plan?: any;
  risk_assessment?: any;
  required_resources?: any;
  timestamp?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssuesComponent implements OnInit {
  logs: Log[] = [];
  filteredLogs: Log[] = [];
  issuesOnlyLogs: Log[] = []; // ✅ NEW: Only logs that have corresponding Observix results
  observixResults: any[] = [];
  observixResultsWithLogs: ObservixResultWithLog[] = []; // ✅ NEW: Observix results with related logs
  selectedPlatform: string = 'all';
  selectedAnalysis: any | null = null;
  isAnalyzing: boolean = false;
  isLoadingObservix: boolean = false;
  isLoadingObservixWithLogs: boolean = false; // ✅ NEW: Loading state for observix with logs
  isLoadingIssues: boolean = false; // ✅ NEW: Loading state for issues filtering

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    // Load Observix results first, then filter logs based on those results
    this.loadObservixResultsAndFilterLogs();
  }

  // ✅ NEW METHOD: Load Observix results first, then filter logs to show only issues
  loadObservixResultsAndFilterLogs(): void {
    this.isLoadingIssues = true;
    this.isLoadingObservix = true;

    // First, get all Observix results with their related logs
    this.logService.getObservixResultsWithRelatedLogs().subscribe({
      next: (observixData) => {
        console.log('Résultats Observix avec logs associés récupérés :', observixData);
        this.observixResultsWithLogs = observixData;
        this.observixResults = observixData; // Keep for compatibility
        this.isLoadingObservix = false;

        // Extract log IDs that exist in Observix results
        const logIdsInObservix = new Set(
          observixData
            .map(result => result.log_id)
            .filter(id => id) // Remove null/undefined IDs
        );

        console.log('Log IDs trouvés dans Observix :', Array.from(logIdsInObservix));

        if (logIdsInObservix.size === 0) {
          console.warn('Aucun log_id trouvé dans les résultats Observix');
          this.issuesOnlyLogs = [];
          this.filteredLogs = [];
          this.isLoadingIssues = false;
          return;
        }

        // Get only the logs that have IDs present in Observix results
        this.logService.getLogsByIds(Array.from(logIdsInObservix)).subscribe({
          next: (issuesLogs) => {
            console.log(`Logs d'issues récupérés: ${issuesLogs.length}`);
            
            // Add source information based on index
            this.issuesOnlyLogs = issuesLogs.map(log => ({
              ...log,
              source: this.getSourceFromIndex(log._index || '')
            }));
            
            this.logs = this.issuesOnlyLogs; // Set as main logs
            this.filteredLogs = this.issuesOnlyLogs; // Initialize filtered logs
            this.isLoadingIssues = false;
            
            console.log('Issues logs avec source :', this.issuesOnlyLogs);
          },
          error: (err) => {
            console.error('Erreur lors du chargement des logs d\'issues :', err);
            this.isLoadingIssues = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des résultats Observix :', err);
        this.isLoadingObservix = false;
        this.isLoadingIssues = false;
      }
    });
  }

  // ✅ NEW METHOD: Determine source from index name
  getSourceFromIndex(indexName: string): string {
    if (indexName.includes('vgm')) return 'vgm';
    if (indexName.includes('fiscd')) return 'fiscd';
    if (indexName.includes('netprobe')) return 'netprobe';
    if (indexName.includes('observix')) return 'observix';
    return 'unknown';
  }

  // ✅ NEW METHOD: Get a specific log by ID
  getLogById(logId: string): void {
    this.logService.getLogById(logId).subscribe({
      next: (log) => {
        if (log) {
          console.log('Log récupéré par ID :', log);
          // You can do something with the log here, like display it in a modal
          this.displayLogDetails(log);
        } else {
          console.warn(`Aucun log trouvé avec l'ID : ${logId}`);
        }
      },
      error: (err) => {
        console.error(`Erreur lors de la récupération du log avec ID ${logId} :`, err);
      }
    });
  }

  // ✅ NEW METHOD: Display log details (you can customize this)
  displayLogDetails(log: Log): void {
    // This could open a modal, navigate to a detail page, etc.
    console.log('Affichage des détails du log :', log);
    // Example: Set it as selected analysis for display
    this.selectedAnalysis = {
      log: log,
      _source: { 
        error_details: { 
          log_message: log.message || log.log_message,
          timestamp: log['@timestamp']
        }
      }
    };
  }

  // ✅ UPDATED METHOD: View Observix result with related log
  viewObservixResultWithLog(result: ObservixResultWithLog): void {
    this.selectedAnalysis = {
      log: result.relatedLog || {
        message: result.error_details?.log_message || 'Message non disponible',
        source: 'observix',
        timestamp: result.error_details?.timestamp || result.timestamp
      },
      _source: result,
      relatedLog: result.relatedLog // ✅ Include the related log
    };
    console.log('selectedAnalysis avec log associé :', this.selectedAnalysis);
  }

  filterByPlatform(platform: string): void {
    this.selectedPlatform = platform;
    // Filter from issuesOnlyLogs instead of all logs
    this.filteredLogs = platform === 'all'
      ? this.issuesOnlyLogs
      : this.issuesOnlyLogs.filter(log => log.source === platform);
  }

  getSourceIcon(source: string): string {
    const iconMap: { [key: string]: string } = {
      'vgm': 'server',
      'fiscd': 'database',
      'netprobe': 'network-wired',
      'observix': 'chart-line',
      'default': 'file-alt'
    };
    return iconMap[source] || iconMap['default'];
  }

  analyze(log: any): void {
    const message = log.log_message || log.message;
    if (!message) {
      alert('❗ Aucun message à analyser pour ce log.');
      return;
    }
    this.isAnalyzing = true;
    this.selectedAnalysis = null;
    this.logService.getObservixAnalysis(message).subscribe({
      next: (analyses) => {
        this.isAnalyzing = false;
        if (analyses.length > 0) {
          this.selectedAnalysis = {
            log,
            _source: analyses[0] // Ensure _source structure
          };
          console.log('selectedAnalysis après analyse :', this.selectedAnalysis);
        } else {
          alert('❗ Aucune analyse trouvée pour ce log.');
        }
      },
      error: (error) => {
        this.isAnalyzing = false;
        console.error('Erreur lors de l\'analyse :', error);
        alert('❌ Erreur lors de la récupération de l\'analyse. Veuillez réessayer.');
      }
    });
  }

  viewObservixResult(result: any): void {
    this.selectedAnalysis = {
      log: {
        message: result.error_details?.log_message || 'Message non disponible',
        source: 'observix',
        timestamp: result.error_details?.timestamp || result.timestamp
      },
      _source: result // Ensure _source structure
    };
    console.log('selectedAnalysis après viewObservixResult :', this.selectedAnalysis);
  }

  getAllDisplayedMessages(): string[] {
    const messages: string[] = [];

    if (this.selectedAnalysis?.log?.message) {
      messages.push(this.selectedAnalysis.log.message);
    }

    // Use observixResultsWithLogs instead of observixResults for better data
    this.observixResultsWithLogs.forEach(result => {
      const msg = result.error_details?.log_message;
      if (msg) {
        messages.push(msg);
      }
    });

    return messages;
  }

  getAllAnalysisMessages(): string[] {
    const messages: string[] = [];

    // Use observixResultsWithLogs instead of observixResults for better data
    this.observixResultsWithLogs.forEach(result => {
      const rca = result.rca_details || {};
      const remediation = result.remediation_plan || {};
      const risks = result.risk_assessment?.potential_risks || [];
      const resources = result.required_resources || [];

      messages.push(...(result.error_details?.log_message || []));
      messages.push(...(result.error_details?.summary || []));
      messages.push(...(rca.summary || []));
      messages.push(...(rca.detailed_analysis || []));
      messages.push(...(rca.recommended_actions || []));

      rca.root_causes?.forEach((rc: any) => {
        messages.push(...(rc.cause || []));
        messages.push(...(rc.technical_details || []));
        messages.push(...(rc.impact_areas || []));
      });

      messages.push(...(rca.system_state?.environmental_factors || []));
      messages.push(...(rca.system_state?.error_patterns || []));
      messages.push(...(rca.system_state?.affected_components || []));

      messages.push(...(remediation.summary || []));
      remediation.steps?.forEach((step: any) => {
        messages.push(...(step.purpose || []));
        messages.push(...(step.action || []));
        messages.push(...(step.fallback || []));
        messages.push(...(step.verification || []));
        messages.push(...(step.expected_outcome || []));
      });

      risks.forEach((risk: any) => {
        messages.push(...(risk.risk || []));
        messages.push(...(risk.mitigation || []));
      });

      resources.forEach((res: any) => {
        messages.push(...(res.description || []));
        messages.push(...(res.reason || []));
      });
    });

    return messages;
  }

  // ✅ NEW METHOD: Get count of issues by platform
  getIssuesCountByPlatform(): { [key: string]: number } {
    const counts: { [key: string]: number } = {
      all: this.issuesOnlyLogs.length,
      vgm: 0,
      fiscd: 0,
      netprobe: 0,
      observix: 0,
      unknown: 0
    };

    this.issuesOnlyLogs.forEach(log => {
      const source = log.source || 'unknown';
      counts[source] = (counts[source] || 0) + 1;
    });

    return counts;
  }

  // ✅ NEW METHOD: Check if there are any issues
  hasIssues(): boolean {
    return this.issuesOnlyLogs.length > 0;
  }

  // ✅ NEW METHOD: Get loading state for UI
  isLoading(): boolean {
    return this.isLoadingIssues || this.isLoadingObservix;
  }
}