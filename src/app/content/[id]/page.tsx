'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function ContentViewPage() {
  const router = useRouter();
  const params = useParams();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

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
      const response = await fetch(`/api/content?id=${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          meta_title: editMetaTitle,
          meta_description: editMetaDesc,
          word_count: editContent.split(/\s+/).filter(Boolean).length,
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
    // You could add a toast notification here
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
                  />
                </Card>

                <Card title="İçerik">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={20}
                  />
                </Card>

                <Card title="Meta Bilgileri">
                  <div className="space-y-4">
                    <Input
                      label="Meta Başlık"
                      value={editMetaTitle}
                      onChange={(e) => setEditMetaTitle(e.target.value)}
                      helperText={`${editMetaTitle.length}/60 karakter`}
                    />
                    <Textarea
                      label="Meta Açıklama"
                      value={editMetaDesc}
                      onChange={(e) => setEditMetaDesc(e.target.value)}
                      rows={3}
                      helperText={`${editMetaDesc.length}/155 karakter`}
                    />
                  </div>
                </Card>
              </>
            ) : (
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">İçerik</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="schema">Şema</TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                  <Card padding="none">
                    <div className="p-6">
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-slate-300">
                          {content.content}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 p-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(content.content, 'Markdown')}
                      >
                        Kopyala
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="html">
                  <Card padding="none">
                    <div className="p-6">
                      <pre className="text-sm text-slate-400 overflow-x-auto">
                        {content.html_content || 'HTML içerik mevcut değil'}
                      </pre>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="schema">
                  <Card padding="none">
                    <div className="p-6">
                      <pre className="text-sm text-slate-400 overflow-x-auto">
                        {content.schema_markup || 'Şema mevcut değil'}
                      </pre>
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
                </div>
                <div>
                  <label className="text-sm text-slate-400">Meta Açıklama</label>
                  <p className="text-white mt-1 text-sm">{content.meta_description || '-'}</p>
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
                      {JSON.parse(content.lsi_keywords).map((kw: string, i: number) => (
                        <Badge key={i} size="sm">{kw}</Badge>
                      ))}
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
              </div>
            </Card>
          </div>
        </div>
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
