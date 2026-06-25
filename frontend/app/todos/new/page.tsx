import TodoForm from "../_components/TodoForm";

// 페이지 자체는 서버 컴포넌트, 폼만 클라이언트 컴포넌트
export default function NewTodoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-violet-100 p-6">
      <TodoForm mode="create" />
    </main>
  );
}
