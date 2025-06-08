const { DataModel, StatsModel } = require('./models');

// 파일의 내용을 파싱하여 DataModel에 저장하는 함수
// fileContent: 업로드된 파일의 텍스트 내용 (string)
async function parseAndStoreData(fileContent) {
  // 파일 내용을 줄 단위로 분리, 앞뒤 공백 제거, 빈 줄 제거
  const lines = fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);
  let parsedData = [];

  // 각 줄을 파싱하여 데이터 객체로 변환
  lines.forEach(line => {
    const values = line.split(/\s+/); // 공백 기준 분리
    if (values.length !== 6) return;  // core + 5개 태스크 값이 아니면 무시

    const core = values[0].trim();
    if (!core) return; // core 값이 없으면 무시

    // 태스크 값들을 실수로 변환
    const taskValues = values.slice(1).map(v => parseFloat(v));
    // 값이 숫자가 아니거나 범위를 벗어나면 무시
    if (taskValues.some(v => isNaN(v) || v < 0 || v > 10000)) return;

    // 파싱된 데이터를 배열에 추가
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
    // 파싱된 데이터를 DB에 일괄 저장
    await DataModel.bulkCreate(parsedData);
    console.log(' 데이터 저장 완료!');
  } catch (error) {
    // 저장 중 오류 발생 시 로그 출력
    console.error('데이터 저장 오류:', error);
  }
}

// 태스크별 통계를 계산하여 StatsModel에 저장하는 함수
async function calculateStats() {
  // 전체 데이터 조회
  const data = await DataModel.findAll();

  if (data.length === 0) {
    // 데이터가 없으면 통계 계산 중단
    console.warn(' 데이터가 없습니다. 통계 계산을 중단합니다.');
    return;
  }

  // 코어별로 데이터 그룹화
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
      // 해당 태스크의 값만 추출
      const values = groups[core].map(row => row[task]);
      // 평균 계산
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      // 최소값, 최대값 계산
      const min = Math.min(...values);
      const max = Math.max(...values);
      // 분산 및 표준편차 계산
      const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      // 통계 결과를 배열에 추가
      statsResults.push({ core, task, avg, min, max, std });
    });
  }

  try {
    // 기존 통계 데이터 초기화
    await StatsModel.truncate();
    // 새로 계산된 통계 데이터 저장
    await StatsModel.bulkCreate(statsResults);
    console.log(' 테스크별 통계 계산 완료!', statsResults);
  } catch (error) {
    // 저장 중 오류 발생 시 로그 출력
    console.error('통계 저장 오류:', error);
  }
}

module.exports = { parseAndStoreData, calculateStats };