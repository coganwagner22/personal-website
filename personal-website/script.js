// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'var(--bg-grey)';
        navbar.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)';
        navbar.style.borderBottom = '2px solid var(--border-grey)';
    } else {
        navbar.style.background = 'var(--bg-grey)';
        navbar.style.boxShadow = 'var(--shadow-light)';
        navbar.style.borderBottom = '1px solid var(--border-grey)';
    }
});

// --- World Clocks Logic ---

// --- Snake Game Logic ---
(function() {
    const CELL_SIZE = 10;
    const WIDTH = 60;
    const HEIGHT = 60;
    const CANVAS_WIDTH = WIDTH * CELL_SIZE;
    const CANVAS_HEIGHT = HEIGHT * CELL_SIZE;
    let snake = [[30, 30]];
    let direction = [1, 0];
    let food = getRandomCoord();
    let running = false;
    let score = 0;
    let highScore = 0;
    let intervalId = null;
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const scoreElem = document.getElementById('snake-score');
    const highScoreElem = document.getElementById('snake-highscore');
    const startBtn = document.getElementById('snake-start');
    function getRandomCoord() {
        return [
            Math.floor(Math.random() * WIDTH),
            Math.floor(Math.random() * HEIGHT)
        ];
    }
    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Draw snake
        ctx.shadowColor = '#444';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#fff';
        snake.forEach(([x, y]) => ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE));
        // Draw food
        ctx.shadowColor = '#d32f2f';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ccc';
        ctx.fillRect(food[0] * CELL_SIZE, food[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
    function moveSnake() {
        const newHead = [
            snake[0][0] + direction[0],
            snake[0][1] + direction[1]
        ];
        // Wall collision
        if (
            newHead[0] < 0 || newHead[0] >= WIDTH ||
            newHead[1] < 0 || newHead[1] >= HEIGHT
        ) {
            running = false;
            if (intervalId) clearInterval(intervalId);
            setTimeout(() => alert('Game Over!'), 100);
            return resetGame();
        }
        // Self collision
        if (snake.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
            running = false;
            if (intervalId) clearInterval(intervalId);
            setTimeout(() => alert('Game Over!'), 100);
            return resetGame();
        }
        const ateFood = newHead[0] === food[0] && newHead[1] === food[1];
        if (ateFood) {
            food = getRandomCoord();
            score++;
            if (score > highScore) highScore = score;
            updateScore();
            snake = [newHead, ...snake];
        } else {
            snake = [newHead, ...snake.slice(0, -1)];
        }
        draw();
    }
    function updateScore() {
        if (scoreElem) scoreElem.textContent = score;
        if (highScoreElem) highScoreElem.textContent = highScore;
    }
    function resetGame() {
        snake = [[30, 30]];
        direction = [1, 0];
        food = getRandomCoord();
        score = 0;
        updateScore();
        draw();
    }
    function startGame() {
        resetGame();
        running = true;
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(moveSnake, 80);
    }
    function handleKeyDown(e) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault(); // Prevent window scroll
        }
        switch (e.key) {
            case 'ArrowUp': if (direction[1] === 0) direction = [0, -1]; break;
            case 'ArrowDown': if (direction[1] === 0) direction = [0, 1]; break;
            case 'ArrowLeft': if (direction[0] === 0) direction = [-1, 0]; break;
            case 'ArrowRight': if (direction[0] === 0) direction = [1, 0]; break;
        }
    }
    if (startBtn) startBtn.onclick = startGame;
    window.addEventListener('keydown', handleKeyDown);
    // Responsive canvas
    function resizeCanvas() {
        const parent = canvas.parentElement;
        if (parent) {
            const size = Math.min(parent.offsetWidth, 600);
            canvas.width = size;
            canvas.height = size;
            draw();
        }
    }
    if (canvas) resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();
})();

