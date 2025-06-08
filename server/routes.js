const express = require('express');
const router = express.Router();
const { parseAndStoreData, calculateStats } = require('./controllers');
const { StatsModel } = require('./models');

// 파일 업로드 후 데이터 파싱 및 통계 계산 API
router.post('/upload', async (req, res) => {
  if (!req.files) return res.status(400).send("파일을 업로드하세요");
  await parseAndStoreData(req.files.inputFile.data.toString());
  await calculateStats();
  res.send("✅ 데이터 분석 완료");
});

// 태스크별 통계 데이터 반환 API
router.get('/stats', async (req, res) => {
  const stats = await StatsModel.findAll();
  // 확인용 로그
  console.log("📌 DB에서 반환하는 통계 데이터:", stats);
  res.json(stats);
});

module.exports = router;