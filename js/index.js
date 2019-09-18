var MineSweeping = /** @class */ (function () {
    function MineSweeping(rows, cols, mineNumber) {
        this.square = []; // 数字的二维数组
        this.doms = []; //doms的二维数组
        this.container = document.querySelector('.game-box');
        this.rows = rows;
        this.cols = cols;
        this.mineNumber = mineNumber;
        this.init();
    }
    MineSweeping.prototype.init = function () {
        this.createDom();
        var randNum = this.randNum();
        var num = 0;
        for (var i = 0; i < this.rows; i++) {
            this.square[i] = [];
            for (var j = 0; j < this.cols; j++) {
                if (~randNum.indexOf(num)) { // 有雷
                    this.square[i][j] = {
                        type: "mine",
                        x: j,
                        y: i,
                        row: i,
                        col: j
                    };
                }
                else { // 无雷
                    this.square[i][j] = {
                        type: "number",
                        x: j,
                        y: i,
                        row: i,
                        col: j,
                        value: 0
                    };
                }
                num++;
            }
        }
        console.log(this.square);
    };
    /**
     * 生成mineNumber个不重复的数字，代表雷的位置
     */
    MineSweeping.prototype.randNum = function () {
        var square = new Array(this.cols * this.rows);
        for (var i = 0; i < square.length; i++) {
            square[i] = i;
        }
        square.sort(function () { return 0.5 - Math.random(); });
        return square.slice(0, this.mineNumber);
    };
    MineSweeping.prototype.createDom = function () {
        var table = document.createElement('table');
        for (var i = 0; i < this.rows; i++) {
            var tr = document.createElement('tr');
            this.doms[i] = [];
            for (var j = 0; j < this.cols; j++) {
                var td = document.createElement('td');
                this.doms[i][j] = td;
                tr.append(td);
            }
            table.append(tr);
        }
        this.container.append(table);
    };
    return MineSweeping;
}());
var Mine = new MineSweeping(10, 10, 10);
