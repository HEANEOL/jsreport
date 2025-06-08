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

// 태스크별 통계 저장 모델 
const StatsModel = sequelize.define('StatsModel', {
  core: { type: DataTypes.STRING, allowNull: false },
  task: { type: DataTypes.STRING, allowNull: false }, // 예: 'task1'
  avg: { type: DataTypes.FLOAT },
  min: { type: DataTypes.FLOAT },
  max: { type: DataTypes.FLOAT },
  std: { type: DataTypes.FLOAT },
});

module.exports = { DataModel, StatsModel };