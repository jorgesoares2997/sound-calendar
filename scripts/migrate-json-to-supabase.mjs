import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function toMemberRow(member) {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    telegram_id: member.telegramId || '',
    email: member.email || '',
    phone: member.phone || '',
    color: member.color || '#22c55e',
    active: Boolean(member.active),
  };
}

function toShiftRow(shift) {
  return {
    id: shift.id,
    date: shift.date,
    title: shift.title,
    type: shift.type,
    start_time: shift.startTime,
    end_time: shift.endTime,
    member_ids: shift.memberIds || [],
    notes: shift.notes || '',
    created_at: shift.createdAt || new Date().toISOString(),
  };
}

async function readJson(relativePath) {
  const target = path.resolve(root, relativePath);
  const raw = await fs.readFile(target, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error('Configure NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const members = await readJson('src/data/members.json');
  const shifts = await readJson('src/data/shifts.json');

  const memberRows = members.map(toMemberRow);
  const shiftRows = shifts.map(toShiftRow);

  const { error: memberError } = await supabase.from('members').upsert(memberRows, { onConflict: 'id' });
  if (memberError) throw memberError;

  const { error: shiftError } = await supabase.from('shifts').upsert(shiftRows, { onConflict: 'id' });
  if (shiftError) throw shiftError;

  const defaultSettings = {
    id: 1,
    bot_token: process.env.TELEGRAM_BOT_TOKEN || '',
    group_chat_id: process.env.TELEGRAM_CHAT_ID || '',
    team_name: process.env.NEXT_PUBLIC_TEAM_NAME || 'Sound Team',
    reminder_message:
      '🎛️ Lembrete de escala!\n\n{member} você está na escala de *{date}* ({shift}).\n\nFique atento ao horário! 🙏',
    default_reminder_hours: 24,
  };

  const { error: settingsError } = await supabase.from('settings').upsert(defaultSettings, { onConflict: 'id' });
  if (settingsError) throw settingsError;

  console.log(`Migracao concluida: ${memberRows.length} membros e ${shiftRows.length} escalas.`);
}

main().catch((error) => {
  console.error('Falha na migracao:', error.message || error);
  process.exit(1);
});
