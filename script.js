let memory = 0;
let history = [];
let currentMode = 'basic';
let isFraction = false;
let chart = null;
let historyVisible = false;
let backgroundOverride = false;
let currentTheme = 'dark';

const backgroundImages = {
  sunny: '',
  rainy: '',
  overcast: '',
  default: ''
};

const quotes = [
  {
    text: "The only way to learn mathematics is to do mathematics.",
    author: "Paul Halmos"
  },
  {
    text: "Pure mathematics is, in its way, the poetry of logical ideas.",
    author: "Albert Einstein"
  },
  {
    text: "Mathematics is the music of reason.",
    author: "James Joseph Sylvester"
  },
  {
    text: "In mathematics, the art of proposing a question must be held of higher value than solving it.",
    author: "Georg Cantor"
  },
  {
    text: "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding.",
    author: "William Paul Thurston"
  }
];

function append(value) {
  const display = document.getElementById('display');
  if (display.value === '0' && !isNaN(value)) {
    display.value = value;
  } else {
    display.value += value;
  }
  display.focus();
}

function clearDisplay() {
  document.getElementById('display').value = '0';
}

function del() {
  let display = document.getElementById('display');
  if (display.value.length === 1) {
    display.value = '0';
  } else {
    display.value = display.value.slice(0, -1);
  }
}

