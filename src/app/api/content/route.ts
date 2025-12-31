import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  getAllContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  getContentStats,
} from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const stats = searchParams.get('stats');

    if (stats === 'true') {
      const contentStats = await getContentStats();
      return NextResponse.json({ stats: contentStats });
    }

    if (id) {
      const content = await getContentById(id);
      if (!content) {
        return NextResponse.json(
          { error: 'İçerik bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json({ content });
    }

    const contents = await getAllContents(status || undefined);
    return NextResponse.json({ contents });
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { error: 'İçerik getirme hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.title) {
      return NextResponse.json(
        { error: 'Başlık gerekli' },
        { status: 400 }
      );
    }

    const content = await createContent(data);
    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    console.error('Create content error:', error);
    return NextResponse.json(
      { error: 'İçerik oluşturma hatası' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'İçerik ID gerekli' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const content = await updateContent(id, data);

    if (!content) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { error: 'İçerik güncelleme hatası' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'İçerik ID gerekli' },
        { status: 400 }
      );
    }

    const deleted = await deleteContent(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete content error:', error);
    return NextResponse.json(
      { error: 'İçerik silme hatası' },
      { status: 500 }
    );
  }
}
