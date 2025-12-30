import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { CircularProgress } from '@/components/ui/Progress';
import Link from 'next/link';
import { getContentStats, getAllContents } from '@/lib/db/queries';

export default async function DashboardPage() {
  const isAuth = await verifyAuth();

  if (!isAuth) {
    redirect('/login');
  }

  const stats = getContentStats();
  const recentContents = getAllContents().slice(0, 5);

  return (
    <DashboardLayout>
      <Header
        title="Dashboard"
        subtitle="İçerik üretim panelinize hoş geldiniz"
        actions={
          <Link href="/content/new">
            <Button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni İçerik
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">Toplam İçerik</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.drafts}</p>
              <p className="text-sm text-slate-400">Taslak</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.published}</p>
              <p className="text-sm text-slate-400">Yayınlandı</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.todayCount}</p>
              <p className="text-sm text-slate-400">Bugün</p>
            </div>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Contents */}
          <div className="lg:col-span-2">
            <Card title="Son İçerikler" padding="none">
              {recentContents.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400">Henüz içerik yok</p>
                  <Link href="/content/new">
                    <Button variant="outline" size="sm" className="mt-4">
                      İlk içeriğinizi oluşturun
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {recentContents.map((content) => (
                    <Link
                      key={content.id}
                      href={`/content/${content.id}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{content.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-slate-500">
                            {new Date(content.created_at).toLocaleDateString('tr-TR')}
                          </span>
                          {content.main_keyword && (
                            <Badge size="sm">{content.main_keyword}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {content.seo_score && (
                          <CircularProgress value={content.seo_score} size={40} strokeWidth={4} />
                        )}
                        <Badge
                          variant={content.status === 'published' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {content.status === 'published' ? 'Yayında' : 'Taslak'}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card title="Ortalamalar">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Ortalama Kelime Sayısı</span>
                    <span className="text-white font-medium">{stats.avgWordCount}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (stats.avgWordCount / 2000) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Ortalama SEO Skoru</span>
                    <span className="text-white font-medium">{stats.avgSeoScore}/100</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${stats.avgSeoScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Hızlı Erişim">
              <div className="space-y-2">
                <Link href="/content/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Yeni İçerik Oluştur
                  </Button>
                </Link>
                <Link href="/analyze" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Rakip Analizi
                  </Button>
                </Link>
                <Link href="/templates" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Şablonlar
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
