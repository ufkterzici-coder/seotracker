'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { CircularProgress } from '@/components/ui/Progress';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import SEOAnalysisPanel from '@/components/seo/SEOAnalysisPanel';

// Dynamic import for TipTap editor (client-side only)
const RichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="border border-slate-700 rounded-lg p-4 min-h-[400px] animate-pulse bg-slate-800/50" />
    )
  }
);

export default function ContentViewPage() {
  const router = useRouter();
  const params = useParams();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMetaTitle, setEditMetaTitle] = useState('');
  const [editMetaDesc, setEditMetaDesc] = useState('');

  useEffect(() => {
    fetchContent();
  }, [params.id]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content?id=${params.id}`);
      const data = await response.json();
      if (data.content) {
        setContent(data.content);
        setEditTitle(data.content.title);
        setEditContent(data.content.content || '');
        setEditMetaTitle(data.content.meta_title || '');
        setEditMetaDesc(data.content.meta_description || '');
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Strip HTML tags for word count
      const plainText = editContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordCount = plainText.split(/\s+/).filter(Boolean).length;

      const response = await fetch(`/api/content?id=${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          html_content: editContent,
          meta_title: editMetaTitle,
          meta_description: editMetaDesc,
          word_count: wordCount,
        }),
      });

      const data = await response.json();
      if (data.content) {
        setContent(data.content);
        setEditing(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/content?id=${params.id}`, {
        method: 'DELETE',
      });
      router.push('/content');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await fetch(`/api/content?id=${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: content.status === 'published' ? 'draft' : 'published',
        }),
      });
      fetchContent();
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!content) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-slate-400 mb-4">İçerik bulunamadı</p>
          <Button onClick={() => router.push('/content')}>
            İçeriklere Dön
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        title={editing ? 'İçerik Düzenle' : content.title}
        subtitle={
          editing
            ? 'Değişiklikleri kaydetmeyi unutmayın'
            : `${content.word_count || 0} kelime • ${new Date(content.created_at).toLocaleDateString('tr-TR')}`
        }
        actions={
          <div className="flex items-center gap-3">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  İptal
                </Button>
                <Button onClick={handleSave} loading={saving}>
                  Kaydet
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setDeleteModal(true)}>
                  Sil
                </Button>
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Düzenle
                </Button>
                <Button onClick={handlePublish} loading={saving}>
                  {content.status === 'published' ? 'Taslağa Al' : 'Yayınla'}
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {editing ? (
              <>
                <Card title="Başlık">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="İçerik başlığı"
                  />
                </Card>

                <Card title="İçerik" padding="none">
                  <RichTextEditor
                    content={editContent}
                    onChange={setEditContent}
                    placeholder="İçeriğinizi buraya yazın..."
                  />
                </Card>

                <Card title="Meta Bilgileri">
                  <div className="space-y-4">
                    <div>
                      <Input
                        label="Meta Başlık"
                        value={editMetaTitle}
                        onChange={(e) => setEditMetaTitle(e.target.value)}
                        placeholder="SEO başlığı (max 60 karakter)"
                      />
                      <div className="flex justify-between mt-1">
                        <span className={`text-xs ${editMetaTitle.length > 60 ? 'text-red-400' : 'text-slate-500'}`}>
                          {editMetaTitle.length}/60 karakter
                        </span>
                        {editMetaTitle.length > 60 && (
                          <span className="text-xs text-red-400">Çok uzun!</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Textarea
                        label="Meta Açıklama"
                        value={editMetaDesc}
                        onChange={(e) => setEditMetaDesc(e.target.value)}
                        rows={3}
                        placeholder="SEO açıklaması (max 155 karakter)"
                      />
                      <div className="flex justify-between mt-1">
                        <span className={`text-xs ${editMetaDesc.length > 155 ? 'text-red-400' : 'text-slate-500'}`}>
                          {editMetaDesc.length}/155 karakter
                        </span>
                        {editMetaDesc.length > 155 && (
                          <span className="text-xs text-red-400">Çok uzun!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">İçerik</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="preview">Önizleme</TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                  <Card padding="none">
                    <div className="p-6">
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-slate-300">
                          {content.content?.replace(/<[^>]*>/g, '') || 'İçerik yok'}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 p-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(content.content?.replace(/<[^>]*>/g, '') || '', 'text')}
                      >
                        {copied === 'text' ? 'Kopyalandı!' : 'Metni Kopyala'}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="html">
                  <Card padding="none">
                    <div className="p-6">
                      <pre className="text-sm text-slate-400 overflow-x-auto whitespace-pre-wrap">
                        {content.html_content || content.content || 'HTML içerik mevcut değil'}
                      </pre>
                    </div>
                    <div className="border-t border-slate-800 p-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(content.html_content || content.content || '', 'html')}
                      >
                        {copied === 'html' ? 'Kopyalandı!' : 'HTML Kopyala'}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="preview">
                  <Card padding="none">
                    <div className="p-6">
                      <div
                        className="prose prose-invert prose-emerald max-w-none
                          prose-headings:text-white prose-headings:font-bold
                          prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                          prose-p:text-slate-300 prose-p:leading-relaxed
                          prose-a:text-emerald-400
                          prose-blockquote:border-emerald-500 prose-blockquote:bg-slate-800/50
                          prose-code:text-emerald-300 prose-code:bg-slate-800
                          prose-li:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: content.html_content || content.content || '' }}
                      />
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Durum</span>
                <Badge variant={content.status === 'published' ? 'success' : 'warning'}>
                  {content.status === 'published' ? 'Yayında' : 'Taslak'}
                </Badge>
              </div>
            </Card>

            {/* SEO Score */}
            {content.seo_score !== null && (
              <Card title="SEO Skoru">
                <div className="flex items-center justify-center py-4">
                  <CircularProgress value={content.seo_score} size={100} strokeWidth={8} />
                </div>
              </Card>
            )}

            {/* Meta Info */}
            <Card title="Meta Bilgileri">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Meta Başlık</label>
                  <p className="text-white mt-1">{content.meta_title || '-'}</p>
                  {content.meta_title && (
                    <span className={`text-xs ${content.meta_title.length > 60 ? 'text-red-400' : 'text-slate-500'}`}>
                      {content.meta_title.length}/60
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm text-slate-400">Meta Açıklama</label>
                  <p className="text-white mt-1 text-sm">{content.meta_description || '-'}</p>
                  {content.meta_description && (
                    <span className={`text-xs ${content.meta_description.length > 155 ? 'text-red-400' : 'text-slate-500'}`}>
                      {content.meta_description.length}/155
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm text-slate-400">URL Slug</label>
                  <p className="text-white mt-1">{content.slug || '-'}</p>
                </div>
              </div>
            </Card>

            {/* Keywords */}
            <Card title="Anahtar Kelimeler">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Ana Anahtar Kelime</label>
                  <p className="text-white mt-1">{content.main_keyword || '-'}</p>
                </div>
                {content.lsi_keywords && (
                  <div>
                    <label className="text-sm text-slate-400">LSI Kelimeler</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(() => {
                        try {
                          const keywords = JSON.parse(content.lsi_keywords);
                          return keywords.map((kw: string, i: number) => (
                            <Badge key={i} size="sm">{kw}</Badge>
                          ));
                        } catch {
                          return <span className="text-slate-500">-</span>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats */}
            <Card title="İstatistikler">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kelime Sayısı</span>
                  <span className="text-white">{content.word_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Okunabilirlik</span>
                  <span className="text-white">{content.readability_score || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Arama Niyeti</span>
                  <span className="text-white capitalize">{content.search_intent || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Oluşturulma</span>
                  <span className="text-white text-sm">
                    {new Date(content.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Güncelleme</span>
                  <span className="text-white text-sm">
                    {new Date(content.updated_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* SEO Analysis Section */}
        {!editing && content.content && content.main_keyword && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">SEO Analizi</h2>
            <SEOAnalysisPanel
              title={content.title}
              content={content.content}
              mainKeyword={content.main_keyword}
              metaTitle={content.meta_title}
              metaDescription={content.meta_description}
              slug={content.slug}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="İçeriği Sil"
      >
        <p className="text-slate-400">
          Bu içeriği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Sil
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  );
}
