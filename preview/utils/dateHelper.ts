// Dynamic date calculations adhering to PlanPasika rules (no hardcoded static dates)

export interface DynamicDayInfo {
  dateIso: string; // YYYY-MM-DD
  dayOfWeekName: string; // Poniedziałek, Wtorek...
  dayOfMonth: number;
  monthName: string;
  isToday: boolean;
  isFuture: boolean;
}

const POLISH_DAYS = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota'
];

const POLISH_MONTHS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia'
];

export function getTodayDate(): Date {
  return new Date();
}

export function formatToIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayFormattedPolish(): string {
  const d = getTodayDate();
  const dayName = POLISH_DAYS[d.getDay()];
  const dayNum = d.getDate();
  const monthName = POLISH_MONTHS[d.getMonth()];
  return `${dayName}, ${dayNum} ${monthName}`;
}

export function getCurrentWeekDays(): DynamicDayInfo[] {
  const today = getTodayDate();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  // Calculate distance to Monday
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);

  const days: DynamicDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateIso = formatToIso(d);
    const isToday = dateIso === formatToIso(today);
    const isFuture = d.getTime() > today.getTime() && !isToday;

    days.push({
      dateIso,
      dayOfWeekName: POLISH_DAYS[d.getDay()],
      dayOfMonth: d.getDate(),
      monthName: POLISH_MONTHS[d.getMonth()],
      isToday,
      isFuture
    });
  }

  return days;
}

export function getFutureWeekDays(): DynamicDayInfo[] {
  const currentWeek = getCurrentWeekDays();
  const nextMondayDate = new Date(currentWeek[0].dateIso);
  nextMondayDate.setDate(nextMondayDate.getDate() + 7);

  const days: DynamicDayInfo[] = [];
  const today = getTodayDate();

  for (let i = 0; i < 7; i++) {
    const d = new Date(nextMondayDate);
    d.setDate(nextMondayDate.getDate() + i);
    const dateIso = formatToIso(d);
    const isToday = dateIso === formatToIso(today);
    const isFuture = true;

    days.push({
      dateIso,
      dayOfWeekName: POLISH_DAYS[d.getDay()],
      dayOfMonth: d.getDate(),
      monthName: POLISH_MONTHS[d.getMonth()],
      isToday,
      isFuture
    });
  }

  return days;
}
