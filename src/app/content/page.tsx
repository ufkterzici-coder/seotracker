import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { CircularProgress } from '@/components/ui/Progress';
import Link from 'next/link';
import { getAllContents } from '@/lib/db/queries';

export default async function ContentListPage() {
  const isAuth = await verifyAuth();

  if (!isAuth) {
    redirect('/login');
  }

  const contents = getAllContents();

  return (
    <DashboardLayout>
      <Header
        title="İçerikler"
        subtitle={`Toplam ${contents.length} içerik`}
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

      <div className="p-6">
        {contents.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Henüz içerik yok</h3>
              <p className="text-slate-400 mb-6">İlk SEO içeriğinizi oluşturarak başlayın.</p>
              <Link href="/content/new">
                <Button>İlk İçeriği Oluştur</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contents.map((content) => (
              <Link key={content.id} href={`/content/${content.id}`}>
                <Card hover className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-white truncate">{content.title}</h3>
                      <Badge
                        variant={content.status === 'published' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {content.status === 'published' ? 'Yayında' : 'Taslak'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      {content.main_keyword && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          {content.main_keyword}
                        </span>
                      )}
                      {content.word_count && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {content.word_count} kelime
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(content.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4">
                    {content.seo_score !== null && (
                      <CircularProgress value={content.seo_score} size={48} strokeWidth={4} />
                    )}
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
