interface MineInterface {
    type: 'mine' | 'number',
    // 在dom中的坐标，与二维数组中的行和列反着的
    x: number,
    y: number,
    // 在二维数组中的行和列
    row: number,
    col: number,
    value?: number,
    flag?: boolean
}

class MineSweeping {
    private readonly rows: number; // 行数
    private readonly cols: number; // 列数
    private readonly cls: string[] = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
    private readonly mineNumber: number; // 总的雷数量
    private mines: MineInterface[] = []; // 雷的二维数组
    private square: MineInterface[][] = []; // 数字的二维数组，用于存储每个格子的信息
    private doms: HTMLTableCellElement[][] = []; //doms的二维数组
    private restMineNumber: number; // 剩下的雷的数量
    private container: HTMLDivElement = document.querySelector('.game-box');
    private readonly mineNum: HTMLSpanElement = document.querySelector('.mine-num');

    constructor(rows: number, cols: number, mineNumber: number) {
        this.rows = rows;
        this.cols = cols;
        this.mineNumber = mineNumber;
        this.restMineNumber = mineNumber;
        this.init()
    }

    public init(): void {
        this.container.innerHTML = '';
        // 初始化数字的二维数组
        let randNum: number[] = this.randNum();
        let num: number = 0;
        for (let i: number = 0; i < this.rows; i++) {
            this.square[i] = [];
            for (let j: number = 0; j < this.cols; j++) {
                if (~randNum.indexOf(num)) { // 有雷
                    let mine: MineInterface = {
                        type: "mine",
                        x: j,
                        y: i,
                        row: i,
                        col: j,
                        flag: false
                    };
                    this.square[i][j] = mine;
                    this.mines.push(mine);
                } else { // 在随机数字数组中找不到num，则无雷
                    this.square[i][j] = {
                        type: "number",
                        x: j,
                        y: i,
                        row: i,
                        col: j,
                        value: 0
                    }
                }
                num++;
            }
        }
        this.updateNumber();
        this.createDom();
        this.addListener();
        this.mineNum.innerHTML = this.mineNumber + '';
    }

    private play(target: EventTarget, flag: 1 | 3) {
        let {row, col} = <any>target;
        let curSquare: MineInterface = this.square[row][col];
        // 显示数字或者雷
        if (flag === 1) {
            // 标红旗的格子不能左击
            if (this.doms[row][col] && this.doms[row][col].className && this.doms[row][col].className === 'flag') {
                return;
            }
            // 处理行为不同，点击的是数字
            if (curSquare.type === 'number') {
                (target as any).classList.add(this.cls[curSquare.value]);
                if (curSquare.value === 0) { // 点到了数字0，扩散
                    /**
                     * 点到了数字0：
                     *  1. 显示自己
                     *  2. 找四周
                     *      a. 显示四周（只显示到非0非mine的为止）
                     *      b. 四周再扩散找四周....
                     */
                    this.getAllZero(curSquare)
                } else { // 点击的是其他数字，显示
                    (target as any).innerHTML = curSquare.value + '';
                }
                // 点到的是雷
            } else if (curSquare.type === 'mine') {
                this.gameOver(curSquare)
            }
            // 点击的是右键，插上小红旗（可取消），当红旗插满mineNumber个数，判断插上的位置是否全都和雷位置一样
            // 一样则游戏胜利，否则游戏结束
        } else if (flag === 3) {
            // 只能是盖着的格子才能够标记
            if (this.doms[row][col].className && this.doms[row][col].className !== 'flag') {
                return
            }
            // 点击的是非数字，切换class
            this.doms[row][col].className = this.doms[row][col].className === 'flag' ? '' : 'flag';
            // 用户标记正确的雷就将雷的数组中flag置为对应值
            if (curSquare.type === 'mine') {
                for (let i = 0; i < this.mines.length; i++) {
                    if (this.mines[i].row == row && this.mines[i].col === col) {
                        this.mines[i].flag = this.doms[row][col].className === 'flag'
                    }
                }
                // this.mines[curSquare.row][curSquare.col].flag = this.doms[row][col].className === 'flag'
            }
            // 如果用户标的已经有flag，则剩下雷数减少
            if (this.doms[row][col].className === 'flag') {
                this.restMineNumber--;
            } else {
                this.restMineNumber++;
            }
            this.mineNum.innerHTML = this.restMineNumber + '';
            // 如果剩余的雷数量<=0时，说明用户已经标完小红旗，判断游戏胜利与否
            if (this.restMineNumber <= 0) {
                if (this.checkGameOver()) {
                    alert('恭喜你，游戏胜利');
                    this.gameOver(curSquare)
                } else {
                    alert('游戏失败');
                    this.gameOver(curSquare)
                }
            }
        }
    }

    private checkGameOver() {
        for (let i = 0; i < this.mines.length; i++) {
            if (this.mines[i].flag === false) {
                return false
            }
        }
        return true
    }

