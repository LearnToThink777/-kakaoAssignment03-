# Todo List 프로젝트

주차(weekly) 단위로 할 일을 관리하는 Todo List 웹 애플리케이션.

## 1. 개요

- **목표**: 날짜(요일)별로 할 일을 등록/조회/관리하고, 검색·필터링할 수 있는 앱 구현
- **레퍼런스**: 데모 GIF 기준 (보라색 카드 UI, 주간 캘린더 + 할 일 목록)
- **상태**: 초기 기획 단계 (구현 전)

## 1-1. 과제 목표 (학습 목표)

- React(Vite) 기반 Todo 앱을 **Next.js App Router** 구조로 다시 만들어 보며, 파일 기반 라우팅(`page.tsx`, `layout.tsx` 등)의 동작 방식을 이해할 수 있다
- **Server Component와 Client Component의 차이**를 이해하고, 역할에 맞게 구분해서 적용할 수 있다
- **FastAPI로 Todo CRUD API**를 직접 구현하고, Next.js에서 `route.ts`를 통해 연동하는 **풀스택 흐름**을 경험할 수 있다
- **로컬스토리지 기반 상태 관리 → 서버 API 기반 데이터 흐름**으로 전환하며, 두 방식의 차이를 설명할 수 있다
- **환경변수**로 API 엔드포인트 등 민감한 값을 분리해 관리할 수 있다

## 2. 화면 구성 (위 → 아래)

1. **헤더**
   - 제목: `Todo List` (이탤릭, 보라색 강조)
2. **주간 네비게이션**
   - 현재 주차 범위 표시: `YYYY-MM-DD ~ YYYY-MM-DD` (예: `2026-05-18 ~ 2026-05-24`)
   - 좌측 `◀` / 우측 `▶` 화살표로 이전/다음 주 이동
3. **요일 카드 (7개)**
   - 월·화·수·목·금·토·일 가로 배치
   - 각 카드: 요일 라벨 + 날짜(일) + 해당 날짜의 할 일 개수(badge)
   - 선택된 날짜는 강조(진한 보라색 배경)
4. **할 일 입력**
   - 텍스트 입력: placeholder `할 일을 입력하세요`
   - `추가` 버튼 (또는 Enter)으로 등록
5. **검색 입력**
   - 돋보기 아이콘 + placeholder `검색어를 입력하세요`
   - 입력한 키워드로 목록 실시간 필터링
6. **상태 필터 탭**
   - `전체` / `진행 중` / `완료`
   - 선택된 탭 강조
7. **할 일 목록 / 빈 상태**
   - 항목 없을 때: `할 일이 없습니다. 추가해보세요!`
   - 항목 있을 때: 체크박스(완료 토글) + 내용 + 삭제 등

## 3. 기능 요구사항

### 필수
- [ ] 주간 캘린더 렌더링 (월~일 7일, 오늘 포함 주가 기본)
- [ ] 이전/다음 주 이동, 상단 날짜 범위 동기화
- [ ] 날짜 카드 클릭 시 해당 날짜 선택 → 목록 필터링
- [ ] 날짜 카드별 할 일 개수 표시
- [ ] 할 일 추가 (선택된 날짜에 귀속)
- [ ] 할 일 완료/미완료 토글
- [ ] 할 일 삭제
- [ ] 검색어로 목록 필터링
- [ ] 상태 필터 (전체 / 진행 중 / 완료)
- [ ] 빈 상태 메시지 표시

### 부가 (선택)
- [ ] localStorage 영속화 (새로고침 유지)
- [ ] 입력 유효성 검사 (빈 값 방지)
- [ ] 할 일 수정(인라인 편집)
- [ ] 반응형 레이아웃

## 4. 데이터 모델

```ts
interface Todo {
  id: string;          // uuid
  text: string;        // 할 일 내용
  date: string;        // 귀속 날짜 'YYYY-MM-DD'
  completed: boolean;  // 완료 여부
  createdAt: number;   // 생성 시각 (정렬용)
}

type StatusFilter = "all" | "active" | "done"; // 전체 / 진행 중 / 완료
```

## 5. 상태(State) 설계

| 상태 | 설명 |
| --- | --- |
| `todos` | 전체 할 일 배열 |
| `currentWeekStart` | 현재 주의 시작일(월요일) |
| `selectedDate` | 선택된 날짜 (목록 필터 기준) |
| `searchKeyword` | 검색 입력값 |
| `statusFilter` | 상태 필터 (`all`/`active`/`done`) |

**목록 파생값**: `selectedDate` → `searchKeyword` → `statusFilter` 순으로 필터링하여 표시.

## 6. 기술 스택

### 활용 스택

| Frontend | Backend |
| --- | --- |
| Next.js (v15+) | FastAPI (v0.111+) |
| React (v18+) | Uvicorn |
| TypeScript (v5) | SQLAlchemy |
| Tailwind CSS (v4) | SQLite |
| Axios | Pydantic (v2) |

### 적용 방식

