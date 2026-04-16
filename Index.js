/* ===================================================================
   RENAN.DEV — Terminal Portfolio
   Clean, modular terminal engine with commands, history, effects
   =================================================================== */

// ======================
//  DOM References
// ======================
const DOM = {
    input: document.getElementById('terminal-input'),
    output: document.getElementById('output'),
    body: document.getElementById('terminal-body'),
    canvas: document.getElementById('matrix-canvas'),
    clock: document.getElementById('clock'),
    year: document.getElementById('year'),
};

// ======================
//  State
// ======================
const state = {
    history: [],
    historyIndex: -1,
    isTyping: false,
};

// ======================
//  Constants
// ======================
const TYPING_SPEED = 18;
const PHONE = '(61) 99273-0855';

const ASCII_BANNER = [
    '  ██████╗ ███████╗███╗   ██╗ █████╗ ███╗   ██╗',
    '  ██╔══██╗██╔════╝████╗  ██║██╔══██╗████╗  ██║',
    '  ██████╔╝█████╗  ██╔██╗ ██║███████║██╔██╗ ██║',
    '  ██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║██║╚██╗██║',
    '  ██║  ██║███████╗██║ ╚████║██║  ██║██║ ╚████║',
    '  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝',
];

// ======================
//  Utility Functions
// ======================

/** Create a DOM element with optional classes and text */
function createElement(tag, classes = [], text = '') {
    const el = document.createElement(tag);
    if (classes.length) el.classList.add(...classes);
    if (text) el.textContent = text;
    return el;
}

/** Append an output line to the terminal */
function appendLine(text, type = 'response') {
    const line = createElement('div', ['output-line', type], text);
    DOM.output.appendChild(line);
    scrollToBottom();
    return line;
}

/** Append raw HTML as an output line */
function appendHTML(html, type = 'response') {
    const line = createElement('div', ['output-line', type]);
    line.innerHTML = html;
    DOM.output.appendChild(line);
    scrollToBottom();
    return line;
}

/** Append a raw element to the output */
function appendElement(element) {
    DOM.output.appendChild(element);
    scrollToBottom();
    return element;
}

/** Add a separator line */
function appendSeparator() {
    const hr = document.createElement('hr');
    hr.classList.add('separator');
    DOM.output.appendChild(hr);
}

/** Smooth scroll to the bottom of the terminal */
function scrollToBottom() {
    requestAnimationFrame(() => {
        DOM.body.scrollTop = DOM.body.scrollHeight;
    });
}

/** Typewriter effect — returns a Promise so we can await it */
function typewrite(element, text, speed = TYPING_SPEED) {
    return new Promise((resolve) => {
        let i = 0;
        state.isTyping = true;

        // Add cursor
        const cursor = createElement('span', ['typing-cursor']);
        element.appendChild(cursor);

        function tick() {
            if (i < text.length) {
                cursor.before(document.createTextNode(text.charAt(i)));
                i++;
                scrollToBottom();
                setTimeout(tick, speed);
            } else {
                cursor.remove();
                state.isTyping = false;
                resolve();
            }
        }
        tick();
    });
}

/** Echo the user's command to the output (like a real terminal) */
function echoCommand(cmd) {
    const line = createElement('div', ['output-line', 'command-echo']);
    line.innerHTML = `<span class="prompt-prefix">renan@portfolio:~$</span> <span class="cmd-text">${escapeHTML(cmd)}</span>`;
    DOM.output.appendChild(line);
    scrollToBottom();
}

/** Escape HTML to prevent XSS */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/** Get current time string */
function getTimeString() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

/** Get current date string */
function getDateString() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

