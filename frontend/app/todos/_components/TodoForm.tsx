"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Todo } from "@/lib/todos";

type Props = {
  mode: "create" | "edit";
  todo?: Todo;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TodoForm({ mode, todo }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(todo?.title ?? "");
  const [date, setDate] = useState(todo?.date ?? today());
  const [completed, setCompleted] = useState(todo?.completed ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("할 일 내용을 입력하세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 백엔드 직접 호출이 아니라 route.ts 프록시로 보낸다 (주소는 환경변수)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
      const url = isEdit && todo ? `${apiUrl}/todos/${todo.id}` : `${apiUrl}/todos`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), date, completed }),
      });

      if (!res.ok) {
        throw new Error("저장에 실패했습니다.");
      }

      router.push("/todos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          할 일
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          날짜
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
        />
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="h-4 w-4"
          />
          완료
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "저장 중..." : isEdit ? "수정" : "추가"}
      </button>
    </form>
  );
}
