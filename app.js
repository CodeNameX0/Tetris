class Tetris {
    constructor() {
        this.stageWidth = 10;
        this.stageHeight = 20;
        this.stageCanvas = document.getElementById("stage");
        this.nextCanvas = document.getElementById("next");

        // 숫자로 변환
        let stageCanvasWidth = parseInt(this.stageCanvas.width, 10);
        let stageCanvasHeight = parseInt(this.stageCanvas.height, 10);

        // 정사각형 셀을 위한 크기 계산 (20px로 줄임)
        this.cellSize = 20;
        this.stageLeftPadding = (stageCanvasWidth - this.cellSize * this.stageWidth) / 2;
        this.stageTopPadding = (stageCanvasHeight - this.cellSize * this.stageHeight) / 2;
        this.blocks = this.createBlocks();
        this.deletedLines = 0;
        this.score = 0;
        this.level = 1;
        this.linesNeededForNextLevel = 10;
        this.fallSpeed = 500;
        this.highScores = this.loadHighScores();

        window.onkeydown = (e) => {
            if (e.keyCode === 37) {
                this.moveLeft();
            } else if (e.keyCode === 38) {
                this.rotate();
            } else if (e.keyCode === 39) {
                this.moveRight();
            } else if (e.keyCode === 40) {
                this.fall();
            }
        };

        document.getElementById("tetris-move-left-button").onmousedown = () => this.moveLeft();
        document.getElementById("tetris-rotate-button").onmousedown = () => this.rotate();
        document.getElementById("tetris-move-right-button").onmousedown = () => this.moveRight();
        document.getElementById("tetris-fall-button").onmousedown = () => this.fall();
        document.getElementById("reset-button").onclick = () => {
            this.resetGame();
            this.startGame();
        };
    }

    createBlocks() {
        return [
            {
                shape: [[[-1, 0], [0, 0], [1, 0], [2, 0]],
                        [[0, -1], [0, 0], [0, 1], [0, 2]],
                        [[-1, 0], [0, 0], [1, 0], [2, 0]],
                        [[0, -1], [0, 0], [0, 1], [0, 2]]],
                color: "rgb(0, 255, 255)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(0, 128, 128)"
            },
            {
                shape: [[[0, 0], [1, 0], [0, 1], [1, 1]],
                        [[0, 0], [1, 0], [0, 1], [1, 1]],
                        [[0, 0], [1, 0], [0, 1], [1, 1]],
                        [[0, 0], [1, 0], [0, 1], [1, 1]]],
                color: "rgb(255, 255, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 128, 0)"
            },
            {
                shape: [[[0, 0], [1, 0], [-1, 1], [0, 1]],
                        [[-1, -1], [-1, 0], [0, 0], [0, 1]],
                        [[0, 0], [1, 0], [-1, 1], [0, 1]],
                        [[-1, -1], [-1, 0], [0, 0], [0, 1]]],
                color: "rgb(0, 255, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(0, 128, 0)"
            },
            {
                shape: [[[-1, 0], [0, 0], [0, 1], [1, 1]],
                        [[0, -1], [-1, 0], [0, 0], [-1, 1]],
                        [[-1, 0], [0, 0], [0, 1], [1, 1]],
                        [[0, -1], [-1, 0], [0, 0], [-1, 1]]],
                color: "rgb(255, 0, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 0, 0)"
            },
            {
                shape: [[[-1, -1], [-1, 0], [0, 0], [1, 0]],
                        [[0, -1], [1, -1], [0, 0], [0, 1]],
                        [[-1, 0], [0, 0], [1, 0], [1, 1]],
                        [[0, -1], [0, 0], [-1, 1], [0, 1]]],
                color: "rgb(0, 0, 255)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(0, 0, 128)"
            },
            {
                shape: [[[1, -1], [-1, 0], [0, 0], [1, 0]],
                        [[0, -1], [0, 0], [0, 1], [1, 1]],
                        [[-1, 0], [0, 0], [1, 0], [-1, 1]],
                        [[-1, -1], [0, -1], [0, 0], [0, 1]]],
                color: "rgb(255, 165, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 82, 0)"
            },
            {
                shape: [[[0, -1], [-1, 0], [0, 0], [1, 0]],
                        [[0, -1], [0, 0], [1, 0], [0, 1]],
                        [[-1, 0], [0, 0], [1, 0], [0, 1]],
                        [[0, -1], [-1, 0], [0, 0], [0, 1]]],
                color: "rgb(255, 0, 255)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 0, 128)"
            }
        ];
    }

    drawBlock(x, y, type, angle, canvas) {
        let context = canvas.getContext("2d");
        let block = this.blocks[type];
        for (let i = 0; i < block.shape[angle].length; i++) {
            this.drawCell(context,
                x + (block.shape[angle][i][0] * this.cellSize),
                y + (block.shape[angle][i][1] * this.cellSize),
                this.cellSize,
                type);
        }
    }

    drawCell(context, cellX, cellY, cellSize, type) {
        let block = this.blocks[type];
        let adjustedX = cellX + 0.5;
        let adjustedY = cellY + 0.5;
        let adjustedSize = cellSize - 1;
        context.fillStyle = block.color;
        context.fillRect(adjustedX, adjustedY, adjustedSize, adjustedSize);
        context.strokeStyle = block.highlight;
        context.beginPath();
        context.moveTo(adjustedX, adjustedY + adjustedSize);
        context.lineTo(adjustedX, adjustedY);
        context.lineTo(adjustedX + adjustedSize, adjustedY);
        context.stroke();
        context.strokeStyle = block.shadow;
        context.beginPath();
        context.moveTo(adjustedX, adjustedY + adjustedSize);
        context.lineTo(adjustedX + adjustedSize, adjustedY + adjustedSize);
        context.lineTo(adjustedX + adjustedSize, adjustedY);
        context.stroke();
    }

    startGame() {
        let virtualStage = new Array(this.stageWidth);
        for (let i = 0; i < this.stageWidth; i++) {
            virtualStage[i] = new Array(this.stageHeight).fill(null);
        }
        this.virtualStage = virtualStage;
        this.currentBlock = null;
        this.nextBlock = this.getRandomBlock();
        this.displayHighScores();
        this.mainLoop();
    }

    mainLoop() {
        if (this.currentBlock == null) {
            if (!this.createNewBlock()) {
                return;
            }
        } else {
            this.fallBlock();
        }
        this.drawStage();
        if (this.currentBlock != null) {
            this.drawBlock(this.stageLeftPadding + this.blockX * this.cellSize,
                this.stageTopPadding + this.blockY * this.cellSize,
                this.currentBlock, this.blockAngle, this.stageCanvas);
        }
        setTimeout(this.mainLoop.bind(this), this.fallSpeed);
    }

    createNewBlock() {
        this.currentBlock = this.nextBlock;
        this.nextBlock = this.getRandomBlock();
        this.blockX = Math.floor(this.stageWidth / 2 - 2);
        this.blockY = 0;
        this.blockAngle = 0;
        this.drawNextBlock();
        if (!this.checkBlockMove(this.blockX, this.blockY, this.currentBlock, this.blockAngle)) {
            let messageElem = document.getElementById("message");
            messageElem.innerText = "GAME OVER";
            this.gameOver();
            return false;
        }
        return true;
    }

    drawNextBlock() {
        this.clear(this.nextCanvas);
        this.drawBlock(this.cellSize * 0.5, this.cellSize * 0.5, this.nextBlock,
            0, this.nextCanvas);
    }

    getRandomBlock() {
        return Math.floor(Math.random() * 7);
    }

    fallBlock() {
        if (this.checkBlockMove(this.blockX, this.blockY + 1, this.currentBlock, this.blockAngle)) {
            this.blockY++;
        } else {
            this.fixBlock(this.blockX, this.blockY, this.currentBlock, this.blockAngle);
            this.score += 10; // 블록 고정 시 10점 추가
            document.getElementById("score").innerText = "" + this.score;
            this.currentBlock = null;
        }
    }

    checkBlockMove(x, y, type, angle) {
        for (let i = 0; i < this.blocks[type].shape[angle].length; i++) {
            let cellX = x + this.blocks[type].shape[angle][i][0];
            let cellY = y + this.blocks[type].shape[angle][i][1];
            if (cellX < 0 || cellX > this.stageWidth - 1) {
                return false;
            }
            if (cellY > this.stageHeight - 1) {
                return false;
            }
            if (this.virtualStage[cellX][cellY] != null) {
                return false;
            }
        }
        return true;
    }

    fixBlock(x, y, type, angle) {
        for (let i = 0; i < this.blocks[type].shape[angle].length; i++) {
            let cellX = x + this.blocks[type].shape[angle][i][0];
            let cellY = y + this.blocks[type].shape[angle][i][1];
            if (cellY >= 0) {
                this.virtualStage[cellX][cellY] = type;
            }
        }
        let linesCleared = 0;
        for (let y = this.stageHeight - 1; y >= 0; ) {
            let filled = true;
            for (let x = 0; x < this.stageWidth; x++) {
                if (this.virtualStage[x][y] == null) {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                for (let y2 = y; y2 > 0; y2--) {
                    for (let x = 0; x < this.stageWidth; x++) {
                        this.virtualStage[x][y2] = this.virtualStage[x][y2 - 1];
                    }
                }
                for (let x = 0; x < this.stageWidth; x++) {
                    this.virtualStage[x][0] = null;
                }
                linesCleared++;
            } else {
                y--;
            }
        }
        if (linesCleared > 0) {
            this.deletedLines += linesCleared;
            this.updateScore(linesCleared);
            this.updateLevel();
            let linesElem = document.getElementById("lines");
            linesElem.innerText = "" + this.deletedLines;
        }
    }

    drawStage() {
        this.clear(this.stageCanvas);
    
        let context = this.stageCanvas.getContext("2d");
    
        // 그리드 그리기
        context.strokeStyle = "rgba(255, 255, 255, 0.5)"; // 그리드 색상 (진한 흰색)
        context.lineWidth = 1; // 선 두께를 1로 설정
        context.setLineDash([4, 2]); // 점선 설정: [4px 선, 2px 간격]
    
        // 수직선 그리기
        for (let x = 0; x <= this.stageWidth; x++) {
            let xPos = this.stageLeftPadding + x * this.cellSize;
            context.beginPath();
            context.moveTo(xPos, this.stageTopPadding);
            context.lineTo(xPos, this.stageTopPadding + this.cellSize * this.stageHeight);
            context.stroke();
        }

        // 수평선 그리기
        for (let y = 0; y <= this.stageHeight; y++) {
        let yPos = this.stageTopPadding + y * this.cellSize;
        context.beginPath();
        context.moveTo(this.stageLeftPadding, yPos);
        context.lineTo(this.stageLeftPadding + this.cellSize * this.stageWidth, yPos);
        context.stroke();
        }
    
        // 점선 초기화 (다른 그리기에 영향을 주지 않도록)
        context.setLineDash([]);
    
        // 블록 그리기
        for (let x = 0; x < this.virtualStage.length; x++) {
            for (let y = 0; y < this.virtualStage[x].length; y++) {
                if (this.virtualStage[x][y] != null) {
                    this.drawCell(context,
                        this.stageLeftPadding + (x * this.cellSize),
                        this.stageTopPadding + (y * this.cellSize),
                        this.cellSize,
                        this.virtualStage[x][y]);
                }
            }
        }
    }

    moveLeft() {
        if (this.checkBlockMove(this.blockX - 1, this.blockY, this.currentBlock, this.blockAngle)) {
            this.blockX--;
            this.refreshStage();
        }
    }

    moveRight() {
        if (this.checkBlockMove(this.blockX + 1, this.blockY, this.currentBlock, this.blockAngle)) {
            this.blockX++;
            this.refreshStage();
        }
    }

    rotate() {
        let newAngle = (this.blockAngle + 1) % 4;
        if (this.checkBlockMove(this.blockX, this.blockY, this.currentBlock, newAngle)) {
            this.blockAngle = newAngle;
            this.refreshStage();
        }
    }

    fall() {
        while (this.checkBlockMove(this.blockX, this.blockY + 1, this.currentBlock, this.blockAngle)) {
            this.blockY++;
            this.refreshStage();
        }
    }

    refreshStage() {
        this.clear(this.stageCanvas);
        this.drawStage();
        this.drawBlock(this.stageLeftPadding + this.blockX * this.cellSize,
            this.stageTopPadding + this.blockY * this.cellSize,
            this.currentBlock, this.blockAngle, this.stageCanvas);
    }

    clear(canvas) {
        let context = canvas.getContext("2d");
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    updateScore(linesCleared) {
        // 기본 점수: 라인당 100점, 레벨 보너스 적용
        let baseScore = linesCleared * 100 * this.level;
        
        // 여러 줄 삭제 보너스
        let multiplier = 1;
        if (linesCleared === 2) multiplier = 2.5;
        else if (linesCleared === 3) multiplier = 5;
        else if (linesCleared === 4) multiplier = 8; // 테트리스 보너스
        
        this.score += Math.floor(baseScore * multiplier);
        
        let scoreElem = document.getElementById("score");
        scoreElem.innerText = "" + this.score;
    }

    updateLevel() {
        let newLevel = Math.floor(this.deletedLines / this.linesNeededForNextLevel) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.fallSpeed = Math.max(50, 500 - (this.level - 1) * 50); // 레벨당 50ms씩 빨라짐
            
            let levelElem = document.getElementById("level");
            levelElem.innerText = "" + this.level;
        }
    }

    gameOver() {
        this.checkAndUpdateHighScore();
        this.displayHighScores();
    }

    checkAndUpdateHighScore() {
        this.highScores.push(this.score);
        this.highScores.sort((a, b) => b - a); // 내림차순 정렬
        this.highScores = this.highScores.slice(0, 5); // 상위 5개만 유지
        this.saveHighScores();
    }

    loadHighScores() {
        let scores = localStorage.getItem('tetrisHighScores');
        return scores ? JSON.parse(scores) : [0, 0, 0, 0, 0];
    }

    saveHighScores() {
        localStorage.setItem('tetrisHighScores', JSON.stringify(this.highScores));
    }

    displayHighScores() {
        let highScoreList = document.getElementById("high-score-list");
        highScoreList.innerHTML = "";
        
        this.highScores.forEach((score, index) => {
            let li = document.createElement("li");
            li.textContent = score.toLocaleString(); // 천 단위 구분 기호 추가
            if (score === this.score && index === 0) {
                li.style.color = "#f39c12"; // 새로운 최고 점수는 금색으로 표시
                li.style.fontWeight = "bold";
                li.textContent += " 🏆";
            }
            highScoreList.appendChild(li);
        });
    }

    resetGame() {
        this.score = 0;
        this.level = 1;
        this.deletedLines = 0;
        this.fallSpeed = 500;
        this.currentBlock = null;
        
        // UI 업데이트
        document.getElementById("score").innerText = "0";
        document.getElementById("level").innerText = "1";
        document.getElementById("lines").innerText = "0";
        document.getElementById("message").innerText = "";
        
        // 가상 스테이지 초기화
        this.virtualStage = [];
        for (let x = 0; x < this.stageWidth; x++) {
            this.virtualStage[x] = [];
            for (let y = 0; y < this.stageHeight; y++) {
                this.virtualStage[x][y] = null;
            }
        }
        
        this.displayHighScores();
    }
}
