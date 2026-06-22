Title 칸에 넣을 것:

```
[3차 과제] Mission 4 - Next.js Todo 페이지와 Server/Client Component 구분
```

Body 칸에 넣을 것 (블록 안쪽을 그대로 복사):

````markdown
### 들어가며

백엔드 CRUD API를 만든 뒤, 이번에는 그 데이터를 화면에 붙였습니다. App Router에서 목록, 생성, 수정 페이지를 만들고 로딩과 에러 화면을 더했습니다. 2차 과제는 모든 컴포넌트가 클라이언트에서 돌았는데, Next.js는 기본이 서버 컴포넌트이고 필요한 자리에만 `"use client"`를 붙입니다. 이 글은 그 경계를 어떻게 나눴고, 도중에 어디서 막혔는지를 정리한 내용입니다.

### 어디까지 서버이고 어디부터 클라이언트인가

시작 전에 스스로 물어본 질문은 두 가지였습니다. 사용자 인터랙션이 필요한 부분은 어디인가, 데이터를 보여주기만 하는 부분은 어디인가.

제가 내린 구분은 이렇습니다. 목록을 불러와 그리는 일, 수정 대상 한 건을 읽어 오는 일은 데이터를 보여주는 쪽이라 서버 컴포넌트로 뒀습니다. 입력값을 다루는 폼, 완료 토글과 삭제 버튼, 에러 화면은 상태와 클릭이 있어 클라이언트 컴포넌트로 나눴습니다.

처음엔 거의 모든 파일에 `"use client"`를 붙이려 했습니다. 2차의 습관이 남아 있었습니다. 정리해 보니 서버 컴포넌트를 기본으로 두고, 인터랙션이 있는 조각만 클라이언트로 떼어 내는 편이 맞았습니다.

### 만든 파일과 라우팅

`app/` 아래 폴더가 그대로 URL이 됩니다.

```
app/todos/
├── page.tsx                # /todos        목록 (서버)
├── new/page.tsx            # /todos/new    생성 (서버 셸 + 클라이언트 폼)
├── [todoId]/page.tsx       # /todos/123    수정 (서버 조회 + 클라이언트 폼)
├── loading.tsx             # 로딩 UI (서버)
├── error.tsx               # 에러 UI (클라이언트)
└── _components/
    ├── TodoForm.tsx        # 생성·수정 공용 폼 (클라이언트)
    └── TodoActions.tsx     # 완료 토글 / 삭제 (클라이언트)
```

### 데이터는 서버에서, 인터랙션은 클라이언트에서

목록 페이지는 서버에서 데이터를 받아 그립니다. 데이터 호출은 `lib/todos.ts`로 빼 뒀습니다.

```tsx
// app/todos/page.tsx (서버 컴포넌트)
import { getTodos } from "@/lib/todos";
import TodoActions from "./_components/TodoActions";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const todos = await getTodos();
  // ...목록을 그리고, 각 항목에 <TodoActions todo={todo} />를 끼운다
}
```

폼은 입력 상태와 제출이 있어 클라이언트 컴포넌트입니다.

```tsx
// app/todos/_components/TodoForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function TodoForm({ mode, todo }) {
  const router = useRouter();
  const [title, setTitle] = useState(todo?.title ?? "");
  // ...제출 시 POST 또는 PUT, 그 뒤 router.push("/todos") + router.refresh()
}
```

서버 컴포넌트가 데이터를 받아 클라이언트 컴포넌트에 props로 넘기고, 클라이언트 컴포넌트가 클릭과 입력을 맡습니다. 서버에서 한 번 그린 화면 위에 필요한 조각만 브라우저에서 살아나는 구조로 제가 이해했습니다.

### 환경변수로 서버 값과 브라우저 값을 가르기

API 주소는 환경변수로 뺐습니다. 여기서 한 번 막혔는데, 그 과정은 아래 트러블슈팅에 적었습니다. 결과만 보면 두 개로 나눴습니다.

```
# .env.local
API_BASE_URL=http://localhost:8000              # 서버 컴포넌트용 (브라우저 비노출)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000  # 클라이언트 컴포넌트용 (브라우저 노출)
```

서버에서 부르는 `getTodos`는 `API_BASE_URL`을 읽고, 브라우저에서 도는 폼은 `NEXT_PUBLIC_API_BASE_URL`을 읽습니다.

### loading.tsx와 error.tsx

두 파일을 `/todos` 세그먼트에 두면, 목록을 불러오는 동안 로딩 화면이 뜨고 조회가 실패하면 에러 화면으로 바뀝니다. loading.tsx는 평범한 서버 컴포넌트입니다. error.tsx는 클라이언트 컴포넌트여야 합니다.

