Title 칸에 넣을 것:

```
[3차 과제] Mission 1 - Next.js 프론트엔드 세팅과 첫 실행
```

Body 칸에 넣을 것 (블록 안쪽을 그대로 복사):

````markdown
### 들어가며

전체 구조를 잡은 다음, 프론트엔드를 실제로 띄워 봤습니다. 2차 과제는 `npm create vite@latest`로 시작해 `src/` 안에 컴포넌트를 뒀습니다. 이번에는 Next.js라 `app/` 디렉토리가 그 역할을 대신하고, 파일 위치 자체가 URL 경로가 됩니다.

### 세팅과 첫 실행

생성한 프론트엔드 폴더에서 의존성을 설치하고 개발 서버를 띄웠습니다.

```bash
cd frontend
npm install
npm run dev
```

프로젝트 생성 옵션은 TypeScript, ESLint, Tailwind를 켜고, `src/` 디렉토리는 끄고, App Router는 켜는 쪽으로 골랐습니다. 그래서 폴더 구조의 기준이 `src/`가 아니라 `app/`이 됩니다.

`localhost:3000`에 접속하니 Next.js 기본 화면이 떴습니다. 생성된 구조를 보면 `app/` 아래에 `layout.tsx`, `page.tsx`, `globals.css`가 있고 `pages/` 디렉토리는 없습니다. 제가 이해한 App Router의 표시가 바로 이 부분입니다. `pages/`가 없고 `app/`이 있으면 App Router 구조입니다.

### Turbopack 기본값에서 한 번 멈춤

가이드의 생성 옵션에는 "Turbopack → No"가 있었습니다. 그런데 개발 서버를 띄우니 로그에 이렇게 떴습니다.

```
▲ Next.js 16.2.9 (Turbopack)
- Local:  http://localhost:3000
✓ Ready in 734ms
```

옵션을 잘못 골랐나 싶었습니다. 확인해 보니 제 `dev` 스크립트는 `next dev` 그대로였고, 플래그를 따로 붙이지 않았습니다. Next 16부터 `next dev`의 기본 번들러가 Turbopack으로 바뀐 것이었습니다. 가이드의 옵션은 Next 15 기준이라, 버전 차이에서 온 표시였습니다. 동작에는 문제가 없어 그대로 뒀습니다.

### 2차와 달라진 점

2차에서는 `src/`가 코드의 기준이었습니다. 이번에는 `app/`이 그 자리를 차지하고, 폴더 경로가 곧 화면 주소가 됩니다. 지금은 `app/page.tsx` 하나가 `/`에 대응하는 상태이고, 라우트는 다음 미션부터 폴더를 더해 가며 늘릴 예정입니다.

### 설치된 버전

Next 16.2.9, React 19.2.4, Tailwind v4, TypeScript 5입니다.

### 참고 자료

- [Next.js — Layouts and Pages (파일 기반 라우팅)](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Next.js — Project structure](https://nextjs.org/docs/app/getting-started/project-structure)
````

Preview 탭으로 확인 후 게시하세요.

---

(라벨 제안: `study`, `mission-1`, `nextjs`, `frontend`)
