// Easter eggs
const easterEggs = {
    platformer: 'mathias',
    threeDGame: 'cube3d'
};
let easterEggInput = '';

// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

// Observe all fade-in elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });
});

// Easter egg detection
window.addEventListener('keydown', (e) => {
    easterEggInput += e.key.toLowerCase();
    
    // Check for platformer game
    if (easterEggs.platformer.startsWith(easterEggInput)) {
        if (easterEggInput === easterEggs.platformer) {
            easterEggInput = '';
            launchPlatformer();
        }
    }
    // Check for 3D game
    else if (easterEggs.threeDGame.startsWith(easterEggInput)) {
        if (easterEggInput === easterEggs.threeDGame) {
            easterEggInput = '';
            launch3DGame();
        }
    }
    // Reset if no match
    else {
        easterEggInput = '';
    }
});

function launch3DGame() {
    alert('Easter Egg trouvé! Jeu 3D lancé.');
    
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    gameContainer.style.position = 'fixed';
    gameContainer.style.top = '50%';
    gameContainer.style.left = '50%';
    gameContainer.style.transform = 'translate(-50%, -50%)';
    gameContainer.style.backgroundColor = '#fff';
    gameContainer.style.padding = '20px';
    gameContainer.style.border = '2px solid #007bff';
    gameContainer.style.borderRadius = '10px';
    gameContainer.style.zIndex = '10000';

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.border = '1px solid #000';
    gameContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // 3D cube properties
    const cube = {
        points: [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ],
        edges: [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ],
        rotation: { x: 0, y: 0, z: 0 },
        targetRotation: { x: 0, y: 0, z: 0 },
        scale: 150,
        position: { x: canvas.width/2, y: canvas.height/2 },
        autoRotate: true
    };

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const rotationSpeed = 0.005;
    const lerpFactor = 0.1;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        previousMousePosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = canvas.getBoundingClientRect();
            const currentPosition = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            const deltaX = currentPosition.x - previousMousePosition.x;
            const deltaY = currentPosition.y - previousMousePosition.y;
            
            cube.targetRotation.y += deltaX * rotationSpeed;
            cube.targetRotation.x += deltaY * rotationSpeed;
            
            previousMousePosition = currentPosition;
            cube.autoRotate = false;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    canvas.addEventListener('dblclick', () => {
        cube.autoRotate = !cube.autoRotate;
    });

    function rotatePoint(point, rotation) {
        let [x, y, z] = point;
        
        // Rotate X
        let temp = y;
        y = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
        z = temp * Math.sin(rotation.x) + z * Math.cos(rotation.x);
        
        // Rotate Y
        temp = x;
        x = x * Math.cos(rotation.y) + z * Math.sin(rotation.y);
        z = -temp * Math.sin(rotation.y) + z * Math.cos(rotation.y);
        
        // Rotate Z
        temp = x;
        x = x * Math.cos(rotation.z) - y * Math.sin(rotation.z);
        y = temp * Math.sin(rotation.z) + y * Math.cos(rotation.z);
        
        return [x, y, z];
    }

    function projectPoint(point) {
        const z = 4;
        const perspective = z / (z + point[2]);
        
        return {
            x: point[0] * perspective * cube.scale + cube.position.x,
            y: point[1] * perspective * cube.scale + cube.position.y
        };
    }

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function drawCube() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw instructions
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('Glissez pour faire tourner • Double-cliquez pour activer/désactiver la rotation automatique', 10, 30);

        // Gradient stroke for cube
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#007bff');
        gradient.addColorStop(1, '#00ff88');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;

        // Project and draw each edge
        cube.edges.forEach(edge => {
            const p1 = rotatePoint(cube.points[edge[0]], cube.rotation);
            const p2 = rotatePoint(cube.points[edge[1]], cube.rotation);
            
            const projected1 = projectPoint(p1);
            const projected2 = projectPoint(p2);
            
            ctx.beginPath();
            ctx.moveTo(projected1.x, projected1.y);
            ctx.lineTo(projected2.x, projected2.y);
            ctx.stroke();
        });
    }

    function animate3D() {
        // Smooth rotation interpolation
        cube.rotation.x = lerp(cube.rotation.x, cube.targetRotation.x, lerpFactor);
        cube.rotation.y = lerp(cube.rotation.y, cube.targetRotation.y, lerpFactor);
        cube.rotation.z = lerp(cube.rotation.z, cube.targetRotation.z, lerpFactor);

        // Auto-rotation if enabled
        if (cube.autoRotate) {
            cube.targetRotation.y += 0.02;
            cube.targetRotation.x += 0.01;
        }

        drawCube();
        requestAnimationFrame(animate3D);
    }

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(gameContainer);
    });
    gameContainer.appendChild(closeButton);

    animate3D();
    document.body.appendChild(gameContainer);
}

