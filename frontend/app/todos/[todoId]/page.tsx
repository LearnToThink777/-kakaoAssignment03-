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
    <main className="flex min-h-screen items-center justify-center bg-violet-100 p-6">
      <TodoForm mode="edit" todo={todo} />
    </main>
  );
}
