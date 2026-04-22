import { NextRequest, NextResponse } from 'next/server';
import { getNotificationDraftAction, sendDailySummaryAction } from '@/app/actions/notifications';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';

async function handleDaily(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const draft = await getNotificationDraftAction('daily');
  if (!draft.success) {
    return NextResponse.json(
      {
        success: true,
        skipped: true,
        reason: draft.error || 'Sem escalas para hoje',
      },
      { status: 200 },
    );
  }

  const result = await sendDailySummaryAction();
  const status = result.success ? 200 : 500;

  return NextResponse.json(result, { status });
}

export async function GET(request: NextRequest) {
  return handleDaily(request);
}

export async function POST(request: NextRequest) {
  return handleDaily(request);
}
