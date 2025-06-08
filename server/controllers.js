const { DataModel, StatsModel } = require('./models');

// 파일의 내용을 파싱하여 DataModel 에 저장
async function parseAndStoreData(fileContent) {
  const lines = fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);
  let parsedData = [];

  lines.forEach(line => {
    const values = line.split(/\s+/);
    if (values.length !== 6) return;

    const core = values[0].trim();
    if (!core) return;

    // 소수점 값까지 처리하기 위해 parseFloat 사용
    const taskValues = values.slice(1).map(v => parseFloat(v));
    if (taskValues.some(v => isNaN(v) || v < 0 || v > 10000)) return;

    parsedData.push({
      core,
      task1: taskValues[0],
      task2: taskValues[1],
      task3: taskValues[2],
      task4: taskValues[3],
      task5: taskValues[4],
    });
  });

  try {
    await DataModel.bulkCreate(parsedData);
    console.log('✅ 데이터 저장 완료!');
  } catch (error) {
    console.error('🚨 데이터 저장 오류:', error);
  }
}

// 태스크별 통계를 계산하여 StatsModel 에 저장
async function calculateStats() {
  const data = await DataModel.findAll();

  if (data.length === 0) {
    console.warn('🚨 데이터가 없습니다. 통계 계산을 중단합니다.');
    return;
  }

  // 코어별로 그룹화
  const groups = {};
  data.forEach(row => {
    if (!groups[row.core]) groups[row.core] = [];
    groups[row.core].push(row);
  });

  const statsResults = [];
  const tasks = ['task1', 'task2', 'task3', 'task4', 'task5'];

  // 각 코어 그룹 내에서 태스크별로 통계 계산
  for (const core in groups) {
    tasks.forEach(task => {
      const values = groups[core].map(row => row[task]);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      statsResults.push({ core, task, avg, min, max, std });
    });
  }

  try {
    await StatsModel.truncate(); // 기존 통계 데이터 초기화
    await StatsModel.bulkCreate(statsResults);
    console.log('✅ 테스크별 통계 계산 완료!', statsResults);
  } catch (error) {
    console.error('🚨 통계 저장 오류:', error);
  }
}

module.exports = { parseAndStoreData, calculateStats };