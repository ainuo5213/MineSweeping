interface MineInterface {
    type: 'mine' | 'number',
    // 在dom中的坐标，与二维数组中的行和列反着的
    x: number,
    y: number,
    // 在二维数组中的行和列
    row: number,
    col: number,
    value?: number
}
class MineSweeping {
    private readonly rows: number; // 行数
    private readonly cols: number; // 列数
    private readonly mineNumber: number; // 总的雷数量
    private square: MineInterface[][] = []; // 数字的二维数组，用于存储每个格子的信息
    private doms: HTMLTableCellElement[][] = []; //doms的二维数组
    private restMineNumber: number; // 剩下的雷的数量
    private allRight: boolean; // 标记的是否是雷
    private container: HTMLDivElement = document.querySelector('.game-box');

    constructor(rows: number, cols: number, mineNumber: number) {
        this.rows = rows;
        this.cols = cols;
        this.mineNumber = mineNumber;
        this.init()
    }

    private init(): void {
        this.createDom();
        // 初始化数字的二维数组
        let randNum: number[] = this.randNum();
        let num: number = 0;
        for (let i = 0; i < this.rows; i++) {
            this.square[i] = [];
            for (let j = 0; j < this.cols; j++) {
                if (~randNum.indexOf(num)) { // 有雷
                    this.square[i][j] = {
                        type: "mine",
                        x: j,
                        y: i,
                        row: i,
                        col: j
                    }
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
        console.log(this.square)
    }

    /**
     * 生成mineNumber个不重复的数字，代表雷的位置
     */
    private randNum(): number[] {
        let square: number[] = new Array(this.cols * this.rows);
        for (let i = 0; i < square.length; i++) {
            square[i] = i;
        }
        square.sort(() => 0.5 - Math.random());
        return square.slice(0, this.mineNumber)
    }

    private createDom(): void {
        let table: HTMLTableElement = document.createElement('table');
        for (let i = 0; i < this.rows; i++) {
            let tr: HTMLTableRowElement = document.createElement('tr');
            this.doms[i] = [];
            for (let j = 0; j < this.cols; j++) {
                let td: HTMLTableCellElement = document.createElement('td');
                this.doms[i][j] = td;
                tr.append(td)
            }
            table.append(tr)
        }
        this.container.append(table)
    }
}

let Mine = new MineSweeping(10, 10, 10);

