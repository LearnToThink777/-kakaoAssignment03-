"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Todo } from "@/lib/todos";
import { formatDate } from "@/lib/week";

type Props = {
  mode: "create" | "edit";
  todo?: Todo;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export default function TodoForm({ mode, todo }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(todo?.title ?? "");
  const [date, setDate] = useState(todo?.date ?? formatDate(new Date()));
  const [completed, setCompleted] = useState(todo?.completed ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("할 일 내용을 입력하세요.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      // 백엔드 직접 호출이 아니라 route.ts 프록시로 보낸다 (주소는 환경변수)
      const url = isEdit && todo ? `${API_URL}/todos/${todo.id}` : `${API_URL}/todos`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), date, completed }),
      });

      if (!res.ok) throw new Error("저장에 실패했습니다.");

      router.push("/todos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!todo) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
      router.push("/todos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-violet-200/50">
      <h1 className="text-center text-2xl font-extrabold italic text-violet-700">
        {isEdit ? "Todo 수정" : "새 할 일"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-violet-700">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="w-full rounded-lg border border-violet-200 bg-violet-50/40 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-violet-700">
            날짜
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-violet-200 bg-violet-50/40 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 rounded-lg bg-violet-50/60 px-3 py-2.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="h-4 w-4 accent-violet-600"
            />
            완료됨
          </label>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? "처리 중..." : isEdit ? "저장" : "추가"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/todos")}
            disabled={busy}
            className="flex-1 rounded-lg bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200 disabled:opacity-60"
          >
            취소
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              삭제
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
