// Calendar export utilities (.ics format and Google Calendar deep links)

export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD or ISO string
  time?: string; // HH:mm
  durationMinutes?: number;
  contactName?: string;
  contactPhone?: string;
}

export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const dateObj = new Date(event.startDate);
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    dateObj.setHours(hours || 9, minutes || 0, 0, 0);
  } else {
    dateObj.setHours(9, 0, 0, 0);
  }

  const durationMs = (event.durationMinutes || 60) * 60 * 1000;
  const endDateObj = new Date(dateObj.getTime() + durationMs);

  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const startIso = formatGCalDate(dateObj);
  const endIso = formatGCalDate(endDateObj);

  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.description}\n\nContacto: ${event.contactName || 'N/A'} (${event.contactPhone || 'Sem telefone'})\nSincronizado via GPA Angola CRM.`
  );
  const location = encodeURIComponent(event.location || 'Angola');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

export function downloadIcsFile(event: CalendarEventData): void {
  const dateObj = new Date(event.startDate);
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    dateObj.setHours(hours || 9, minutes || 0, 0, 0);
  } else {
    dateObj.setHours(9, 0, 0, 0);
  }

  const durationMs = (event.durationMinutes || 60) * 60 * 1000;
  const endDateObj = new Date(dateObj.getTime() + durationMs);

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const dtStart = formatIcsDate(dateObj);
  const dtEnd = formatIcsDate(endDateObj);
  const uid = `visit_${Date.now()}@gpaangola.co.ao`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GPA Angola CRM//Sincronizacao de Visitas//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${(event.description + (event.contactName ? ` | Contacto: ${event.contactName}` : '')).replace(/\n/g, '\\n')}`,
    `LOCATION:${(event.location || 'Angola').replace(/\n/g, ' ')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
