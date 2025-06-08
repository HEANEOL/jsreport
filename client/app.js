// client/app.js

let allStats = [];               // 서버에서 받아온 raw 통계 데이터
let currentDimension = 'core';   // 'core' 또는 'task'
let currentChartType = 'bar';    // 'bar' 또는 'pie'

const chartDom              = document.getElementById('chart');
const toggleDimensionButton = document.getElementById('toggleDimensionButton');
const toggleChartTypeButton = document.getElementById('toggleChartTypeButton');
let myChart;

// --- 1) 파일 업로드 ---
function uploadFile() {
  const file = document.getElementById('fileInput').files[0];
  if (!file) return alert('⚠️ 파일을 선택해주세요.');

  const fd = new FormData();
  fd.append('inputFile', file);

  fetch('/api/upload', { method: 'POST', body: fd })
    .then(response => response.text())
    .then(message => {
      alert(message);
      loadChartData();
    })
    .catch(error => {
      console.error('🚨 파일 업로드 오류:', error);
      alert('⚠️ 파일 업로드 중 오류가 발생했습니다.');
    });
}



// --- 2) 서버에서 통계 데이터 로드 ---
function loadChartData() {
  fetch('/api/stats')
    .then(r => r.json())
    .then(data => {
      allStats = data || [];
      if (!allStats.length) {
        chartDom.innerHTML = '<p>데이터가 없습니다. 파일을 업로드해주세요.</p>';
        return;
      }
      updateChart();
    })
    .catch(err => console.error('데이터 로딩 오류:', err));
}

// --- 3) 태스크 ↔ 코어 토글 ---
function toggleDimension() {
  currentDimension = currentDimension === 'task' ? 'core' : 'task';
  toggleDimensionButton.textContent =
    currentDimension === 'task' ? '현재: 태스크 보기' : '현재: 코어 보기';

  updateChart();
}

// --- 4) 막대 ↔ 파이 차트 토글 ---
function toggleChartType() {
  currentChartType = currentChartType === 'bar' ? 'pie' : 'bar';
  toggleChartTypeButton.textContent =
    currentChartType === 'bar' ? '현재: 막대 차트 보기' : '현재: 파이 차트 보기';

  updateChart();
}

// --- 5) 차트 업데이트 ---
function updateChart() {
  if (!allStats.length) {
    chartDom.innerHTML = '<p>데이터가 없습니다. 파일을 업로드해주세요.</p>';
    return;
  }

  const labels = [...new Set(allStats.map(i => i[currentDimension]))]; // 모든 코어 또는 태스크
  const avgData = labels.map(label => allStats.find(i => i[currentDimension] === label)?.avg || 0);
  const minData = labels.map(label => allStats.find(i => i[currentDimension] === label)?.min || 0);
  const maxData = labels.map(label => allStats.find(i => i[currentDimension] === label)?.max || 0);
  const stdData = labels.map(label => allStats.find(i => i[currentDimension] === label)?.std || 0);

  if (echarts.getInstanceByDom(chartDom)) {
    echarts.getInstanceByDom(chartDom).dispose();
  }
  myChart = echarts.init(chartDom);

  if (currentChartType === 'bar') {
    myChart.setOption({
      title: { text: `${currentDimension.toUpperCase()}별 avg, min, max, std 비교`, top: 20 },
      tooltip: { trigger: 'axis' },
      grid: { top: 60, bottom: 30 }, // ✅ 제목과 그래프가 겹치지 않도록 마진 추가
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
    const seriesData = [
      {
        type: 'pie',
        radius: ['25%', '20%'], // ✅ 크기 줄임
        center: ['15%', '50%'], // ✅ 좌측 정렬
        label: { show: true, formatter: 'AVG' }, // ✅ 라벨 추가
        data: labels.map((name, i) => ({ name, value: avgData[i] }))
      },
      {
        type: 'pie',
        radius: ['25%', '20%'], // ✅ 크기 줄임
        center: ['35%', '50%'], // ✅ 중앙 왼쪽
        label: { show: true, formatter: 'MIN' }, // ✅ 라벨 추가
        data: labels.map((name, i) => ({ name, value: minData[i] }))
      },
      {
        type: 'pie',
        radius: ['25%', '20%'], // ✅ 크기 줄임
        center: ['55%', '50%'], // ✅ 중앙 오른쪽
        label: { show: true, formatter: 'MAX' }, // ✅ 라벨 추가
        data: labels.map((name, i) => ({ name, value: maxData[i] }))
      },
      {
        type: 'pie',
        radius: ['25%', '20%'], // ✅ 크기 줄임
        center: ['75%', '50%'], // ✅ 우측 정렬
        label: { show: true, formatter: 'STD' }, // ✅ 라벨 추가
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
  toggleDimensionButton.onclick = toggleDimension;
  toggleChartTypeButton.onclick = toggleChartType;
  loadChartData();
});