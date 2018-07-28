//游戏主要逻辑的实现
var Grid = require('./grid.js');
var Tile = require("./tile.js");

function GameManager(size) {
  this.size = size;
  this.startTiles = 2;
}
GameManager.prototype = {
  //游戏初始化
  setup: function() {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.addStartTiles();
    return this.grid.cells;
  },
  //初始化数据
  addStartTiles: function() {
    for (var x = 0; x < this.startTiles; x++) {
      this.addRandomTiles();
    }
  },
  //在一个随机单元格中随机填充2或4
  addRandomTiles: function() {
    if (this.grid.cellsAvailable()) {
      var value = Math.random() < 0.9 ? 2 : 4;
      var cell = this.grid.randomAvailableCell();
      var tile = new Tile(cell, value);
      this.grid.insertTile(tile); //插入一个单元格
    }
  },
  //游戏结束时的状态
  actuate: function() {
    return {
      grids: this.grid.cells,
      over: this.over,
      won: this.won,
      score: this.score
    }
  },
  //游戏操作逻辑的实现（偏移向量）,矩阵结构为：【0，0】，【0，1】【0，2】
  getVector: function(direction) {
    var map = {
      0: { //上
        x: -1,
        y: 0
      },
      1: { //右
        x: 0,
        y: 1
      },
      2: { //下
        x: 1,
        y: 0
      },
      3: { //左
        x: 0,
        y: -1
      }
    };
    return map[direction];
  },
  //遍历方法，实现移动时推向最远的空单元格
  buildTraversals: function(vector) {
    var traversals = {
      x: [],
      y: []
    };
    for (var pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }
    //使移动向最右和最下的时候不会超出边界
    if (vector.x === 1) {
      traversals.x = traversals.x.reverse();
    }
    if (vector.y === 1) {
      traversals.y = traversals.y.reverse();
    }
    return traversals;
  },
  //把当前单元格挪到下一个可放的位置
  moveTile: function(tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  },
  //指定方向移动单元格
  move: function(direction) {
    var self = this;
    var vector = this.getVector(direction); //获得移动方向
    var traversals = this.buildTraversals(vector); //移动单元格
    var cell;
    var tile;
    var moved = false;
    self.prepareTiles();

    traversals.x.forEach(function(x) {
      traversals.y.forEach(function(y) {
        cell = {
          x: x,
          y: y
        };
        tile = self.grid.cellContent(cell); //获取单元格内容
        if (tile) {
          var positions = self.findFarthestTail(cell, vector);
          var next = self.grid.cellContent(positions.next);

          if (next && next.value === tile.value) {
            //合并相同内容的格子
            var merged = new Tile(positions.next, tile.value * 2); //临时的格子用来存放合并的数据
            merged.mergedFrom = [tile, next];
            self.grid.insertTile(merged); //把格子插到当前格子中
            self.grid.removeTile(tile); //删除当前格子的内容
            tile.updatePosition(positions.next); //更新格子的位置
            self.score += merged.value; //记录分数
            if (merged.value === 2048) self.won = true;
          } else {
            self.moveTile(tile, positions.farthest);
          }

          //使位置不改变
          if (!self.positionsEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    });
    if (moved) {
      this.addRandomTiles(); //移动成功后随机添加单元格和内容
      if (!this.movesAvailable()) { //如果无法移动
        this.over = true;
      }
      return this.actuate();
    }
  },
  //遍历单元格，，判断单元格是否有内容
  prepareTiles: function() {
    var tile;
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        tile = this.grid.cells[x][y];
        if (tile) {
          tile.mergedFrom = null;
          tile.savePosition();
        }
      }
    }
  },
  //移动位置逻辑的实现
  positionsEqual: function(first, second) {
    return first.x === second.x && first.y === second.y;
  },
  //一次移动多个单元格
  movesAvailable: function() {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  },

  tileMatchesAvailable: function() {
    var self = this;

    var tile;

    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        tile = this.grid.cellContent({
          x: x,
          y: y
        });

        if (tile) {
          for (var direction = 0; direction < 4; direction++) {
            var vector = self.getVector(direction);
            var cell = {
              x: x + vector.x,
              y: y + vector.y
            };

            var other = self.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true;
            }
          }
        }
      }
    }

    return false;
  },

  //找到当前移动方向的最远的空单元格
  findFarthestTail: function(cell, vector) {
    var previous;
    //当前单元格在范围内且存在可用单元格
    do {
      previous = cell;
      cell = {
        x: previous.x + vector.x,
        y: previous.y + vector.y
      };
    }
    while (this.grid.withinBounds(cell) && this.grid.emptyCell(cell));
    return {
      farthest: previous,
      next: cell
    }
  },
  restart: function() {
    return this.setup();
  }
}
module.exports = GameManager;