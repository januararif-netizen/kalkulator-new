// State variables
let display = '0', expression = '', history = [], currentSlide = 0;
let isDegree = true, isInverse = false, theme = 'dark';
let showMenu = false, showHistory = false, showThemeMenu = false;
let wallpaper = '', lastResult = null, canContinue = false;

// DOM elements
const el = {
    display: document.getElementById('display'),
    expression: document.getElementById('expression'),
    historyList: document.getElementById('historyList'),
    buttonSlides: document.getElementById('buttonSlides'),
    basicButtons: document.getElementById('basicButtons'),
    advancedButtons: document.getElementById('advancedButtons'),
    menuBtn: document.getElementById('menuBtn'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    historyBtn: document.getElementById('historyBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    themeBtn: document.getElementById('themeBtn'),
    themeSubmenu: document.getElementById('themeSubmenu'),
    darkThemeBtn: document.getElementById('darkThemeBtn'),
    lightThemeBtn: document.getElementById('lightThemeBtn'),
    wallpaperBtn: document.getElementById('wallpaperBtn'),
    removeWallpaperBtn: document.getElementById('removeWallpaperBtn'),
    fileInput: document.getElementById('fileInput'),
    wallpaper: document.getElementById('wallpaper'),
    prevSlideBtn: document.getElementById('prevSlideBtn'),
    nextSlideBtn: document.getElementById('nextSlideBtn'),
    indicator1: document.getElementById('indicator1'),
    indicator2: document.getElementById('indicator2'),
    historyModal: document.getElementById('historyModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    converterModal: document.getElementById('converterModal'),
    converterBtn: document.getElementById('converterBtn'),
    closeConverterBtn: document.getElementById('closeConverterBtn'),
    converterType: document.getElementById('converterType'),
    converterInput: document.getElementById('converterInput'),
    converterFrom: document.getElementById('converterFrom'),
    converterTo: document.getElementById('converterTo'),
    converterResult: document.getElementById('converterResult'),
    convertBtn: document.getElementById('convertBtn'),
    swapBtn: document.getElementById('swapBtn')
};

// Button configurations
const basicButtons = [
    ['AC', '( )', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '=']
];

const advancedButtons = [
    ['√', 'π','x^y' , '!'],
    [isDegree ? 'Deg' : 'Rad', 'sin', 'cos', 'tan'],
    ['^2', 'e', 'ln', 'log']
];

// Initialize
function init() {
    loadSavedData();
    generateButtons();
    setupEventListeners();
    updateDisplay();
}

// Load saved data
function loadSavedData() {
    theme = localStorage.getItem('theme') || 'dark';
    setTheme(theme);
    
    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) setWallpaper(savedWallpaper);
    
    loadHistory();
}

// Generate buttons
function generateButtons() {
    el.basicButtons.innerHTML = '';
    basicButtons.flat().forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn;
        button.className = 'calc-btn';
        
        if (btn === '=') button.classList.add('equals');
        else if (['÷', '×', '−', '+'].includes(btn)) button.classList.add('operator');
        else if (btn === 'AC') button.classList.add('clear');
        else if (btn === '') button.classList.add('backspace');
        else button.classList.add('number');
        
        button.onclick = () => handleClick(btn);
        el.basicButtons.appendChild(button);
    });
    
    el.advancedButtons.innerHTML = '';
    advancedButtons.flat().forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn;
        button.className = 'calc-btn function';
        if (btn === 'Inv' && isInverse) button.style.opacity = '0.5';
        button.onclick = () => handleClick(btn);
        el.advancedButtons.appendChild(button);
    });
}

