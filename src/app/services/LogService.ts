import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, expand, map, takeWhile, toArray, switchMap, forkJoin, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogService {
  private baseUrl = '/elasticsearch';

  constructor(private http: HttpClient) {}

  getLogs(index: string = '*'): Observable<any> {
    const url = `${this.baseUrl}/${index}/_search?pretty=true&size=10000`;
    const body = {
      size: 10000,
      query: {
        match_all: {}
      }
    };
    return this.http.post(url, body);
  }

  getAllLogs(): Observable<any[]> {
    const initialUrl = `${this.baseUrl}/*/_search?scroll=1m`;
    const body = {
      size: 10000,
      sort: ['@timestamp'],
      query: {
        match_all: {}
      }
    };

    return this.http.post<any>(initialUrl, body).pipe(
      expand(response => {
        const scrollId = response._scroll_id;
        if (!scrollId || response.hits.hits.length === 0) {
          return of(null);
        }
        return this.http.post<any>(`${this.baseUrl}/_search/scroll`, {
          scroll: '1m',
          scroll_id: scrollId
        });
      }),
      takeWhile(response => response !== null && response.hits.hits.length > 0),
      map(response => response.hits.hits.map((hit: any) => hit._source)),
      toArray(),
      map(results => results.flat())
    );
  }

  getAllVgmLogs(): Observable<any[]> {
    const indexPattern = 'logstash-vgm*';
    const initialUrl = `${this.baseUrl}/${indexPattern}/_search?scroll=2m`;
    const body = {
      size: 10000,
      sort: ['_doc'],
      query: {
        match_all: {}
      }
    };
    
    return this.http.post<any>(initialUrl, body).pipe(
      expand(response => {
        const scrollId = response._scroll_id;
        if (!scrollId || response.hits.hits.length === 0) {
          return of(null);
        }
        return this.http.post<any>(`${this.baseUrl}/_search/scroll`, {
          scroll: '2m',
          scroll_id: scrollId
        });
      }),
      takeWhile(response => response !== null && response.hits.hits.length > 0),
      map(response => response.hits.hits.map((hit: any) => ({
        ...hit._source,
        _index: hit._index
      }))),
      toArray(),
      map(results => results.flat())
    );
  }

  getAllFiscdLogs(): Observable<any[]> {
    const indexPattern = 'logstash-fiscd*';
    const initialUrl = `${this.baseUrl}/${indexPattern}/_search?scroll=2m`;
    const body = {
      size: 10000,
      sort: ['_doc'],
      query: {
        match_all: {}
      }
    };

    return this.http.post<any>(initialUrl, body).pipe(
      expand(response => {
        const scrollId = response._scroll_id;
        if (!scrollId || response.hits.hits.length === 0) {
          return of(null);
        }
        return this.http.post<any>(`${this.baseUrl}/_search/scroll`, {
          scroll: '2m',
          scroll_id: scrollId
        });
      }),
      takeWhile(response => response !== null && response.hits.hits.length > 0),
      map(response => response.hits.hits.map((hit: any) => ({
        ...hit._source,
        _index: hit._index
      }))),
      toArray(),
      map(results => results.flat())
    );
  }

  getFilteredLogs(startDate: string, endDate: string, errorType: string, index: string = '*'): Observable<any> {
    const must: any[] = [];

    if (startDate && endDate) {
      must.push({
        range: {
          '@timestamp': {
            gte: `${startDate}T00:00:00`,
            lte: `${endDate}T23:59:59`
          }
        }
      });
    }

    if (errorType) {
      must.push({
        match: {
          level: errorType
        }
      });
    }

    const body = {
      size: 10000,
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }]
        }
      }
    };

    const url = `${this.baseUrl}/${index}/_search?pretty=true&size=10000`;
    return this.http.post(url, body);
  }

  getFiscdLogs(): Observable<any> {
    const index = 'logstash-fiscd*';
    const url = `${this.baseUrl}/${index}/_search?pretty=true&size=10000`;
    const body = {
      size: 10000,
      query: {
        match_all: {}
      }
    };
    return this.http.post(url, body);
  }

  getAllIndices(): Observable<string[]> {
    const url = `${this.baseUrl}/_cat/indices?format=json`;
    return this.http.get<any[]>(url).pipe(
      map(indices => indices.map(index => index.index)),
      map(indices => indices.filter(index => !index.startsWith('.')))
    );
  }

  getAllLogsByIndex(): Observable<any[]> {
    return this.getAllIndices().pipe(
      switchMap(indices => {
        const requests = indices.map(index =>
          this.getLogs(index).pipe(
            map((res: any) => res?.hits?.hits?.map((hit: any) => ({
              ...hit._source,
              _index: hit._index
            })) || []),
            catchError(() => of([]))
          )
        );
        return forkJoin(requests);
      }),
      map(results => results.flat())
    );
  }

  getObservixResults(): Observable<any[]> {
    const index = 'observix-results-2025.06';
    const url = `${this.baseUrl}/${index}/_search?pretty=true&size=10000`;
    const body = {
      size: 10000,
      query: {
        match_all: {}
      },
      sort: [
        { "error_details.timestamp": { order: "desc" } }
      ]
    };

    return this.http.post<any>(url, body).pipe(
      map(response => response.hits.hits.map((hit: any) => hit._source))
    );
  }

  getAllObservixResults(index: string = 'observix-results-*'): Observable<any[]> {
    const initialUrl = `${this.baseUrl}/${index}/_search?scroll=2m`;
    const body = {
      size: 10000,
      sort: [{ "error_details.timestamp": { order: "desc" } }],
      query: {
        match_all: {}
      }
    };

    return this.http.post<any>(initialUrl, body).pipe(
      expand(response => {
        const scrollId = response._scroll_id;
        if (!scrollId || response.hits.hits.length === 0) {
          return of(null);
        }
        return this.http.post<any>(`${this.baseUrl}/_search/scroll`, {
          scroll: '2m',
          scroll_id: scrollId
        });
      }),
      takeWhile(response => response !== null && response.hits.hits.length > 0),
      map(response => response.hits.hits.map((hit: any) => ({
        ...hit._source,
        _index: hit._index,
        _id: hit._id
      }))),
      toArray(),
      map(results => results.flat()),
      catchError(err => {
        console.error('Erreur lors de la récupération de tous les résultats Observix :', err);
        return of([]);
      })
    );
  }

  // ✅ NOUVELLE MÉTHODE pour récupérer TOUS les logs des plateformes VGM et FISCD
  getAllPlatformLogs(): Observable<any[]> {
    const vgm$ = this.getAllVgmLogs().pipe(
      map(logs => logs.map(log => ({ ...log, source: 'vgm' }))),
      catchError(err => {
        console.error('Erreur lors de la récupération des logs VGM :', err);
        return of([]);
      })
    );

    const fiscd$ = this.getAllFiscdLogs().pipe(
      map(logs => logs.map(log => ({ ...log, source: 'fiscd' }))),
      catchError(err => {
        console.error('Erreur lors de la récupération des logs FISCD :', err);
        return of([]);
      })
    );

    return forkJoin([vgm$, fiscd$]).pipe(
      map(([vgmLogs, fiscdLogs]) => {
        console.log(`Logs VGM récupérés: ${vgmLogs.length}`);
        console.log(`Logs FISCD récupérés: ${fiscdLogs.length}`);
        return [...vgmLogs, ...fiscdLogs];
      }),
      catchError(err => {
        console.error('Erreur lors de la récupération des logs des plateformes :', err);
        return of([]);
      })
    );
  }

  // ✅ ANCIENNE MÉTHODE - conservée pour compatibilité mais modifiée pour récupérer plus de données
  getPlatformLogs(): Observable<any[]> {
    const vgmIndex = 'logstash-vgm*'; // Utilise le pattern au lieu d'un index spécifique
    const fiscdIndex = 'logstash-fiscd*';
    const netprobeIndex = 'logstash-netprobe*';

    // Récupérer TOUS les logs, pas seulement ERROR et WARN
    const defaultBody = {
      size: 10000,
      query: {
        match_all: {}
      },
      sort: [{ "@timestamp": { order: "desc" } }]
    };

    const vgm$ = this.http.post<any>(`${this.baseUrl}/${vgmIndex}/_search`, defaultBody).pipe(
      map(res => res.hits.hits.map((hit: any) => ({ ...hit._source, source: 'vgm' }))),
      catchError(err => {
        console.error('Erreur VGM :', err);
        return of([]);
      })
    );

    const fiscd$ = this.http.post<any>(`${this.baseUrl}/${fiscdIndex}/_search`, defaultBody).pipe(
      map(res => res.hits.hits.map((hit: any) => ({ ...hit._source, source: 'fiscd' }))),
      catchError(err => {
        console.error('Erreur FISCD :', err);
        return of([]);
      })
    );

    const netprobe$ = this.http.post<any>(`${this.baseUrl}/${netprobeIndex}/_search`, defaultBody).pipe(
      map(res => res.hits.hits.map((hit: any) => ({ ...hit._source, source: 'netprobe' }))),
      catchError(() => of([]))
    );

    return forkJoin([vgm$, fiscd$, netprobe$]).pipe(
      map(([vgmLogs, fiscdLogs, netprobeLogs]) => {
        console.log(`Logs récupérés - VGM: ${vgmLogs.length}, FISCD: ${fiscdLogs.length}, NetProbe: ${netprobeLogs.length}`);
        return [...vgmLogs, ...fiscdLogs, ...netprobeLogs];
      })
    );
  }

  getObservixAnalysis(logMessage: string): Observable<any[]> {
    const index = 'observix-results-2025.06';
    const url = `${this.baseUrl}/${index}/_search`;
    const body = {
      size: 10,
      query: {
        match: {
          "error_details.log_message": logMessage
        }
      }
    };

    return this.http.post<any>(url, body).pipe(
      map(res => res.hits?.hits?.map((hit: any) => hit._source) || []),
      catchError(err => {
        console.error("Erreur lors de la récupération de l'analyse Observix :", err);
        return of([]);
      })
    );
  }

  // ✅ NOUVELLES MÉTHODES NÉCESSAIRES POUR LE COMPOSANT ISSUES

  /**
   * Récupère un log spécifique par son ID
   */
  getLogById(logId: string): Observable<any> {
    const url = `${this.baseUrl}/*/_search`;
    const body = {
      size: 1,
      query: {
        term: {
          "_id": logId
        }
      }
    };

    return this.http.post<any>(url, body).pipe(
      map(response => {
        const hits = response.hits?.hits || [];
        if (hits.length > 0) {
          return {
            ...hits[0]._source,
            _id: hits[0]._id,
            _index: hits[0]._index
          };
        }
        return null;
      }),
      catchError(err => {
        console.error(`Erreur lors de la récupération du log avec ID ${logId} :`, err);
        return of(null);
      })
    );
  }

  /**
   * Récupère plusieurs logs par leurs IDs
   */
  getLogsByIds(logIds: string[]): Observable<any[]> {
    if (!logIds || logIds.length === 0) {
      return of([]);
    }

    const url = `${this.baseUrl}/*/_search`;
    const body = {
      size: logIds.length,
      query: {
        terms: {
          "_id": logIds
        }
      }
    };

    return this.http.post<any>(url, body).pipe(
      map(response => {
        const hits = response.hits?.hits || [];
        return hits.map((hit: any) => ({
          ...hit._source,
          _id: hit._id,
          _index: hit._index
        }));
      }),
      catchError(err => {
        console.error('Erreur lors de la récupération des logs par IDs :', err);
        return of([]);
      })
    );
  }

  /**
   * Récupère tous les résultats Observix avec leurs logs associés
   */
  getObservixResultsWithRelatedLogs(): Observable<any[]> {
    return this.getAllObservixResults().pipe(
      switchMap(observixResults => {
        console.log(`Résultats Observix trouvés: ${observixResults.length}`);
        
        if (observixResults.length === 0) {
          return of([]);
        }

        // Extraire tous les log_ids des résultats Observix
        const logIds = observixResults
          .map(result => result.log_id)
          .filter(id => id && id.trim() !== ''); // Filtrer les IDs vides ou null

        console.log(`Log IDs extraits des résultats Observix: ${logIds.length}`, logIds);

        if (logIds.length === 0) {
          // Si aucun log_id n'est trouvé, retourner les résultats sans logs associés
          return of(observixResults.map(result => ({
            ...result,
            relatedLog: null
          })));
        }

        // Récupérer les logs correspondants
        return this.getLogsByIds(logIds).pipe(
          map(logs => {
            // Créer un map des logs par ID pour une recherche rapide
            const logsMap = new Map();
            logs.forEach(log => {
              if (log._id) {
                logsMap.set(log._id, log);
              }
            });

            // Associer chaque résultat Observix à son log correspondant
            return observixResults.map(result => ({
              ...result,
              relatedLog: result.log_id ? logsMap.get(result.log_id) || null : null
            }));
          }),
          catchError(err => {
            console.error('Erreur lors de la récupération des logs associés :', err);
            // En cas d'erreur, retourner les résultats sans logs associés
            return of(observixResults.map(result => ({
              ...result,
              relatedLog: null
            })));
          })
        );
      }),
      catchError(err => {
        console.error('Erreur lors de la récupération des résultats Observix avec logs associés :', err);
        return of([]);
      })
    );
  }

  /**
   * Récupère tous les logs qui ont des analyses Observix associées
   */
  getLogsWithObservixAnalysis(): Observable<any[]> {
    return this.getObservixResultsWithRelatedLogs().pipe(
      map(observixResults => {
        return observixResults
          .filter(result => result.relatedLog !== null)
          .map(result => ({
            ...result.relatedLog,
            observixAnalysis: result
          }));
      })
    );
  }

  /**
   * Recherche des logs par pattern de message
   */
  searchLogsByMessage(messagePattern: string, index: string = '*'): Observable<any[]> {
    const url = `${this.baseUrl}/${index}/_search`;
    const body = {
      size: 1000,
      query: {
        multi_match: {
          query: messagePattern,
          fields: ['message', 'log_message', 'msg'],
          type: 'phrase_prefix'
        }
      },
      sort: [{ "@timestamp": { order: "desc" } }]
    };

    return this.http.post<any>(url, body).pipe(
      map(response => {
        const hits = response.hits?.hits || [];
        return hits.map((hit: any) => ({
          ...hit._source,
          _id: hit._id,
          _index: hit._index
        }));
      }),
      catchError(err => {
        console.error('Erreur lors de la recherche de logs par message :', err);
        return of([]);
      })
    );
  }
}