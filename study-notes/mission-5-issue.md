Title 칸에 넣을 것:

```
[3차 과제] Mission 5 - route.ts 프록시와 actions.ts로 프론트-백엔드 연동
```

Body 칸에 넣을 것 (블록 안쪽을 그대로 복사):

````markdown
### 들어가며

페이지와 백엔드 API를 따로 만들어 둔 상태에서, 이번에 둘을 실제로 연결했습니다. 2차 과제는 `useEffect`로 로컬스토리지를 읽고 썼습니다. 이번에는 데이터가 서버에 있어 요청으로만 닿을 수 있고, 흐름이 클라이언트와 서버의 왕복으로 바뀌었습니다. 이 글은 route.ts와 actions.ts의 역할을 어떻게 나눴고, 연동하면서 짚어야 했던 지점들을 정리한 내용입니다.

### route.ts가 중간에 있는 이유

처음엔 클라이언트에서 FastAPI(`localhost:8000`)로 바로 부르면 되지 않나 싶었습니다. 굳이 한 단계를 더 두는 이유를 정리해 봤습니다.

제가 이해한 이유는 세 가지입니다. 먼저 백엔드 주소가 브라우저에 노출되지 않습니다. 클라이언트는 같은 출처의 `/api/todos`만 알고, 그 뒤의 FastAPI 주소는 서버에만 남습니다. 다음으로 같은 출처 요청이라 브라우저의 CORS 제약을 받지 않습니다. 마지막으로 인증 헤더나 검증 같은 공통 처리를 한 자리에 모을 수 있습니다.

### route.ts와 actions.ts의 역할 분담

둘 다 서버에서 돌지만 쓰임이 다릅니다. 제가 잡은 기준은 이렇습니다.

| | route.ts | actions.ts |
| --- | --- | --- |
| 역할 | HTTP 요청을 받아 FastAPI로 넘기는 프록시 | 서버 컴포넌트가 직접 부르는 서버 함수 |
| 호출 | 클라이언트가 `fetch('/api/todos')` | 페이지에서 `import { getTodos }` |
| 이번 쓰임 | 생성·수정·삭제 | 목록·단건 조회 |

조회는 화면을 그릴 때 서버에서 한 번에 끝내면 되니 actions.ts에서 FastAPI를 직접 부릅니다. 클라이언트에서 일어나는 변경은 route.ts 프록시를 거칩니다.

```ts
// app/actions.ts — 조회는 서버에서 FastAPI 직접 호출
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_BASE_URL}/todos`, { cache: "no-store" });
  if (!res.ok) throw new Error("할 일 목록을 불러오지 못했습니다.");
  return res.json();
}
```

```ts
// app/api/todos/route.ts — 생성 프록시
export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  revalidatePath("/todos");
  return NextResponse.json(data, { status: res.status });
}
```

클라이언트 폼은 이제 백엔드가 아니라 `/api/todos`로 보냅니다.

```ts
// app/todos/_components/TodoForm.tsx
const url = isEdit && todo ? `/api/todos/${todo.id}` : `/api/todos`;
const method = isEdit ? "PUT" : "POST";
await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
```

### 바뀐 데이터 흐름

요청은 이렇게 흐릅니다.

```
[브라우저 폼] → fetch('/api/todos') → [route.ts] → FastAPI → SQLite
[목록 페이지(서버)] → actions.getTodos() → FastAPI → SQLite
```

같은 백엔드를 두 경로가 보지만, 조회는 서버에서 직접, 변경은 클라이언트에서 프록시를 거쳐 닿습니다.

### 트러블슈팅

**1) route handler의 params도 Promise였다**

Mission 4에서 페이지의 `params`가 Promise인 걸 겪었는데, route handler도 같았습니다. `[id]` 프록시에서 `await` 없이 쓰면 타입이 맞지 않습니다.

```ts
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

**2) DELETE는 본문이 없어 따로 처리해야 했다**

PUT 프록시를 그대로 복사해 DELETE도 `res.json()`으로 짰다면 터졌을 겁니다. FastAPI의 DELETE는 204 No Content라 응답 본문이 없습니다. 빈 본문에 `json()`을 부르면 파싱에서 실패합니다. 그래서 DELETE는 본문 없이 상태 코드만 돌려주도록 나눴습니다.

```ts
export async function DELETE(_request: NextRequest, { params }) {
  const { id } = await params;
  const res = await fetch(`${API_BASE_URL}/todos/${id}`, { method: "DELETE" });
  revalidatePath("/todos");
  return new NextResponse(null, { status: res.status }); // 204 그대로
}
```

**3) 변경 후 목록이 바로 안 바뀔 뻔했다**

처음엔 route handler에서 `revalidatePath('/todos')`만 부르면 목록이 즉시 갱신될 줄 알았습니다. 공식 문서를 보니 route handler의 `revalidatePath`는 "다음 방문 시" 갱신을 표시할 뿐, 그 자리에서 바로 다시 그리지는 않습니다. 즉시 반영은 클라이언트에서 `router.refresh()`가 맡았습니다. 그래서 둘을 같이 뒀습니다. 프록시는 다음 방문을 대비해 표시하고, 폼·버튼은 변경 직후 `router.refresh()`로 서버 컴포넌트를 다시 불러옵니다.

```ts
// 클라이언트: 변경 직후
router.refresh();
```

**4) 더 이상 필요 없어진 환경변수 정리**

Mission 4에서는 클라이언트가 백엔드를 직접 불러 `NEXT_PUBLIC_API_BASE_URL`이 필요했습니다. 이제 클라이언트는 같은 출처 `/api`만 부르므로 그 변수를 지웠습니다. 결과적으로 백엔드 주소는 서버에만 남고 브라우저 번들에는 들어가지 않습니다.

### 확인한 것

- `POST /api/todos`로 만든 항목이 FastAPI를 직접 조회(`localhost:8000/todos`)했을 때 그대로 있었습니다. DB에 실제 저장된 셈입니다.
- `PUT /api/todos/{id}`는 200, `DELETE /api/todos/{id}`는 204였고, 프록시로 본 목록과 백엔드를 직접 본 목록이 일치했습니다.
- 목록 페이지 HTML이 삭제·수정 결과를 반영했습니다. 브라우저 네트워크 탭에서는 변경 요청만 `/api/todos`로 보이고, 목록은 서버에서 그려져 별도 호출이 잡히지 않습니다.

### 아직 확신이 없는 부분

`revalidateTag`나 `updateTag`를 쓰면 `router.refresh()` 없이도 즉시 반영이 더 깔끔해지는지 더 봐야 합니다. 프록시 계층에서 백엔드 5xx 같은 에러를 클라이언트에 어떻게 일관되게 전달할지도 아직 정리 중입니다.

### 참고 자료

- [Next.js — route.js (Route Handlers)](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Next.js — Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js — revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
````

Preview 탭으로 확인 후 게시하세요.

---

(라벨 제안: `study`, `mission-5`, `nextjs`, `route-handler`, `fullstack`)