function calculate() {
  let display = document.getElementById('display');
  try {
    // Use math.js for more advanced calculations
    const result = math.evaluate(display.value.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'));
    
    if (isNaN(result) || !isFinite(result)) {
      display.value = 'Error 😅';
      return;
    }
    
    const formattedResult = isFraction ? toFraction(result) : formatNumber(result);
    const calculation = `${display.value} = ${formattedResult}`;
    
    history.push(calculation);
    if (history.length > 10) history.shift();
    
    updateHistory();
    display.value = formattedResult;
    
    // Show calculation animation
    showCalculationAnimation(calculation);
  } catch (error) {
    display.value = 'Error 😅';
    console.error('Calculation error:', error);
  }
}

function formatNumber(num) {
  // Format number to show up to 8 decimal places if needed, but remove trailing zeros
  return Number(num.toFixed(8)).toString();
}

function showCalculationAnimation(calculation) {
  const display = document.getElementById('display');
  const originalValue = display.value;
  
  // Temporarily show the full calculation
  display.value = calculation;
  
  // Return to result after 1 second
  setTimeout(() => {
    display.value = originalValue;
  }, 1000);
}

function applyFunction(func) {
  let display = document.getElementById('display');
  try {
    let value = parseFloat(display.value) || 0;
    let result;
    
    switch (func) {
      case 'sin': result = Math.sin(value); break;
      case 'cos': result = Math.cos(value); break;
      case 'tan': result = Math.tan(value); break;
      case 'asin': result = Math.asin(value); break;
      case 'acos': result = Math.acos(value); break;
      case 'atan': result = Math.atan(value); break;
      case 'log': result = Math.log10(value); break;
      case 'ln': result = Math.log(value); break;
      case 'exp': result = Math.exp(value); break;
      case 'pow10': result = Math.pow(10, value); break;
      case 'sqrt': result = Math.sqrt(value); break;
      case 'cbrt': result = Math.cbrt(value); break;
      case 'factorial': result = math.factorial(value); break;
    }
    
    if (isNaN(result) || !isFinite(result)) {
      display.value = 'Error 😅';
      return;
    }
    
    display.value = isFraction ? toFraction(result) : formatNumber(result);
    history.push(`${func}(${value}) = ${display.value}`);
    updateHistory();
  } catch (error) {
    display.value = 'Error 😅';
    console.error('Function error:', error);
  }
}

function memoryOperation(op) {
  let display = document.getElementById('display');
  let value = parseFloat(display.value) || 0;
  
  switch (op) {
    case 'M+': memory += value; break;
    case 'M-': memory -= value; break;
    case 'MR': display.value = memory.toString(); break;
    case 'MC': memory = 0; break;
  }
  
  updateMemoryIndicator();
}

function updateMemoryIndicator() {
  const indicator = document.getElementById('memory-indicator');
  const valueDisplay = document.getElementById('memory-value');
  
  if (memory !== 0) {
    indicator.style.display = 'flex';
    valueDisplay.textContent = formatNumber(memory);
  } else {
    indicator.style.display = 'none';
  }
}

function convert(type, conversion) {
  let display = document.getElementById('display');
  let value = parseFloat(display.value) || 0;
  let result;
  
  switch (conversion) {
    case 'cm-to-inch': result = value * 0.393701; break;
    case 'inch-to-cm': result = value * 2.54; break;
    case 'm-to-ft': result = value * 3.28084; break;
    case 'ft-to-m': result = value * 0.3048; break;
    case 'kg-to-lb': result = value * 2.20462; break;
    case 'lb-to-kg': result = value * 0.453592; break;
    case 'c-to-f': result = (value * 9/5) + 32; break;
    case 'f-to-c': result = (value - 32) * 5/9; break;
    case 'sqm-to-sqft': result = value * 10.7639; break;
    case 'sqft-to-sqm': result = value * 0.092903; break;
    case 'l-to-gal': result = value * 0.264172; break;
    case 'gal-to-l': result = value * 3.78541; break;
  }
  
  display.value = formatNumber(result);
  history.push(`${value} ${conversion.replace('-to-', ' → ')} = ${display.value}`);
  updateHistory();
}

async function convertCurrency(from, to) {
  const loading = document.getElementById('loading');
  loading.style.display = 'flex';
  
  let display = document.getElementById('display');
  let value = parseFloat(display.value) || 0;
  
  try {
    // Note: In a real app, you would use a proper API key
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const rate = response.data.rates[to];
    const result = value * rate;
    
    display.value = formatNumber(result);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    history.push(`${value} ${from} → ${to} = ${display.value} @ ${timestamp}`);
    updateHistory();
  } catch (error) {
    console.error('Currency conversion error:', error);
    display.value = 'API Error 😅';
    
    // Fallback rates (for demo purposes)
    const fallbackRates = {
      'USD-PKR': 280,
      'PKR-USD': 0.00357,
      'USD-EUR': 0.85,
      'EUR-USD': 1.18
    };
    
    const rate = fallbackRates[`${from}-${to}`];
    if (rate) {
      const result = value * rate;
      display.value = formatNumber(result);
      history.push(`${value} ${from} → ${to} ≈ ${display.value} (offline)`);
      updateHistory();
    }
  } finally {
    loading.style.display = 'none';
  }
}

function toggleMode(mode) {
  currentMode = mode;
  
  // Hide all button groups and graph
  document.querySelectorAll('.buttons > div').forEach(div => {
    div.setAttribute('aria-hidden', 'true');
    div.style.display = 'none';
  });
  document.getElementById('graph-container').style.display = 'none';
  
  // Update tab selection
  const activeTab = document.querySelector(`[onclick="toggleMode('${mode}')"]`);
  activeTab.setAttribute('aria-selected', 'true');
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    if (tab !== activeTab) tab.setAttribute('aria-selected', 'false');
  });
  
  // Move tab indicator
  const indicator = document.querySelector('.tab-indicator');
  indicator.style.width = `${activeTab.offsetWidth}px`;
  indicator.style.left = `${activeTab.offsetLeft}px`;
  
  // Show the appropriate buttons or graph
  if (mode === 'basic') {
    document.querySelector('.basic-buttons').style.display = 'grid';
    document.querySelector('.basic-buttons').setAttribute('aria-hidden', 'false');
  } else if (mode === 'scientific') {
    document.querySelector('.scientific-buttons').style.display = 'grid';
    document.querySelector('.scientific-buttons').setAttribute('aria-hidden', 'false');
  } else if (mode === 'converter') {
    document.querySelector('.converter-buttons').style.display = 'grid';
    document.querySelector('.converter-buttons').setAttribute('aria-hidden', 'false');
  } else if (mode === 'graph') {
    document.getElementById('graph-container').style.display = 'block';
    plotGraph();
  }
  
  // Show mode preview animation
  showModePreview(activeTab.dataset.preview);
}

