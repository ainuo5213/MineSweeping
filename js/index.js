var MineSweeping = /** @class */ (function () {
    function MineSweeping(rows, cols, mineNumber) {
        var _this = this;
        this.cls = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
        this.mines = []; // 雷的二维数组
        this.square = []; // 数字的二维数组，用于存储每个格子的信息
        this.doms = []; //doms的二维数组
        this.container = document.querySelector('.game-box');
        this.mineNum = document.querySelector('.mine-num');
        this.handleMouseDown = function (e) {
            console.log(_this.cols, _this.rows);
            if (e.target.tagName.toLowerCase() === 'td') {
                if (e.which === 1) { // 左键
                    _this.play(e.target, 1);
                }
                else if (e.which === 3) { // 右键阻止默认事件
                    _this.container.oncontextmenu = function () {
                        return false;
                    };
                    _this.play(e.target, 3);
                }
            }
        };
        this.rows = rows;
        this.cols = cols;
        this.mineNumber = mineNumber;
        this.restMineNumber = mineNumber;
        this.init();
    }
    MineSweeping.prototype.init = function () {
        this.container.innerHTML = '';
        // 初始化数字的二维数组
        var randNum = this.randNum();
        var num = 0;
        for (var i = 0; i < this.rows; i++) {
            this.square[i] = [];
            for (var j = 0; j < this.cols; j++) {
                if (~randNum.indexOf(num)) { // 有雷
                    var mine_1 = {
                        type: "mine",
                        x: j,
                        y: i,
                        row: i,
                        col: j,
                        flag: false
                    };
                    this.square[i][j] = mine_1;
                    this.mines.push(mine_1);
                }
                else { // 在随机数字数组中找不到num，则无雷
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
        this.updateNumber();
        this.createDom();
        this.addListener();
        this.mineNum.innerHTML = this.mineNumber + '';
    };
    MineSweeping.prototype.play = function (target, flag) {
        var _a = target, row = _a.row, col = _a.col;
        var curSquare = this.square[row][col];
        // 显示数字或者雷
        if (flag === 1) {
            // 标红旗的格子不能左击
            if (this.doms[row][col] && this.doms[row][col].className && this.doms[row][col].className === 'flag') {
                return;
            }
            // 处理行为不同，点击的是数字
            if (curSquare.type === 'number') {
                target.classList.add(this.cls[curSquare.value]);
                if (curSquare.value === 0) { // 点到了数字0，扩散
                    /**
                     * 点到了数字0：
                     *  1. 显示自己
                     *  2. 找四周
                     *      a. 显示四周（只显示到非0非mine的为止）
                     *      b. 四周再扩散找四周....
                     */
                    this.getAllZero(curSquare);
                }
                else { // 点击的是其他数字，显示
                    target.innerHTML = curSquare.value + '';
                }
                // 点到的是雷
            }
            else if (curSquare.type === 'mine') {
                this.gameOver(curSquare);
            }
            // 点击的是右键，插上小红旗（可取消），当红旗插满mineNumber个数，判断插上的位置是否全都和雷位置一样
            // 一样则游戏胜利，否则游戏结束
        }
        else if (flag === 3) {
            // 只能是盖着的格子才能够标记
            if (this.doms[row][col].className && this.doms[row][col].className !== 'flag') {
                return;
            }
            // 点击的是非数字，切换class
            this.doms[row][col].className = this.doms[row][col].className === 'flag' ? '' : 'flag';
            // 用户标记正确的雷就将雷的数组中flag置为对应值
            if (curSquare.type === 'mine') {
                for (var i = 0; i < this.mines.length; i++) {
                    if (this.mines[i].row == row && this.mines[i].col === col) {
                        this.mines[i].flag = this.doms[row][col].className === 'flag';
                    }
                }
                // this.mines[curSquare.row][curSquare.col].flag = this.doms[row][col].className === 'flag'
            }
            // 如果用户标的已经有flag，则剩下雷数减少
            if (this.doms[row][col].className === 'flag') {
                this.restMineNumber--;
            }
            else {
                this.restMineNumber++;
            }
            this.mineNum.innerHTML = this.restMineNumber + '';
            // 如果剩余的雷数量<=0时，说明用户已经标完小红旗，判断游戏胜利与否
            if (this.restMineNumber <= 0) {
                if (this.checkGameOver()) {
                    alert('恭喜你，游戏胜利');
                    this.gameOver(curSquare);
                }
                else {
                    alert('游戏失败');
                    this.gameOver(curSquare);
                }
            }
        }
    };
    MineSweeping.prototype.checkGameOver = function () {
        for (var i = 0; i < this.mines.length; i++) {
            if (this.mines[i].flag === false) {
                return false;
            }
        }
        return true;
    };
    /**
     * 游戏失败函数
     * @param square
     */
    MineSweeping.prototype.gameOver = function (square) {
        /**
         * 给当前点击的雷添加一个特殊的样式
         * 所有雷显示
         * 取消所有格子的事件
         */
        // 给当前雷添加特殊样式
        if (square.type === 'mine') {
            this.doms[square.row][square.col].style.backgroundColor = 'red';
        }
        // 显示所有雷
        for (var i = 0; i < this.mines.length; i++) {
            var mineX = this.mines[i].row, mineY = this.mines[i].col;
            // 如果游戏结束时，有雷的位置已经插了旗子，就将其背景颜色改变
            if (this.doms[mineX][mineY].className === 'flag') {
                this.doms[mineX][mineY].style.backgroundColor = 'green';
                // 如果游戏结束时，有雷的位置没插旗子，就直接高边其class为mine-item
            }
            else {
                this.doms[mineX][mineY].className = '';
                this.doms[mineX][mineY].classList.add('mine-item');
            }
        }
        // 取消table的事件
        this.removeListener();
    };
    MineSweeping.prototype.removeListener = function () {
        this.container.removeEventListener('mousedown', this.handleMouseDown);
    };
    MineSweeping.prototype.getAllZero = function (square) {
        var _this = this;
        var around = this.getAround(square);
        var _loop_2 = function (i) {
            var x = around[i][0], y = around[i][1];
            // 给周围的格子添加class
            this_1.doms[x][y].classList.add(this_1.cls[this_1.square[x][y].value]);
            // 以某个格子为中心找到的四周某个格子为0，那么就接着调用函数
            if (this_1.square[x][y].value === 0) {
                // 当前格子没有被找过
                if (!this_1.doms[x][y].check) {
                    setTimeout(function () {
                        _this.doms[x][y].check = true;
                        _this.getAllZero(_this.square[x][y]);
                    }, 0);
                }
                // 如果以某个格子为中心找到的四周格子不为0且不为雷
            }
            else if (this_1.square[x][y].type === 'number' && this_1.square[x][y].value !== 0) {
                this_1.doms[x][y].innerHTML = this_1.square[x][y].value + '';
            }
        };
        var this_1 = this;
        for (var i = 0; i < around.length; i++) {
            _loop_2(i);
        }
    };
    MineSweeping.prototype.addListener = function () {
        this.container.addEventListener('mousedown', this.handleMouseDown);
    };
    MineSweeping.prototype.updateNumber = function () {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                // 只更新的是雷周围的数字，因为只有类周围的数字才会显示出来
                if (this.square[i][j].type === 'number') {
                    continue;
                }
                var num = this.getAround(this.square[i][j]); // 每一个雷周围的数字集合
                for (var k = 0; k < num.length; k++) {
                    this.square[num[k][0]][num[k][1]].value += 1;
                }
            }
        }
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
    /**
     * 获取一个格子周围所有的格子
     */
    MineSweeping.prototype.getAround = function (square) {
        // res找到的格子的坐标返回出去
        var x = square.x, y = square.y, res = [];
        for (var i = x - 1; i <= x + 1; i++) {
            for (var j = y - 1; j <= y + 1; j++) {
                // 做判断，排除四角、自身是雷、不遍历自己
                if (i < 0 || // 左边格子超出了范围
                    j < 0 || // 格子超出了上边的范围
                    i > this.rows - 1 || // 格子超出了右边的范围
                    j > this.cols - 1 || // 各自超出了下边的范围
                    (i === x && j === y) || // 当前遍历到的格子是自己
                    // j和i相反得出row，col
                    this.square[j][i].type === 'mine' // 周围的格子是个雷
                ) {
                    continue;
                }
                res.push([j, i]); // 要以行和列的方式进行返回
            }
        }
        return res;
    };
    MineSweeping.prototype.createDom = function () {
        var table = document.createElement('table');
        for (var i = 0; i < this.rows; i++) {
            var tr = document.createElement('tr');
            this.doms[i] = [];
            for (var j = 0; j < this.cols; j++) {
                var td = document.createElement('td');
                td.row = i;
                td.col = j;
                this.doms[i][j] = td;
                // 给当前中心找到的格子添加check标志，以后不再找这个
                this.doms[i][j].check = false;
                tr.append(td);
            }
            table.append(tr);
        }
        this.container.append(table);
    };
    return MineSweeping;
}());
var levels = document.querySelectorAll('.level button');
var activeIndex = 0;
var arr = [[10, 10, 10], [16, 16, 40], [28, 28, 99]];
var mine = new MineSweeping(arr[0][0], arr[0][1], arr[0][2]);
var _loop_1 = function (i) {
    levels[i].onclick = function () {
        levels[activeIndex].className = '';
        levels[i].className = 'active';
        mine.removeListener();
        mine = new MineSweeping(arr[i][0], arr[i][1], arr[i][2]);
        mine.init();
        activeIndex = i;
    };
};
for (var i = 0; i < levels.length - 1; i++) {
    _loop_1(i);
}
levels[levels.length - 1].onclick = function () {
    mine.removeListener();
    mine.init();
};