// Setup event listeners
function setupEventListeners() {
    el.menuBtn.onclick = (e) => {
        e.stopPropagation();
        el.dropdownMenu.classList.toggle('show');
    };
    
    document.onclick = () => {
        el.dropdownMenu.classList.remove('show');
        el.themeSubmenu.classList.remove('show');
    };
    
    el.dropdownMenu.onclick = (e) => e.stopPropagation();
    
    el.themeBtn.onclick = (e) => {
        e.stopPropagation();
        el.themeSubmenu.classList.toggle('show');
    };
    
    el.darkThemeBtn.onclick = () => {
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
        el.dropdownMenu.classList.remove('show');
    };
    
    el.lightThemeBtn.onclick = () => {
        setTheme('light');
        localStorage.setItem('theme', 'light');
        el.dropdownMenu.classList.remove('show');
    };
    
    el.historyBtn.onclick = () => {
        el.historyModal.classList.add('show');
        el.dropdownMenu.classList.remove('show');
        updateHistoryDisplay();
    };
    
    el.clearHistoryBtn.onclick = () => {
        if (confirm('Hapus semua riwayat?')) {
            clearAllHistory();
            el.dropdownMenu.classList.remove('show');
        }
    };
    
    el.wallpaperBtn.onclick = () => {
        el.fileInput.click();
        el.dropdownMenu.classList.remove('show');
    };
    
    el.removeWallpaperBtn.onclick = () => {
        setWallpaper('');
        localStorage.removeItem('wallpaper');
        el.dropdownMenu.classList.remove('show');
    };
    
    el.fileInput.onchange = handleWallpaper;
    el.closeModalBtn.onclick = () => el.historyModal.classList.remove('show');
    
    el.historyModal.onclick = (e) => {
        if (e.target === el.historyModal) el.historyModal.classList.remove('show');
    };
    
    el.converterBtn.onclick = () => {
        el.converterModal.classList.add('show');
        el.dropdownMenu.classList.remove('show');
    };
    
    el.closeConverterBtn.onclick = () => el.converterModal.classList.remove('show');
    
    el.converterModal.onclick = (e) => {
        if (e.target === el.converterModal) el.converterModal.classList.remove('show');
    };
    
    el.converterType.onchange = updateConverterUnits;
    el.convertBtn.onclick = performConversion;
    el.swapBtn.onclick = swapUnits;
    el.converterInput.oninput = performConversion;
    
    el.prevSlideBtn.onclick = () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlidePosition();
        }
    };
    
    el.nextSlideBtn.onclick = () => {
        if (currentSlide < 1) {
            currentSlide++;
            updateSlidePosition();
        }
    };
    
    el.display.onclick = function() { this.focus(); };
    el.display.onfocus = function() {
        this.setSelectionRange(this.value.length, this.value.length);
    };
    el.expression.onclick = () => el.display.focus();
    
    el.display.onkeydown = (e) => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        handleKeyboard(e);
    };
    
    window.onkeydown = handleKeyboard;
}

// Handle button clicks
function handleClick(btn) {
    const ops = { '÷': '/', '×': '*', '−': '-' };
    
    if (btn === 'AC') clearAll();
    else if (btn === '=') calculate();
    else if (btn === '⌫') backspace();
    else if (btn === '( )') handleParentheses();
    else if (ops[btn]) appendValue(ops[btn]);
    else if (['÷', '×', '−', '+', '.', '%'].includes(btn)) appendValue(btn);
    else if (!isNaN(btn)) appendValue(btn);
    else if (btn === 'Deg' || btn === 'Rad') {
        isDegree = !isDegree;
        advancedButtons[1][0] = isDegree ? 'Deg' : 'Rad';
        generateButtons();
    }
    else if (btn === 'Inv') {
        isInverse = !isInverse;
        generateButtons();
    }
    else if (['sin', 'cos', 'tan'].includes(btn)) appendTrig(btn);
    else if (btn === '√') appendValue('√(');
    else if (btn === 'x²' || btn === '^2') appendValue('^2');
    else if (btn === 'x^y') appendValue('^');
    else if (btn === '!') appendValue('!');
    else if (btn === 'π') appendValue('π');
    else if (btn === 'e') appendValue('e');
    else if (btn === 'ln') appendValue('ln(');
    else if (btn === 'log') appendValue('log(');
}

// Handle parentheses
function handleParentheses() {
    const openCount = (display.match(/\(/g) || []).length;
    const closeCount = (display.match(/\)/g) || []).length;
    
    if (display === '0' || /[+\-×÷(]$/.test(display)) {
        appendValue('(');
    } else if (openCount > closeCount && /[\d)]$/.test(display)) {
        appendValue(')');
    } else {
        appendValue('(');
    }
}

// Append value
function appendValue(val) {
    let dispVal = val === '*' ? '×' : val === '/' ? '÷' : val;

    if (canContinue) {
        if (/[+\-×÷]/.test(dispVal)) {
            display += dispVal;
            expression = display;
        } else {
            display = dispVal;
            expression = dispVal;
        }
        canContinue = false;
    } else {
        if (display === '0' && val !== '.' && val !== '%') {
            display = dispVal;
            expression = dispVal;
        } else {
            display += dispVal;
            expression += dispVal;
        }
    }
    updateDisplay();
}

// Append trig function
function appendTrig(func) {
    appendValue(isInverse ? `a${func}(` : `${func}(`);
    isInverse = false;
    generateButtons();
}