// --- Globe Visualization ---
(function() {
  const globeDiv = document.getElementById('globeViz');
  if (!globeDiv || typeof Globe !== 'function') return;
  // Default globe, no markers until we get location
  const globe = Globe()(globeDiv)
    .width(globeDiv.offsetWidth)
    .height(globeDiv.offsetHeight)
    .backgroundColor('#16181a')
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
    .showAtmosphere(true)
    .atmosphereColor('#bdbdbd')
    .atmosphereAltitude(0.18)
    .pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);

  // Animate globe rotation
  let angle = 0;
  function animateGlobe() {
    angle += 0.002;
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: 20, lng: angle * 180 / Math.PI, altitude: 2.5 }, 50);
    requestAnimationFrame(animateGlobe);
  }
  animateGlobe();

  fetch('https://ipinfo.io/json?token=e02508e6df1392')
    .then(r => r.json())
    .then(loc => {
      if (!loc.loc) return;
      const [lat, lng] = loc.loc.split(',').map(Number);
      globe.pointsData([
        {
          lat: lat,
          lng: lng,
          size: 1.4,
          color: '#d32f2f',
        }
      ])
      .pointAltitude('size')
      .pointColor('color')
      .pointRadius(0.32)
      .pointResolution(16);
      globe.pointOfView({ lat, lng, altitude: 2.2 }, 1200);
      // Show location text
      const place = [loc.city, loc.region, loc.country].filter(Boolean).join(', ');
      const locDiv = document.getElementById('globe-location');
      if (locDiv) locDiv.textContent = `You are visiting from: ${place}`;
    })
    .catch(() => {});
})();
const clockConfigs = [
    { id: 'ny', tz: 'America/New_York', label: 'New York (EST)' },
    { id: 'london', tz: 'Europe/London', label: 'London (GMT)' },
    { id: 'berlin', tz: 'Europe/Berlin', label: 'Berlin (CET)' },
    { id: 'tokyo', tz: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

function updateClocks() {
    clockConfigs.forEach(cfg => {
        const now = new Date();
        const localeOpts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: cfg.tz };
        const digital = now.toLocaleTimeString([], localeOpts);
        const digitalElem = document.getElementById('digital-' + cfg.id);
        if (digitalElem) digitalElem.textContent = digital;

        // Analog clock
        const analogElem = document.getElementById('clock-' + cfg.id);
        if (analogElem) {
            analogElem.innerHTML = '';
            const tzDate = new Date(now.toLocaleString('en-US', { timeZone: cfg.tz }));
            const hour = tzDate.getHours() % 12;
            const min = tzDate.getMinutes();
            const sec = tzDate.getSeconds();
            // Hour hand
            const hourHand = document.createElement('div');
            hourHand.className = 'clock-hand hour';
            hourHand.style.transform = `rotate(${(hour + min/60) * 30}deg)`;
            analogElem.appendChild(hourHand);
            // Minute hand
            const minHand = document.createElement('div');
            minHand.className = 'clock-hand minute';
            minHand.style.transform = `rotate(${min * 6}deg)`;
            analogElem.appendChild(minHand);
            // Second hand
            const secHand = document.createElement('div');
            secHand.className = 'clock-hand second';
            secHand.style.transform = `rotate(${sec * 6}deg)`;
            analogElem.appendChild(secHand);
        }
    });
}
setInterval(updateClocks, 1000);
document.addEventListener('DOMContentLoaded', updateClocks);

// Server connection handling
function connectToServer(type) {
    const serverAddress = '15.204.196.146:2402';
    let message = '';
    
    if (type === 'dzsa') {
        message = 'Connecting to server with DZSA...';
        // Add DZSA specific connection code here
    } else {
        message = 'Connecting to server with Vanilla Launcher...';
        // Add vanilla launcher connection code here
    }
    
    alert(message);
    navigator.clipboard.writeText(serverAddress).then(() => {
        alert('Server address copied to clipboard: ' + serverAddress);
    });
}

// Email form handling with rate limiting
let lastEmailTime = 0;
const EMAIL_LIMIT_HOURS = 1;

function sendEmail() {
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const emailStatus = document.getElementById('emailStatus');
    const sendButton = document.getElementById('sendButton');
    
    // Check rate limiting
    const currentTime = Date.now();
    if (currentTime - lastEmailTime < EMAIL_LIMIT_HOURS * 60 * 60 * 1000) {
        emailStatus.textContent = 'Please wait ' + EMAIL_LIMIT_HOURS + ' hour(s) before sending another email.';
        return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailStatus.textContent = 'Please enter a valid email address.';
        return false;
    }
    
    // Disable button and show loading state
    sendButton.disabled = true;
    emailStatus.textContent = 'Sending message...';
    
    // Simulate sending email (in a real implementation, this would make an API call)
    setTimeout(() => {
        // Update last email time
        lastEmailTime = currentTime;
        
        // Reset form and enable button
        document.getElementById('emailForm').reset();
        sendButton.disabled = false;
        emailStatus.textContent = 'Message sent successfully! Check your email for confirmation.';
        
        // In a real implementation, you would send the email to cogan@cogan.live here
        console.log('Email would be sent to: cogan@cogan.live');
        console.log('From:', email);
        console.log('Message:', message);
    }, 2000); // Simulate 2 second delay for sending
    
    return false; // Prevent form submission
}

// Add animation to project cards on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card').forEach((card) => {
    observer.observe(card);
});
