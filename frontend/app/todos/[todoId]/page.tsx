import Link from "next/link";
import { notFound } from "next/navigation";
import { getTodo } from "@/app/actions";
import TodoForm from "../_components/TodoForm";

// 수정 대상 데이터를 서버에서 조회 (Next 16: params는 Promise)
export const dynamic = "force-dynamic";

export default async function EditTodoPage({
  params,
}: {
  params: Promise<{ todoId: string }>;
}) {
  const { todoId } = await params;
  const id = Number(todoId);
  const todo = Number.isNaN(id) ? null : await getTodo(id);

  if (!todo) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <Link href="/todos" className="text-sm text-gray-500 hover:underline">
        ← 목록으로
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-indigo-700">
        할 일 수정
      </h1>
      <TodoForm mode="edit" todo={todo} />
    </main>
  );
}
