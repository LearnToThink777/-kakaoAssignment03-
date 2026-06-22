import Link from "next/link";
import TodoForm from "../_components/TodoForm";

// 페이지 자체는 서버 컴포넌트, 폼만 클라이언트 컴포넌트
export default function NewTodoPage() {
  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <Link href="/todos" className="text-sm text-gray-500 hover:underline">
        ← 목록으로
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-indigo-700">새 할 일</h1>
      <TodoForm mode="create" />
    </main>
  );
}
