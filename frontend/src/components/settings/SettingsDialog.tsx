import { useState } from 'react'
import { X, Database, Cpu, Layers, Server, Key, Trash2, AlertTriangle } from 'lucide-react'
import { useSettings, useGraphs, useDeleteGraph } from '@/api/queries'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { graphDisplayName } from '@/utils/graphDisplayName'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { data: settings, isLoading: settingsLoading } = useSettings()
  const { data: graphsData, isLoading: graphsLoading } = useGraphs()
  const deleteGraphMutation = useDeleteGraph()
  const [deletingGraph, setDeletingGraph] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (!open) return null

  const handleDeleteGraph = async (graphName: string) => {
    if (confirmDelete !== graphName) {
      setConfirmDelete(graphName)
      return
    }

    setDeletingGraph(graphName)
    try {
      await deleteGraphMutation.mutateAsync(graphName)
      setConfirmDelete(null)
    } catch (error) {
      console.error('Failed to delete graph:', error)
    } finally {
      setDeletingGraph(null)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Server className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">系统设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* System Configuration */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">配置信息</h3>
            {settingsLoading ? (
              <div className="text-sm text-slate-500">加载设置中...</div>
            ) : settings ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Cpu className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-600">大语言模型</div>
                    <div className="text-sm text-slate-800 font-mono">{settings.llm_model}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Layers className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-600">向量模型</div>
                    <div className="text-sm text-slate-800 font-mono truncate">
                      {settings.embedding_model}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      维度: {settings.embedding_dimension}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Database className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-600">Milvus 连接</div>
                    <div className="text-sm text-slate-800 font-mono truncate">
                      {settings.milvus_uri}
                    </div>
                    {settings.milvus_db && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        数据库: {settings.milvus_db}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Key className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-600">OpenAI API Key</div>
                    <div className="text-sm text-slate-800">
                      {settings.openai_api_key_set ? (
                        <span className="text-green-600 font-medium">✓ 已配置</span>
                      ) : (
                        <span className="text-red-600 font-medium">✗ 未设置</span>
                      )}
                    </div>
                    {settings.openai_base_url && (
                      <div className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                        Base URL: {settings.openai_base_url}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-600">加载设置失败</div>
            )}
          </section>

          {/* Knowledge Bases Management */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">知识库管理</h3>
            {graphsLoading ? (
              <div className="text-sm text-slate-500">加载知识库中...</div>
            ) : graphsData?.graphs && graphsData.graphs.length > 0 ? (
              <div className="space-y-2">
                {graphsData.graphs
                  .filter((g) => g.has_all_collections)
                  .map((graph) => (
                    <div
                      key={graph.name}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-all',
                        confirmDelete === graph.name
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Database className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {graphDisplayName(graph.name)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {graph.entity_collection} · {graph.relation_collection} ·{' '}
                            {graph.passage_collection}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {confirmDelete === graph.name ? (
                          <>
                            <div className="flex items-center gap-2 mr-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-xs font-medium text-red-600">
                                确认删除？
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelDelete}
                              disabled={deletingGraph === graph.name}
                              className="h-7 px-2 text-xs"
                            >
                              取消
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDeleteGraph(graph.name)}
                              disabled={deletingGraph === graph.name}
                              className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                            >
                              {deletingGraph === graph.name ? '删除中...' : '确认删除'}
                            </Button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleDeleteGraph(graph.name)}
                            disabled={deletingGraph !== null}
                            className={cn(
                              'p-1.5 rounded-md transition-colors',
                              deletingGraph !== null
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            )}
                            title="删除知识库"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">未找到知识库</div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              设置仅供查看。请通过环境变量或配置文件进行修改。
            </p>
            <Button onClick={onClose} size="sm">
              关闭
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
