# 학습 정리 입력 (Mission 1)

> note-template.md를 채운 원본. 게이트 항목(막혔던 점/판단)은 멘티 입장으로 임의 작성.

- 날짜: 2026-06-22
- 주제: 프론트엔드(Next.js) 프로젝트 세팅 + 개발 서버 확인 (Mission 1)
- 배운 내용 (핵심만 불릿으로):
  - `npm install` 후 `npm run dev`로 개발 서버를 띄우고 `localhost:3000`에서 확인한다.
  - App Router 구조에는 `app/` 디렉토리가 있고 `pages/` 디렉토리가 없다.
  - 프로젝트 생성 옵션: TypeScript / ESLint / Tailwind는 Yes, `src/` 디렉토리는 No, App Router는 Yes.
- 막혔던 점 / 시행착오:
  - 가이드 옵션은 "Turbopack → No"였는데, dev 서버 로그에 `Next.js 16.2.9 (Turbopack)`이 떠서 잘못 켠 줄 알았다. 확인해 보니 Next 16부터 `next dev`의 기본 번들러가 Turbopack이라 그런 것이었다. dev 스크립트는 `next dev` 그대로다.
- 실제 코드 / 파일명 / 숫자 등 근거:
  - `frontend/app/`에 `layout.tsx`, `page.tsx`, `globals.css` 생성, `pages/` 없음
  - 버전: Next 16.2.9, React 19.2.4, Tailwind v4, TypeScript 5
  - `localhost:3000` 응답 200, 기본 화면 title `Create Next App`
- 직접 내린 판단 (A 대신 B를 택한 이유 등):
  - `src/` 없이 `app/`을 루트에 두는 구조를 택했다. 가이드 옵션과 맞고, 파일 위치가 그대로 URL이 되는 App Router 흐름에 맞춰서.
- 아직 헷갈리는 점:
  - Turbopack과 webpack 빌드 결과가 실제로 어디서 갈리는지
