# 개요. 

프로파일링. 

컴퓨터는 매우 뛰어나고 지금도 발전해가지만 그에 맞춰서 요새 프로그렘도 같이 살을 찌우는 것 같다. (특히 게임이...)
이 프로파일링은 그런 살찐 프로그렘의 따끔한 조언과 잔소리가 되니 구현하는 과정에서 최대한 흡수하려고 노력했다.
각설하고 내가 프로그래밍한 이 프로그렘은 막대그래프와 파이그래프 두가지의 형태로 데이터를 시각화해 제공한다.
조금 구체적으론 express 로 웹을 다루고 fileupload 를 통해 데이터를 입력받아 mysql2에 가공한 상태로 담고 echarts를 통해 시각화한다.
이를 통해 데이터를 조금 더 직관적으로 비교해봤다.



# 프로그렘 사용을 위한 수행절차
npm install express express-fileupload sequelize mysql2 echarts
이를 통해 웹서버, 파일조작,데이터베이스, 데이터 시각화를 위한 그래프를 추가함.
npm install << 이걸론 위에게 다운안되니 꼭 하고 실행해야함.
데이터베이스 연결
- Sequelize를 사용해 MySQL 데이터베이스에 직접 연결 (db.js 사용자가  파일에 있는 정보를 임의로 수정해서 사용해야함)
데이터베이스 이름, 사용자, 비밀번호를 코드 내에서 직접 지정.

**MySQL에 접속**
mysql -u root -p   # 사용자 이름이 'root'인 경우, 암호 입력

**데이터베이스 생성 (필요한 경우)**
CREATE DATABASE database_name;

** 데이터베이스 사용**
USE database_name;

**테이블 목록 확인**
SHOW TABLES;


# 코드분석


1. 서버 설정 및 데이터베이스 초기화 (server.js, db.js)
Express를 사용해 웹 서버를 구성 (server.js).
서버 구동 시 DB 초기화를 수행하여 기존 데이터를 정리하고 새 데이터를 저장할 준비를 함.
Sequelize를 이용해 데이터베이스를 연결.
sequelize.sync({ alter: true })를 통해 스키마 동기화 및 업데이트(초기화).

2. 파일 업로드 기능 및 API 라우트 (routes.js)
express-fileupload를 사용해 파일 업로드 기능 활성화 (server.js).
API 라우트 설정 (routes.js):
/api/upload: 파일을 업로드하고 서버에서 분석.
/api/stats: 데이터베이스에 저장된 통계를 반환.

3. 데이터 분석 및 저장 (controllers.js, models.js)
 parseAndStoreData(): 파일에서 데이터를 파싱해 DataModel에 저장 (controllers.js).
데이터 모델: DataModel은 원본 데이터를 저장하는 테이블 (models.js).
calculateStats(): 태스크별 통계를 계산해 StatsModel에 저장 (controllers.js).
통계 모델: StatsModel을 통해 태스크별 평균, 최소, 최대, 표준편차 값을 관리 (models.js).
두 개의 딕셔너리 형태로 데이터를 구분하여 저장.( 각 요소의 구별을 위한 조치)

4. 클라이언트에서 데이터 요청 및 시각화 (client/app.js, index.html)
데이터 요청 (app.js)
 fetch('/api/stats')를 통해 서버에서 통계를 가져옴.
 가져온 데이터를 ECharts로 그래프화하여 화면에 표시.
그래프 타입
막대 그래프: 각 코어별 태스크별 비교가 용이함.
파이 그래프: 특정 수치가 높은 코어/태스크를 쉽게 식별 가능.
 토글 버튼을 통해 두 가지 그래프 타입을 전환 (app.js).

더 자세한 내용은 주석참조

# 전체적인 흐름 및 데이터 무결성
사용자가 파일을 업로드 → 서버에서 데이터 처리 → 클라이언트에서 시각화.
 StatsModel.truncate()를 통해 기존 통계를 초기화하고 새 데이터 저장 (server.js).
서버 실행 시 데이터베이스를 동기화하여 안정적인 데이터 관리 수행 (db.js).
 데이터는 5×5 형태의 데이터만 대응 가능하며, 추가적인 데이터가 증가해도 DB에 저장되지 않음 >무결성에는 다소 취약.
하지만 들어온 데이터를 일관되게 처리할 수 있으므로 일관성은 높다고 평가 가능.
