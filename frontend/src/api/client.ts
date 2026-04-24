import axios from 'axios'
import type {
  QueryRequest,
  QueryResponse,
  GraphStats,
  NeighborResponse,
  ListGraphsResponse,
  SystemSettings,
  DeleteResponse,
  DocumentResponse,
  ListDocumentsResponse,
  UpdateDocumentRequest,
  AddDocumentsRequest,
  AddDocumentsResponse,
  ImportRequest,
  ImportResponse,
  UploadOptions,
  StreamEvent,
} from '@/types/api'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Query the knowledge graph
  query: async (request: QueryRequest): Promise<QueryResponse> => {
    const { graph_name, ...body } = request
    const params = graph_name ? { graph_name } : {}
    const response = await apiClient.post<QueryResponse>('/query', body, { params })
    return response.data
  },

  // Query Stream
  queryStream: (
    request: QueryRequest,
    onMessage: (event: StreamEvent) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ) => {
    const { graph_name, ...body } = request
    const url = new URL('/api/query/stream', window.location.origin)
    if (graph_name) {
      url.searchParams.append('graph_name', graph_name)
    }

    let isAborted = false

    const fetchStream = async () => {
      try {
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader available')

        const decoder = new TextDecoder()
        let buffer = ''

        while (!isAborted) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim() === '') continue
            
            const dataMatch = line.match(/data:\s*(.*)/)
            
            if (dataMatch) {
              try {
                const data = JSON.parse(dataMatch[1]) as StreamEvent
                onMessage(data)
              } catch (e) {
                console.error('Failed to parse SSE data:', e)
              }
            }
          }
        }
        
        if (!isAborted) {
          onComplete()
        }
      } catch (error) {
        if (!isAborted) {
          onError(error instanceof Error ? error : new Error(String(error)))
        }
      }
    }

    fetchStream()

    return () => {
      isAborted = true
    }
  },

  // Get graph statistics
  getGraphStats: async (graphName: string): Promise<GraphStats> => {
    const response = await apiClient.get<GraphStats>(
      `/graph/${encodeURIComponent(graphName)}/stats`
    )
    return response.data
  },

  // Get entity neighbors (for lazy loading graph expansion)
  getNeighbors: async (
    entityId: string,
    graphName: string,
    limit: number = 20
  ): Promise<NeighborResponse> => {
    const response = await apiClient.get<NeighborResponse>(
      `/graph/${encodeURIComponent(graphName)}/neighbors/${encodeURIComponent(entityId)}`,
      { params: { limit } }
    )
    return response.data
  },

  // Health check
  health: async (): Promise<{ status: string; version: string }> => {
    const response = await apiClient.get<{ status: string; version: string }>('/health')
    return response.data
  },

  // List available graphs (datasets)
  listGraphs: async (): Promise<ListGraphsResponse> => {
    const response = await apiClient.get<ListGraphsResponse>('/graphs')
    return response.data
  },

  // Get system settings
  getSettings: async (): Promise<SystemSettings> => {
    const response = await apiClient.get<SystemSettings>('/settings')
    return response.data
  },

  // Delete a graph (knowledge base)
  deleteGraph: async (graphName: string): Promise<DeleteResponse> => {
    const response = await apiClient.delete<DeleteResponse>(
      `/graph/${encodeURIComponent(graphName)}`
    )
    return response.data
  },

  // Documents CRUD
  getDocuments: async (
    graphName?: string,
    query?: string,
    topK: number = 10
  ): Promise<ListDocumentsResponse> => {
    const response = await apiClient.get<ListDocumentsResponse>('/documents', {
      params: { graph_name: graphName, query, top_k: topK },
    })
    return response.data
  },

  getDocument: async (documentId: string, graphName?: string): Promise<DocumentResponse> => {
    const response = await apiClient.get<DocumentResponse>(`/documents/${documentId}`, {
      params: { graph_name: graphName },
    })
    return response.data
  },

  updateDocument: async (
    documentId: string,
    request: UpdateDocumentRequest,
    graphName?: string
  ): Promise<DocumentResponse> => {
    const response = await apiClient.put<DocumentResponse>(`/documents/${documentId}`, request, {
      params: { graph_name: graphName },
    })
    return response.data
  },

  deleteDocument: async (documentId: string, graphName?: string): Promise<DeleteResponse> => {
    const response = await apiClient.delete<DeleteResponse>(`/documents/${documentId}`, {
      params: { graph_name: graphName },
    })
    return response.data
  },

  // Ingestion
  addDocuments: async (
    request: AddDocumentsRequest,
    graphName?: string
  ): Promise<AddDocumentsResponse> => {
    const response = await apiClient.post<AddDocumentsResponse>('/add_documents', request, {
      params: { graph_name: graphName },
    })
    return response.data
  },
}

// Import documents from URLs or file paths
export async function importDocuments(request: ImportRequest): Promise<ImportResponse> {
  const response = await apiClient.post<ImportResponse>('/import', request)
  return response.data
}

// Upload files directly
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<ImportResponse> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  if (options.chunkDocuments !== undefined) {
    formData.append('chunk_documents', String(options.chunkDocuments))
  }
  if (options.chunkSize !== undefined) {
    formData.append('chunk_size', String(options.chunkSize))
  }
  if (options.chunkOverlap !== undefined) {
    formData.append('chunk_overlap', String(options.chunkOverlap))
  }
  if (options.extractTriplets !== undefined) {
    formData.append('extract_triplets', String(options.extractTriplets))
  }
  if (options.graphName) {
    formData.append('graph_name', options.graphName)
  }

  const response = await apiClient.post<ImportResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export default api
