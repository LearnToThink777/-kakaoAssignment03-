// 단건 수정/삭제 프록시. 클라이언트는 /api/todos/{id}로 요청한다.
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { backendUrl } from "@/lib/backendUrl";

// 수정 프록시
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${backendUrl()}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  revalidatePath("/todos");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// 삭제 프록시 (FastAPI는 204 No Content를 반환)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${backendUrl()}/todos/${id}`, { method: "DELETE" });
  revalidatePath("/todos");
  return new NextResponse(null, { status: res.status });
}
