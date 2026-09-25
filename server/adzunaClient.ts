/**
 * Official Adzuna API Client for Skill2Career
 * Endpoints: https://api.adzuna.com/v1/api/jobs/{country}/search/{page}
 * Documentation: https://developer.adzuna.com/
 */

export interface AdzunaSearchParams {
  country?: string; // Default: 'in' for India
  page?: number;
  resultsPerPage?: number;
  what?: string; // Keywords, skills, or job title
  where?: string; // City, state, or 'India'
  distance?: number; // km
  sortBy?: 'relevance' | 'date' | 'salary';
  maxDaysOld?: number;
  fullTime?: boolean;
  partTime?: boolean;
  contract?: boolean;
  permanent?: boolean;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export interface AdzunaRawJob {
  id: string | number;
  title: string;
  description: string;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
    area?: string[];
  };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string | number | boolean;
  contract_type?: string;
  contract_time?: string;
  redirect_url: string;
  created: string;
  category?: {
    tag?: string;
    label?: string;
  };
  adref?: string;
  latitude?: number;
  longitude?: number;
}

export interface AdzunaSearchResponse {
  results: AdzunaRawJob[];
  count: number;
  mean?: number;
  __source?: string;
}

interface CacheEntry {
  data: AdzunaSearchResponse;
  timestamp: number;
}

export class AdzunaClient {
  private appId: string;
  private appKey: string;
  private baseUrl: string = 'https://api.adzuna.com/v1/api/jobs';
  private cache: Map<string, CacheEntry> = new Map();
  private cacheTtlMs: number = 15 * 60 * 1000; // 15 minutes TTL

  constructor() {
    this.appId = process.env.ADZUNA_APP_ID ? process.env.ADZUNA_APP_ID.trim() : '';
    this.appKey = process.env.ADZUNA_APP_KEY ? process.env.ADZUNA_APP_KEY.trim() : '';
  }

  /**
   * Refreshes credentials from environment (useful when user adds keys at runtime)
   */
  public refreshCredentials() {
    this.appId = process.env.ADZUNA_APP_ID ? process.env.ADZUNA_APP_ID.trim() : '';
    this.appKey = process.env.ADZUNA_APP_KEY ? process.env.ADZUNA_APP_KEY.trim() : '';
  }

  /**
   * Returns true if Adzuna API credentials are provided and non-placeholder
   */
  public isConfigured(): boolean {
    this.refreshCredentials();
    return Boolean(
      this.appId &&
      this.appKey &&
      !this.appId.includes('YOUR_') &&
      !this.appKey.includes('YOUR_') &&
      this.appId.length > 2 &&
      this.appKey.length > 5
    );
  }

  public getStatus() {
    return {
      configured: this.isConfigured(),
      provider: 'adzuna',
      default_country: 'in',
      cache_size: this.cache.size,
      attribution: 'Job vacancies data provided by Adzuna (https://www.adzuna.in)',
      app_id_set: Boolean(this.appId),
      app_key_set: Boolean(this.appKey),
    };
  }

  /**
   * Searches jobs using the official Adzuna Search API
   */
  public async searchJobs(params: AdzunaSearchParams = {}): Promise<{
    success: boolean;
    configured: boolean;
    data?: AdzunaSearchResponse;
    error?: string;
    fromCache?: boolean;
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        configured: false,
        error: 'Adzuna API credentials are not configured. Please set ADZUNA_APP_ID and ADZUNA_APP_KEY in your environment to fetch real-time Indian job vacancies.',
      };
    }

    const country = (params.country || 'in').toLowerCase().trim();
    const page = Math.max(1, params.page || 1);
    const resultsPerPage = Math.min(50, Math.max(1, params.resultsPerPage || 20));

    // Construct query parameters
    const queryParams = new URLSearchParams();
    queryParams.set('app_id', this.appId);
    queryParams.set('app_key', this.appKey);
    queryParams.set('results_per_page', String(resultsPerPage));
    queryParams.set('content-type', 'application/json');

    if (params.what && params.what.trim()) {
      queryParams.set('what', params.what.trim());
    }
    if (params.where && params.where.trim()) {
      queryParams.set('where', params.where.trim());
    }
    if (params.distance) {
      queryParams.set('distance', String(params.distance));
    }
    if (params.sortBy) {
      queryParams.set('sort_by', params.sortBy);
    }
    if (params.maxDaysOld) {
      queryParams.set('max_days_old', String(params.maxDaysOld));
    }
    if (params.fullTime) {
      queryParams.set('full_time', '1');
    }
    if (params.partTime) {
      queryParams.set('part_time', '1');
    }
    if (params.contract) {
      queryParams.set('contract', '1');
    }
    if (params.permanent) {
      queryParams.set('permanent', '1');
    }
    if (params.category) {
      queryParams.set('category', params.category);
    }
    if (params.salaryMin != null && params.salaryMin > 0) {
      queryParams.set('salary_min', String(params.salaryMin));
    }
    if (params.salaryMax != null && params.salaryMax > 0) {
      queryParams.set('salary_max', String(params.salaryMax));
    }

    // Cache key excludes secrets
    const cacheKey = `${country}_p${page}_r${resultsPerPage}_w:${params.what || ''}_l:${params.where || ''}_s:${params.sortBy || ''}_f:${params.fullTime ? 1 : 0}_p:${params.partTime ? 1 : 0}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return {
        success: true,
        configured: true,
        data: cached.data,
        fromCache: true,
      };
    }

    const endpoint = `${this.baseUrl}/${encodeURIComponent(country)}/search/${page}?${queryParams.toString()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Skill2Career-Platform/2.0 (Career Readiness & Placement)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            configured: true,
            error: 'Adzuna API authentication failed. Please verify that ADZUNA_APP_ID and ADZUNA_APP_KEY are valid for Adzuna Developer API.',
          };
        }
        if (response.status === 429) {
          return {
            success: false,
            configured: true,
            error: 'Adzuna API rate limit exceeded. Please wait a few moments before requesting more listings.',
          };
        }
        if (response.status === 404) {
          return {
            success: true,
            configured: true,
            data: { results: [], count: 0 },
          };
        }
        const errText = await response.text().catch(() => '');
        return {
          success: false,
          configured: true,
          error: `Adzuna API returned HTTP ${response.status}: ${errText.slice(0, 120)}`,
        };
      }

      const rawData = (await response.json()) as AdzunaSearchResponse;
      if (!rawData || !Array.isArray(rawData.results)) {
        return {
          success: true,
          configured: true,
          data: { results: [], count: 0 },
        };
      }

      // Save to cache
      this.cache.set(cacheKey, {
        data: rawData,
        timestamp: Date.now(),
      });

      return {
        success: true,
        configured: true,
        data: rawData,
        fromCache: false,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          configured: true,
          error: 'Adzuna API request timed out (10s limit exceeded). Please retry.',
        };
      }
      return {
        success: false,
        configured: true,
        error: `Could not connect to Adzuna API: ${err.message || 'Network error'}`,
      };
    }
  }
}

export const adzunaClient = new AdzunaClient();