// ======================
//  Commands Registry
// ======================
const commands = {

    help: {
        description: 'List available commands',
        execute() {
            appendLine('Available commands:', 'info');
            appendSeparator();

            const cmdList = Object.entries(commands)
                .map(([name, cmd]) => ({ name, desc: cmd.description }))
                .sort((a, b) => a.name.localeCompare(b.name));

            for (const { name, desc } of cmdList) {
                appendHTML(
                    `  <span style="color:var(--color-cyan)">${name.padEnd(12)}</span> <span style="color:var(--color-gray)">—</span> ${desc}`,
                    'response'
                );
            }

            appendSeparator();
            appendLine('Tip: Use ↑ ↓ arrows to navigate command history.', 'system');
        }
    },

    about: {
        description: 'About Renan Rodrigues',
        async execute() {
            // ASCII Banner
            for (const line of ASCII_BANNER) {
                appendLine(line, 'ascii-art');
            }

            appendSeparator();

            const bio = createElement('div', ['output-line', 'response']);
            DOM.output.appendChild(bio);
            await typewrite(bio, 'Hello! I\'m Renan Rodrigues — a passionate Full-Stack Developer from Brazil.');

            const bio2 = createElement('div', ['output-line', 'response']);
            DOM.output.appendChild(bio2);
            await typewrite(bio2, 'I build modern web applications with JavaScript, Node.js, and more.');

            const bio3 = createElement('div', ['output-line', 'response']);
            DOM.output.appendChild(bio3);
            await typewrite(bio3, 'Currently seeking internship or job opportunities in web development.', 22);

            appendSeparator();
            appendLine('Type "skills" to see my tech stack, or "projects" to see my work.', 'system');
        }
    },

    skills: {
        description: 'Display technical skills',
        execute() {
            appendLine('Technical Skills:', 'info');
            appendSeparator();

            const skills = [
                { name: 'JavaScript', level: 75, color: 'yellow' },
                { name: 'HTML/CSS', level: 85, color: 'green' },
                { name: 'Node.js', level: 55, color: 'green' },
                { name: 'React', level: 40, color: 'cyan' },
                { name: 'Python', level: 35, color: 'magenta' },
                { name: 'Git', level: 60, color: 'cyan' },
                { name: 'SQL', level: 45, color: 'yellow' },
            ];

            for (const skill of skills) {
                const container = createElement('div', ['skill-bar-container']);
                container.innerHTML = `
                    <span class="skill-name">${skill.name}</span>
                    <div class="skill-bar">
                        <div class="skill-bar-fill ${skill.color}" data-width="${skill.level}"></div>
                    </div>
                    <span class="skill-percent">${skill.level}%</span>
                `;
                DOM.output.appendChild(container);
            }

            // Animate the bars after a small delay
            setTimeout(() => {
                document.querySelectorAll('.skill-bar-fill[data-width]').forEach((bar) => {
                    bar.style.width = bar.dataset.width + '%';
                });
            }, 100);

            appendSeparator();
            scrollToBottom();
        }
    },

    projects: {
        description: 'Show my projects',
        execute() {
            appendLine('My Projects:', 'info');
            appendSeparator();

            const projects = [
                {
                    title: '🖥️ Terminal Portfolio',
                    desc: 'This interactive terminal-style portfolio you\'re using right now!',
                    tech: ['JavaScript', 'CSS3', 'HTML5'],
                    url: '#',
                },
                {
                    title: '🌐 Web App Project',
                    desc: 'Full-stack web application with Node.js backend.',
                    tech: ['Node.js', 'Express', 'MongoDB'],
                    url: '#',
                },
                {
                    title: '📱 Responsive Dashboard',
                    desc: 'A data dashboard with charts and real-time updates.',
                    tech: ['React', 'Chart.js', 'REST API'],
                    url: '#',
                },
            ];

            for (const project of projects) {
                const card = document.createElement('a');
                card.classList.add('project-card');
                card.href = project.url;
                card.target = '_blank';
                card.rel = 'noopener noreferrer';
                card.innerHTML = `
                    <div class="project-title">${project.title}</div>
                    <div class="project-desc">${project.desc}</div>
                    <div class="project-tech">
                        ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                `;
                DOM.output.appendChild(card);
            }

            appendSeparator();
            appendLine('Click any project card to visit.', 'system');
            scrollToBottom();
        }
    },

    contact: {
        description: 'Get my contact information',
        async execute() {
            appendLine('Contact Information:', 'info');
            appendSeparator();

            const info = [
                `📞  Phone:    ${PHONE}`,
                `📧  Email:    renanbrodrigues6@gmail.com`,
                `📍  Location: Brasília, DF — Brazil`,
            ];

            for (const line of info) {
                const el = createElement('div', ['output-line', 'response']);
                DOM.output.appendChild(el);
                await typewrite(el, line, 15);
            }

            appendSeparator();
            appendLine('Type "social" to see my profiles.', 'system');
        }
    },

    social: {
        description: 'Show social media links',
        execute() {
            appendLine('Social Profiles:', 'info');
            appendSeparator();

            const socials = [
                { name: '⚡ GitHub', url: 'https://github.com/' },
                { name: '💼 LinkedIn', url: 'https://linkedin.com/' },
                { name: '🐦 Twitter/X', url: 'https://x.com/' },
            ];

            const container = createElement('div', ['output-line']);
            container.style.display = 'flex';
            container.style.flexWrap = 'wrap';
            container.style.gap = '6px';

            for (const s of socials) {
                const link = document.createElement('a');
                link.classList.add('social-link');
                link.href = s.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = s.name;
                container.appendChild(link);
            }

            DOM.output.appendChild(container);
            appendSeparator();
            scrollToBottom();
        }
    },

    clear: {
        description: 'Clear the terminal screen',
        execute() {
            DOM.output.innerHTML = '';
        }
    },

    date: {
        description: 'Show current date and time',
        execute() {
            appendLine(getDateString(), 'response');
            appendLine(getTimeString(), 'response');
        }
    },

    whoami: {
        description: 'Who are you?',
        execute() {
            appendLine('renan', 'response');
        }
    },

    sudo: {
        description: '??? (try it)',
        execute() {
            appendLine('Nice try! But you don\'t have admin access here 😄', 'warning');
            appendLine('[sudo] password for renan: ********', 'error');
            appendLine('Sorry, try again.', 'error');
        }
    },

    matrix: {
        description: 'Toggle Matrix rain effect',
        execute() {
            const canvas = DOM.canvas;
            if (canvas.style.opacity === '0') {
                canvas.style.opacity = '0.12';
                appendLine('Matrix rain: ON ☔', 'response');
            } else {
                canvas.style.opacity = '0';
                appendLine('Matrix rain: OFF 🌤️', 'response');
            }
        }
    },

    neofetch: {
        description: 'System information',
        execute() {
            const lines = [
                '',
                `  <span style="color:var(--color-cyan)">OS:</span>         RenanOS v2.0`,
                `  <span style="color:var(--color-cyan)">Host:</span>       portfolio.renan.dev`,
                `  <span style="color:var(--color-cyan)">Kernel:</span>     JavaScript ES2024`,
                `  <span style="color:var(--color-cyan)">Uptime:</span>     ${Math.floor(performance.now() / 1000)}s`,
                `  <span style="color:var(--color-cyan)">Shell:</span>      terminal.js 1.0`,
                `  <span style="color:var(--color-cyan)">Terminal:</span>    Renan Terminal Emulator`,
                `  <span style="color:var(--color-cyan)">Resolution:</span> ${window.innerWidth}x${window.innerHeight}`,
                `  <span style="color:var(--color-cyan)">Theme:</span>      Matrix Green`,
                '',
                `  <span style="background:#ff5f57;color:#ff5f57">██</span><span style="background:#febc2e;color:#febc2e">██</span><span style="background:#28c840;color:#28c840">██</span><span style="background:#00e5ff;color:#00e5ff">██</span><span style="background:#e040fb;color:#e040fb">██</span><span style="background:#ffd600;color:#ffd600">██</span><span style="background:#e0e0e0;color:#e0e0e0">██</span>`,
            ];

            for (const line of lines) {
                appendHTML(line, 'response');
            }
        }
    },

    history: {
        description: 'Show command history',
        execute() {
            if (state.history.length === 0) {
                appendLine('No history yet.', 'system');
                return;
            }
            appendLine('Command History:', 'info');
            state.history.forEach((cmd, i) => {
                appendHTML(`  <span style="color:var(--color-gray)">${String(i + 1).padStart(3)}</span>  ${escapeHTML(cmd)}`, 'response');
            });
        }
    },

    banner: {
        description: 'Show the welcome banner',
        execute() {
            showWelcome();
        }
    },
};