function showModePreview(modeName) {
  const preview = document.getElementById('preview');
  preview.textContent = modeName + ' Mode';
  preview.style.display = 'block';
  preview.classList.add('active');
  
  setTimeout(() => {
    preview.classList.remove('active');
    setTimeout(() => preview.style.display = 'none', 500);
  }, 1500);
}

function toggleTheme(theme) {
  currentTheme = theme;
  document.body.className = theme;
  
  // Update theme toggle buttons
  document.querySelectorAll('[role="radio"]').forEach(btn => {
    btn.setAttribute('aria-checked', 'false');
  });
  document.querySelector(`[onclick="toggleTheme('${theme}')"]`).setAttribute('aria-checked', 'true');
  
  // Update colors based on theme
  if (theme === 'light') {
    document.documentElement.style.setProperty('--primary-bg', '#f5f5f5');
    document.documentElement.style.setProperty('--secondary-bg', '#e0e0e0');
    document.documentElement.style.setProperty('--calculator-bg', 'rgba(255, 255, 255, 0.8)');
    document.documentElement.style.setProperty('--display-bg', 'rgba(50, 50, 50, 0.9)');
    document.documentElement.style.setProperty('--button-bg', 'rgba(240, 240, 240, 0.8)');
    document.documentElement.style.setProperty('--button-hover', 'rgba(220, 220, 220, 0.9)');
    document.documentElement.style.setProperty('--button-active', 'rgba(200, 200, 200, 1)');
    document.documentElement.style.setProperty('--text-color', '#333');
    document.documentElement.style.setProperty('--text-secondary', '#666');
  } else if (theme === 'dark') {
    document.documentElement.style.setProperty('--primary-bg', '#1a1a2e');
    document.documentElement.style.setProperty('--secondary-bg', '#16213e');
    document.documentElement.style.setProperty('--calculator-bg', 'rgba(30, 30, 60, 0.8)');
    document.documentElement.style.setProperty('--display-bg', 'rgba(10, 10, 20, 0.9)');
    document.documentElement.style.setProperty('--button-bg', 'rgba(40, 40, 80, 0.7)');
    document.documentElement.style.setProperty('--button-hover', 'rgba(60, 60, 120, 0.8)');
    document.documentElement.style.setProperty('--button-active', 'rgba(80, 80, 160, 0.9)');
    document.documentElement.style.setProperty('--text-color', '#e6e6e6');
    document.documentElement.style.setProperty('--text-secondary', '#b8b8b8');
  } else if (theme === 'candy') {
    document.documentElement.style.setProperty('--primary-bg', '#ff9ff3');
    document.documentElement.style.setProperty('--secondary-bg', '#feca57');
    document.documentElement.style.setProperty('--calculator-bg', 'rgba(255, 159, 243, 0.8)');
    document.documentElement.style.setProperty('--display-bg', 'rgba(72, 52, 212, 0.9)');
    document.documentElement.style.setProperty('--button-bg', 'rgba(255, 107, 107, 0.7)');
    document.documentElement.style.setProperty('--button-hover', 'rgba(255, 159, 243, 0.8)');
    document.documentElement.style.setProperty('--button-active', 'rgba(254, 202, 87, 0.9)');
    document.documentElement.style.setProperty('--text-color', '#2f3640');
    document.documentElement.style.setProperty('--text-secondary', '#353b48');
    document.documentElement.style.setProperty('--accent-color', '#1dd1a1');
  }
  
  updateBackground();
}

function toggleFraction() {
  isFraction = !isFraction;
  let display = document.getElementById('display');
  let value = parseFloat(display.value) || 0;
  display.value = isFraction ? toFraction(value) : formatNumber(value);
  
  // Show notification
  const notification = document.createElement('div');
  notification.textContent = isFraction ? 'Fraction Mode On' : 'Decimal Mode On';
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '10px 20px';
  notification.style.background = 'rgba(0, 0, 0, 0.8)';
  notification.style.color = 'white';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '1000';
  notification.style.animation = 'fadeInOut 2s forwards';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeInOut 2s forwards reverse';
    setTimeout(() => notification.remove(), 2000);
  }, 1000);
}

