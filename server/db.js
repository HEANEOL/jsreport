require('dotenv').config();

const { Sequelize } = require('sequelize');

// Sequelize 인스턴스 생성 및 데이터베이스 연결 설정
const sequelize = new Sequelize(
  'db',         // 데이터베이스 이름
  'root',       // 데이터베이스 사용자명
  'ggnfjsdp',   // 데이터베이스 비밀번호
  {
    host: 'localhost',    // 데이터베이스 호스트
    port: 3306,           // MySQL 기본 포트
    dialect: 'mysql',     // 사용 DB 종류 (mysql, postgres, sqlite 등)
    logging: false,       // 실행 쿼리 로그 출력 여부 (false면 로그 숨김)
    retry: { max: 3 }     // 연결 실패 시 재시도 횟수
  }
);

// 데이터베이스 연결 테스트
(async () => {
    try {
        await sequelize.authenticate(); // 연결 시도
        console.log(" 데이터베이스 연결 성공!");
    } catch (error) {
        // 연결 실패 시 에러 출력
        console.error("DB 연결 실패:", error);
    }
})();

module.exports = { sequelize };