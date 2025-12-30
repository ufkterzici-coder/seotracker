'use client';

import { useState, useCallback } from 'react';
import type { Content } from '@/types/content';

export function useContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = useCallback(async (status?: string): Promise<Content[]> => {
    setLoading(true);
    setError(null);

    try {
      const url = status ? `/api/content?status=${status}` : '/api/content';
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İçerikler yüklenemedi');
      }

      return data.contents || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContent = useCallback(async (id: string): Promise<Content | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/content?id=${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İçerik yüklenemedi');
      }

      return data.content || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createContent = useCallback(async (data: Partial<Content>): Promise<Content | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'İçerik oluşturulamadı');
      }

      return result.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContent = useCallback(async (id: string, data: Partial<Content>): Promise<Content | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'İçerik güncellenemedi');
      }

      return result.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteContent = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'İçerik silinemedi');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchContents,
    fetchContent,
    createContent,
    updateContent,
    deleteContent,
  };
}
