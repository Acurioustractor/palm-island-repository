/**
 * Empathy Ledger v2 API Client
 *
 * Typed client for the Empathy Ledger platform's intake and syndication APIs.
 * Reads configuration from environment variables:
 *   - EMPATHY_LEDGER_API_URL      — base URL (e.g. https://empathy-ledger.vercel.app)
 *   - EMPATHY_LEDGER_INTAKE_KEY   — X-Intake-Key for intake routes
 *   - EMPATHY_LEDGER_API_KEY      — X-API-Key for syndication routes
 */

// ---------------------------------------------------------------------------
// Request / Response Types
// ---------------------------------------------------------------------------

export interface CreateStorytellerRequest {
  profile_id: string;
  display_name: string;
  location?: string;
  cultural_background?: string;
  bio?: string;
  public_avatar_url?: string;
}

export interface CreateStorytellerResponse {
  storyteller: { id: string; display_name: string };
}

export interface CreateStoryRequest {
  storyteller_id: string;
  project_id?: string;
  title?: string;
  video_link?: string;
  content?: string;
  cultural_sensitivity_level?: string;
  has_explicit_consent?: boolean;
  privacy_level?: string;
}

export interface CreateStoryResponse {
  story: { id: string; title: string };
}

export interface LinkMediaRequest {
  story_id: string;
  media_ids: string[];
}

export interface LinkMediaResponse {
  linked: number;
}

export interface LinkProjectRequest {
  storyteller_id: string;
  project_id: string;
}

export interface LinkProjectResponse {
  linked: true;
  id: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
  abn?: string;
  type?: string;
  description?: string;
  cultural_focus?: string;
  geographic_focus?: string;
  settings?: {
    elder_review_required?: boolean;
    [key: string]: unknown;
  };
  project?: {
    name: string;
    description?: string;
  };
}

export interface CreateOrganizationResponse {
  id: string;
  name: string;
  slug: string;
  tenant_id: string;
  project?: { id: string; name: string };
}

export interface ImportMediaItem {
  external_id: string;
  source_url: string;
  file_type: string;
  title?: string;
  description?: string;
  storyteller_id?: string;
  story_id?: string;
  organization_id?: string;
  tags?: string[];
  cultural_sensitivity_level?: string;
  consent_status?: string;
  metadata?: Record<string, any>;
}

export interface ImportMediaRequest {
  items: ImportMediaItem[];
  source_platform: string;
}

export interface ImportMediaResponse {
  imported: number;
  media_ids: string[];
  errors: string[];
}

export interface SyndicateContentRequest {
  contentType: string;
  contentId: string;
  destinationType: string;
  attributionText: string;
  requestedBy?: string;
}

export interface SyndicateContentResponse {
  syndicationId: string;
  status: string;
  message: string;
}

export interface GetSyndicationStatusResponse {
  syndications: unknown[];
  total: number;
}

// ---------------------------------------------------------------------------
// Error wrapper
// ---------------------------------------------------------------------------

export class EmpathyLedgerError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'EmpathyLedgerError';
  }
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class EmpathyLedgerClient {
  private baseUrl: string;
  private intakeKey: string;
  private apiKey: string;

  constructor(opts?: {
    baseUrl?: string;
    intakeKey?: string;
    apiKey?: string;
  }) {
    this.baseUrl = (opts?.baseUrl ?? process.env.EMPATHY_LEDGER_API_URL ?? '').replace(/\/$/, '');
    this.intakeKey = opts?.intakeKey ?? process.env.EMPATHY_LEDGER_INTAKE_KEY ?? '';
    this.apiKey = opts?.apiKey ?? process.env.EMPATHY_LEDGER_API_KEY ?? '';

    if (!this.baseUrl) {
      throw new Error('EmpathyLedgerClient: EMPATHY_LEDGER_API_URL is required');
    }
  }

  // ---- helpers ------------------------------------------------------------

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    opts: {
      body?: unknown;
      auth: 'intake' | 'api';
    }
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (opts.auth === 'intake') {
      if (!this.intakeKey) throw new Error('EmpathyLedgerClient: EMPATHY_LEDGER_INTAKE_KEY is required for intake routes');
      headers['X-Intake-Key'] = this.intakeKey;
    } else {
      if (!this.apiKey) throw new Error('EmpathyLedgerClient: EMPATHY_LEDGER_API_KEY is required for syndication routes');
      headers['X-API-Key'] = this.apiKey;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (!res.ok) {
      throw new EmpathyLedgerError(
        `EL API ${method} ${path} failed with ${res.status}`,
        res.status,
        json
      );
    }

    return json as T;
  }

  // ---- intake routes ------------------------------------------------------

  async createStoryteller(
    data: CreateStorytellerRequest
  ): Promise<CreateStorytellerResponse> {
    return this.request<CreateStorytellerResponse>('POST', '/api/intake/create-storyteller', {
      body: data,
      auth: 'intake',
    });
  }

  async createStory(data: CreateStoryRequest): Promise<CreateStoryResponse> {
    return this.request<CreateStoryResponse>('POST', '/api/intake/create-story', {
      body: data,
      auth: 'intake',
    });
  }

  async linkMedia(data: LinkMediaRequest): Promise<LinkMediaResponse> {
    return this.request<LinkMediaResponse>('POST', '/api/intake/link-media', {
      body: data,
      auth: 'intake',
    });
  }

  async importMedia(data: ImportMediaRequest): Promise<ImportMediaResponse> {
    return this.request<ImportMediaResponse>('POST', '/api/intake/import-media', {
      body: data,
      auth: 'intake',
    });
  }

  async linkProject(data: LinkProjectRequest): Promise<LinkProjectResponse> {
    return this.request<LinkProjectResponse>('POST', '/api/intake/link-project', {
      body: data,
      auth: 'intake',
    });
  }

  // ---- syndication routes -------------------------------------------------

  async syndicateContent(
    data: SyndicateContentRequest
  ): Promise<SyndicateContentResponse> {
    return this.request<SyndicateContentResponse>('POST', '/api/v1/content-hub/syndicate', {
      body: data,
      auth: 'api',
    });
  }

  async getSyndicationStatus(
    contentId: string
  ): Promise<GetSyndicationStatusResponse> {
    return this.request<GetSyndicationStatusResponse>(
      'GET',
      `/api/v1/content-hub/syndicate?contentId=${encodeURIComponent(contentId)}`,
      { auth: 'api' }
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton helper
// ---------------------------------------------------------------------------

let _client: EmpathyLedgerClient | null = null;

/**
 * Returns a singleton EmpathyLedgerClient instance.
 * Reads configuration from process.env on first call.
 */
export function getClient(): EmpathyLedgerClient {
  if (!_client) {
    _client = new EmpathyLedgerClient();
  }
  return _client;
}
