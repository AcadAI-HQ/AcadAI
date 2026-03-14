/**
 * GET /api/dashboard/status
 *
 * Returns live AI pipeline status for the dashboard AI Engine card:
 * - Days since roadmap update (from _pipeline_locks/roadmap-update)
 * - Days since learning resources refresh (from _pipeline_locks/learning-resources)
 * - Latest blog post title + slug (from blog-posts collection)
 *
 * Public read (no auth required) — data is not user-specific.
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
// Cache for 1 hour — pipeline runs are infrequent
export const revalidate = 3600;

function daysSince(ts: FirebaseFirestore.Timestamp | undefined): number {
  if (!ts) return 999;
  const ms = Date.now() - ts.toMillis();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function GET() {
  if (!adminDb) {
    return NextResponse.json(
      { error: 'Firebase Admin not initialized' },
      { status: 500 }
    );
  }

  const [roadmapLock, resourcesLock, latestBlogSnap] = await Promise.all([
    adminDb.collection('_pipeline_locks').doc('roadmap-update').get(),
    adminDb.collection('_pipeline_locks').doc('learning-resources').get(),
    adminDb
      .collection('blog-posts')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get(),
  ]);

  const roadmapUpdatedDaysAgo = daysSince(
    roadmapLock.data()?.completedAt
  );
  const resourcesRefreshedDaysAgo = daysSince(
    resourcesLock.data()?.completedAt
  );

  const latestPost = latestBlogSnap.docs[0]?.data();

  return NextResponse.json({
    roadmapUpdatedDaysAgo,
    resourcesRefreshedDaysAgo,
    latestBlogTitle: latestPost?.title ?? 'Coming soon',
    latestBlogSlug: latestPost?.slug ?? '',
  });
}
