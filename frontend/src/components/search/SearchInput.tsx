import { useState, useCallback, useRef } from 'react'
import { Search, Loader2, X, Zap } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useSearchStore } from '@/stores/searchStore'
import { useGraphStore } from '@/stores/graphStore'
import { useDatasetStore } from '@/stores/datasetStore'
import { useSearch } from '@/api/queries'
import { api } from '@/api/client'
import type { QueryResponse } from '@/types/api'

function SearchInput() {
  const [inputValue, setInputValue] = useState('')
  const [useStream, setUseStream] = useState(false)
  const { setQuery, setSearching, setResult, setError, reset } = useSearchStore()
  const { setSubgraph, clearGraph } = useGraphStore()
  const { currentDataset } = useDatasetStore()
  const abortControllerRef = useRef<(() => void) | null>(null)

  const searchMutation = useSearch()

  const handleSearch = useCallback(async () => {
    const query = inputValue.trim()
    if (!query || searchMutation.isPending || abortControllerRef.current) return

    setQuery(query)
    setSearching(true)
    setError(null)
    clearGraph()

    if (useStream) {
      const partialResult: Partial<QueryResponse> = {
        question: query,
        answer: '',
        query_entities: [],
        retrieved_passages: [],
        stats: {}
      }

      const cleanup = api.queryStream(
        { question: query, graph_name: currentDataset || undefined },
        (event) => {
          if (event.type === 'status') {
            // Update partial stats/entities if needed
            const eventData = event.data as { query_entities?: string[] } | undefined
            if (eventData?.query_entities) {
              partialResult.query_entities = eventData.query_entities
            }
          } else if (event.type === 'answer_chunk') {
            const deltaText = String(
              (event as Record<string, unknown>).chunk ??
              (event as Record<string, unknown>).delta ??
              ''
            )
            partialResult.answer = (partialResult.answer || '') + deltaText
            setResult({ ...partialResult } as QueryResponse)
          } else if (event.type === 'done') {
            // Final complete result
            if (event.result) {
              const fullResult = event.result as QueryResponse
              setResult(fullResult)
              setSubgraph(fullResult.subgraph || null, fullResult.retrieval_detail, fullResult.rerank_result)
            } else {
              // Fallback: stream done event has no full graph payload,
              // fetch complete query result once for graph/timeline rendering.
              api
                .query({ question: query, graph_name: currentDataset || undefined })
                .then((fullResult) => {
                  setResult(fullResult)
                  setSubgraph(
                    fullResult.subgraph || null,
                    fullResult.retrieval_detail,
                    fullResult.rerank_result
                  )
                })
                .catch(() => {})
            }
            setSearching(false)
            abortControllerRef.current = null
          } else if (event.type === 'error') {
            setError(event.message || 'Stream error')
            setSearching(false)
            abortControllerRef.current = null
          }
        },
        (error) => {
          setError(error.message || 'Stream failed')
          setSearching(false)
          abortControllerRef.current = null
        },
        () => {
          setSearching(false)
          abortControllerRef.current = null
        }
      )
      abortControllerRef.current = cleanup
    } else {
      try {
        const result = await searchMutation.mutateAsync({
          question: query,
          graph_name: currentDataset || undefined,
        })
        setResult(result)
        setSubgraph(result.subgraph || null, result.retrieval_detail, result.rerank_result)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Search failed'
        setError(message)
      } finally {
        setSearching(false)
      }
    }
  }, [inputValue, useStream, searchMutation, currentDataset, setQuery, setSearching, setResult, setError, setSubgraph, clearGraph])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleClear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current()
      abortControllerRef.current = null
    }
    setInputValue('')
    reset()
    clearGraph()
  }, [reset, clearGraph])

  const isLoading = searchMutation.isPending || !!abortControllerRef.current

  return (
    <div className="relative w-full max-w-2xl mx-auto space-y-2">
      <div className="flex items-center justify-end gap-2 px-1">
        <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={useStream}
            onChange={(e) => setUseStream(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Zap className={cn("w-3.5 h-3.5", useStream ? "text-amber-500" : "")} />
          流式响应
        </label>
      </div>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入您的问题..."
          disabled={isLoading}
          className={cn(
            'w-full px-4 py-3 pr-24',
            'border border-slate-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            'text-slate-700 placeholder:text-slate-400',
            'transition-all duration-200',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        />

        {/* Clear button */}
        {inputValue && !isLoading && (
          <button
            onClick={handleClear}
            className={cn(
              'absolute right-14 top-1/2 -translate-y-1/2',
              'p-1.5 rounded-md',
              'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
              'transition-colors'
            )}
            title="清空"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={isLoading || !inputValue.trim()}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'p-2 rounded-md',
            'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            'transition-colors'
          )}
          title="搜索"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Query entities display */}
      <QueryEntitiesDisplay />
    </div>
  )
}

function QueryEntitiesDisplay() {
  const { result, isSearching } = useSearchStore()

  if (isSearching) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>正在分析查询...</span>
      </div>
    )
  }

  if (!result?.query_entities?.length) return null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500">实体:</span>
      {result.query_entities.map((entity, index) => (
        <span
          key={index}
          className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200"
        >
          {entity}
        </span>
      ))}
    </div>
  )
}

export default SearchInput
