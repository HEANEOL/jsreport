// 필요한 모듈 불러오기
const express       = require('express');
const fileUpload    = require('express-fileupload');
const path          = require('path');
const { sequelize } = require('./db');
const { StatsModel }= require('./models');
const routes        = require('./routes');

// Express 애플리케이션 생성
const app = express();

// JSON 요청 본문 파싱 미들웨어 등록
app.use(express.json());

// 파일 업로드 미들웨어 등록 (최대 10MB)
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));

// API 라우트 등록
app.use('/api', routes);

// 정적 파일 제공 (client 폴더)
app.use(express.static(path.join(__dirname, '../client')));

// 루트 경로에서 index.html 제공
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/index.html')));

// 서버 실행 및 DB 초기화
(async () => {
    try {
        // 데이터베이스 연결 확인
        await sequelize.authenticate();
        console.log(" 데이터베이스 연결 성공!");

        // 데이터베이스 동기화
        await sequelize.sync({ alter: true });
        console.log("데이터베이스 동기화 완료!");

        // 통계 데이터 초기화
        if (StatsModel) {
            await StatsModel.truncate();
            console.log("통계 데이터 초기화 완료!");
        }

        // 서버 시작
        app.listen(3000, () => console.log(" Server running on http://localhost:3000"));
    } catch (err) {
        // 오류 처리
        console.error(" DB 오류 발생:", err);
    }
})();