- **프론트엔드**: Next.js App Router + TypeScript
  - Server / Client Component 구분 적용
  - `route.ts`(Route Handler)로 백엔드 API 연동
  - HTTP 통신: Axios
  - 스타일링: Tailwind CSS (v4)
- **백엔드**: FastAPI (Todo CRUD API)
  - ASGI 서버: Uvicorn
  - ORM: SQLAlchemy / DB: SQLite
  - 요청·응답 검증: Pydantic (v2)
- **데이터 흐름**: 서버 API 기반 (기존 `localStorage` 방식과 비교/전환)
- **환경변수**: API 엔드포인트 등 민감 값 분리 (`.env`, `NEXT_PUBLIC_*`)
- 상태관리: `useState` / `useReducer` (+ Context, 필요 시)

## 6-1. 현재 디렉토리 구조 (Mission 0 완료)

루트는 `kakaoAssignment03/`로 두고 `frontend/`·`backend/`를 분리.
(가이드의 `kakao-assignment-3` 대신 기존 폴더를 루트로 사용)

```
kakaoAssignment03/
├── frontend/                 # Next.js 16 (App Router) + TS + Tailwind v4
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   ├── package.json
│   ├── next.config.ts        # (가이드는 .mjs, 생성 기본값은 .ts)
│   ├── tsconfig.json
│   └── ...
├── backend/                  # FastAPI
│   ├── main.py               # 진입점 + /health (이후 CRUD/DB/스키마 추가)
│   ├── requirements.txt
│   └── .env.local
├── PROJECT.md
└── FEATURE-SPLIT.md          # 프론트/백엔드 기능 분담 정리
```

> 앞으로 미션마다 `app/api/todos/route.ts`, `app/todos/...`, `actions.ts` 등을 추가한다.

## 7. 컴포넌트 구조 (제안)

```
App
├─ Header
├─ WeekNavigator        // 날짜 범위 + 좌우 화살표
├─ WeekDays             // 요일 카드 7개
│  └─ DayCard           // 요일/날짜/개수
├─ TodoInput            // 입력 + 추가 버튼
├─ SearchBar            // 검색 입력
├─ StatusTabs           // 전체/진행 중/완료
└─ TodoList
   ├─ TodoItem          // 체크/내용/삭제
   └─ EmptyState        // 빈 상태 메시지
```

## 8. 작업 순서 (체크리스트)

1. [x] 프로젝트 셋업 (Next.js App Router + TS + Tailwind / FastAPI) — Mission 0
2. [ ] 레이아웃 / 카드 UI 스타일링
3. [ ] 주간 날짜 계산 유틸 + WeekNavigator
4. [ ] WeekDays / DayCard + 날짜 선택
5. [ ] TodoInput + 추가 로직
6. [ ] TodoList / TodoItem (토글·삭제)
7. [ ] SearchBar + StatusTabs 필터링
8. [ ] 날짜별 개수 badge 연동
9. [ ] FastAPI CRUD API + `route.ts` 연동 (서버 API 데이터 흐름)
10. [ ] 빈 상태 / 예외 처리 / 마무리

## 9. 문서화 / 학습 정리 규칙

작업 단위가 끝나면 `study-post` 스킬로 학습 정리 글을 만들어 GitHub Issue에 게시한다.
(게시는 직접 한다 — 자동 생성하지 않음)

- **스킬 위치**: `.claude/skills/study-post/` (이 프로젝트로 복사 완료)
  - `SKILL.md` — 워크플로 + 최종 Issue 출력 형식
  - `writing-guide.md` — **글쓰기 규칙 (반드시 준수)**
  - `note-template.md` — 학습 정리 입력 템플릿
- **분량/구성 지침**:
  - Mission 3부터: 설계 의도·동작·코드 근거를 충분히 녹여 길게 작성
  - Mission 4부터: 위에 더해 **트러블슈팅 과정을 별도 섹션으로 포함** (증상 → 원인 추적 → 해결, 실제 로그·명령·상태코드 근거)
- **저장 위치**: 각 미션의 채운 템플릿/완성 글은 `study-notes/mission-N-note.md`, `study-notes/mission-N-issue.md`
- **입력**: `note-template.md`를 채워서 `/study-post`에 전달. "막혔던 점"과 "실제 코드/근거"는 비우지 않는다.
- **준수 핵심 (writing-guide.md)**:
  - 존댓말 기술문, 회고·일기체·반말 금지
  - 개념 단정 대신 "제가 이해한 바 + 근거(코드/경험)" 서술
  - 한국어 AI 티 단어 금지 (다양한/효율적인/결론적으로 등), 강조용 볼드 금지
  - 문장 길이 들쭉날쭉, '것/점/의' 3회 이상 반복 금지
  - "나만 쓸 수 있는 문장" 최소 확보
- **최종 Issue 템플릿** (`SKILL.md` 출력 형식):
  - Title 칸 / Body 칸 분리
  - Body는 ````markdown 블록으로 감싸 원본 마크다운 복붙 가능하게
  - 본문에 참고 자료 섹션(공식 1차 문서 링크) 포함