// ======================
//  Command Processor
// ======================
function processCommand(rawInput) {
    const cmd = rawInput.trim().toLowerCase();
    if (!cmd) return;

    // Save to history
    state.history.push(cmd);
    state.historyIndex = state.history.length;

    // Echo the command
    echoCommand(cmd);

    // Lookup and execute
    if (commands[cmd]) {
        commands[cmd].execute();
    } else {
        appendLine(`Command not found: "${escapeHTML(cmd)}"`, 'error');
        appendLine('Type "help" to see available commands.', 'system');
    }
}

// ======================
//  Input Handlers
// ======================
DOM.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        processCommand(DOM.input.value);
        DOM.input.value = '';
    }

    // Command history navigation
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.historyIndex > 0) {
            state.historyIndex--;
            DOM.input.value = state.history[state.historyIndex];
        }
    }

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            DOM.input.value = state.history[state.historyIndex];
        } else {
            state.historyIndex = state.history.length;
            DOM.input.value = '';
        }
    }

    // Tab completion
    if (e.key === 'Tab') {
        e.preventDefault();
        const partial = DOM.input.value.trim().toLowerCase();
        if (partial) {
            const matches = Object.keys(commands).filter(c => c.startsWith(partial));
            if (matches.length === 1) {
                DOM.input.value = matches[0];
            } else if (matches.length > 1) {
                echoCommand(partial);
                appendLine(matches.join('  '), 'system');
            }
        }
    }

    // Ctrl+L to clear
    if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        commands.clear.execute();
    }
});

