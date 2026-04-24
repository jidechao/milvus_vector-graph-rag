import { useState } from 'react'
import { api } from '@/api/client'
import { useDatasetStore } from '@/stores/datasetStore'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Search, Edit2, Trash2, FileText, AlertCircle, Loader2, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DocumentResponse } from '@/types/api'

export function DocumentsPage() {
  const { currentDataset } = useDatasetStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [editingDoc, setEditingDoc] = useState<DocumentResponse | null>(null)
  const [editContent, setEditContent] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['documents', currentDataset, activeQuery],
    queryFn: () => api.getDocuments(currentDataset || undefined, activeQuery, 20),
    enabled: !!currentDataset && !!activeQuery,
  })

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; text: string }) => 
      api.updateDocument(params.id, { text: params.text }, currentDataset || undefined),
    onSuccess: () => {
      setEditingDoc(null)
      refetch()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteDocument(id, currentDataset || undefined),
    onSuccess: () => {
      refetch()
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim())
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除此文档吗？这也将删除关联的实体和关系。')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch {
        alert('删除文档失败')
      }
    }
  }

  const handleSaveEdit = async () => {
    if (!editingDoc) return
    try {
      await updateMutation.mutateAsync({ id: editingDoc.id, text: editContent })
    } catch {
      alert('更新文档失败')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">文档管理</h1>
        <div className="text-sm text-slate-500">
          当前知识库: <span className="font-semibold text-slate-700">{currentDataset || '未选择'}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md mb-6 flex items-start gap-3 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
        <p>文档列表需要提供搜索词。请输入关键词通过向量检索查找相关文档。</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按内容搜索文档..." 
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={!searchQuery.trim() || !currentDataset}>
          搜索
        </Button>
      </form>

      <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-lg shadow-sm border border-slate-200">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500">
            加载文档失败
          </div>
        ) : !activeQuery ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p>输入搜索词以查找文档</p>
          </div>
        ) : data?.documents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <Search className="w-12 h-12 text-slate-300 mb-4" />
            <p>未找到相关文档："{activeQuery}"</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {data?.documents.map((doc) => (
              <div key={doc.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                    ID: {doc.id}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 text-slate-600"
                      onClick={() => {
                        setEditingDoc(doc)
                        setEditContent(doc.text)
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-slate-800 whitespace-pre-wrap line-clamp-4">
                  {doc.text}
                </div>
                <div className="mt-3 flex gap-4 text-xs text-slate-500">
                  <span>{doc.entity_ids.length} 实体</span>
                  <span>{doc.relation_ids.length} 关系</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold">编辑文档</h3>
              <button onClick={() => setEditingDoc(null)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <div className="text-xs text-slate-500 font-mono mb-2">ID: {editingDoc.id}</div>
              <textarea 
                className="flex-1 w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingDoc(null)}>取消</Button>
              <Button onClick={handleSaveEdit} disabled={updateMutation.isPending || !editContent.trim()}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                保存更改
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
