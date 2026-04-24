import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, Database, FileText, UploadCloud } from 'lucide-react'
import Header from '@/components/ui/Header'

const navigation = [
  { name: '仪表盘', href: '/dashboard', icon: LayoutDashboard },
  { name: '查询工作台', href: '/query', icon: Search },
  { name: '知识库管理', href: '/knowledge-bases', icon: Database },
  { name: '文档管理', href: '/documents', icon: FileText },
  { name: '数据导入', href: '/ingestion', icon: UploadCloud },
]

export function MainLayout() {
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