// Clicking anywhere on terminal focuses the input
document.querySelector('.terminal').addEventListener('click', (e) => {
    if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        DOM.input.focus();
    }
});

// ======================
//  Clock
// ======================
function updateClock() {
    DOM.clock.textContent = getTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Year
DOM.year.textContent = new Date().getFullYear();

// ======================
//  Matrix Rain Effect
// ======================
function initMatrixRain() {
    const canvas = DOM.canvas;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF'.split('');

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff41';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 40);
}

// ======================
//  Welcome Message
// ======================
function showWelcome() {
    // ASCII Banner
    for (const line of ASCII_BANNER) {
        appendLine(line, 'ascii-art');
    }

    appendSeparator();

    appendHTML(
        `  Welcome to <span style="color:var(--color-cyan)">Renan's Terminal Portfolio</span> — v2.0`,
        'response'
    );
    appendHTML(
        `  <span style="color:var(--color-gray)">${getDateString()}</span>`,
        'system'
    );

    appendSeparator();

    appendLine('Type "help" to see available commands.', 'system');
    appendLine('Type "about" to learn more about me.', 'system');
    appendLine('', 'system');
}

// ======================
//  Boot Sequence
// ======================
function boot() {
    initMatrixRain();

    // Simulated boot lines
    const bootLines = [
        { text: '[OK] Loading kernel modules...', delay: 0 },
        { text: '[OK] Initializing terminal engine...', delay: 200 },
        { text: '[OK] Connecting to portfolio.renan.dev...', delay: 400 },
        { text: '[OK] System ready.', delay: 600 },
    ];

    bootLines.forEach(({ text, delay }) => {
        setTimeout(() => {
            appendLine(text, 'system');
        }, delay);
    });

    // Show welcome after boot
    setTimeout(() => {
        appendSeparator();
        showWelcome();
        DOM.input.focus();
    }, 900);
}

// ======================
//  Initialize
// ======================
document.addEventListener('DOMContentLoaded', boot);