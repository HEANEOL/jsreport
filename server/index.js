const express       = require('express');
const fileUpload    = require('express-fileupload');
const path          = require('path');
const { sequelize } = require('./db');
const { StatsModel }= require('./models');
const routes        = require('./routes');


const app = express();
app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));

app.use('/api', routes);
app.use(express.static(path.join(__dirname, '../client')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/index.html')));







// ✅ 기존 기능 유지: 서버 실행 및 DB 초기화
(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ 데이터베이스 연결 성공!");

        await sequelize.sync({ alter: true });
        console.log("✅ 데이터베이스 동기화 완료!");

        if (StatsModel) {
            await StatsModel.truncate();
            console.log("✅ 통계 데이터 초기화 완료!");
        }

        app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
    } catch (err) {
        console.error("🚨 DB 오류 발생:", err);
    }
})();