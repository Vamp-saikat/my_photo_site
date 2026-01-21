let selectedImageUrl = '';
let gridSize = 3;
let draggedItem = null;

let moves = 0;
let seconds = 0;
let timerInterval = null;
let isGameActive = false; 

function selectImage(wrapper, url) {
    document.querySelectorAll('.puzzle-choice-img').forEach(img => {
        img.style.borderColor = 'transparent';
    });
    const img = wrapper.querySelector('img');
    img.style.borderColor = '#b5a499';
    selectedImageUrl = url;
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
    }
}
/**
function startGame() {
    if (!selectedImageUrl) return;
    gridSize = parseInt(document.getElementById('difficulty').value);
    document.getElementById('setup-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    isGameActive = false; 
    initPuzzle();
}
*/
/**
 * THE UNLOCKING FUNCTION
 */
/**function startPlaying() {
    // 1. Set the game state to active
    isGameActive = true; 
    
    // 2. "Open" the board by removing the locked-board class
    const board = document.getElementById('puzzle-board');
    if (board) {
        board.classList.remove('locked-board');
        board.style.pointerEvents = "auto"; // Ensure pieces can be clicked
    }

    // 3. Hide the button container to reveal the full board
    const panel = document.getElementById('control-panel');
    if (panel) panel.style.display = 'none';

    // 4. Force all pieces to become draggable
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach(p => {
        p.setAttribute('draggable', 'true');
        p.style.cursor = 'grab'; // Changes cursor to a hand icon
    });

    // 5. Start the clock
    startTimer();
}
*/
function initPuzzle() {
    const board = document.getElementById('puzzle-board');
    if (!board) return;
    board.innerHTML = '';
    
    // Ensure the board starts with the lock class
    board.classList.add('locked-board');
    
    const boardSize = Math.min(window.innerWidth * 0.85, 500); 
    const pieceSize = boardSize / gridSize;
    board.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceSize}px)`;
    
    let pieceOrder = Array.from({length: gridSize * gridSize}, (_, i) => i);
    pieceOrder.sort(() => Math.random() - 0.5);
    
    pieceOrder.forEach((originalIdx) => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.style.width = `${pieceSize * 1.15}px`;
        piece.style.height = `${pieceSize * 1.15}px`;
        piece.style.margin = `-${pieceSize * 0.075}px`; 
        piece.style.backgroundImage = `url('${selectedImageUrl}')`;
        piece.style.backgroundSize = `${boardSize}px ${boardSize}px`;
        
        const row = Math.floor(originalIdx / gridSize);
        const col = originalIdx % gridSize;
        piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
        
        // MASK LOGIC
        const maskSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M30,0 C35,15 65,15 70,0 L100,0 L100,30 C85,35 85,65 100,70 L100,100 L70,100 C65,85 35,85 30,100 L0,100 L0,70 C15,65 15,35 0,30 L0,0 Z"/></svg>';
        piece.style.webkitMaskImage = `url('${maskSvg}')`;
        piece.style.maskImage = `url('${maskSvg}')`;
        piece.style.webkitMaskSize = "100% 100%";
        piece.style.maskSize = "100% 100%";
        
        // START COMPLETELY DISABLED
        piece.setAttribute('draggable', 'false'); 
        piece.dataset.correctIndex = originalIdx;
        
        piece.addEventListener('dragstart', handleDragStart);
        piece.addEventListener('dragover', (e) => e.preventDefault());
        piece.addEventListener('drop', handleDrop);
        
        board.appendChild(piece);
    });
}

function handleDragStart(e) { 
    if (!isGameActive) {
        e.preventDefault();
        return false;
    }
    draggedItem = this; 
}

function handleDrop(e) {
    if (!isGameActive || this === draggedItem) return;
    
    moves++;
    document.getElementById('move-count').innerText = moves.toString().padStart(3, '0');
    
    const targetBg = this.style.backgroundPosition;
    const targetIdx = this.dataset.correctIndex;
    
    this.style.backgroundPosition = draggedItem.style.backgroundPosition;
    this.dataset.correctIndex = draggedItem.dataset.correctIndex;
    
    draggedItem.style.backgroundPosition = targetBg;
    draggedItem.dataset.correctIndex = targetIdx;
    
    checkWin();
}

function checkWin() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    const win = Array.from(pieces).every((p, i) => parseInt(p.dataset.correctIndex) === i);
    
    if (win) {
        isGameActive = false;
        clearInterval(timerInterval);
        document.getElementById('win-msg').style.display = 'block';
        document.getElementById('puzzle-board').classList.add('locked-board');
    }
}

// Stats and Timer functions same as before...
function resetStats() { moves = 0; seconds = 0; }
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds/60).toString().padStart(2,'0');
        const secs = (seconds%60).toString().padStart(2,'0');
        document.getElementById('timer').innerText = `${mins}:${secs}`;
    }, 1000);
}