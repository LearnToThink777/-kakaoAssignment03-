// 서버 전용: FastAPI 백엔드 주소를 환경변수에서 읽는다.
// BACKEND_URL은 NEXT_PUBLIC_ 접두사가 없어 브라우저에 노출되지 않는다.
// (클라이언트 컴포넌트에서 import 하지 말 것)
export function backendUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    throw new Error("환경변수 BACKEND_URL이 설정되지 않았습니다.");
  }
  return url;
}
