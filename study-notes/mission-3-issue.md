Title 칸에 넣을 것:

```
[3차 과제] Mission 3 - FastAPI로 Todo CRUD API 구현하기
```

Body 칸에 넣을 것 (블록 안쪽을 그대로 복사):

````markdown
### 들어가며

백엔드 서버를 띄운 다음, 이번에는 Todo 데이터를 실제로 다루는 API를 만들었습니다. 2차 과제는 데이터를 브라우저 localStorage에 넣고 뺐는데, 이번에는 FastAPI가 SQLite에 저장하고 프론트는 HTTP로 그 데이터를 주고받습니다. 구현할 엔드포인트는 네 개입니다.

| Method | URL | 설명 |
| --- | --- | --- |
| GET | `/todos` | 전체 목록 조회 |
| POST | `/todos` | 새 Todo 생성 |
| PUT | `/todos/{id}` | Todo 수정 |
| DELETE | `/todos/{id}` | Todo 삭제 |

이 글은 데이터 모델을 어떻게 잡았고, 각 엔드포인트가 어떻게 동작하며, 중간에 어디서 막혔는지를 정리한 내용입니다.

### 모델과 스키마를 나눈 이유

처음엔 데이터 정의를 하나로 끝내려 했습니다. 클래스 하나에 모든 필드를 넣고 저장에도 응답에도 같이 쓰면 된다고 봤습니다. 만들다 보니 그렇게 두면 곤란한 자리가 나왔습니다. 응답에는 `id`와 `created_at`이 들어가야 하는데, 생성 요청에는 그 두 값이 없어야 합니다. id는 DB가 발급하고 생성 시각도 서버가 찍기 때문입니다.

그래서 제가 이해한 구분은 이렇습니다. SQLAlchemy 모델은 테이블이 어떻게 생겼는지를 정의하고, Pydantic 스키마는 요청과 응답에서 오가는 데이터의 형태를 정의합니다. 둘은 닮았지만 목적이 다릅니다.

```python
# DB 모델 (테이블 구조)
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False, index=True)  # 'YYYY-MM-DD'
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
```

```python
# 요청/응답 스키마
class TodoCreate(BaseModel):       # 생성 입력: id, created_at 없음
    title: str
    date: str
    completed: bool = False

class TodoUpdate(BaseModel):       # 수정 입력: 보낸 필드만 반영
    title: str | None = None
    date: str | None = None
    completed: bool | None = None

class TodoOut(BaseModel):          # 응답: id, created_at 포함
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    date: str
    completed: bool
    created_at: datetime
```

`TodoOut`에 붙인 `from_attributes=True`는 ORM 객체를 그대로 응답 스키마로 변환하게 해 줍니다. Pydantic v1의 `orm_mode`가 v2에서 이 이름으로 바뀌었습니다.

### DB 설정과 세션 의존성

DB는 SQLite 파일 하나로 잡았습니다.

```python
DATABASE_URL = "sqlite:///./todos.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

여기서 작은 수정이 있었습니다. 참고 코드는 `from sqlalchemy.ext.declarative import declarative_base`였는데, 제가 쓰는 SQLAlchemy 2.0.51에서는 그 경로가 옮겨져 경고가 떴습니다. `from sqlalchemy.orm import declarative_base`로 바꾸니 경고가 사라졌습니다.

세션은 요청마다 열고 닫아야 합니다. FastAPI의 의존성으로 두면 그 수명 관리를 함수 하나로 묶을 수 있습니다.

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

`yield`로 세션을 넘기고, 응답이 끝나면 `finally`에서 닫습니다. 각 엔드포인트는 `db: Session = Depends(get_db)`로 이 세션을 받습니다.

### 엔드포인트를 하나씩

조회는 전체를 생성 순서로 돌려줍니다.

```python
@app.get("/todos", response_model=list[TodoOut])
def list_todos(db: Session = Depends(get_db)):
    return db.query(Todo).order_by(Todo.created_at).all()
```

생성은 입력을 받아 행을 추가하고, 발급된 행을 다시 읽어 반환합니다. 상태 코드는 201로 뒀습니다.

```python
@app.post("/todos", response_model=TodoOut, status_code=201)
def create_todo(payload: TodoCreate, db: Session = Depends(get_db)):
    todo = Todo(title=payload.title, date=payload.date, completed=payload.completed)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo
