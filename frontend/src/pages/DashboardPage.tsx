import { useHealth, useSettings, useGraphs } from '@/api/queries'
import { Activity, Server, Database, CheckCircle2, XCircle } from 'lucide-react'

export function DashboardPage() {
  const { data: health, isLoading: healthLoading } = useHealth()
  const { data: settings, isLoading: settingsLoading } = useSettings()
  const { data: graphs, isLoading: graphsLoading } = useGraphs()

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">系统健康状态</h2>
          </div>
          {healthLoading ? (
            <div className="animate-pulse h-16 bg-slate-100 rounded-md"></div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">运行状态</span>
                {health?.status === 'ok' ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> 正常
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <XCircle className="w-4 h-4" /> 异常
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">版本号</span>
                <span className="font-medium text-slate-800">{health?.version || '未知'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Graphs Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">知识库概览</h2>
          </div>
          {graphsLoading ? (
            <div className="animate-pulse h-16 bg-slate-100 rounded-md"></div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">知识库总数</span>
                <span className="font-medium text-slate-800">{graphs?.graphs.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">就绪知识库</span>
                <span className="font-medium text-green-600">
                  {graphs?.graphs.filter(g => g.has_all_collections).length || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settings Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">系统配置</h2>
          </div>
          {settingsLoading ? (
            <div className="animate-pulse h-16 bg-slate-100 rounded-md"></div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">大语言模型</span>
                <span className="font-medium text-slate-800 truncate max-w-[120px]" title={settings?.llm_model}>
                  {settings?.llm_model}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">向量模型</span>
                <span className="font-medium text-slate-800 truncate max-w-[120px]" title={settings?.embedding_model}>
                  {settings?.embedding_model}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Milvus 地址</span>
                <span className="font-medium text-slate-800 truncate max-w-[120px]" title={settings?.milvus_uri}>
                  {settings?.milvus_uri}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
