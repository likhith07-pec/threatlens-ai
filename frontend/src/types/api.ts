export type InvestigationStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'cancelled';

export type VerificationState =
  | 'verified'
  | 'partially_supported'
  | 'contradicted'
  | 'insufficient_evidence'
  | 'needs_review';

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface ErrorResponse {
  detail: string;
  code: string;
}

export interface HealthResponse {
  status: string;
  integrations: {
    tinyfish?: string;
    nvd?: string;
    cisa_kev?: string;
    gemini?: string;
    [key: string]: string | undefined;
  };
}

export interface CreateInvestigationRequest {
  cve_id: string;
}

export interface CreateInvestigationResponse {
  id: string;
  status: InvestigationStatus;
}

export interface InvestigationListItem {
  id: string;
  cve_id: string;
  status: InvestigationStatus;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
  progress_stage?: string | null;
  error_summary?: string | null;
  summary?: string | null;
}

export interface InvestigationListResponse {
  items: InvestigationListItem[];
  total: number;
}

export interface InvestigationDetail {
  id: string;
  cve_id: string;
  status: InvestigationStatus;
  progress_stage?: string | null;
  error_summary?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  summary?: string | null;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  source_type: string;
  domain?: string;
  retrieved_at: string;
  published_at?: string | null;
  excerpt?: string;
  content_hash?: string;
}

export interface EvidenceItem {
  id: string;
  source_id: string;
  excerpt: string;
  retrieved_at: string;
  verification_state: VerificationState;
  provenance: {
    provider: string;
    metadata?: Record<string, any>;
  };
}

export interface Claim {
  id: string;
  claim_type: string;
  subject: string;
  value: string;
  text: string;
  verification_state: VerificationState;
  evidence_ids: string[];
  rationale?: string;
}

export interface EvidenceResponse {
  sources: Source[];
  evidence: EvidenceItem[];
  claims: Claim[];
}

export interface GraphNode {
  id: string;
  type: 'claim' | 'source' | 'evidence';
  label: string;
  verification_state?: VerificationState;
  source_type?: string;
  data?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: 'supported' | 'contradicted' | 'context' | 'cites';
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ContradictionItem {
  id: string;
  investigation_id?: string;
  claim_a: Claim;
  claim_b: Claim;
  conflict_category: string;
  explanation: string;
  context_considered?: string;
  review_status: 'unresolved' | 'acknowledged' | 'dismissed';
}

export interface RiskSignal {
  name: string;
  weight: number;
  status: 'verified' | 'unconfirmed' | 'missing';
  explanation: string;
}

export interface RiskAssessmentData {
  cve_id: string;
  cvss_score?: number | null;
  cvss_version?: string | null;
  cvss_severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  threatlens_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cisa_kev_listed: boolean;
  in_the_wild_exploit: boolean;
  patch_available: boolean;
  confidence_score: number;
  signals: RiskSignal[];
}

export interface ReportResponse {
  id: string;
  generated_at: string;
  format_version: string;
  content: {
    markdown: string;
    json: Record<string, any>;
  };
}

