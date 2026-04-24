import { useState } from 'react'
import { useGraphs, useDeleteGraph } from '@/api/queries'
import { api } from '@/api/client'
import { useQuery } from '@tanstack/react-query'
import { Database, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { graphDisplayName } from '@/utils/graphDisplayName'

function GraphStatsCard({ graphName }: { graphName: string }) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['graphStats', graphName],
    queryFn: () => api.getGraphStats(graphName),
    staleTime: 60 * 1000,
  })

  if (isLoading) {
    return <div className="h-12 animate-pulse bg-slate-100 rounded-md"></div>
  }

  if (error) {
    return <div className="text-sm text-red-500">Failed to load stats</div>
  }

  return (
    <div className="flex gap-6 text-sm">
      <div className="flex flex-col">
        <span className="text-slate-500">实体</span>
        <span className="font-semibold text-slate-800">{stats?.entity_count || 0}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-slate-500">关系</span>
        <span className="font-semibold text-slate-800">{stats?.relation_count || 0}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-slate-500">段落</span>
        <span className="font-semibold text-slate-800">{stats?.passage_count || 0}</span>
      </div>
    </div>
  )
}

export function KnowledgeBasesPage() {
  const { data: graphs, isLoading, refetch } = useGraphs()
  const deleteGraph = useDeleteGraph()
  const [deletingGraph, setDeletingGraph] = useState<string | null>(null)

  const handleDelete = async (graphName: string) => {
    if (!confirm(`确定要永久删除知识库 "${graphName}" 吗？此操作无法撤销。`)) {
      return
    }

    setDeletingGraph(graphName)
    try {
      await deleteGraph.mutateAsync(graphName)
    } catch (err) {
      alert('删除知识库失败')
      console.error(err)
    } finally {
      setDeletingGraph(null)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">知识库管理</h1>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : graphs?.graphs.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">未找到知识库</h3>
          <p className="text-slate-500">请先导入文档以创建您的第一个知识库。</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {graphs?.graphs.map((graph) => (
            <div key={graph.name} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {graphDisplayName(graph.name)}
                  </h3>
                  {!graph.has_all_collections && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3 h-3" />
                      不完整
                    </span>
                  )}
                </div>
                
                {graph.has_all_collections ? (
                  <GraphStatsCard graphName={graph.name} />
                ) : (
                  <p className="text-sm text-slate-500">
                    缺失集合: 
                    {!graph.entity_collection && ' 实体'}
                    {!graph.relation_collection && ' 关系'}
                    {!graph.passage_collection && ' 段落'}
                  </p>
                )}
              </div>

              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => handleDelete(graph.name)}
                disabled={deletingGraph === graph.name}
              >
                {deletingGraph === graph.name ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
