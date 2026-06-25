// 주간 캘린더용 날짜 계산 유틸 (순수 함수, 서버/클라이언트 공용).
// 로컬 타임존 기준으로 계산해 toISOString의 UTC 오프셋 오류(하루 밀림)를 피한다.

// 'YYYY-MM-DD' (로컬 기준)
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 'YYYY-MM-DD' → Date (로컬 자정)
export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

// 해당 날짜가 속한 주의 월요일 (한 주는 월~일)
export function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0=일 … 6=토
  const diff = day === 0 ? -6 : 1 - day; // 월요일까지 이동
  return addDays(date, diff);
}

export type WeekDay = {
  date: string; // 'YYYY-MM-DD'
  label: string; // 요일 (월~일)
  dayOfMonth: number; // 일(숫자)
};

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

// 월요일을 받아 그 주 7일을 만든다
export function getWeekDays(monday: Date): WeekDay[] {
  return DAY_LABELS.map((label, i) => {
    const date = addDays(monday, i);
    return { date: formatDate(date), label, dayOfMonth: date.getDate() };
  });
}

// 상단 범위 라벨: '2026-05-18 ~ 2026-05-24'
export function weekRangeLabel(monday: Date): string {
  return `${formatDate(monday)} ~ ${formatDate(addDays(monday, 6))}`;
}