// Backspace
function backspace() {
    if (canContinue) {
        clearAll();
        return;
    }
    
    if (display.length > 1) {
        display = display.slice(0, -1);
        expression = expression.slice(0, -1);
    } else {
        display = '0';
        expression = '';
    }
    updateDisplay();
}

// Clear all
function clearAll() {
    display = '0';
    expression = '';
    canContinue = false;
    updateDisplay();
}

// Calculate factorial
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

// Calculate
function calculate() {
    try {
        let expr = display;
        const originalExpr = expr;
        
        expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        expr = expr.replace(/π/g, `(${Math.PI})`).replace(/\be\b/g, `(${Math.E})`);
        
        // Handle factorial
        let factorialMatch;
        while ((factorialMatch = expr.match(/(\d+(\.\d+)?|\([^()]+\))!/)) !== null) {
            const num = factorialMatch[1];
            const value = num.includes('(') ? eval(num) : parseFloat(num);
            expr = expr.replace(factorialMatch[0], factorial(Math.floor(value)));
        }
        
        // Handle percentage
        expr = expr.replace(/(\d+\.?\d*)%/g, (match, num) => `(${parseFloat(num)} / 100)`);
        
        // Handle power
        while (expr.includes('^')) {
            expr = expr.replace(/(\d+\.?\d*|\([^()]+\))\^(\d+\.?\d*|\([^()]+\))/g, 'Math.pow($1,$2)');
        }
        
        // Handle trig functions
        const trigFuncs = ['asin', 'acos', 'atan', 'sin', 'cos', 'tan'];
        for (const func of trigFuncs) {
            const isInv = func.startsWith('a');
            let pos = 0;
            while ((pos = expr.indexOf(func + '(', pos)) !== -1) {
                let openCount = 0, start = pos + func.length, end = start;
                for (let i = start; i < expr.length; i++) {
                    if (expr[i] === '(') openCount++;
                    if (expr[i] === ')') {
                        openCount--;
                        if (openCount === 0) {
                            end = i;
                            break;
                        }
                    }
                }
                
                const innerExpr = expr.substring(start + 1, end);
                let replacement;
                if (isDegree) {
                    replacement = isInv 
                        ? `((Math.${func}(${innerExpr}))*(180/Math.PI))`
                        : `Math.${func}((${innerExpr})*(Math.PI/180))`;
                } else {
                    replacement = `Math.${func}(${innerExpr})`;
                }
                
                expr = expr.substring(0, pos) + replacement + expr.substring(end + 1);
                pos += replacement.length;
            }
        }
        
        let result = eval(expr);
        result = Math.abs(result) < 1e-10 ? 0 : Math.round(result * 1e10) / 1e10;
        
        history = [...history, { expression: originalExpr, result }].slice(-50);
        saveHistory();
        
        expression = originalExpr;
        display = result.toString();
        lastResult = result;
        canContinue = true;
        updateDisplay();
    } catch (error) {
        display = 'Error';
        expression = '';
        canContinue = false;
        updateDisplay();
        setTimeout(() => clearAll(), 1500);
    }
}

// Handle keyboard - FUNGSI TUNGGAL (menghapus duplicate)
function handleKeyboard(e) {
    if (e.key >= '0' && e.key <= '9') appendValue(e.key);
    else if (e.key === '+') appendValue('+');
    else if (e.key === '-') appendValue('-');
    else if (e.key === '*') { e.preventDefault(); appendValue('*'); }
    else if (e.key === '/') { e.preventDefault(); appendValue('/'); }
    else if (e.key === '.') appendValue('.');
    else if (e.key === '%') appendValue('%');
    else if (e.key === '(' || e.key === ')') appendValue(e.key);
    else if (e.key === 'Enter') { e.preventDefault(); calculate(); }
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape') clearAll();
    else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        currentSlide--;
        updateSlidePosition();
    }
    else if (e.key === 'ArrowRight' && currentSlide < 1) {
        currentSlide++;
        updateSlidePosition();
    }
    else if (e.key === 't') {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        localStorage.setItem('theme', theme);
    }
    else if (e.key === 'h' || e.key === 'H') {
        showHistory = !showHistory;
        historyModal.classList.toggle('show', showHistory);
        if (showHistory) {
            updateHistoryDisplay();
        }
    }
    else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        clearAllHistory();
    }
}

// Clear all history
function clearAllHistory() {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat?')) {
        history = [];
        saveHistory();
        updateHistoryDisplay();
    }
}

