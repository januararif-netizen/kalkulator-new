// State variables
let display = '0';
let expression = '';
let history = [];
let lastResult = null;
let canContinue = false;
let currentSlide = 0;
let isDegree = true;
let isInverse = false;
let theme = 'dark';

// DOM elements
const displayEl = document.getElementById('display');
const expressionEl = document.getElementById('expression');
const historyListEl = document.getElementById('historyList');
const buttonSlidesEl = document.getElementById('buttonSlides');
const basicButtonsEl = document.getElementById('basicButtons');
const advancedButtonsEl = document.getElementById('advancedButtons');
const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const historyBtn = document.getElementById('historyBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const themeBtn = document.getElementById('themeBtn');
const themeSubmenu = document.getElementById('themeSubmenu');
const darkThemeBtn = document.getElementById('darkThemeBtn');
const lightThemeBtn = document.getElementById('lightThemeBtn');
const wallpaperBtn = document.getElementById('wallpaperBtn');
const removeWallpaperBtn = document.getElementById('removeWallpaperBtn');
const fileInput = document.getElementById('fileInput');
const wallpaperEl = document.getElementById('wallpaper');
const prevSlideBtn = document.getElementById('prevSlideBtn');
const nextSlideBtn = document.getElementById('nextSlideBtn');
const indicator1 = document.getElementById('indicator1');
const indicator2 = document.getElementById('indicator2');
const historyModal = document.getElementById('historyModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const converterModal = document.getElementById('converterModal');
const converterBtn = document.getElementById('converterBtn');
const closeConverterBtn = document.getElementById('closeConverterBtn');
const converterType = document.getElementById('converterType');
const converterInput = document.getElementById('converterInput');
const converterFrom = document.getElementById('converterFrom');
const converterTo = document.getElementById('converterTo');
const converterResult = document.getElementById('converterResult');
const convertBtn = document.getElementById('convertBtn');
const swapBtn = document.getElementById('swapBtn');

// Button configurations
const basicButtons = [
    ['AC', '( )', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '=']
];

const advancedButtons = [
    ['√', 'π', 'x²', 'x³'],
    [isDegree ? 'Deg' : 'Rad', 'sin', 'cos', 'tan'],
    ['Inv', 'e', 'ln', 'log'],
    ['|x|', '!', 'exp', 'mod'],
    ['(', ')', 'x^y', 'rand']
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
    basicButtonsEl.innerHTML = '';
    basicButtons.flat().forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn;
        button.className = 'calc-btn';
        
        if (btn === '=') button.classList.add('equals');
        else if (['÷', '×', '−', '+'].includes(btn)) button.classList.add('operator');
        else if (btn === 'AC') button.classList.add('clear');
        else if (btn === '') button.classList.add('backspace');
        else button.classList.add('number');
        
        button.addEventListener('click', () => handleClick(btn));
        basicButtonsEl.appendChild(button);
    });
    
    advancedButtonsEl.innerHTML = '';
    advancedButtons.flat().forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn;
        button.className = 'calc-btn function';
        
        if (btn === 'Inv' && isInverse) button.style.opacity = '0.5';
        
        button.addEventListener('click', () => handleClick(btn));
        advancedButtonsEl.appendChild(button);
    });
}

