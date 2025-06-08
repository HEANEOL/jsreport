require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'db',   // DB_NAME
  'root',        // DB_USER
  'ggnfjsdp',        // DB_PASS
  {
    host: 'localhost',    // DB_HOST
    port: 3306,           // MySQL 기본 포트
    dialect: 'mysql',     // 사용 DB 종류(mysql, postgres, sqlite 등)
    logging: false,       // (선택) 실행 쿼리 로그 숨기기
    retry: { max: 3 }     // (선택) 재시도 횟수
  }
);



// ✅ DB 연결 테스트
(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ 데이터베이스 연결 성공!");
    } catch (error) {
        console.error("🚨 DB 연결 실패:", error);
    }
})();



module.exports = { sequelize };