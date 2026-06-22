# 학습 정리 입력 (Mission 5)

> note-template.md를 채운 원본. 게이트 항목(막혔던 점/판단)은 멘티 입장으로 임의 작성하되, 실제 진행 중 일어난 일을 근거로 함.

- 날짜: 2026-06-22
- 주제: API Route(route.ts)와 Server 함수(actions.ts)로 프론트-백엔드 연동 (Mission 5)
- 배운 내용 (핵심만 불릿으로):
  - 조회는 actions.ts에서 FastAPI를 직접 호출(서버 컴포넌트가 사용), 클라이언트발 생성/수정/삭제는 route.ts 프록시를 거친다.
  - route.ts가 중간에 있으면 백엔드 주소가 브라우저에 노출되지 않고, 같은 출처 요청이라 브라우저 CORS가 필요 없다.
  - Next 16에서는 route handler의 `params`도 Promise라 `await` 해야 한다.
  - DELETE는 204(본문 없음)라, 프록시에서 `res.json()`을 부르지 않고 빈 응답을 돌려준다.
  - route handler의 `revalidatePath`는 "다음 방문 시" 갱신 표시일 뿐, 즉시 반영은 클라이언트 `router.refresh()`가 한다.
- 막혔던 점 / 시행착오:
  - route.ts와 actions.ts 역할이 처음엔 헷갈렸다. 둘 다 변경을 둘까 했는데, 조회는 actions(서버 직접), 클라이언트발 변경은 route 프록시로 가른다는 모델을 잡았다.
  - DELETE 프록시를 PUT과 똑같이 `res.json()`으로 짰다면 204 빈 본문에서 터졌을 것이다. DELETE는 `new NextResponse(null, { status: 204 })`로 분리했다.
  - 변경 후 목록이 안 바뀔까 걱정했는데, route handler의 `revalidatePath('/todos')`는 다음 방문 표시라 즉시 반영은 `router.refresh()`로 해야 했다(공식 문서 확인).
  - 클라이언트가 같은 출처 `/api`로 부르게 바꾸면서, 더 이상 쓰지 않는 `NEXT_PUBLIC_API_BASE_URL`을 `.env.local`에서 제거했다.
- 실제 코드 / 파일명 / 숫자 등 근거:
  - `app/actions.ts`: getTodos/getTodo (FastAPI 직접 조회), `API_BASE_URL`(서버 전용)
  - `app/api/todos/route.ts`: GET/POST 프록시, `app/api/todos/[id]/route.ts`: PUT/DELETE 프록시 + revalidatePath
  - 클라이언트 변경: TodoForm/TodoActions가 `/api/todos`(같은 출처)로 호출
  - 검증: POST `/api/todos`→201(id:2), 8000 직접 조회에 id:2 존재, PUT→200, DELETE→204, `/api/todos`와 8000 최종 상태 일치, 목록 페이지 HTML이 최신 반영, `tsc --noEmit` exit 0
- 직접 내린 판단 (A 대신 B를 택한 이유 등):
  - 조회는 actions.ts 직접 호출(서버에서 한 번에 렌더), 클라이언트발 변경은 route.ts 프록시. 가이드의 역할 모델을 그대로 따랐다.
  - 갱신은 route handler의 revalidatePath(다음 방문 대비)와 클라이언트 router.refresh(즉시 반영)를 함께 뒀다.
  - 백엔드 주소를 브라우저에서 감추려고 NEXT_PUBLIC_ 변수를 없앴다.
- 아직 헷갈리는 점:
  - revalidateTag/updateTag를 쓰면 router.refresh 없이도 즉시 반영이 깔끔해지는지
  - 프록시 계층에서 에러(백엔드 5xx)를 클라이언트에 어떻게 일관되게 전달할지