// Setup event listeners
function setupEventListeners() {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
        themeSubmenu.classList.remove('show');
    });
    
    dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
    
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeSubmenu.classList.toggle('show');
    });
    
    darkThemeBtn.addEventListener('click', () => {
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
        dropdownMenu.classList.remove('show');
    });
    
    lightThemeBtn.addEventListener('click', () => {
        setTheme('light');
        localStorage.setItem('theme', 'light');
        dropdownMenu.classList.remove('show');
    });
    
    historyBtn.addEventListener('click', () => {
        historyModal.classList.add('show');
        dropdownMenu.classList.remove('show');
        updateHistoryDisplay();
    });
    
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Hapus semua riwayat?')) {
            history = [];
            saveHistory();
            dropdownMenu.classList.remove('show');
        }
    });
    
    wallpaperBtn.addEventListener('click', () => {
        fileInput.click();
        dropdownMenu.classList.remove('show');
    });
    
    removeWallpaperBtn.addEventListener('click', () => {
        setWallpaper('');
        localStorage.removeItem('wallpaper');
        dropdownMenu.classList.remove('show');
    });
    
    fileInput.addEventListener('change', handleWallpaper);
    
    closeModalBtn.addEventListener('click', () => {
        historyModal.classList.remove('show');
    });
    
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.remove('show');
        }
    });
    
    converterBtn.addEventListener('click', () => {
        converterModal.classList.add('show');
        dropdownMenu.classList.remove('show');
    });
    
    closeConverterBtn.addEventListener('click', () => {
        converterModal.classList.remove('show');
    });
    
    converterModal.addEventListener('click', (e) => {
        if (e.target === converterModal) {
            converterModal.classList.remove('show');
        }
    });
    
    converterType.addEventListener('change', updateConverterUnits);
    convertBtn.addEventListener('click', performConversion);
    swapBtn.addEventListener('click', swapUnits);
    converterInput.addEventListener('input', performConversion);
    
    prevSlideBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlidePosition();
        }
    });
    
    nextSlideBtn.addEventListener('click', () => {
        if (currentSlide < 1) {
            currentSlide++;
            updateSlidePosition();
        }
    });
    
    displayEl.addEventListener('click', function() {
        this.focus();
    });
    
    displayEl.addEventListener('focus', function() {
        this.setSelectionRange(this.value.length, this.value.length);
    });
    
    expressionEl.addEventListener('click', function() {
        displayEl.focus();
    });
    
    displayEl.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
            return;
        }
        e.preventDefault();
        handleKeyboard(e);
    });
    
    window.addEventListener('keydown', handleKeyboard);
}

// Handle button clicks
function handleClick(btn) {
    if (btn === 'AC') clearAll();
    else if (btn === '=') calculate();
    else if (btn === '⌫') backspace();
    else if (btn === '( )') handleParentheses();
    else if (['÷', '×', '−', '+', '.', '%'].includes(btn)) {
        if (btn === '÷') appendValue('/');
        else if (btn === '×') appendValue('*');
        else if (btn === '−') appendValue('-');
        else appendValue(btn);
    }
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
    else if (btn === 'x²') appendValue('^2');
    else if (btn === 'x³') appendValue('^3');
    else if (btn === 'x^y') appendValue('^');
    else if (btn === '!') appendValue('!');
    else if (btn === 'π') appendValue('π');
    else if (btn === 'e') appendValue('e');
    else if (btn === 'ln') appendValue('ln(');
    else if (btn === 'log') appendValue('log(');
    else if (btn === '|x|') appendValue('abs(');
    else if (btn === 'exp') appendValue('exp(');
    else if (btn === 'mod') appendValue('mod');
    else if (btn === 'rand') appendValue('rand()');
    else if (btn === '(' || btn === ')') appendValue(btn);
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
    let dispVal = val;
    if (val === '*') dispVal = '×';
    if (val === '/') dispVal = '÷';

    if (canContinue) {
        if (/[+\-×÷]/.test(dispVal)) {
            display = display + dispVal;
            expression = display;
            canContinue = false;
        } else {
            display = dispVal;
            expression = dispVal;
            canContinue = false;
        }
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
    const funcStr = isInverse ? `a${func}(` : `${func}(`;
    appendValue(funcStr);
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
        
        // Handle functions
        expr = expr.replace(/√/g, 'Math.sqrt')
            .replace(/\bln/g, 'Math.log')
            .replace(/\blog/g, 'Math.log10')
            .replace(/\babs/g, 'Math.abs')
            .replace(/\bexp/g, 'Math.exp')
            .replace(/\brand\s*\(\s*\)/g, 'Math.random()')
            .replace(/\bmod\b/g, '%');
        
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
        setTimeout(() => {
            clearAll();
        }, 1500);
    }
}

// Handle keyboard
function handleKeyboard(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        return;
    }
    
    if (e.key >= '0' && e.key <= '9') appendValue(e.key);
    else if (e.key === '+') appendValue('+');
    else if (e.key === '-') appendValue('−');
    else if (e.key === '*') { e.preventDefault(); appendValue('×'); }
    else if (e.key === '/') { e.preventDefault(); appendValue('÷'); }
    else if (e.key === '.') appendValue('.');
    else if (e.key === '%') appendValue('%');
    else if (e.key === '(' || e.key === ')') appendValue(e.key);
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape') clearAll();
}

// Update display
function updateDisplay() {
    displayEl.value = display;
    expressionEl.value = expression || '';
    displayEl.scrollLeft = displayEl.scrollWidth;
}

