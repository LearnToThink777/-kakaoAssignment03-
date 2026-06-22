# 학습 정리 입력 (Mission 6)

> note-template.md를 채운 원본. 게이트 항목(막혔던 점/판단)은 멘티 입장으로 임의 작성하되, 실제 진행 중 일어난 일을 근거로 함.

- 날짜: 2026-06-22
- 주제: 환경변수 분리 (프론트/백엔드 .env.local, 하드코딩 URL 제거) (Mission 6)
- 배운 내용 (핵심만 불릿으로):
  - 환경에 따라 달라지는 값(URL, DB 경로)을 코드에서 빼 `.env.local`로 옮긴다.
  - `NEXT_PUBLIC_` 접두사가 붙은 값만 브라우저 번들에 인라인되고, 없는 값은 서버에만 남는다.
  - 프론트: `NEXT_PUBLIC_API_URL`(클라이언트용 프록시 주소), `BACKEND_URL`(서버 전용 백엔드 주소).
  - 백엔드: `DATABASE_URL`, `FRONTEND_ORIGIN`을 .env.local에서 읽는다.
  - `.env*`는 .gitignore로 커밋에서 제외한다.
- 막혔던 점 / 시행착오:
  - 백엔드에서 `load_dotenv()`만 불렀더니 `.env`만 찾고 `.env.local`은 안 읽혔다. 파일명을 넘기고, 실행 위치와 무관하게 `Path(__file__).parent / ".env.local"`로 줬다.
  - 코드에 fallback으로 URL을 남길지 고민하다, 서버 값은 환경변수를 필수로 두고 없으면 명확히 실패(throw/KeyError)하게 했다. 그래야 "하드코딩 없음"이 진짜다.
  - grep으로 훑다 백엔드 CORS `allow_origins`에 `http://localhost:3000`이 그대로 박혀 있는 걸 발견해 `FRONTEND_ORIGIN`으로 뺐다.
  - 프론트 env 이름을 바꾼 뒤 dev 서버를 재시작해야 반영됐다.
- 실제 코드 / 파일명 / 숫자 등 근거:
  - `frontend/.env.local`: NEXT_PUBLIC_API_URL=http://localhost:3000/api, BACKEND_URL=http://localhost:8000
  - `backend/.env.local`: DATABASE_URL=sqlite:///./todos.db, FRONTEND_ORIGIN=http://localhost:3000
  - `frontend/lib/backendUrl.ts`(서버 전용 헬퍼, env 없으면 throw), 클라는 `process.env.NEXT_PUBLIC_API_URL ?? "/api"`
  - `backend/main.py`: load_dotenv + `os.environ["DATABASE_URL"]`, CORS `os.environ["FRONTEND_ORIGIN"].split(",")`
  - `backend/.gitignore` 신규(.env*, .venv, *.db 등), frontend/.gitignore는 `.env*` 이미 포함
  - 검증: 프록시 GET 200, CORS 응답 헤더 `access-control-allow-origin: http://localhost:3000`, POST→DB 저장 확인, `tsc --noEmit` exit 0
- 직접 내린 판단 (A 대신 B를 택한 이유 등):
  - 클라이언트엔 프록시 주소(`NEXT_PUBLIC_API_URL`)만 주고, 백엔드 주소(`BACKEND_URL`)는 서버에만 뒀다. 브라우저 번들에 백엔드 주소가 들어가지 않게.
  - 서버 환경변수는 fallback 없이 필수로 했다. 누락 시 조용히 기본값으로 도는 대신 바로 실패하도록.
  - CORS 허용 출처도 콤마 구분으로 받아 여러 출처를 env로 관리할 수 있게 했다.
- 아직 헷갈리는 점:
  - NEXT_PUBLIC_ 값은 빌드 시점에 고정되는데, 배포 환경마다 다른 값을 줘야 할 때 런타임 주입을 어떻게 하는지
  - .env.local / .env.development / .env 우선순위를 실제로 언제 갈라 써야 하는지
