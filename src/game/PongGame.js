export class PongGame {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.gameOver = false;
        this.gamePaused = false;
        
        // Dimensiones
        this.width = 800;
        this.height = 400;
        
        // Paletas
        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.paddleSpeed = 8;
        this.paddleHorizontalSpeed = 4;
        
        // Límites de movimiento horizontal
        this.leftPaddleMinX = 10;
        this.leftPaddleMaxX = this.width / 2 - 50;
        this.rightPaddleMinX = this.width / 2 + 50;
        this.rightPaddleMaxX = this.width - 20;
        
        this.leftPaddle = {
            x: 20,
            y: this.height / 2 - this.paddleHeight / 2,
            score: 0
        };
        
        this.rightPaddle = {
            x: this.width - 30,
            y: this.height / 2 - this.paddleHeight / 2,
            score: 0
        };
        
        // Pelota - CON SISTEMA DE ACELERACIÓN
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            radius: 8,
            speedX: 5,
            speedY: 3,
            baseSpeed: 6,           // Velocidad base para cálculos
            acceleration: 0.2,      // Incremento de velocidad por golpe
            maxSpeed: 15,           // Velocidad máxima permitida
            hitCount: 0             // Contador de golpes
        };
        
        // Configuración
        this.winningScore = 8;
        this.minDifference = 1;
        
        // Controles
        this.keys = {
            w: false, s: false, a: false, d: false,
            ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
            p: false, r: false
        };
        
        this.setupControls();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            // Reiniciar con R solo cuando está pausado
            if (key === 'r' && this.gamePaused) {
                this.restartGame();
                return;
            }
            
            // Pausar/reanudar con P
            if (key === 'p' && !this.gameOver) {
                this.togglePause();
                return;
            }
            
            // Reiniciar con ESPACIO cuando el juego termina
            if (this.gameOver && e.key === ' ') {
                this.restartGame();
                return;
            }
            
            if (e.key in this.keys) {
                this.keys[e.key] = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = false;
            }
        });
    }
    
    togglePause() {
        if (this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showPauseScreen();
        } else {
            this.hidePauseScreen();
            if (this.gameRunning && !this.gamePaused) {
                this.gameLoop();
            }
        }
    }
    
    showPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSA', this.width / 2, this.height / 2 - 50);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Presiona P para continuar', this.width / 2, this.height / 2);
        this.ctx.fillText('Presiona R para reiniciar partida', this.width / 2, this.height / 2 + 30);
    }
    
    hidePauseScreen() {
        this.draw();
    }
    
    updateControlsInfo(isPaused) {
        let controlsInfo = this.container.querySelector('.controls-info');
        
        if (!controlsInfo) {
            controlsInfo = document.createElement('div');
            controlsInfo.className = 'controls-info';
            this.container.querySelector('.game-container').appendChild(controlsInfo);
        }
        
        if (isPaused) {
            controlsInfo.innerHTML = `
                <div class="player-controls">
                    <div class="player">
                        <strong>Jugador Izquierdo:</strong> WASD (movimiento completo)
                    </div>
                    <div class="player">
                        <strong>Jugador Derecho:</strong> Flechas (movimiento completo)
                    </div>
                </div>
                <div class="game-rules">
                    <strong>Características:</strong> Pelota acelera con cada golpe • Máxima velocidad: ${this.ball.maxSpeed}
                </div>
                <div class="game-controls">
                    P (Continuar) | R (Reiniciar partida)
                </div>
            `;
        } else {
            controlsInfo.innerHTML = `
                <div class="player-controls">
                    <div class="player">
                        <strong>Jugador Izquierdo:</strong> WASD (movimiento completo)
                    </div>
                    <div class="player">
                        <strong>Jugador Derecho:</strong> Flechas (movimiento completo)
                    </div>
                </div>
                <div class="game-rules">
                    <strong>Reglas:</strong> Mejor de 8 puntos • Diferencia de 1 • Empate 7-7 continúa<br>
                    <strong>Física:</strong> Pelota acelera progresivamente • Velocidad actual: <span id="current-speed">${this.getCurrentBallSpeed().toFixed(1)}</span>
                </div>
                <div class="game-controls">
                    P (Pausar) • R (Reiniciar en pausa) • ESPACIO (Reiniciar al terminar)
                </div>
            `;
        }
    }
    
    getCurrentBallSpeed() {
        return Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
    }
    
    accelerateBall() {
        this.ball.hitCount++;
        
        // Calcular aumento de velocidad
        const speedIncrease = this.ball.acceleration * this.ball.hitCount;
        const currentSpeed = this.getCurrentBallSpeed();
        const targetSpeed = Math.min(this.ball.baseSpeed + speedIncrease, this.ball.maxSpeed);
        
        // Si ya estamos en la velocidad objetivo, no hacer nada
        if (currentSpeed >= targetSpeed) return;
        
        // Calcular factor de escala para mantener la dirección
        const scale = targetSpeed / currentSpeed;
        
        // Aplicar aceleración manteniendo la dirección
        this.ball.speedX *= scale;
        this.ball.speedY *= scale;
        
        // Actualizar display de velocidad si existe
        const speedDisplay = document.getElementById('current-speed');
        if (speedDisplay) {
            speedDisplay.textContent = this.getCurrentBallSpeed().toFixed(1);
        }
    }
    
    start() {
        this.renderGame();
        this.gameRunning = true;
        this.gameOver = false;
        this.gamePaused = false;
        this.gameLoop();
    }
    
    renderGame() {
        // Limpiar contenedor
        this.container.innerHTML = '';
        
        // Crear estructura HTML con clases CSS
        const gameContainer = document.createElement('div');
        gameContainer.className = 'game-container';
        
        // Marcador
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.className = 'score-display';
        this.scoreDisplay.textContent = '0 - 0';
        gameContainer.appendChild(this.scoreDisplay);
        
        // Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'game-canvas';
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        gameContainer.appendChild(this.canvas);
        
        this.container.appendChild(gameContainer);
        this.ctx = this.canvas.getContext('2d');
        this.updateScore();
        this.updateControlsInfo(false);
    }
    
    updateScore() {
        let scoreText = `${this.leftPaddle.score} - ${this.rightPaddle.score}`;
        
        if (this.leftPaddle.score >= 7 && this.rightPaddle.score >= 7) {
            scoreText += ' • PUNTO DE ORO';
            this.scoreDisplay.classList.add('golden-point');
        } else {
            this.scoreDisplay.classList.remove('golden-point');
        }
        
        this.scoreDisplay.textContent = scoreText;
        this.checkWinner();
    }
    
    checkWinner() {
        const leftScore = this.leftPaddle.score;
        const rightScore = this.rightPaddle.score;
        
        if (leftScore >= this.winningScore || rightScore >= this.winningScore) {
            const difference = Math.abs(leftScore - rightScore);
            if (difference > this.minDifference) {
                this.endGame();
                return true;
            }
        }
        
        if (leftScore >= 7 && rightScore >= 7) {
            const difference = Math.abs(leftScore - rightScore);
            if (difference > this.minDifference) {
                this.endGame();
                return true;
            }
        }
        
        return false;
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        this.gamePaused = false;
        
        const winner = this.leftPaddle.score > this.rightPaddle.score ? 'Jugador Izquierdo' : 'Jugador Derecho';
        
        // Dibujar mensaje en el canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡PARTIDA TERMINADA!', this.width / 2, this.height / 2 - 50);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`${winner} gana`, this.width / 2, this.height / 2);
        
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`${this.leftPaddle.score} - ${this.rightPaddle.score}`, this.width / 2, this.height / 2 + 40);
        
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Presiona ESPACIO para reiniciar', this.width / 2, this.height / 2 + 80);
    }
    
    restartGame() {
        this.leftPaddle.score = 0;
        this.rightPaddle.score = 0;
        
        this.leftPaddle.x = 20;
        this.leftPaddle.y = this.height / 2 - this.paddleHeight / 2;
        this.rightPaddle.x = this.width - 30;
        this.rightPaddle.y = this.height / 2 - this.paddleHeight / 2;
        
        this.resetBall();
        
        // También eliminamos cualquier overlay que pudiera existir
        const gameOverDiv = this.container.querySelector('.game-over-overlay');
        if (gameOverDiv) {
            gameOverDiv.remove();
        }
        
        this.gameOver = false;
        this.gameRunning = true;
        this.gamePaused = false;
        
        this.updateScore();
        this.updateControlsInfo(false);
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gameOver || this.gamePaused) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.gameOver || this.gamePaused) return;
        
        // Movimiento jugador izquierdo
        if (this.keys.w && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= this.paddleSpeed;
        }
        if (this.keys.s && this.leftPaddle.y < this.height - this.paddleHeight) {
            this.leftPaddle.y += this.paddleSpeed;
        }
        if (this.keys.a && this.leftPaddle.x > this.leftPaddleMinX) {
            this.leftPaddle.x -= this.paddleHorizontalSpeed;
        }
        if (this.keys.d && this.leftPaddle.x < this.leftPaddleMaxX) {
            this.leftPaddle.x += this.paddleHorizontalSpeed;
        }
        
        // Movimiento jugador derecho
        if (this.keys.ArrowUp && this.rightPaddle.y > 0) {
            this.rightPaddle.y -= this.paddleSpeed;
        }
        if (this.keys.ArrowDown && this.rightPaddle.y < this.height - this.paddleHeight) {
            this.rightPaddle.y += this.paddleSpeed;
        }
        if (this.keys.ArrowLeft && this.rightPaddle.x > this.rightPaddleMinX) {
            this.rightPaddle.x -= this.paddleHorizontalSpeed;
        }
        if (this.keys.ArrowRight && this.rightPaddle.x < this.rightPaddleMaxX) {
            this.rightPaddle.x += this.paddleHorizontalSpeed;
        }
        
        // Mover pelota
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Rebotes en paredes
        if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.height) {
            this.ball.speedY = -this.ball.speedY;
        }
        
        // Rebote en paleta izquierda - CON ACELERACIÓN
        if (this.ball.x - this.ball.radius <= this.leftPaddle.x + this.paddleWidth &&
            this.ball.x + this.ball.radius >= this.leftPaddle.x &&
            this.ball.y >= this.leftPaddle.y &&
            this.ball.y <= this.leftPaddle.y + this.paddleHeight &&
            this.ball.speedX < 0) {
            
            this.ball.speedX = -this.ball.speedX;
            let hitPos = (this.ball.y - (this.leftPaddle.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            this.ball.speedY = hitPos * 6;
            
            // ACELERAR PELOTA después del golpe
            this.accelerateBall();
        }
        
        // Rebote en paleta derecha - CON ACELERACIÓN
        if (this.ball.x + this.ball.radius >= this.rightPaddle.x &&
            this.ball.x - this.ball.radius <= this.rightPaddle.x + this.paddleWidth &&
            this.ball.y >= this.rightPaddle.y &&
            this.ball.y <= this.rightPaddle.y + this.paddleHeight &&
            this.ball.speedX > 0) {
            
            this.ball.speedX = -this.ball.speedX;
            let hitPos = (this.ball.y - (this.rightPaddle.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            this.ball.speedY = hitPos * 6;
            
            // ACELERAR PELOTA después del golpe
            this.accelerateBall();
        }
        
        // Puntos
        if (this.ball.x - this.ball.radius <= 0) {
            this.rightPaddle.score++;
            this.updateScore();
            if (!this.gameOver) {
                this.resetBall();
            }
        }
        
        if (this.ball.x + this.ball.radius >= this.width) {
            this.leftPaddle.score++;
            this.updateScore();
            if (!this.gameOver) {
                this.resetBall();
            }
        }
    }
    
    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        
        // Resetear velocidad y contador de golpes
        this.ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
        this.ball.speedY = (Math.random() * 4 - 2);
        this.ball.hitCount = 0;  // Resetear contador de golpes
        
        // Actualizar display de velocidad
        const speedDisplay = document.getElementById('current-speed');
        if (speedDisplay) {
            speedDisplay.textContent = this.getCurrentBallSpeed().toFixed(1);
        }
    }
    
    draw() {
        if (this.gameOver || this.gamePaused) return;
        
        // Fondo
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Línea central
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Áreas de movimiento
        this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(this.leftPaddleMinX, 0, this.leftPaddleMaxX - this.leftPaddleMinX, this.height);
        this.ctx.strokeRect(this.rightPaddleMinX, 0, this.rightPaddleMaxX - this.rightPaddleMinX, this.height);
        
        // Paletas
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.paddleWidth, this.paddleHeight);
        
        // Pelota - COLOR BLANCO FIJO
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Mostrar velocidad actual en pantalla (debug)
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Vel: ${this.getCurrentBallSpeed().toFixed(1)} | Golpes: ${this.ball.hitCount}`, 10, 20);
    }
    
    stop() {
        this.gameRunning = false;
    }
}