// Update slide position
function updateSlidePosition() {
    buttonSlidesEl.style.transform = `translateX(-${currentSlide * 100}%)`;
    indicator1.classList.toggle('active', currentSlide === 0);
    indicator2.classList.toggle('active', currentSlide === 1);
    prevSlideBtn.disabled = currentSlide === 0;
    nextSlideBtn.disabled = currentSlide === 1;
}

// Theme functions
function setTheme(newTheme) {
    theme = newTheme;
    document.body.classList.toggle('light-theme', theme === 'light');
}

// Wallpaper functions
function setWallpaper(wallpaperData) {
    wallpaperEl.style.backgroundImage = wallpaperData ? `url(${wallpaperData})` : '';
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
            try {
                data[i] = JSON.parse(item);
            } catch (e) {}
        }
    }
    history = Object.values(data).filter(item => item && item.expression);
}

function saveHistory() {
    for (let i = 0; i < 50; i++) {
        localStorage.removeItem(`calc_history_${i}`);
    }
    history.slice(-50).forEach((item, index) => {
        localStorage.setItem(`calc_history_${index}`, JSON.stringify(item));
    });
}

function updateHistoryDisplay() {
    historyListEl.innerHTML = '';
    
    if (history.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-history';
        emptyMessage.textContent = 'Tidak ada riwayat perhitungan';
        historyListEl.appendChild(emptyMessage);
        return;
    }
    
    history.slice().reverse().forEach((item, i) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const expr = document.createElement('div');
        expr.className = 'history-expression';
        expr.textContent = item.expression;
        
        const result = document.createElement('div');
        result.className = 'history-result';
        result.textContent = '= ' + item.result;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            history = history.filter((_, idx) => idx !== history.length - 1 - i);
            saveHistory();
            updateHistoryDisplay();
        });
        
        historyItem.appendChild(expr);
        historyItem.appendChild(result);
        historyItem.appendChild(deleteBtn);
        
        historyItem.addEventListener('click', () => {
            display = item.result.toString();
            expression = item.expression;
            lastResult = item.result;
            canContinue = true;
            historyModal.classList.remove('show');
            updateDisplay();
        });
        
        historyListEl.appendChild(historyItem);
    });
}

// Converter functions
function updateConverterUnits() {
    const type = converterType.value;
    converterFrom.innerHTML = '';
    converterTo.innerHTML = '';
    
    if (type === 'currency') {
        const currencies = [
            { value: 'USD', label: 'USD (US Dollar)' },
            { value: 'JPY', label: 'JPY (Japanese Yen)' },
            { value: 'IDR', label: 'IDR (Indonesian Rupiah)' }
        ];
        
        currencies.forEach(curr => {
            converterFrom.add(new Option(curr.label, curr.value));
            converterTo.add(new Option(curr.label, curr.value));
        });
        
        converterFrom.value = 'USD';
        converterTo.value = 'IDR';
    } else if (type === 'temperature') {
        const temps = [
            { value: 'C', label: '°C (Celsius)' },
            { value: 'F', label: '°F (Fahrenheit)' },
            { value: 'K', label: 'K (Kelvin)' }
        ];
        
        temps.forEach(temp => {
            converterFrom.add(new Option(temp.label, temp.value));
            converterTo.add(new Option(temp.label, temp.value));
        });
        
        converterFrom.value = 'C';
        converterTo.value = 'F';
    }
    
    performConversion();
}

function performConversion() {
    const value = parseFloat(converterInput.value) || 0;
    const type = converterType.value;
    const from = converterFrom.value;
    const to = converterTo.value;
    let result = 0;
    
    if (type === 'currency') {
        const rates = {
            'USD': 1,
            'JPY': 149.50,
            'IDR': 15750
        };
        
        const inUSD = value / rates[from];
        result = inUSD * rates[to];
    } else if (type === 'temperature') {
        if (from === 'C' && to === 'F') result = (value * 9/5) + 32;
        else if (from === 'C' && to === 'K') result = value + 273.15;
        else if (from === 'F' && to === 'C') result = (value - 32) * 5/9;
        else if (from === 'F' && to === 'K') result = (value - 32) * 5/9 + 273.15;
        else if (from === 'K' && to === 'C') result = value - 273.15;
        else if (from === 'K' && to === 'F') result = (value - 273.15) * 9/5 + 32;
        else result = value;
    }
    
    converterResult.textContent = result.toFixed(2);
}

function swapUnits() {
    const temp = converterFrom.value;
    converterFrom.value = converterTo.value;
    converterTo.value = temp;
    performConversion();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);