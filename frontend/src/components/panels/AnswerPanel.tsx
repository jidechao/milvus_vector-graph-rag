import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useSearchStore } from '@/stores/searchStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function AnswerPanel() {
  const { result, isSearching } = useSearchStore()
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!result && !isSearching) return null

  const handleCopy = async () => {
    if (!result?.answer) return
    await navigator.clipboard.writeText(result.answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Answer Section */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isSearching ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
              </div>
            ) : result?.answer ? (
              <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-50 prose-pre:text-slate-800 prose-pre:border prose-pre:border-slate-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.answer}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-400 italic">尚未生成答案</p>
            )}
          </div>

          {result?.answer && (
            <button
              onClick={handleCopy}
              className={cn(
                'p-2 rounded-md flex-shrink-0 transition-colors',
                copied
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'hover:bg-slate-100 text-slate-400'
              )}
              title={copied ? '已复制!' : '复制答案'}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sources Section */}
      {result?.retrieved_passages && result.retrieved_passages.length > 0 && (
        <div className="border-t border-slate-100">
          <button
            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            {isSourcesExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <FileText className="w-4 h-4" />
            <span>{result.retrieved_passages.length} 个来源</span>
          </button>

          <AnimatePresence>
            {isSourcesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {result.retrieved_passages.map((passage, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-md text-sm text-slate-600"
                    >
                      <div className="text-xs text-slate-400 mb-1">
                        来源 {index + 1}
                      </div>
                      <p className="line-clamp-4">{passage}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default AnswerPanel