function launchPlatformer() {
    alert('Easter Egg trouvé! Jeu de Plateforme lancé. Utilisez les flèches pour bouger et sauter. Collectez les pièces et évitez de tomber!');
    
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    gameContainer.style.position = 'fixed';
    gameContainer.style.top = '50%';
    gameContainer.style.left = '50%';
    gameContainer.style.transform = 'translate(-50%, -50%)';
    gameContainer.style.backgroundColor = '#fff';
    gameContainer.style.padding = '20px';
    gameContainer.style.border = '2px solid #007bff';
    gameContainer.style.borderRadius = '10px';
    gameContainer.style.zIndex = '10000';

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 600;
    canvas.style.border = '1px solid #000';
    gameContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    const scoreDisplay = document.createElement('p');
    scoreDisplay.style.marginTop = '10px';
    scoreDisplay.style.fontSize = '18px';
    scoreDisplay.textContent = 'Score: 0';
    gameContainer.appendChild(scoreDisplay);

    // Game objects
    const player = {
        x: 50,
        y: canvas.height - 50,
        width: 30,
        height: 30,
        speed: 6,
        jumpForce: 15,
        gravity: 0.5,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        score: 0,
        lives: 3,
        isInvulnerable: false
    };

    // More varied platforms with different types
    const platforms = [
        { x: 0, y: canvas.height - 20, width: canvas.width, height: 20, type: 'normal' },
        { x: 300, y: canvas.height - 120, width: 150, height: 20, type: 'normal' },
        { x: 600, y: canvas.height - 200, width: 150, height: 20, type: 'moving', direction: 1, speed: 3, startX: 600 },
        { x: 200, y: canvas.height - 280, width: 150, height: 20, type: 'breaking', durability: 60 },
        { x: 500, y: canvas.height - 350, width: 150, height: 20, type: 'bouncy' },
        { x: 800, y: canvas.height - 250, width: 150, height: 20, type: 'moving', direction: 1, speed: 2, startX: 800 },
        { x: 1000, y: canvas.height - 300, width: 150, height: 20, type: 'normal' },
        { x: 400, y: canvas.height - 400, width: 150, height: 20, type: 'breaking', durability: 60 },
        { x: 700, y: canvas.height - 450, width: 150, height: 20, type: 'bouncy' },
        { x: 900, y: canvas.height - 500, width: 150, height: 20, type: 'normal' }
    ];

    // More collectibles
    const coins = [
        { x: 320, y: canvas.height - 150, width: 20, height: 20, collected: false, type: 'normal', value: 10 },
        { x: 620, y: canvas.height - 230, width: 20, height: 20, collected: false, type: 'special', value: 50 },
        { x: 220, y: canvas.height - 310, width: 20, height: 20, collected: false, type: 'normal', value: 10 },
        { x: 520, y: canvas.height - 380, width: 20, height: 20, collected: false, type: 'powerup', value: 0 },
        { x: 820, y: canvas.height - 280, width: 20, height: 20, collected: false, type: 'normal', value: 10 },
        { x: 1020, y: canvas.height - 330, width: 20, height: 20, collected: false, type: 'special', value: 50 },
        { x: 420, y: canvas.height - 430, width: 20, height: 20, collected: false, type: 'powerup', value: 0 },
        { x: 720, y: canvas.height - 480, width: 20, height: 20, collected: false, type: 'normal', value: 10 },
        { x: 920, y: canvas.height - 530, width: 20, height: 20, collected: false, type: 'special', value: 50 }
    ];

    // Add enemies with different patterns
    const enemies = [
        { x: 350, y: canvas.height - 140, width: 30, height: 30, direction: 1, speed: 2, range: 150, startX: 350, type: 'patrol' },
        { x: 650, y: canvas.height - 220, width: 30, height: 30, direction: 1, speed: 3, range: 200, startX: 650, type: 'patrol' },
        { x: 850, y: canvas.height - 270, width: 30, height: 30, direction: 1, speed: 4, amplitude: 50, startY: canvas.height - 270, type: 'flying' },
        { x: 450, y: canvas.height - 420, width: 30, height: 30, direction: 1, speed: 3, range: 150, startX: 450, type: 'patrol' }
    ];

    // Game controls
    const keys = {
        left: false,
        right: false,
        up: false
    };

    window.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft': keys.left = true; break;
            case 'ArrowRight': keys.right = true; break;
            case 'ArrowUp': keys.up = true; break;
        }
    });

    window.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowLeft': keys.left = false; break;
            case 'ArrowRight': keys.right = false; break;
            case 'ArrowUp': keys.up = false; break;
        }
    });

    function updatePlayer() {
        // Horizontal movement with momentum
        if (keys.left) {
            player.velocityX = Math.max(-player.speed, player.velocityX - 0.5);
        } else if (keys.right) {
            player.velocityX = Math.min(player.speed, player.velocityX + 0.5);
        } else {
            player.velocityX *= 0.9; // Friction
        }
        player.x += player.velocityX;

        // Jumping
        if (keys.up && !player.isJumping) {
            player.velocityY = -player.jumpForce;
            player.isJumping = true;
        }

        // Apply gravity
        player.velocityY += player.gravity;
        player.y += player.velocityY;

        // Update platforms
        platforms.forEach(platform => {
            // Moving platforms
            if (platform.type === 'moving') {
                platform.x += platform.direction * platform.speed;
                if (platform.x > platform.startX + 100 || platform.x < platform.startX - 100) {
                    platform.direction *= -1;
                }
            }
            
            // Platform collision
            if (player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height + player.velocityY) {
                
                switch(platform.type) {
                    case 'normal':
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        player.isJumping = false;
                        break;
                    case 'breaking':
                        platform.durability--;
                        if (platform.durability <= 0) {
                            platform.type = 'broken';
                        } else {
                            player.y = platform.y - player.height;
                            player.velocityY = 0;
                            player.isJumping = false;
                        }
                        break;
                    case 'bouncy':
                        player.velocityY = -player.jumpForce * 1.5;
                        player.isJumping = true;
                        break;
                    case 'moving':
                        player.x += platform.direction * platform.speed;
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        player.isJumping = false;
                        break;
                }
            }
        });

        // Coin collection
        coins.forEach(coin => {
            if (!coin.collected &&
                player.x + player.width > coin.x &&
                player.x < coin.x + coin.width &&
                player.y + player.height > coin.y &&
                player.y < coin.y + coin.height) {
                coin.collected = true;
                
                switch(coin.type) {
                    case 'normal':
                    case 'special':
                        player.score += coin.value;
                        scoreDisplay.textContent = 'Score: ' + player.score;
                        break;
                    case 'powerup':
                        player.isInvulnerable = true;
                        setTimeout(() => { player.isInvulnerable = false; }, 5000);
                        break;
                }
                
                // Check if all coins are collected
                if (coins.every(c => c.collected)) {
                    endGame(true);
                }
            }
        });

        // Update enemies
        enemies.forEach(enemy => {
            switch(enemy.type) {
                case 'patrol':
                    enemy.x += enemy.direction * enemy.speed;
                    if (enemy.x > enemy.startX + enemy.range || enemy.x < enemy.startX - enemy.range) {
                        enemy.direction *= -1;
                    }
                    break;
                case 'flying':
                    // Sinusoidal vertical movement
                    enemy.x += enemy.direction * enemy.speed;
                    enemy.y = enemy.startY + Math.sin(enemy.x * 0.02) * enemy.amplitude;
                    if (enemy.x > enemy.startX + enemy.range || enemy.x < enemy.startX - enemy.range) {
                        enemy.direction *= -1;
                    }
                    break;
            }
        });

        // Enemy collision
        if (!player.isInvulnerable) {
            enemies.forEach(enemy => {
                if (player.x + player.width > enemy.x &&
                    player.x < enemy.x + enemy.width &&
                    player.y + player.height > enemy.y &&
                    player.y < enemy.y + enemy.height) {
                    player.lives--;
                    if (player.lives <= 0) {
                        endGame(false);
                    } else {
                        // Reset player position and make temporarily invulnerable
                        player.x = 50;
                        player.y = canvas.height - 100;
                        player.isInvulnerable = true;
                        setTimeout(() => { player.isInvulnerable = false; }, 2000);
                    }
                }
            });
        }

        // Boundaries
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y + player.height > canvas.height) {
            player.lives--;
            if (player.lives <= 0) {
                endGame(false);
            } else {
                player.x = 50;
                player.y = canvas.height - 100;
            }
        }
    }

    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw platforms with different styles
        platforms.forEach(platform => {
            switch(platform.type) {
                case 'normal':
                    ctx.fillStyle = '#333';
                    break;
                case 'moving':
                    ctx.fillStyle = '#2196f3';
                    break;
                case 'breaking':
                    // Color gets lighter as durability decreases
                    const opacity = platform.durability / 60;
                    ctx.fillStyle = `rgba(244, 67, 54, ${opacity})`;
                    break;
                case 'bouncy':
                    ctx.fillStyle = '#4caf50';
                    break;
                case 'broken':
                    return; // Don't draw broken platforms
            }
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // Draw coins with animation
        coins.forEach(coin => {
            if (!coin.collected) {
                ctx.save();
                ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2);
                ctx.rotate(performance.now() / 500); // Rotation animation

                switch(coin.type) {
                    case 'normal':
                        ctx.fillStyle = '#ffd700';
                        break;
                    case 'special':
                        ctx.fillStyle = '#ff5722';
                        break;
                    case 'powerup':
                        ctx.fillStyle = '#e91e63';
                        break;
                }

                // Star shape for coins
                const spikes = 5;
                const outerRadius = coin.width/2;
                const innerRadius = coin.width/4;
                
                ctx.beginPath();
                for(let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / spikes;
                    if(i === 0) {
                        ctx.moveTo(radius, 0);
                    } else {
                        ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
                    }
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        });

        // Draw enemies with different styles
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.type === 'flying' ? '#9c27b0' : '#f44336';
            
            if (enemy.type === 'flying') {
                // Flying enemy: Circle with wings
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Wings
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y + enemy.height/2);
                ctx.quadraticCurveTo(
                    enemy.x + enemy.width/2, 
                    enemy.y - enemy.height/2,
                    enemy.x + enemy.width, 
                    enemy.y + enemy.height/2
                );
                ctx.stroke();
            } else {
                // Patrol enemy: Triangle
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y + enemy.height);
                ctx.lineTo(enemy.x + enemy.width/2, enemy.y);
                ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
                ctx.closePath();
                ctx.fill();
            }
        });

        // Draw instructions
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText('← → : Déplacer    ↑ : Sauter', 20, 30);
        ctx.fillText('⭐ Normal: 10pts    🌟 Spécial: 50pts    💫 Power-up: Invincibilité', 20, 60);

        // Draw player with effects
        ctx.save();
        if (player.isInvulnerable) {
            ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 100) * 0.5;
        }
        // Player gradient
        const gradient = ctx.createLinearGradient(
            player.x, player.y,
            player.x, player.y + player.height
        );
        gradient.addColorStop(0, '#007bff');
        gradient.addColorStop(1, '#0056b3');
        ctx.fillStyle = gradient;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.restore();

        // Draw lives
        for(let i = 0; i < player.lives; i++) {
            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            ctx.arc(30 + i * 30, 30, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw score with shadow
        ctx.font = '24px Arial';
        ctx.fillStyle = '#000';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(`Score: ${player.score}`, canvas.width - 150, 40);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    function gameLoop() {
        updatePlayer();
        draw();
        requestAnimationFrame(gameLoop);
    }

    function endGame(won) {
        // Create game over overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.padding = '20px';
        overlay.style.borderRadius = '10px';
        overlay.style.color = '#fff';
        overlay.style.textAlign = 'center';
        overlay.style.minWidth = '300px';

        // Game over message
        const title = document.createElement('h2');
        title.style.color = won ? '#4caf50' : '#f44336';
        title.style.marginBottom = '20px';
        title.textContent = won ? 'Niveau Terminé!' : 'Game Over';
        overlay.appendChild(title);

        // Score details
        const scoreText = document.createElement('p');
        scoreText.style.fontSize = '20px';
        scoreText.style.marginBottom = '15px';
        scoreText.textContent = `Score Final: ${player.score}`;
        overlay.appendChild(scoreText);

        // Stats
        const stats = document.createElement('div');
        stats.style.marginBottom = '20px';
        stats.style.textAlign = 'left';
        stats.innerHTML = `
            <p>🪙 Pièces collectées: ${coins.filter(c => c.collected).length}/${coins.length}</p>
            <p>❤️ Vies restantes: ${player.lives}</p>
            ${won ? '<p>🌟 Bonus de victoire: +100</p>' : ''}
        `;
        overlay.appendChild(stats);

        // Retry button
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Rejouer';
        retryButton.style.padding = '10px 20px';
        retryButton.style.fontSize = '16px';
        retryButton.style.backgroundColor = '#007bff';
        retryButton.style.color = '#fff';
        retryButton.style.border = 'none';
        retryButton.style.borderRadius = '5px';
        retryButton.style.cursor = 'pointer';
        retryButton.style.marginRight = '10px';
        retryButton.addEventListener('click', () => {
            document.body.removeChild(gameContainer);
            launchPlatformer();
        });
        overlay.appendChild(retryButton);

        // Quit button
        const quitButton = document.createElement('button');
        quitButton.textContent = 'Quitter';
        quitButton.style.padding = '10px 20px';
        quitButton.style.fontSize = '16px';
        quitButton.style.backgroundColor = '#dc3545';
        quitButton.style.color = '#fff';
        quitButton.style.border = 'none';
        quitButton.style.borderRadius = '5px';
        quitButton.style.cursor = 'pointer';
        quitButton.addEventListener('click', () => {
            document.body.removeChild(gameContainer);
        });
        overlay.appendChild(quitButton);

        gameContainer.appendChild(overlay);
        
        // Stop game loop and event listeners
        cancelAnimationFrame(gameLoop);
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('keyup', handleKeyPress);

        // Add victory bonus
        if (won) {
            player.score += 100;
            scoreText.textContent = `Score Final: ${player.score}`;
        }
    }

    gameLoop();
    document.body.appendChild(gameContainer);
}
