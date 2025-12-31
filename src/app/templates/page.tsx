import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getAllTemplates } from '@/lib/db/queries';

export default async function TemplatesPage() {
  const isAuth = await verifyAuth();

  if (!isAuth) {
    redirect('/login');
  }

  const templates = await getAllTemplates();

  return (
    <DashboardLayout>
      <Header
        title="Şablonlar"
        subtitle="İçerik üretimi için hazır şablonlar"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const structure = template.structure ? JSON.parse(template.structure) : {};
            const prompts = template.prompts ? JSON.parse(template.prompts) : {};

            return (
              <Card key={template.id} hover className="flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    {template.is_default === 1 && (
                      <Badge variant="success" size="sm" className="mt-1">
                        Varsayılan
                      </Badge>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-4 flex-1">
                  {template.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  {structure.sections && (
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wider">Bölümler</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {structure.sections.slice(0, 4).map((section: string, i: number) => (
                          <Badge key={i} size="sm" variant="default">
                            {section.replace('_', ' ')}
                          </Badge>
                        ))}
                        {structure.sections.length > 4 && (
                          <Badge size="sm" variant="default">
                            +{structure.sections.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {structure.minWords && structure.maxWords && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Kelime Aralığı</span>
                      <span className="text-white">
                        {structure.minWords} - {structure.maxWords}
                      </span>
                    </div>
                  )}

                  {prompts.tone && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Ton</span>
                      <span className="text-white capitalize">{prompts.tone}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {templates.length === 0 && (
          <Card>
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <p className="text-slate-400">Henüz şablon yok</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