// Update display
function updateDisplay() {
    el.display.value = display;
    el.expression.value = expression || '';
    el.display.scrollLeft = el.display.scrollWidth;
}

// Update slide position
function updateSlidePosition() {
    el.buttonSlides.style.transform = `translateX(-${currentSlide * 100}%)`;
    el.indicator1.classList.toggle('active', currentSlide === 0);
    el.indicator2.classList.toggle('active', currentSlide === 1);
    el.prevSlideBtn.disabled = currentSlide === 0;
    el.nextSlideBtn.disabled = currentSlide === 1;
}

// Theme functions
function setTheme(newTheme) {
    theme = newTheme;
    document.body.classList.toggle('light-theme', theme === 'light');
}

// Wallpaper functions
function setWallpaper(wallpaperData) {
    el.wallpaper.style.backgroundImage = wallpaperData ? `url(${wallpaperData})` : '';
}

function handleWallpaper(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setWallpaper(ev.target.result);
            localStorage.setItem('wallpaper', ev.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// History functions
function loadHistory() {
    const data = {};
    for (let i = 0; i < 50; i++) {
        const item = localStorage.getItem(`calc_history_${i}`);
        if (item) {
            try { data[i] = JSON.parse(item); } catch (e) {}
        }
    }
    history = Object.values(data).filter(item => item && item.expression);
}

function saveHistory() {
    for (let i = 0; i < 50; i++) {
        localStorage.removeItem(`calc_history_${i}`);
    }
    history.slice(-50).forEach((item, i) => {
        localStorage.setItem(`calc_history_${i}`, JSON.stringify(item));
    });
}

function updateHistoryDisplay() {
    el.historyList.innerHTML = '';
    
    if (history.length === 0) {
        el.historyList.innerHTML = '<p class="empty-history">Tidak ada riwayat perhitungan</p>';
        return;
    }
    
    history.slice().reverse().forEach((item, i) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
            <button class="delete-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        historyItem.onclick = (e) => {
            if (e.target.closest('.delete-btn')) return;
            display = item.result.toString();
            expression = item.expression;
            lastResult = item.result;
            canContinue = true;
            el.historyModal.classList.remove('show');
            updateDisplay();
        };
        
        historyItem.querySelector('.delete-btn').onclick = (e) => {
            e.stopPropagation();
            history.splice(history.length - 1 - i, 1);
            saveHistory();
            updateHistoryDisplay();
        };
        
        el.historyList.appendChild(historyItem);
    });
}

// Converter functions
function updateConverterUnits() {
    const type = el.converterType.value;
    el.converterFrom.innerHTML = '';
    el.converterTo.innerHTML = '';
    
    const units = type === 'currency' ? [
        { value: 'USD', label: 'USD (US Dollar)' },
        { value: 'JPY', label: 'JPY (Japanese Yen)' },
        { value: 'IDR', label: 'IDR (Indonesian Rupiah)' }
    ] : [
        { value: 'C', label: '°C (Celsius)' },
        { value: 'F', label: '°F (Fahrenheit)' },
        { value: 'K', label: 'K (Kelvin)' }
    ];
    
    units.forEach(unit => {
        el.converterFrom.add(new Option(unit.label, unit.value));
        el.converterTo.add(new Option(unit.label, unit.value));
    });
    
    if (type === 'currency') {
        el.converterFrom.value = 'USD';
        el.converterTo.value = 'IDR';
    } else {
        el.converterFrom.value = 'C';
        el.converterTo.value = 'F';
    }
    
    performConversion();
}

function performConversion() {
    const value = parseFloat(el.converterInput.value) || 0;
    const type = el.converterType.value;
    const from = el.converterFrom.value;
    const to = el.converterTo.value;
    let result = 0;
    
    if (type === 'currency') {
        const rates = { 'USD': 1, 'JPY': 149.50, 'IDR': 15750 };
        result = (value / rates[from]) * rates[to];
    } else {
        const temp = {
            'C-F': v => v * 9/5 + 32,
            'C-K': v => v + 273.15,
            'F-C': v => (v - 32) * 5/9,
            'F-K': v => (v - 32) * 5/9 + 273.15,
            'K-C': v => v - 273.15,
            'K-F': v => (v - 273.15) * 9/5 + 32
        };
        result = temp[`${from}-${to}`] ? temp[`${from}-${to}`](value) : value;
    }
    
    el.converterResult.textContent = result.toFixed(2);
}

function swapUnits() {
    [el.converterFrom.value, el.converterTo.value] = [el.converterTo.value, el.converterFrom.value];
    performConversion();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
