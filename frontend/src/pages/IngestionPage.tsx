import { useState } from 'react'
import { api, importDocuments, uploadFiles } from '@/api/client'
import { useDatasetStore } from '@/stores/datasetStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Link as LinkIcon, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function IngestionPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'file'>('text')
  const { currentDataset } = useDatasetStore()
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  
  // Text Import State
  const [textContent, setTextContent] = useState('')
  
  // URL Import State
  const [urlContent, setUrlContent] = useState('')
  
  // File Upload State
  const [files, setFiles] = useState<File[]>([])

  // Common Settings
  const [chunkSize, setChunkSize] = useState(1000)
  const [chunkOverlap, setChunkOverlap] = useState(200)
  const [extractTriplets, setExtractTriplets] = useState(true)
  const [graphName, setGraphName] = useState(currentDataset || '')

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textContent.trim()) return
    
    setLoading(true)
    setResult(null)
    try {
      const res = await api.addDocuments({
        documents: [textContent],
        extract_triplets: extractTriplets,
      }, graphName)
      
      setResult({
        success: true,
        message: `Successfully added ${res.num_documents} documents, extracted ${res.num_entities} entities and ${res.num_relations} relations.`
      })
      setTextContent('')
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string }
      setResult({
        success: false,
        message: error.response?.data?.detail || error.message || 'Failed to add document'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const urls = urlContent.split('\n').map(u => u.trim()).filter(u => u)
    if (urls.length === 0) return
    
    setLoading(true)
    setResult(null)
    try {
      const res = await importDocuments({
        sources: urls,
        chunk_documents: true,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        extract_triplets: extractTriplets,
        graph_name: graphName,
      })
      
      if (res.success) {
        setResult({
          success: true,
          message: `Successfully imported ${res.num_documents} documents from ${res.num_sources} sources. Extracted ${res.num_entities} entities and ${res.num_relations} relations.`
        })
        setUrlContent('')
      } else {
        setResult({
          success: false,
          message: `Import failed: ${res.errors.join(', ')}`
        })
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string }
      setResult({
        success: false,
        message: error.response?.data?.detail || error.message || 'Failed to import URLs'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return
    
    setLoading(true)
    setResult(null)
    try {
      const res = await uploadFiles(files, {
        chunkDocuments: true,
        chunkSize,
        chunkOverlap,
        extractTriplets,
        graphName,
      })
      
      if (res.success) {
        setResult({
          success: true,
          message: `Successfully uploaded ${res.num_documents} documents from ${res.num_sources} files. Extracted ${res.num_entities} entities and ${res.num_relations} relations.`
        })
        setFiles([])
      } else {
        setResult({
          success: false,
          message: `Upload failed: ${res.errors.join(', ')}`
        })
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string }
      setResult({
        success: false,
        message: error.response?.data?.detail || error.message || 'Failed to upload files'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">数据导入</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'text' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => { setActiveTab('text'); setResult(null) }}
          >
            <FileText className="w-4 h-4" /> 纯文本
          </button>
          <button
            className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'url' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => { setActiveTab('url'); setResult(null) }}
          >
            <LinkIcon className="w-4 h-4" /> 网页链接
          </button>
          <button
            className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'file' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => { setActiveTab('file'); setResult(null) }}
          >
            <UploadCloud className="w-4 h-4" /> 文件上传
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="graphName">目标知识库</Label>
              <Input 
                id="graphName" 
                value={graphName} 
                onChange={(e) => setGraphName(e.target.value)} 
                placeholder="与知识库列表一致，如 default 或 unprefixed"
              />
            </div>
            {(activeTab === 'url' || activeTab === 'file') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="chunkSize">分块大小 (Chunk Size)</Label>
                  <Input 
                    id="chunkSize" 
                    type="number" 
                    value={chunkSize} 
                    onChange={(e) => setChunkSize(parseInt(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chunkOverlap">分块重叠 (Chunk Overlap)</Label>
                  <Input 
                    id="chunkOverlap" 
                    type="number" 
                    value={chunkOverlap} 
                    onChange={(e) => setChunkOverlap(parseInt(e.target.value))} 
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <input 
              type="checkbox" 
              id="extractTriplets" 
              checked={extractTriplets}
              onChange={(e) => setExtractTriplets(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="extractTriplets" className="font-normal cursor-pointer">
              使用大模型提取实体和关系
            </Label>
          </div>

          {activeTab === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="textContent">文档正文</Label>
                <textarea
                  id="textContent"
                  className="w-full min-h-[200px] p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="在此输入纯文本..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !textContent.trim()} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 处理中...</> : '导入文本'}
              </Button>
            </form>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="urlContent">网页链接 (每行一个)</Label>
                <textarea
                  id="urlContent"
                  className="w-full min-h-[200px] p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/article1&#10;https://example.com/article2"
                  value={urlContent}
                  onChange={(e) => setUrlContent(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !urlContent.trim()} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 处理中...</> : '导入链接'}
              </Button>
            </form>
          )}

          {activeTab === 'file' && (
            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>文件</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="fileUpload"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFiles(Array.from(e.target.files))
                      }
                    }}
                    disabled={loading}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      点击选择文件
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      PDF, DOCX, TXT, MD, HTML
                    </span>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-slate-700">已选文件:</p>
                    <ul className="text-sm text-slate-600 list-disc list-inside pl-4">
                      {files.map((f, i) => <li key={i}>{f.name} ({(f.size / 1024).toFixed(1)} KB)</li>)}
                    </ul>
                  </div>
                )}
              </div>
              <Button type="submit" disabled={loading || files.length === 0} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 处理中...</> : '上传文件'}
              </Button>
            </form>
          )}

          {result && (
            <div className={`mt-6 p-4 rounded-md flex items-start gap-3 ${result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {result.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <p className="text-sm">{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