function toFraction(value) {
  const tolerance = 1.0E-6;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = value;
  
  do {
    const a = Math.floor(b);
    let aux = h1; h1 = a * h1 + h2; h2 = aux;
    aux = k1; k1 = a * k1 + k2; k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(value - h1 / k1) > value * tolerance);
  
  return k1 === 1 ? h1.toString() : `${h1}/${k1}`;
}

function updateHistory() {
  const historyDiv = document.getElementById('history');
  const historyContent = historyDiv.querySelector('.history-content');
  
  historyContent.innerHTML = history.map((entry, i) => {
    const [calculation, result] = entry.split(' = ');
    return `
      <div onclick="reuseHistory(${i})" tabindex="0">
        <span>${calculation}</span>
        <span class="result">= ${result}</span>
      </div>
    `;
  }).join('');
  
  historyDiv.classList.toggle('hidden', !historyVisible);
  
  // Auto-scroll to bottom
  historyContent.scrollTop = historyContent.scrollHeight;
}

function reuseHistory(index) {
  const display = document.getElementById('display');
  const calculation = history[index].split('=')[0].trim();
  display.value = calculation;
  display.focus();
}

function plotGraph() {
  const ctx = document.getElementById('graph').getContext('2d');
  if (chart) chart.destroy();
  
  let expression = document.getElementById('display').value || 'sin(x)';
  
  // Replace common math functions with Math. prefix
  expression = expression.replace(/(sin|cos|tan|log|ln|sqrt|cbrt|abs|exp|pow)/g, 'Math.$1');
  
  const data = [];
  for (let x = -10; x <= 10; x += 0.1) {
    try {
      const y = math.evaluate(expression.replace(/x/g, `(${x})`));
      if (isFinite(y)) {
        data.push({ x, y });
      }
    } catch (error) {
      console.error('Graph error:', error);
      document.getElementById('display').value = 'Invalid Expression';
      return;
    }
  }
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: expression,
        data: data,
        borderColor: currentTheme === 'dark' ? '#00f5d4' : '#007bff',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          position: 'center',
          grid: {
            color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: currentTheme === 'dark' ? '#e6e6e6' : '#333'
          }
        },
        y: {
          type: 'linear',
          position: 'center',
          grid: {
            color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: currentTheme === 'dark' ? '#e6e6e6' : '#333'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: currentTheme === 'dark' ? '#e6e6e6' : '#333'
          }
        }
      }
    }
  });
}

function toggleHistory() {
  historyVisible = !historyVisible;
  const toggleButton = document.getElementById('toggle-history');
  const historyDiv = document.getElementById('history');
  
  historyDiv.classList.toggle('hidden', !historyVisible);
  toggleButton.setAttribute('aria-expanded', historyVisible.toString());
  toggleButton.innerHTML = historyVisible ? 
    '<i class="fas fa-history button-icon"></i>Hide History' : 
    '<i class="fas fa-history button-icon"></i>History';
  
  updateHistory();
}

function toggleBackgroundOverride() {
  backgroundOverride = !backgroundOverride;
  const overrideBtn = document.getElementById('override-bg');
  overrideBtn.innerHTML = backgroundOverride ? 
    '<i class="fas fa-image button-icon"></i>Reset BG' : 
    '<i class="fas fa-image button-icon"></i>BG';
  
  updateBackground();
}

function updateBackground() {
  const container = document.getElementById('app-container');
  
  if (backgroundOverride) {
    container.style.backgroundImage = `url('${backgroundImages.default}')`;
    return;
  }
  
  const weatherCondition = document.getElementById('weather-condition').textContent.toLowerCase();
  let conditionKey = 'default';
  
  if (weatherCondition.includes('sun')) conditionKey = 'sunny';
  else if (weatherCondition.includes('rain')) conditionKey = 'rainy';
  else if (weatherCondition.includes('cloud')) conditionKey = 'overcast';
  
  container.style.backgroundImage = `url('${backgroundImages[conditionKey]}')`;
}

