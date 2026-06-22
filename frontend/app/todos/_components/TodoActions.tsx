"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Todo } from "@/lib/todos";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export default function TodoActions({ todo }: { todo: Todo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleCompleted() {
    setBusy(true);
    // route.ts 프록시로 보낸다 (주소는 환경변수)
    await fetch(`${API_URL}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    await fetch(`${API_URL}/todos/${todo.id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleCompleted}
        disabled={busy}
        className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-60"
      >
        {todo.completed ? "되돌리기" : "완료"}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        삭제
      </button>
    </div>
  );
}
