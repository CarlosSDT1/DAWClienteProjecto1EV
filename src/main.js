import "./scss/style.scss"
import { PongGame } from './game/PongGame.js'

// Iniciar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('app');
    const game = new PongGame(gameContainer);
    game.start();
});