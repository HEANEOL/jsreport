const express = require('express');
const router = express.Router();
const { parseAndStoreData, calculateStats } = require('./controllers');
const { StatsModel } = require('./models');

// 파일 업로드 및 데이터 파싱, 통계 계산을 처리하는 엔드포인트
// 클라이언트가 파일을 업로드하면 해당 파일을 파싱하여 DB에 저장하고, 통계 데이터를 계산함
router.post('/upload', async (req, res) => {
  // 파일이 첨부되지 않은 경우 에러 반환
  if (!req.files) return res.status(400).send("파일을 업로드하세요");
  // 업로드된 파일의 내용을 파싱 및 DB 저장
  await parseAndStoreData(req.files.inputFile.data.toString());
  // 저장된 데이터를 기반으로 통계 계산 및 저장
  await calculateStats();
  // 처리 완료 응답
  res.send("데이터 분석 완료");
});

// 태스크별 통계 데이터를 반환하는 엔드포인트
// DB에 저장된 모든 통계 데이터를 JSON 형태로 반환
router.get('/stats', async (req, res) => {
  // 통계 데이터 전체 조회
  const stats = await StatsModel.findAll();
  // 조회된 통계 데이터 로그 출력 (서버 콘솔)
  console.log("DB에서 반환하는 통계 데이터:", stats);
  // 클라이언트에 통계 데이터 반환
  res.json(stats);
});

module.exports = router;