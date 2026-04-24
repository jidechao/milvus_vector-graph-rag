// API Request Types

export interface QueryRequest {
  question: string
  graph_name?: string
  use_reranking?: boolean
  entity_top_k?: number
  relation_top_k?: number
  expansion_degree?: number
}

// API Response Types

export interface QueryResponse {
  question: string
  answer: string
  query_entities: string[]
  subgraph?: SubGraph
  retrieved_passages: string[]
  stats: Record<string, unknown>
  retrieval_detail?: RetrievalDetail
  rerank_result?: RerankResult
  eviction_result?: EvictionResult
}

export interface SubGraph {
  entity_ids: string[]
  relation_ids: string[]
  passage_ids: string[]
  entities: Entity[]
  relations: Relation[]
  passages: Passage[]
  expansion_history: ExpansionStep[]
}

export interface Entity {
  id: string
  name: string
  relation_ids: string[]
  passage_ids: string[]
}

export interface Relation {
  id: string
  text: string
  subject: string
  predicate: string
  object: string
  entity_ids: [string, string]
  passage_ids: string[]
}

export interface Passage {
  id: string
  text: string
}

export interface ExpansionStep {
  step: number
  operation: string
  description?: string
  added_entity_ids?: string[]
  added_relation_ids?: string[]
  new_entity_ids?: string[]
  new_relation_ids?: string[]
  total_entities: number
  total_relations: number
}

export interface RetrievalDetail {
  entity_ids: string[]
  entity_texts: string[]
  entity_scores: number[]
  relation_ids: string[]
  relation_texts: string[]
  relation_scores: number[]
}

export interface RerankResult {
  selected_relation_ids: string[]
  selected_relation_texts: string[]
}

export interface EvictionResult {
  occurred: boolean
  before_count: number
  after_count: number
}

// Graph Stats Response
export interface GraphStats {
  entity_count: number
  relation_count: number
  passage_count: number
  graph_name: string
}

// Graph Info (for listing available datasets)
export interface GraphInfo {
  name: string
  entity_collection: string
  relation_collection: string
  passage_collection: string
  has_all_collections: boolean
}

export interface ListGraphsResponse {
  graphs: GraphInfo[]
}

// System Settings
export interface SystemSettings {
  llm_model: string
  embedding_model: string
  embedding_dimension: number
  milvus_uri: string
  milvus_db: string | null
  openai_api_key_set: boolean
  openai_base_url: string | null
}

// Delete response
export interface DeleteResponse {
  success: boolean
  message: string
}

// Neighbors Response
export interface NeighborResponse {
  entity_id: string
  neighbors: Entity[]
  relations: Relation[]
}

// Documents
export interface DocumentResponse {
  id: string
  text: string
  entity_ids: string[]
  relation_ids: string[]
}

export interface ListDocumentsResponse {
  documents: DocumentResponse[]
  total: number
}

export interface UpdateDocumentRequest {
  text?: string
}

export interface TripletInput {
  subject: string
  predicate: string
  object: string
}

export interface AddDocumentsRequest {
  documents: string[]
  ids?: string[]
  extract_triplets?: boolean
  triplets?: TripletInput[][]
}

export interface AddDocumentsResponse {
  num_documents: number
  num_entities: number
  num_relations: number
  document_ids: string[]
}

// Import types
export interface ImportRequest {
  sources: string[]
  chunk_documents: boolean
  chunk_size: number
  chunk_overlap: number
  extract_triplets: boolean
  graph_name?: string
}

export interface ImportResponse {
  success: boolean
  num_sources: number
  num_documents: number
  num_chunks: number
  num_entities: number
  num_relations: number
  errors: string[]
}

export interface UploadOptions {
  chunkDocuments?: boolean
  chunkSize?: number
  chunkOverlap?: number
  extractTriplets?: boolean
  graphName?: string
}

// Graph Node status for visualization
export type NodeStatus = 'undiscovered' | 'seed' | 'expanded' | 'filtered' | 'selected'

// Timeline step status
export type StepStatus = 'pending' | 'active' | 'completed'

// Status assignment for each step
export interface StepNodeStatus {
  seedEntityIds: string[]
  seedRelationIds: string[]
  expandedEntityIds: string[]
  expandedRelationIds: string[]
  filteredRelationIds: string[]
  selectedRelationIds: string[]
}

export interface TimelineStep {
  id: string
  label: string
  status: StepStatus
  description?: string
  nodeStatus: StepNodeStatus
  stats?: {
    entityCount: number
    relationCount: number
  }
}

// SSE Stream Events
export interface StreamEvent {
  type: string
  message?: string
  [key: string]: unknown
}

