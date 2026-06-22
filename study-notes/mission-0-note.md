# 학습 정리 입력 (Mission 0)

> note-template.md를 채운 원본. 게이트 항목(막혔던 점/판단)은 멘티 입장으로 임의 작성.

- 날짜: 2026-06-22
- 주제: Next.js App Router + FastAPI 풀스택 구조 잡기 (Mission 0)
- 배운 내용 (핵심만 불릿으로):
  - App Router는 `app/` 폴더 구조가 곧 URL이 된다 (`page.tsx`, `layout.tsx`)
  - 프론트(Next.js)와 백엔드(FastAPI) 디렉토리를 완전히 분리, `route.ts`가 백엔드 프록시 역할
  - 2차의 localStorage 저장 → 3차는 FastAPI + SQLite가 데이터의 단일 출처
- 막혔던 점 / 시행착오:
  - 처음엔 `route.ts`를 "URL을 정의하는 라우팅 파일"로 이해했는데, 이번 구조에서는 프론트가 FastAPI를 직접 부르지 않고 그 사이에서 요청을 받아 백엔드로 넘기는 프록시 계층이었다.
  - `app/`을 page.tsx 한 개당 화면 하나 정도로만 봤는데, 폴더 경로 자체가 URL 세그먼트가 된다는 점을 뒤늦게 잡았다.
  - 가이드의 `next.config.mjs`와 달리 create-next-app이 `next.config.ts`를 만들어서 잠깐 다른 줄 알았다 (동작은 동일).
- 실제 코드 / 파일명 / 숫자 등 근거:
  - 생성 파일: `frontend/app/layout.tsx`, `frontend/app/page.tsx`, `frontend/app/globals.css`
  - 백엔드: `backend/main.py`(`/health`), `requirements.txt`
  - 버전: Next 16.2.9, React 19.2.4, Tailwind v4, TypeScript 5
- 직접 내린 판단 (A 대신 B를 택한 이유 등):
  - 가이드는 `kakao-assignment-3` 폴더를 새로 만들라 했지만, 이미 기획 문서가 든 작업 폴더를 루트로 그대로 썼다. 폴더를 한 겹 더 만들면 문서가 분리되기 때문.
  - 검색/상태/날짜 필터를 서버 쿼리로 넘기지 않고 프론트에서 거르기로 했다. SQLite·단일 사용자 규모라 단순함을 먼저 봤고, 데이터가 커지면 서버 필터링으로 옮길 생각.
- 아직 헷갈리는 점:
  - Server Component와 Client Component의 경계
  - `route.ts`(Route Handler)와 `actions.ts`(Server Actions)가 각각 어디까지 맡는지
