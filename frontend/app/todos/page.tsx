import { getTodos } from "@/app/actions";
import TodoBoard from "./_components/TodoBoard";

// 매 요청마다 최신 목록을 가져온다 (서버 컴포넌트)
export const dynamic = "force-dynamic";

export default async function TodosPage() {
  // 서버에서 데이터를 fetch해 클라이언트 컴포넌트에 props로 전달한다
  const todos = await getTodos();

  return (
    <main className="flex min-h-screen items-center justify-center bg-violet-100 p-6">
      <TodoBoard todos={todos} />
    </main>
  );
}
