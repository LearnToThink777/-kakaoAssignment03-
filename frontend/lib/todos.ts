// 백엔드(FastAPI) 응답 형태와 맞춘 타입
export type Todo = {
  id: number;
  title: string;
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
  created_at: string;
};