function updateClock() {
  const now = new Date();
  const timeElement = document.getElementById('clock-time');
  const dateElement = document.getElementById('clock-date');
  
  // Format time (HH:MM:SS)
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  // Format date (Day, Month Date, Year)
  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  timeElement.textContent = time;
  dateElement.textContent = date;
}

function updateWeather() {
  // Simulated weather data - in a real app, you would use a weather API
  const locations = [
    { city: 'Karachi', country: 'PK', temp: 32, condition: 'Sunny', icon: 'fa-sun' },
    { city: 'Lahore', country: 'PK', temp: 29, condition: 'Partly Cloudy', icon: 'fa-cloud-sun' },
    { city: 'Islamabad', country: 'PK', temp: 25, condition: 'Clear', icon: 'fa-moon' },
    { city: 'Peshawar', country: 'PK', temp: 30, condition: 'Hot', icon: 'fa-temperature-high' }
  ];
  
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  
  document.getElementById('weather-location').textContent = `${randomLocation.city}, ${randomLocation.country}`;
  document.getElementById('weather-temp').textContent = `${randomLocation.temp}°C`;
  
  const conditionElement = document.getElementById('weather-condition');
  conditionElement.innerHTML = `<i class="fas ${randomLocation.icon} weather-icon"></i> ${randomLocation.condition}`;
  
  updateBackground();
}

function updateQuote() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('daily-quote').textContent = randomQuote.text;
  document.querySelector('.quote-author').textContent = `— ${randomQuote.author}`;
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  const keyMap = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    '+': '+', '-': '−', '*': '*', '/': '/', '.': '.',
    'Enter': 'calculate()', 'Backspace': 'del()', 'Escape': 'clearDisplay()',
    'ArrowLeft': () => document.querySelectorAll('.mode-toggle button')[0].focus(),
    'ArrowRight': () => document.querySelectorAll('.mode-toggle button')[1].focus(),
    'h': 'toggleHistory()',
    'm': () => {
      const scientificButtons = document.querySelector('.scientific-buttons');
      if (scientificButtons.style.display === 'grid') {
        memoryOperation('MR');
      }
    },
    '(': '(', ')': ')',
    '^': '**',
    'p': 'Math.PI',
    'e': 'Math.E'
  };
  
  if (keyMap[e.key]) {
    e.preventDefault();
    
    if (typeof keyMap[e.key] === 'function') {
      keyMap[e.key]();
    } else if (e.key === 'Enter') {
      calculate();
    } else if (e.key === 'Backspace' || e.key === 'Escape' || e.key === 'h') {
      eval(keyMap[e.key]);
    } else {
      append(keyMap[e.key]);
    }
    
    // Highlight the pressed button
   const buttons = document.querySelectorAll('.buttons button');
buttons.forEach(btn => {
  if (
    (btn.textContent === keyMap[e.key]) ||
    (e.key === 'Enter' && btn.textContent === '=') ||
    (e.key === 'Backspace' && (btn.textContent === '⌫' || btn.querySelector('.fa-backspace')))
  ) {
    btn.classList.add('highlight');
    setTimeout(() => btn.classList.remove('highlight'), 100);
  }
});

  }
});

// Initialize the calculator
document.addEventListener('DOMContentLoaded', () => {
  // Set initial mode and theme
  toggleMode('basic');
  toggleTheme('dark');
  
  // Initialize clock and update every second
  updateClock();
  setInterval(updateClock, 1000);
  
  // Initialize weather and update every 5 minutes (300000ms)
  updateWeather();
  setInterval(updateWeather, 300000);
  
  // Initialize quote and update daily
  updateQuote();
  
  // Set up event listeners for tooltips
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      const tooltip = btn.querySelector('.tooltip');
      if (tooltip) {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateX(-50%) translateY(-5px)';
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      const tooltip = btn.querySelector('.tooltip');
      if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateX(-50%)';
      }
    });
  });
  
  // Focus the display on load
  document.getElementById('display').focus();
});