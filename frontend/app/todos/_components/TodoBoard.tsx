"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Todo } from "@/lib/todos";
import {
  addDays,
  formatDate,
  getWeekDays,
  parseDate,
  startOfWeek,
  weekRangeLabel,
} from "@/lib/week";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type StatusFilter = "all" | "active" | "done";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행 중" },
  { key: "done", label: "완료" },
];

export default function TodoBoard({
  todos,
  initialDate,
}: {
  todos: Todo[];
  initialDate?: string;
}) {
  const router = useRouter();

  // initialDate(수정/생성 후 복귀 날짜)가 있으면 그 날짜, 없으면 오늘 기준으로 시작
  const start = initialDate ? parseDate(initialDate) : new Date();
  const [monday, setMonday] = useState(() => startOfWeek(start));
  const [selectedDate, setSelectedDate] = useState(
    () => initialDate ?? formatDate(new Date())
  );
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  // 수정/생성 복귀로 받은 ?date=는 첫 렌더에만 쓰고 URL에서 즉시 제거한다.
  // (보드 상태는 그대로 유지되지만, 이 화면을 새로고침하면 기본값인 오늘 주간으로 돌아간다)
  useEffect(() => {
    if (initialDate) {
      window.history.replaceState(null, "", "/todos");
    }
  }, [initialDate]);

  const weekDays = useMemo(() => getWeekDays(monday), [monday]);

  // 날짜별 할 일 개수 (요일 카드 badge용)
  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const todo of todos) {
      map.set(todo.date, (map.get(todo.date) ?? 0) + 1);
    }
    return map;
  }, [todos]);

  // 선택 날짜 → 검색어 → 상태 순으로 필터링한 목록
  const visibleTodos = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return todos
      .filter((t) => t.date === selectedDate)
      .filter((t) => (kw ? t.title.toLowerCase().includes(kw) : true))
      .filter((t) =>
        status === "all"
          ? true
          : status === "done"
            ? t.completed
            : !t.completed
      );
  }, [todos, selectedDate, keyword, status]);

  function goWeek(deltaWeeks: number) {
    setMonday((prev) => addDays(prev, deltaWeeks * 7));
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const text = title.trim();
    if (!text || busy) return;

    setBusy(true);
    await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: text, date: selectedDate, completed: false }),
    });
    setTitle("");
    router.refresh();
    setBusy(false);
  }

  async function toggle(todo: Todo) {
    setBusy(true);
    await fetch(`${API_URL}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove(todo: Todo) {
    setBusy(true);
    await fetch(`${API_URL}/todos/${todo.id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-violet-200/50">
      {/* 헤더 */}
      <h1 className="text-center text-2xl font-extrabold italic text-violet-700">
        Todo List
      </h1>

      {/* 주간 네비게이션 */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
        <button
          type="button"
          onClick={() => goWeek(-1)}
          aria-label="이전 주"
          className="text-violet-600 hover:text-violet-800"
        >
          ◀
        </button>
        <span className="tabular-nums">{weekRangeLabel(monday)}</span>
        <button
          type="button"
          onClick={() => goWeek(1)}
          aria-label="다음 주"
          className="text-violet-600 hover:text-violet-800"
        >
          ▶
        </button>
      </div>

      {/* 요일 카드 7개 */}
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => {
          const isSelected = day.date === selectedDate;
          const count = countByDate.get(day.date) ?? 0;
          return (
            <button
              type="button"
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-colors ${
                isSelected
                  ? "bg-violet-600 text-white"
                  : "bg-violet-50 text-violet-700 hover:bg-violet-100"
              }`}
            >
              <span className="text-[11px] font-medium">{day.label}</span>
              <span className="text-base font-bold">{day.dayOfMonth}</span>
              <span
                className={`text-[11px] ${
                  isSelected ? "text-violet-100" : "text-violet-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 할 일 입력 */}
      <form onSubmit={addTodo} className="mt-5 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일을 입력하세요"
          className="min-w-0 flex-1 rounded-full border border-violet-200 bg-violet-50/40 px-4 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-violet-400"
        />
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          추가
        </button>
      </form>

      {/* 검색 */}
      <div className="relative mt-3">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full rounded-full border border-violet-200 bg-violet-50/40 py-2 pl-10 pr-9 text-sm outline-none placeholder:text-gray-400 focus:border-violet-400"
        />
        {keyword && (
          <button
            type="button"
            onClick={() => setKeyword("")}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* 상태 필터 탭 */}
      <div className="mt-3 flex gap-2">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.key;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-violet-600 text-white"
                  : "bg-violet-50 text-violet-700 hover:bg-violet-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 목록 / 빈 상태 */}
      <div className="mt-4">
        {visibleTodos.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            할 일이 없습니다. 추가해보세요!
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-xl bg-violet-50/60 px-4 py-3"
              >
                {/* 완료 토글 (원형 체크박스) */}
                <button
                  type="button"
                  onClick={() => toggle(todo)}
                  disabled={busy}
                  aria-label={todo.completed ? "완료 취소" : "완료"}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    todo.completed
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-violet-300 hover:border-violet-500"
                  }`}
                >
                  {todo.completed && <CheckIcon />}
                </button>

                <span
                  className={`min-w-0 flex-1 truncate text-sm ${
                    todo.completed
                      ? "text-gray-400 line-through"
                      : "text-gray-800"
                  }`}
                >
                  {todo.title}
                </span>

                {/* 수정 (별도 페이지로 이동) */}
                <Link
                  href={`/todos/${todo.id}`}
                  aria-label="수정"
                  className="rounded-md p-1 text-violet-400 hover:bg-violet-100 hover:text-violet-600"
                >
                  <EditIcon />
                </Link>

                {/* 삭제 */}
                <button
                  type="button"
                  onClick={() => remove(todo)}
                  disabled={busy}
                  aria-label="삭제"
                  className="rounded-md p-1 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
