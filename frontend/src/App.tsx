import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { QueryWorkbenchPage } from '@/pages/QueryWorkbenchPage'
import { KnowledgeBasesPage } from '@/pages/KnowledgeBasesPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { IngestionPage } from '@/pages/IngestionPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="query" element={<QueryWorkbenchPage />} />
            <Route path="knowledge-bases" element={<KnowledgeBasesPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="ingestion" element={<IngestionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
