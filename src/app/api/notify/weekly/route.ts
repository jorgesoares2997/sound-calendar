import { NextRequest, NextResponse } from 'next/server';
import { sendWeeklySummaryAction } from '@/app/actions/notifications';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';

async function handleWeekly(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const result = await sendWeeklySummaryAction();
  const status = result.success ? 200 : 500;

  return NextResponse.json(result, { status });
}

export async function GET(request: NextRequest) {
  return handleWeekly(request);
}

export async function POST(request: NextRequest) {
  return handleWeekly(request);
}
