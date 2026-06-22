Title 칸에 넣을 것:

```
[3차 과제] Mission 6 - 환경변수로 URL과 민감 값 분리하기
```

Body 칸에 넣을 것 (블록 안쪽을 그대로 복사):

````markdown
### 들어가며

지금까지 코드 곳곳에 `http://localhost:8000`을 직접 적어 왔습니다. 이번에는 그 값을 환경변수로 빼냈습니다. 2차 과제는 외부 서버와 통신하지 않아 환경변수가 필요 없었습니다. 프론트와 백엔드가 나뉜 순간부터 URL이나 DB 경로처럼 환경마다 달라지는 값은 코드 밖에 둬야 합니다. 코드에 박아 두면 개발과 배포에서 주소가 달라질 때마다 코드를 고쳐야 하기 때문입니다.

### 무엇을 어디에 뒀나

값을 두 가지 기준으로 나눴습니다. 브라우저가 알아도 되는 값인가, 서버에만 있어야 하는 값인가.

```
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api   # 클라이언트용: route.ts 프록시 주소
BACKEND_URL=http://localhost:8000               # 서버 전용: FastAPI 주소

# backend/.env.local
DATABASE_URL=sqlite:///./todos.db
FRONTEND_ORIGIN=http://localhost:3000
```

제가 이해한 `NEXT_PUBLIC_`의 의미는 이렇습니다. 이 접두사가 붙은 값만 빌드 때 브라우저 번들에 인라인됩니다. 접두사가 없는 값은 서버에만 남고 브라우저로 가지 않습니다. 그래서 클라이언트가 쓰는 프록시 주소에는 `NEXT_PUBLIC_`을 붙이고, 백엔드 주소에는 붙이지 않았습니다. 백엔드 주소가 브라우저로 새 나가지 않게 하려는 의도입니다.

### 코드에서 URL을 걷어내기

서버에서 백엔드 주소를 읽는 부분은 작은 헬퍼로 모았습니다. 값이 없으면 조용히 기본값으로 도는 대신 바로 실패하게 했습니다.

```ts
// frontend/lib/backendUrl.ts (서버 전용)
export function backendUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    throw new Error("환경변수 BACKEND_URL이 설정되지 않았습니다.");
  }
  return url;
}
```

```ts
// actions.ts / route.ts 에서
const res = await fetch(`${backendUrl()}/todos`, { cache: "no-store" });
```

클라이언트는 프록시 주소를 환경변수에서 읽습니다. 값이 없으면 같은 출처의 상대 경로로 떨어지게 뒀습니다.

```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const url = isEdit && todo ? `${apiUrl}/todos/${todo.id}` : `${apiUrl}/todos`;
```

백엔드도 DB 경로를 코드에서 뺐습니다.

```python
# backend/main.py
load_dotenv(Path(__file__).parent / ".env.local")
DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
```

### 트러블슈팅

**1) load_dotenv가 .env.local을 안 읽었다**

처음엔 `load_dotenv()`만 불렀습니다. 그런데 DB 경로가 잡히지 않았습니다. 확인해 보니 인자 없는 `load_dotenv()`는 `.env`를 찾고 `.env.local`은 찾지 않았습니다. 게다가 기본 동작은 실행 위치(cwd)를 기준으로 파일을 찾습니다. uvicorn을 다른 폴더에서 띄우면 못 읽을 수 있습니다. 그래서 파일명을 명시하고, 실행 위치와 무관하게 이 파일 기준 경로로 줬습니다.

```python
load_dotenv(Path(__file__).parent / ".env.local")
```

**2) fallback 기본값을 남길지 말지**

서버 값에 `process.env.BACKEND_URL ?? "http://localhost:8000"`처럼 기본값을 둘 수도 있었습니다. 편하지만 그러면 코드에 URL이 그대로 남습니다. 이번 미션의 목표가 하드코딩 제거라, 서버 값은 환경변수를 필수로 두고 없으면 실패하게 했습니다. 설정 누락을 조용히 넘기지 않고 바로 드러내는 쪽을 택했습니다.

**3) CORS 출처가 코드에 박혀 있었다**

URL을 다 뺐다고 생각하고 `localhost`로 코드를 훑었습니다. 백엔드 CORS 설정에 `allow_origins=["http://localhost:3000"]`이 그대로 남아 있었습니다. 이 주소도 환경마다 달라질 값이라 환경변수로 뺐습니다. 콤마로 구분해 여러 출처를 받을 수 있게 했습니다.

```python
allowed_origins = os.environ["FRONTEND_ORIGIN"].split(",")
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, ...)
```

확인은 프리플라이트로 했습니다. 백엔드에 `Origin` 헤더를 실어 보내니 응답에 `access-control-allow-origin: http://localhost:3000`이 돌아왔습니다. 환경변수 값이 그대로 반영된 셈입니다.

### .gitignore

`.env.local`에는 민감 값이 들어가니 커밋에서 빼야 합니다. 프론트는 create-next-app이 만든 `.gitignore`에 이미 `.env*`가 있었습니다. 백엔드에는 `.gitignore`가 없어 새로 만들었습니다.

```
# backend/.gitignore
.env
.env.*
.venv/
__pycache__/
*.db
```

### 확인한 것

- 프록시로 목록을 부르면 200으로 돌아왔습니다. 서버가 `BACKEND_URL`을 읽어 FastAPI까지 닿은 셈입니다.
- 생성 요청을 보낸 뒤 FastAPI를 직접 조회하니 그 항목이 있었습니다. DB 경로도 환경변수로 잘 잡힌 것입니다.
- 코드에서 `localhost`로 다시 훑었을 때, 남은 것은 환경변수 파일과 SVG 네임스페이스뿐이었습니다. 로직 코드에는 백엔드 URL이 없습니다.

### 아직 확신이 없는 부분

`NEXT_PUBLIC_` 값은 빌드 시점에 고정됩니다. 배포 환경마다 다른 값을 줘야 할 때 런타임에 어떻게 주입하는지는 더 봐야 합니다. `.env.local`과 `.env.development`, `.env`의 우선순위를 실제로 언제 갈라 써야 하는지도 아직 정리 중입니다.

### 참고 자료

- [Next.js — Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
- [python-dotenv (PyPI)](https://pypi.org/project/python-dotenv/)
- [FastAPI — CORS](https://fastapi.tiangolo.com/tutorial/cors/)
````

Preview 탭으로 확인 후 게시하세요.

---

(라벨 제안: `study`, `mission-6`, `env`, `nextjs`, `fastapi`)
