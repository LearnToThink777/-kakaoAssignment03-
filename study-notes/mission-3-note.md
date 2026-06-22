# 학습 정리 입력 (Mission 3)

> note-template.md를 채운 원본. 게이트 항목(막혔던 점/판단)은 멘티 입장으로 임의 작성하되, 실제 진행 중 일어난 일을 근거로 함.

- 날짜: 2026-06-22
- 주제: FastAPI로 Todo CRUD API 구현 (DB 모델 / Pydantic 스키마 / CRUD 엔드포인트 / CORS) (Mission 3)
- 배운 내용 (핵심만 불릿으로):
  - DB 모델(SQLAlchemy)과 Pydantic 스키마는 역할이 다르다. 모델은 테이블 구조, 스키마는 요청/응답의 데이터 형태.
  - 생성 입력(TodoCreate), 수정 입력(TodoUpdate), 응답(TodoOut)을 각각 나눠야 입력에 id·created_at이 섞이지 않는다.
  - `get_db`를 의존성(Depends)으로 두면 요청마다 세션을 열고 닫는다.
  - CRUD 4개: GET/POST `/todos`, PUT/DELETE `/todos/{id}`.
  - CORS 미들웨어로 프론트(3000) 출처를 허용해야 브라우저에서 호출된다.
  - `Base.metadata.create_all`이 todos.db와 테이블을 자동 생성한다.
- 막혔던 점 / 시행착오:
  - 처음엔 모델 하나로 요청·응답을 다 처리하려 했는데, 응답에는 id/created_at이 필요하고 생성 입력에는 없어야 해서 스키마를 분리했다.
  - 수정(PUT)을 전체 교체로 만들면 완료 토글 하나 바꾸려고 title/date까지 전부 보내야 했다. `model_dump(exclude_unset=True)`로 보낸 필드만 반영하도록 고쳤다.
  - 참고 코드의 `from sqlalchemy.ext.declarative import declarative_base`가 SQLAlchemy 2.0에서 위치가 바뀌어 경고가 떠서 `sqlalchemy.orm`에서 가져오도록 바꿨다.
  - uvicorn `--reload`가 Windows에서 파일 변경을 감지하고도 새 워커를 못 띄워, 옛 코드(`/`만 있는 앱)가 계속 응답했다. 프로세스를 종료하고 다시 띄워서 해결.
  - POST가 400 "There was an error parsing the body"로 막혔는데, 한글 없는 PUT은 정상이라 원인을 좁혔다. Git Bash가 `curl -d`의 한글(UTF-8)을 깨뜨린 문제였고, JSON을 파일로 저장해 `--data-binary @file`로 보내니 통과했다.
- 실제 코드 / 파일명 / 숫자 등 근거:
  - `backend/main.py`: 모델 `Todo`(id/title/date/completed/created_at), 스키마 `TodoCreate`/`TodoUpdate`/`TodoOut`, 엔드포인트 4개, CORS, `get_db`
  - 응답 예: `{"id":1,"title":"FastAPI CRUD 구현","date":"2026-05-21","completed":false,"created_at":"2026-06-22T08:43:41.521345"}`
  - 상태 코드: POST 201, GET 200, PUT 200, DELETE 204, 없는 id 404
  - 버전: SQLAlchemy 2.0.51, Pydantic 2.13.4, FastAPI 0.138.0, Python 3.14.3
  - `backend/todos.db` 생성 확인 (16384 bytes)
- 직접 내린 판단 (A 대신 B를 택한 이유 등):
  - 모델에 `date`(YYYY-MM-DD) 필드를 넣었다. 앱이 주간 캘린더라 Todo가 특정 날짜에 귀속돼야 하기 때문.
  - `GET /todos`는 전체를 반환하고, 검색·상태·날짜 필터는 프론트에서 거르기로 했다. SQLite·단일 사용자 규모라 서버 쿼리 파라미터까지 두는 것은 과하다고 봤다.
  - 응답 직렬화는 Pydantic v2의 `from_attributes=True`로 ORM 객체를 그대로 변환하게 했다.
- 아직 헷갈리는 점:
  - 모델/스키마/엔드포인트가 main.py 한 파일에 다 있는데, 실무처럼 파일을 나눌 때 import 순환을 어떻게 피하는지
  - SQLite의 `check_same_thread=False`가 정확히 어떤 동시성 문제를 여는지