```

수정은 부분 수정으로 만들었습니다. 이 결정은 뒤에서 따로 적겠습니다. 없는 id면 404를 던집니다.

```python
@app.put("/todos/{todo_id}", response_model=TodoOut)
def update_todo(todo_id: int, payload: TodoUpdate, db: Session = Depends(get_db)):
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(todo, field, value)

    db.commit()
    db.refresh(todo)
    return todo
```

삭제는 행을 지우고 본문 없이 204를 돌려줍니다.

```python
@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
```

`@app.put`의 `payload: TodoUpdate`를 적어 두면, 핸들러가 불리기 전에 FastAPI가 본문을 그 스키마로 검증합니다. 검증을 코드로 따로 쓰지 않아도 되는 부분입니다.

### CORS — 포트가 다른 프론트를 위한 설정

프론트는 3000, 백엔드는 8000입니다. 출처가 다르면 브라우저가 응답을 막기 때문에, 허용 출처를 미들웨어로 열어 줬습니다.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

지금은 프론트 한 곳만 열어 뒀습니다. 배포 주소가 생기면 그 출처를 더하면 됩니다.

### 막혔던 두 지점

첫 번째는 서버 리로드였습니다. main.py를 저장하면 `--reload`가 알아서 다시 띄워 줄 줄 알았는데, 로그에 "Reloading..."만 찍히고 새 워커가 올라오지 않았습니다. `/todos`를 부르면 계속 404가 났고, 알고 보니 라우트가 없던 옛 코드가 그대로 응답하고 있었습니다. 코드 자체는 멀쩡한지 확인하려고 모듈을 직접 import해 등록된 라우트를 찍어 봤습니다.

```
ROUTES: ['/todos', '/todos/{todo_id}']
```

라우트는 정상이었습니다. Windows의 파일 감시 리로드가 한 번 어긋난 상황이라 보고, uvicorn 프로세스를 종료한 뒤 다시 띄우니 새 코드가 올라왔습니다.

두 번째는 더 헷갈렸습니다. POST가 400 "There was an error parsing the body"로 막혔습니다. 그런데 한글이 없는 PUT 요청은 정상이었습니다. 차이가 본문의 한글이라는 점이 보였습니다. 터미널(Git Bash)에서 `curl -d '{"title":"문서 정리", ...}'`로 보낼 때 한글이 깨져 JSON으로 읽히지 않았던 것입니다. JSON을 UTF-8 파일로 저장하고 보내니 통과했습니다.

```bash
curl -X POST http://localhost:8000/todos \
  -H "Content-Type: application/json" \
  --data-binary @todo.json
```

```json
{"id":1,"title":"FastAPI CRUD 구현","date":"2026-05-21","completed":false,"created_at":"2026-06-22T08:43:41.521345"}
```

서버 코드 문제가 아니라 요청을 만든 쪽 인코딩 문제였습니다. 원인을 코드에서 찾다가 클라이언트로 옮겨 좁힌 과정이 기억에 남습니다.

### 직접 내린 판단

`date` 필드를 모델에 넣었습니다. 이 앱은 주간 캘린더라 각 Todo가 특정 날짜에 묶여야 하기 때문입니다. 날짜는 `YYYY-MM-DD` 문자열로 저장했습니다.

조회 필터는 서버에 두지 않았습니다. `GET /todos`는 전체를 돌려주고, 검색과 상태(전체/진행 중/완료), 날짜 필터는 프론트에서 거릅니다. SQLite에 단일 사용자 규모라, 쿼리 파라미터까지 서버에 두는 것은 지금 과하다고 봤습니다. 데이터가 커지면 서버 필터링으로 옮길 생각입니다.

### 아직 확신이 없는 부분

지금은 모델, 스키마, 엔드포인트가 main.py 한 파일에 모여 있습니다. 실무처럼 파일을 나눌 때 모델과 DB 설정 사이의 import 순환을 어떻게 피하는지는 아직 잘 모르겠습니다. `check_same_thread=False`가 정확히 어떤 동시성 문제를 여는지도 더 봐야 합니다.

### 참고 자료

- [FastAPI — SQL (Relational) Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [FastAPI — CORS (Cross-Origin Resource Sharing)](https://fastapi.tiangolo.com/tutorial/cors/)
- [Pydantic — Models](https://docs.pydantic.dev/latest/concepts/models/)
- [SQLAlchemy 2.0 — ORM Quick Start](https://docs.sqlalchemy.org/en/20/orm/quickstart.html)
````

Preview 탭으로 확인 후 게시하세요.

---

(라벨 제안: `study`, `mission-3`, `fastapi`, `backend`, `crud`)
