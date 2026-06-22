// 서버에서 실행되는 데이터 함수.
// 목록/단건 "조회"는 여기서 FastAPI를 직접 호출한다 (서버 컴포넌트가 사용).
// 생성/수정/삭제는 클라이언트가 route.ts(/api/todos)를 거쳐 보낸다.
import type { Todo } from "@/lib/todos";
import { backendUrl } from "@/lib/backendUrl";

// 전체 목록 조회
export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${backendUrl()}/todos`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("할 일 목록을 불러오지 못했습니다.");
  }
  return res.json();
}

// 단건 조회: 백엔드에 GET /todos/{id}가 없어 목록에서 찾는다
export async function getTodo(id: number): Promise<Todo | null> {
  const todos = await getTodos();
  return todos.find((todo) => todo.id === id) ?? null;
}
