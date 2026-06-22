// API Route (백엔드 프록시).
// 클라이언트는 같은 출처인 /api/todos로 요청하고, 여기서 FastAPI로 전달한다.
// 백엔드 주소(API_BASE_URL)는 서버에만 있어 브라우저에 노출되지 않는다.
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { backendUrl } from "@/lib/backendUrl";

// 목록 조회 프록시
export async function GET() {
  const res = await fetch(`${backendUrl()}/todos`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// 생성 프록시
export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${backendUrl()}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  revalidatePath("/todos");
  return NextResponse.json(data, { status: res.status });
}
