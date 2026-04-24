import { cn } from '@/utils/cn'
import { HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface LegendItem {
  label: string
  color: string
  borderColor: string
  description: string
}

const legendItems: LegendItem[] = [
  {
    label: '种子节点',
    color: 'bg-amber-500',
    borderColor: 'border-amber-500',
    description: '向量检索返回的初始结果',
  },
  {
    label: '扩展节点',
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    description: '通过图遍历发现的关联节点',
  },
  {
    label: '已选中',
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    description: '大模型重排后选出的最相关结果',
  },
  {
    label: '已过滤',
    color: 'bg-slate-400',
    borderColor: 'border-slate-300 border-dashed',
    description: '曾被考虑但最终未被选中的节点',
  },
]

function GraphLegend() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="relative flex items-center gap-3 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm">
      {legendItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 group relative"
          title={item.description}
        >
          <div
            className={cn(
              'w-4 h-4 rounded border-2 bg-white',
              item.borderColor
            )}
          >
            <div className={cn('w-full h-full rounded-sm', item.color, 'opacity-30')} />
          </div>
          <span className="text-xs font-medium text-slate-600">{item.label}</span>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {item.description}
          </div>
        </div>
      ))}

      {/* Help button */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="ml-1 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        title="算法是如何工作的"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Help popup */}
      {showHelp && (
        <div className="absolute bottom-full right-0 mb-2 p-3 bg-white rounded-lg border border-slate-200 shadow-lg w-72 text-xs z-50">
          <h4 className="font-semibold text-slate-800 mb-2">Vector Graph RAG 工作原理</h4>
          <ol className="space-y-1.5 text-slate-600">
            <li><span className="text-amber-600 font-medium">1. 种子:</span> 向量检索找到初始实体和关系</li>
            <li><span className="text-blue-600 font-medium">2. 扩展:</span> 图遍历发现相连的节点</li>
            <li><span className="text-slate-500 font-medium">3. 过滤:</span> 节点过多？按相似度保留最相关部分</li>
            <li><span className="text-emerald-600 font-medium">4. 重排:</span> 大模型选出用于回答的最佳关系</li>
          </ol>
          <p className="mt-2 text-slate-500 text-[10px]">点击左侧时间线步骤查看各个阶段</p>
        </div>
      )}
    </div>
  )
}

export default GraphLegend
