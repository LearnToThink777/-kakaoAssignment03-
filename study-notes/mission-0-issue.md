Title 칸에 넣을 것:

```
[3차 과제] Mission 0 - Next.js App Router + FastAPI 구조 잡기
```

Body 칸에 넣을 것 (블록 안쪽을 그대로 복사):

````markdown
### 들어가며

2차 과제까지는 React(Vite)로 만든 Todo 앱을 브라우저 localStorage에 저장했습니다. 3차는 같은 앱을 Next.js App Router로 다시 세우고, 데이터 관리는 FastAPI 서버로 넘깁니다. 이번 글은 첫 단계인 프로젝트 구조 잡기를 정리한 내용입니다.

### 폴더가 곧 경로라는 App Router

제가 처음 이해한 App Router는 `page.tsx` 하나가 화면 하나에 대응하는 정도였습니다. 만들어 보니 `app/` 아래 폴더 경로 자체가 URL이었습니다. `app/page.tsx`는 `/`, 앞으로 추가할 `app/todos/page.tsx`는 `/todos`, `app/todos/[todoId]/page.tsx`는 `/todos/123`에 대응합니다. `layout.tsx`는 그 경로 묶음을 감싸는 공통 틀입니다.

지금은 `create-next-app`으로 생성한 `app/layout.tsx`, `app/page.tsx`, `app/globals.css`만 있습니다. 라우트와 API 파일은 다음 미션에서 하나씩 더합니다.

### route.ts를 프록시로 다시 이해한 부분

처음엔 `route.ts`도 URL을 정의하는 라우팅 파일이라고 봤습니다. 공식 문서를 확인하니 Route Handler는 요청을 직접 처리하는 핸들러였고, 이번 구조에서 제가 잡은 역할은 프론트가 FastAPI를 직접 부르지 않도록 중간에서 요청을 받아 백엔드로 넘기는 프록시였습니다. 흐름은 이렇습니다.

```
브라우저 UI → Next.js route.ts → FastAPI → SQLite
```

제가 생각하는 이 방식의 이점은 백엔드 주소 같은 값을 프론트 코드에 직접 박지 않고 환경변수로 분리할 수 있다는 데 있습니다.

### localStorage에서 서버로, 바뀐 책임

2차에서는 데이터의 저장과 검증, 형태를 프론트가 떠안았습니다. 3차에서는 FastAPI와 SQLite가 데이터의 단일 출처입니다. 그래서 CRUD와 검증(Pydantic), id·생성시각 발급은 백엔드로 넘기고, 프론트는 주간 캘린더와 날짜 선택, 검색·필터 같은 화면 표현에 집중하도록 나눴습니다.

검색과 상태·날짜 필터는 서버 쿼리로 넘길 수도 있었습니다. 이번에는 SQLite에 단일 사용자 규모라 목록을 받아 프론트에서 거르는 쪽을 택했습니다. 단순함을 먼저 본 선택이고, 데이터가 커지면 서버 필터링으로 옮길 생각입니다.

### 구조 결정 하나

가이드는 `kakao-assignment-3` 폴더를 새로 만들라고 안내했습니다. 저는 이미 기획 문서가 들어 있던 작업 폴더를 루트로 그대로 썼습니다. 폴더를 한 겹 더 만들면 기존 문서가 떨어져 나가기 때문입니다. 대신 그 안에서 `frontend`와 `backend`를 나눠 가이드의 분리 의도는 지켰습니다.

생성 결과는 Next 16.2.9, React 19.2.4, Tailwind v4, TypeScript 5입니다. 가이드 예시의 `next.config.mjs`와 달리 실제로는 `next.config.ts`가 생성됐는데, 확장자만 다르고 동작은 같아 그대로 뒀습니다.

### 아직 확신이 없는 부분

Server Component와 Client Component의 경계, 그리고 `route.ts`(Route Handler)와 `actions.ts`(Server Actions)가 각각 어디까지 맡는지는 아직 명확히 잡히지 않았습니다. 다음 미션에서 실제로 데이터를 주고받으며 확인하려 합니다.

### 참고 자료

- [Next.js — Layouts and Pages (파일 기반 라우팅)](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Next.js — route.js (Route Handlers)](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
````

Preview 탭으로 확인 후 게시하세요.

---

(라벨 제안: `study`, `mission-0`, `nextjs`, `fastapi`)
