import Link from "next/link";
import { getTodos } from "@/app/actions";
import TodoActions from "./_components/TodoActions";

// 매 요청마다 최신 목록을 가져온다 (서버 컴포넌트)
export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-700">Todo List</h1>
        <Link
          href="/todos/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + 새 할 일
        </Link>
      </div>

      {todos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          할 일이 없습니다. 추가해보세요!
        </p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div>
                <p
                  className={
                    todo.completed
                      ? "text-gray-400 line-through"
                      : "text-gray-900"
                  }
                >
                  {todo.title}
                </p>
                <p className="text-xs text-gray-400">{todo.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/todos/${todo.id}`}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  수정
                </Link>
                <TodoActions todo={todo} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
