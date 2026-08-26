import { expandReminderTemplate, formatReminderPreviewHtml } from '@/utils/telegram';
import type { Member, Shift } from '@/types';

describe('Telegram Utilities', () => {
  const mockMember: Member = {
    id: 'm1',
    name: 'João Pedro',
    role: 'Técnico de Som',
    telegramId: 'joaopedro_audio',
    active: true,
  };

  const mockShift: Shift = {
    id: 's1',
    date: '2026-10-15',
    title: 'Culto da Noite',
    type: 'culto',
    startTime: '18:00',
    endTime: '20:30',
    memberIds: ['m1'],
    createdAt: '2026-08-26T10:00:00.000Z',
  };

  describe('expandReminderTemplate', () => {
    it('should replace {member} with bold markdown name', () => {
      const template = 'Olá {member}, tudo bem?';
      const result = expandReminderTemplate(template, mockMember, mockShift);
      expect(result).toBe('Olá *João Pedro*, tudo bem?');
    });

    it('should replace {member_name} with plain name', () => {
      const template = 'Seu nome é {member_name}.';
      const result = expandReminderTemplate(template, mockMember, mockShift);
      expect(result).toBe('Seu nome é João Pedro.');
    });

    it('should replace all shift-related tags correctly', () => {
      const template = 'Escala: {shift_title} no dia {shift_date} às {shift_time}.';
      const result = expandReminderTemplate(template, mockMember, mockShift);
      
      // '2026-10-15' becomes localized, expecting standard pt-BR format (e.g. 'quinta-feira, 15 de outubro de 2026')
      // Note: Node's Intl format might slightly differ based on environment, but usually looks like this.
      expect(result).toContain('Escala: Culto da Noite no dia');
      expect(result).toContain('15 de outubro');
      expect(result).toContain('às 18:00.');
    });

    it('should support legacy tags {shift}, {date}, {time}', () => {
      const template = 'Antigo: {shift} - {date} - {time}';
      const result = expandReminderTemplate(template, mockMember, mockShift);
      expect(result).toContain('Antigo: Culto da Noite - ');
      expect(result).toContain('15 de outubro');
      expect(result).toContain('- 18:00');
    });

    it('should handle missing shift title and time gracefully', () => {
      const emptyShift: Shift = { ...mockShift, title: '', startTime: undefined as any };
      const template = 'A {shift_title} às {shift_time}';
      const result = expandReminderTemplate(template, mockMember, emptyShift);
      expect(result).toBe('A Escala às '); // Fallback to 'Escala' and empty time
    });
  });

  describe('formatReminderPreviewHtml', () => {
    it('should convert *bold* to <strong>bold</strong>', () => {
      const text = 'This is *bold* text';
      const html = formatReminderPreviewHtml(text);
      expect(html).toBe('This is <strong>bold</strong> text');
    });

    it('should convert newlines to <br />', () => {
      const text = 'Line 1\nLine 2';
      const html = formatReminderPreviewHtml(text);
      expect(html).toBe('Line 1<br />Line 2');
    });

    it('should escape HTML tags to prevent injection', () => {
      const text = 'Hack <script>alert(1)</script>';
      const html = formatReminderPreviewHtml(text);
      expect(html).toBe('Hack &lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('should handle complex formatting combined', () => {
      const text = '*Title*\n<tag> & *bold2*';
      const html = formatReminderPreviewHtml(text);
      expect(html).toBe('<strong>Title</strong><br />&lt;tag&gt; &amp; <strong>bold2</strong>');
    });
  });
});
