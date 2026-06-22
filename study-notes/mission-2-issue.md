Title 칸에 넣을 것:

```
[3차 과제] Mission 2 - FastAPI 백엔드 세팅과 첫 서버 띄우기
```

Body 칸에 넣을 것 (블록 안쪽을 그대로 복사):

````markdown
### 들어가며

프론트(Next.js)를 띄운 뒤, 데이터를 맡을 백엔드를 세웠습니다. 2차 과제는 데이터를 브라우저 localStorage에서만 다뤘는데, 이번에는 FastAPI 서버가 데이터를 직접 관리하고 프론트는 API로 주고받습니다. 이번 글은 그 백엔드의 첫 서버를 띄우기까지를 정리한 내용입니다.

### 가상환경부터 잡은 이유

처음엔 패키지를 전역에 바로 설치하려 했습니다. 다시 보니 프로젝트마다 의존성이 섞이지 않게 가상환경으로 격리하는 흐름이 맞았습니다.

```bash
python -m venv .venv
```

활성화 명령에서 한 번 막혔습니다. 가이드는 `source .venv/bin/activate`였는데 이건 Mac/Linux용이고, 제 환경은 Windows라 `.venv\Scripts\activate`로 해야 했습니다. 경로 구분자와 스크립트 위치가 OS마다 다른 부분입니다.

### requirements.txt를 먼저 고정

설치할 패키지를 `requirements.txt`에 미리 적고 한 번에 설치했습니다.

```
fastapi>=0.111.0
uvicorn[standard]>=0.29.0
sqlalchemy>=2.0.0
pydantic>=2.0.0
```

```bash
pip install -r requirements.txt
```

제가 이 방식을 택한 이유는 설치 순서를 손으로 외우지 않아도 되고, 같은 구성을 나중에 다시 만들 수 있어서입니다. 실제로 설치된 버전은 fastapi 0.138.0, uvicorn 0.49.0, sqlalchemy 2.0.51, pydantic 2.13.4였습니다. Python 3.14를 쓰고 있어서 pydantic 같은 컴파일 패키지의 휠이 없으면 소스 빌드로 넘어갈까 걱정했는데, cp314 휠이 있어 그대로 설치됐습니다.

### 첫 서버와 main:app의 의미

`main.py`는 가이드대로 단순하게 뒀습니다.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello World"}
```

```bash
uvicorn main:app --reload
```

`uvicorn main:app`에서 `main:app`이 무엇을 가리키는지 처음엔 헷갈렸습니다. 확인해 보니 `main.py` 모듈 안의 `app` 객체를 지목하는 표기였습니다. `--reload`는 파일이 바뀌면 서버를 다시 띄워 줍니다.

`localhost:8000`에 접속하니 `{"message": "Hello World"}`가 나왔고, `localhost:8000/docs`에서는 FastAPI가 만들어 둔 Swagger 문서가 떴습니다. 이 문서를 따로 작성하지 않았는데 자동으로 생긴 점이 인상적이었습니다.

### 아직 확신이 없는 부분

프론트는 3000, 백엔드는 8000으로 포트가 다릅니다. 곧 둘을 붙일 때 CORS를 어디서 풀어야 하는지는 아직 정리하지 못했습니다. 다음 미션에서 실제로 요청을 보내며 확인하려 합니다.

### 참고 자료

- [FastAPI — First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)
- [Python 공식 문서 — venv](https://docs.python.org/3/library/venv.html)
- [Uvicorn 공식 문서](https://www.uvicorn.org/)
````

Preview 탭으로 확인 후 게시하세요.

---

(라벨 제안: `study`, `mission-2`, `fastapi`, `backend`)