    /**
     * 游戏失败函数
     * @param square
     */
    private gameOver(square: MineInterface) {
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
        for (let i = 0; i < this.mines.length; i++) {
            let mineX: number = this.mines[i].row, mineY: number = this.mines[i].col;
            // 如果游戏结束时，有雷的位置已经插了旗子，就将其背景颜色改变
            if (this.doms[mineX][mineY].className === 'flag') {
                this.doms[mineX][mineY].style.backgroundColor = 'green';
                // 如果游戏结束时，有雷的位置没插旗子，就直接高边其class为mine-item
            } else {
                this.doms[mineX][mineY].className = '';
                this.doms[mineX][mineY].classList.add('mine-item');
            }
        }
        // 取消table的事件
        this.removeListener()
    }
    public removeListener() {
        this.container.removeEventListener('mousedown', this.handleMouseDown);
    }

    private getAllZero(square: MineInterface) {
        let around: number[][] = this.getAround(square);
        for (let i = 0; i < around.length; i++) {
            let x: number = around[i][0], y: number = around[i][1];
            // 给周围的格子添加class
            this.doms[x][y].classList.add(this.cls[this.square[x][y].value]);
            // 以某个格子为中心找到的四周某个格子为0，那么就接着调用函数
            if (this.square[x][y].value === 0) {
                // 当前格子没有被找过
                if (!(this.doms[x][y] as any).check) {
                    setTimeout(() => {
                        (this.doms[x][y] as any).check = true;
                        this.getAllZero(this.square[x][y])
                    }, 0)
                }
                // 如果以某个格子为中心找到的四周格子不为0且不为雷
            } else if (this.square[x][y].type === 'number' && this.square[x][y].value !== 0) {
                this.doms[x][y].innerHTML = this.square[x][y].value + ''
            }
        }
    }

    private addListener() {
        this.container.addEventListener('mousedown', this.handleMouseDown)
    }

    private handleMouseDown = (e: MouseEvent) => {
        console.log(this.cols, this.rows);
        if ((e.target as any).tagName.toLowerCase() === 'td') {
            if (e.which === 1) { // 左键
                this.play(e.target, 1)
            } else if (e.which === 3) { // 右键阻止默认事件
                this.container.oncontextmenu = function () {
                    return false
                };
                this.play(e.target, 3)
            }
        }
    };

    private updateNumber() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                // 只更新的是雷周围的数字，因为只有类周围的数字才会显示出来
                if (this.square[i][j].type === 'number') {
                    continue;
                }
                let num: number[][] = this.getAround(this.square[i][j]); // 每一个雷周围的数字集合
                for (let k = 0; k < num.length; k++) {
                    this.square[num[k][0]][num[k][1]].value += 1
                }
            }
        }
    }

    /**
     * 生成mineNumber个不重复的数字，代表雷的位置
     */
    private randNum(): number[] {
        let square: number[] = new Array(this.cols * this.rows);
        for (let i: number = 0; i < square.length; i++) {
            square[i] = i;
        }
        square.sort(() => 0.5 - Math.random());
        return square.slice(0, this.mineNumber)
    }

    /**
     * 获取一个格子周围所有的格子
     */
    private getAround(square: MineInterface): number[][] {
        // res找到的格子的坐标返回出去
        let {x, y} = square, res: number[][] = [];
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                // 做判断，排除四角、自身是雷、不遍历自己
                if (i < 0 || // 左边格子超出了范围
                    j < 0 || // 格子超出了上边的范围
                    i > this.rows - 1 || // 格子超出了右边的范围
                    j > this.cols - 1 || // 各自超出了下边的范围
                    (i === x && j === y) || // 当前遍历到的格子是自己
                    // j和i相反得出row，col
                    this.square[j][i].type === 'mine' // 周围的格子是个雷
                ) {
                    continue
                }
                res.push([j, i]) // 要以行和列的方式进行返回
            }
        }

        return res

    }

    private createDom(): void {
        let table: HTMLTableElement = document.createElement('table');
        for (let i: number = 0; i < this.rows; i++) {
            let tr: HTMLTableRowElement = document.createElement('tr');
            this.doms[i] = [];
            for (let j: number = 0; j < this.cols; j++) {
                let td: HTMLTableCellElement = document.createElement('td');
                (td as any).row = i;
                (td as any).col = j;
                this.doms[i][j] = td;
                // 给当前中心找到的格子添加check标志，以后不再找这个
                (this.doms[i][j] as any).check = false;
                tr.append(td)
            }
            table.append(tr)
        }
        this.container.append(table)
    }
}

let levels: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.level button');
let activeIndex: number = 0;
let arr: number[][] = [[10, 10, 10], [16, 16, 40], [28, 28, 99]];
let mine: MineSweeping = new MineSweeping(arr[0][0], arr[0][1], arr[0][2]);
for (let i = 0; i < levels.length - 1; i++) {
    levels[i].onclick = function () {
        levels[activeIndex].className = '';
        levels[i].className = 'active';
        mine.removeListener();
        mine = new MineSweeping(arr[i][0], arr[i][1], arr[i][2]);
        mine.init();
        activeIndex = i;
    }
}
levels[levels.length - 1].onclick = function () {
    mine.removeListener();
    mine.init();
};