```tsx
// app/todos/error.tsx
"use client"; // 에러 경계는 클라이언트 컴포넌트여야 한다

export default function Error({ error, unstable_retry }) {
  return (
    <main className="...">
      <h2>문제가 발생했습니다</h2>
      <p>{error.message}</p>
      <button onClick={() => unstable_retry()}>다시 시도</button>
    </main>
  );
}
```

처음엔 재시도 버튼에 `reset`을 쓰려 했는데, 제가 쓰는 16.2.9 문서는 `unstable_retry`를 권장하고 있어 그쪽으로 맞췄습니다.

### 트러블슈팅

**1) params가 Promise였다**

수정 페이지에서 `const { todoId } = params`로 바로 값을 꺼냈더니 타입이 맞지 않았습니다. Next 16에서 동적 라우트의 `params`는 Promise라, `await`로 풀어야 했습니다.

```tsx
export default async function EditTodoPage({
  params,
}: {
  params: Promise<{ todoId: string }>;
}) {
  const { todoId } = await params;
  // ...
}
```

**2) 클라이언트에서 환경변수가 undefined로 나왔다**

폼에서 `process.env.API_BASE_URL`을 읽었더니 undefined였습니다. 서버에서는 잘 읽히던 값이라 한참 헷갈렸습니다. 원인은 노출 범위였습니다. Next.js는 `NEXT_PUBLIC_` 접두사가 붙은 값만 브라우저 번들에 넣습니다. 접두사가 없는 값은 서버에만 남습니다. 그래서 클라이언트용으로 `NEXT_PUBLIC_API_BASE_URL`을 따로 뒀습니다. `.env.local`을 고친 뒤에도 한 번 더 막혔는데, dev 서버를 재시작하고 나서야 값이 반영됐습니다.

**3) 단건 조회 엔드포인트가 없었다**

수정 페이지는 id로 한 건을 읽어야 하는데, 백엔드에는 `GET /todos/{id}`가 없었습니다(Mission 3에서 목록·생성·수정·삭제만 만들었습니다). 백엔드를 늘리는 대신, 목록을 받아 id로 찾는 방식으로 우회했습니다.

```ts
export async function getTodo(id: number): Promise<Todo | null> {
  const todos = await getTodos();
  return todos.find((todo) => todo.id === id) ?? null;
}
```

**4) error.tsx가 진짜 도는지 확인하기**

에러 화면이 실제로 잡히는지 보려고 백엔드를 잠깐 내리고 `/todos`를 호출했습니다. 그런데 curl로 받은 HTML에 에러 화면이 보이지 않았습니다. 처음엔 error.tsx가 안 걸리는 줄 알았습니다.

원인을 좁히려고 `getTodos`에 강제로 에러를 던지고 다시 호출했더니, 서버 로그에 에러가 분명히 찍혔습니다.

```
⨯ Error: 강제 에러 테스트
    at getTodos (lib\todos.ts)
    at TodosPage (app\todos\page.tsx)
  digest: '4115243759'
```

에러는 프레임워크의 에러 경계까지 전파됐고 digest도 발급됐습니다. 그런데도 curl HTML에는 에러 화면 마크업이 없었습니다. 제가 내린 결론은 이렇습니다. dev 모드에서 서버 컴포넌트가 던진 에러의 화면은 초기 HTML로 직접 그려지지 않고 RSC 페이로드로 전달돼 브라우저에서 그려집니다. curl은 자바스크립트를 실행하지 않으니 그 화면을 못 본 셈입니다. 성공 페이지가 curl로 잘 보였던 것과 대비됩니다.

덤으로 알게 된 점이 있습니다. 없는 id로 들어가면 not-found 화면이 뜨는데 HTTP 상태는 404가 아니라 200이었습니다. 공식 문서를 보니 스트리밍 중에는 응답 헤더가 이미 나가 상태 코드를 바꿀 수 없고, 대신 `noindex` 메타 태그를 넣어 색인을 막는다고 되어 있었습니다.

### 직접 내린 판단

단건 조회를 위해 백엔드를 건드리지 않고 목록 재사용으로 풀었습니다. 지금 규모에선 충분하고, 데이터가 커지면 `GET /todos/{id}`를 더하면 됩니다.

폼 제출은 일단 클라이언트에서 API를 직접 부르게 뒀습니다. 다음 미션에서 route.ts나 Server Actions로 옮길 자리라고 봅니다.

### 아직 확신이 없는 부분

dev 모드에서 not-found가 200으로 나가는 동작이 프로덕션에서는 어떻게 달라지는지 더 봐야 합니다. 클라이언트 폼에서 직접 부르는 방식과 route.ts 프록시 방식 사이의 경계도 아직 흐릿합니다.

### 참고 자료

- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js — loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [Next.js — error.js](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Next.js — Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
````

Preview 탭으로 확인 후 게시하세요.

---

(라벨 제안: `study`, `mission-4`, `nextjs`, `app-router`, `frontend`)
