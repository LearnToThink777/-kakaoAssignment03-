# 학습 정리 입력 (Mission 4)

> note-template.md를 채운 원본. 게이트 항목(막혔던 점/판단)은 멘티 입장으로 임의 작성하되, 실제 진행 중 일어난 일을 근거로 함.

- 날짜: 2026-06-22
- 주제: Next.js App Router에서 Todo 페이지 구현 (Server/Client Component 구분, loading/error, 동적 라우트) (Mission 4)
- 배운 내용 (핵심만 불릿으로):
  - 목록·조회처럼 데이터를 보여주기만 하는 부분은 서버 컴포넌트, 입력·클릭·상태가 있는 부분만 `"use client"`로 분리한다.
  - `app/todos/page.tsx`(목록), `new/page.tsx`(생성), `[todoId]/page.tsx`(수정), `loading.tsx`, `error.tsx`를 한 세그먼트에 둔다.
  - Next 16에서 동적 라우트의 `params`는 Promise라 `await` 해야 한다.
  - 서버에서만 쓰는 값과 브라우저에 노출할 값을 환경변수 접두사(`NEXT_PUBLIC_`)로 구분한다.
  - 에러 경계 컴포넌트(error.tsx)는 클라이언트 컴포넌트여야 한다.
- 막혔던 점 / 시행착오:
  - 처음엔 거의 모든 컴포넌트에 `"use client"`를 붙이려 했다. 목록·수정 조회는 서버 컴포넌트로 두고 폼·버튼·에러 화면만 클라이언트로 나누면 됐다.
  - `[todoId]`에서 `const { todoId } = params`로 바로 꺼냈다가 Next 16에서는 params가 Promise라 타입 오류가 났다. `await params`로 고쳤다.
  - 수정 페이지에서 단건을 가져오려는데 백엔드에 `GET /todos/{id}`가 없었다. 목록을 받아 id로 찾는 방식으로 우회했다.
  - 환경변수를 `API_BASE_URL` 하나로 두고 클라이언트 폼에서 읽으니 undefined였다. 브라우저에 노출되려면 `NEXT_PUBLIC_` 접두사가 필요했고, `.env.local`은 dev 서버를 재시작해야 반영됐다.
  - error.tsx의 `reset` prop을 쓰려다, 16.2 문서가 `unstable_retry`를 권장해서 바꿨다.
  - error.tsx가 실제로 도는지 curl로 확인하려는데 에러 화면이 안 보였다. dev 모드에서는 에러 UI가 초기 HTML이 아니라 RSC 페이로드로 전달돼 curl(JS 미실행)로는 안 보였고, 서버 로그의 에러 digest로 확인했다.
- 실제 코드 / 파일명 / 숫자 등 근거:
  - 서버 컴포넌트: `app/todos/page.tsx`, `app/todos/[todoId]/page.tsx`, `app/todos/loading.tsx`
  - 클라이언트 컴포넌트: `app/todos/_components/TodoForm.tsx`, `TodoActions.tsx`, `app/todos/error.tsx`
  - 데이터 헬퍼: `lib/todos.ts`(getTodos/getTodo), 환경변수 `.env.local`(API_BASE_URL, NEXT_PUBLIC_API_BASE_URL)
  - 검증: `/todos` 200(시드 표시), `/todos/new` 200(폼), `/todos/1` 200(prefill), 없는 id는 not-found, `tsc --noEmit` exit 0
  - 서버 로그(강제 에러 확인): `⨯ Error: 강제 에러 테스트 at getTodos (lib\todos.ts) at TodosPage ... digest: '4115243759'`
- 직접 내린 판단 (A 대신 B를 택한 이유 등):
  - 단건 조회를 위해 백엔드를 건드리지 않고 목록 재사용으로 해결했다. 이 규모에선 충분하고, 데이터가 커지면 `GET /todos/{id}`를 추가하면 된다.
  - 폼 제출은 일단 클라이언트에서 직접 API를 호출하게 뒀다. 다음 미션에서 route.ts나 Server Actions로 옮길 예정.
  - error.tsx와 loading.tsx를 `/todos` 세그먼트에 둬서 목록 조회 실패와 지연 화면을 분리했다.
- 아직 헷갈리는 점:
  - dev 모드에서 not-found가 HTTP 200으로 나가는 동작(스트리밍)이 프로덕션에서는 어떻게 달라지는지
  - 클라이언트 폼에서 직접 호출하는 방식과 route.ts 프록시 방식의 경계
