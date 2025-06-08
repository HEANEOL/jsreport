// client/app.js

let allStats = [];               // 서버에서 받아온 raw 통계 데이터
let currentDimension = 'core';   // 현재 차트의 기준: 'core' 또는 'task'
let currentChartType = 'bar';    // 현재 차트 타입: 'bar' 또는 'pie'

const chartDom              = document.getElementById('chart');                // 차트가 그려질 DOM 요소
const toggleDimensionButton = document.getElementById('toggleDimensionButton');// 차트 기준(코어/태스크) 토글 버튼
const toggleChartTypeButton = document.getElementById('toggleChartTypeButton');// 차트 타입(막대/파이) 토글 버튼
let myChart;                                                                  // ECharts 인스턴스

// --- 1) 파일 업로드 ---
function uploadFile() {
  // 파일 입력 요소에서 파일 선택
  const file = document.getElementById('fileInput').files[0];
  if (!file) return alert('파일을 선택해주세요.');

  // FormData 객체 생성 및 파일 추가
  const fd = new FormData();
  fd.append('inputFile', file);

  // 서버로 파일 업로드 요청
  fetch('/api/upload', { method: 'POST', body: fd })
    .then(response => response.text())
    .then(message => {
      alert(message);   // 서버 응답 메시지 표시
      loadChartData();  // 업로드 후 차트 데이터 새로고침
    })
    .catch(error => {
      console.error(' 파일 업로드 오류:', error);
      alert(' 파일 업로드 중 오류가 발생했습니다.');
    });
}

// --- 2) 서버에서 통계 데이터 로드 ---
function loadChartData() {
  // 서버에서 통계 데이터 요청
  fetch('/api/stats')
    .then(r => r.json())
    .then(data => {
      allStats = data || [];
      if (!allStats.length) {
        chartDom.innerHTML = '<p>데이터가 없습니다. 파일을 업로드해주세요.</p>';
        return;
      }
      updateChart(); // 데이터가 있으면 차트 업데이트
    })
    .catch(err => console.error('데이터 로딩 오류:', err));
}

// --- 3) 태스크 ↔ 코어 토글 ---
function toggleDimension() {
  // 현재 차트 기준을 토글
  currentDimension = currentDimension === 'task' ? 'core' : 'task';
  toggleDimensionButton.textContent =
    currentDimension === 'task' ? '현재: 태스크 보기' : '현재: 코어 보기';

  updateChart(); // 차트 갱신
}

// --- 4) 막대 ↔ 파이 차트 토글 ---
function toggleChartType() {
  // 현재 차트 타입을 토글
  currentChartType = currentChartType === 'bar' ? 'pie' : 'bar';
  toggleChartTypeButton.textContent =
    currentChartType === 'bar' ? '현재: 막대 차트 보기' : '현재: 파이 차트 보기';

  updateChart(); // 차트 갱신
}

// --- 5) 차트 업데이트 ---
function updateChart() {
  // 데이터가 없으면 안내 메시지 표시
  if (!allStats.length) {
    chartDom.innerHTML = '<p>데이터가 없습니다. 파일을 업로드해주세요.</p>';
    return;
  }

  // 현재 기준(core 또는 task)에 따라 라벨 추출
  const labels = [...new Set(allStats.map(i => i[currentDimension]))];
  // 각 통계 항목별 데이터 추출
  const avgData = labels.map(label => allStats.find(i => i[currentDimension] === label)?.avg || 0);
  const minData = labels.map(label => allStats.find(i => i[currentDimension] === label)?.min || 0);
  const maxData = labels.map(label => allStats.find(i => i[currentDimension] === label)?.max || 0);
  const stdData = labels.map(label => allStats.find(i => i[currentDimension] === label)?.std || 0);

  // 기존 차트 인스턴스가 있으면 제거
  if (echarts.getInstanceByDom(chartDom)) {
    echarts.getInstanceByDom(chartDom).dispose();
  }
  myChart = echarts.init(chartDom);

  // 막대 차트 옵션 설정
  if (currentChartType === 'bar') {
    myChart.setOption({
      title: { text: `${currentDimension.toUpperCase()}별 avg, min, max, std 비교`, top: 20 },
      tooltip: { trigger: 'axis' },
      grid: { top: 60, bottom: 30 }, // 제목과 그래프가 겹치지 않도록 마진 추가
      legend: { data: ['avg', 'min', 'max', 'std'] },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series: [
        { name: 'avg', type: 'bar', data: avgData },
        { name: 'min', type: 'bar', data: minData },
        { name: 'max', type: 'bar', data: maxData },
        { name: 'std', type: 'bar', data: stdData }
      ]
    });
  } else {
    // 파이 차트 옵션 설정 (avg, min, max, std 각각 별도의 파이 차트)
    const seriesData = [
      {
        type: 'pie',
        radius: ['25%', '20%'], // 크기 조정
        center: ['15%', '50%'], // 좌측 정렬
        label: { show: true, formatter: 'AVG' }, // 라벨 표시
        data: labels.map((name, i) => ({ name, value: avgData[i] }))
      },
      {
        type: 'pie',
        radius: ['25%', '20%'],
        center: ['35%', '50%'], 
        label: { show: true, formatter: 'MIN' },
        data: labels.map((name, i) => ({ name, value: minData[i] }))
      },
      {
        type: 'pie',
        radius: ['25%', '20%'], 
        center: ['55%', '50%'], 
        label: { show: true, formatter: 'MAX' }, 
        data: labels.map((name, i) => ({ name, value: maxData[i] }))
      },
      {
        type: 'pie',
        radius: ['25%', '20%'], 
        center: ['75%', '50%'], 
        label: { show: true, formatter: 'STD' }, 
        data: labels.map((name, i) => ({ name, value: stdData[i] }))
      }
    ];

    myChart.setOption({
      title: { text: `${currentDimension.toUpperCase()}별 avg, min, max, std 비교`, top: 20 },
      tooltip: { trigger: 'item' },
      series: seriesData
    });
  }
}

// --- 초기 설정 ---
document.addEventListener('DOMContentLoaded', () => {
  // 버튼 이벤트 핸들러 등록
  toggleDimensionButton.onclick = toggleDimension;
  toggleChartTypeButton.onclick = toggleChartType;
  // 페이지 로드 시 차트 데이터 로드
  loadChartData();
});