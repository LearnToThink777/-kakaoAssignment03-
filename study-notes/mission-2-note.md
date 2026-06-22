# 학습 정리 입력 (Mission 2)

> note-template.md를 채운 원본. 게이트 항목(막혔던 점/판단)은 멘티 입장으로 임의 작성.

- 날짜: 2026-06-22
- 주제: 백엔드(FastAPI) 프로젝트 세팅 + 개발 서버 확인 (Mission 2)
- 배운 내용 (핵심만 불릿으로):
  - `python -m venv .venv`로 프로젝트별 가상환경을 만들고 의존성을 격리한다
  - `requirements.txt`에 패키지를 미리 적어두고 `pip install -r`로 한 번에 설치
  - `uvicorn main:app --reload`로 개발 서버 실행 (main.py의 app 객체를 가리킴)
  - FastAPI는 `/docs`에 Swagger UI 문서를 자동 생성한다
- 막혔던 점 / 시행착오:
  - 처음엔 가상환경 없이 전역에 설치하려 했는데, 프로젝트별로 격리하는 venv 흐름으로 잡았다.
  - 가이드의 활성화 명령이 Mac/Linux용 `source .venv/bin/activate`라, Windows에서는 `.venv\Scripts\activate`로 달랐다.
  - `uvicorn main:app`의 `main:app`이 무슨 뜻인지 헷갈렸는데, `main.py` 모듈의 `app` 객체를 가리키는 것이었다.
  - Python 3.14라 pydantic-core·sqlalchemy 같은 컴파일 패키지의 휠이 없으면 소스 빌드로 넘어갈까 걱정했는데, cp314 휠이 있어 그대로 설치됐다.
- 실제 코드 / 파일명 / 숫자 등 근거:
  - `backend/main.py`(루트 `/` → `{"message": "Hello World"}`), `backend/requirements.txt`
  - 설치 버전: fastapi 0.138.0, uvicorn 0.49.0, sqlalchemy 2.0.51, pydantic 2.13.4, Python 3.14.3
  - 확인: `GET /` 200, `GET /docs` 200
- 직접 내린 판단 (A 대신 B를 택한 이유 등):
  - `requirements.txt`를 먼저 고정해두고 설치하는 방식을 택했다. 설치 순서를 손으로 외우지 않아도 되고, 같은 구성을 다시 만들 수 있기 때문.
  - 셸에서 activate 대신 venv 안의 python을 직접 호출(`.venv/Scripts/python.exe -m ...`)했다. 비대화형 환경에서도 같은 인터프리터를 확실히 쓸 수 있어서.
- 아직 헷갈리는 점:
  - `--reload`가 watchfiles로 어떤 변경까지 감지하는지
  - 프론트(3000)와 백엔드(8000)가 다른 포트라, 곧 붙일 때 CORS를 어디서 풀어야 하는지
