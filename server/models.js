const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('./db');

// 원본 데이터 저장 모델
const DataModel = sequelize.define('DataModel', {
  core: { type: DataTypes.STRING, allowNull: false },
  task1: { type: DataTypes.FLOAT },
  task2: { type: DataTypes.FLOAT },
  task3: { type: DataTypes.FLOAT },
  task4: { type: DataTypes.FLOAT },
  task5: { type: DataTypes.FLOAT },
});

// 태스크별 통계 저장 모델 (어느 코어의 어느 태스크에 대한 통계인지 지정하기 위해 task 필드 추가)
const StatsModel = sequelize.define('StatsModel', {
  core: { type: DataTypes.STRING, allowNull: false },
  task: { type: DataTypes.STRING, allowNull: false }, // 예: 'task1'
  avg: { type: DataTypes.FLOAT },
  min: { type: DataTypes.FLOAT },
  max: { type: DataTypes.FLOAT },
  std: { type: DataTypes.FLOAT },
});

module.exports = { DataModel, StatsModel };