// Mobile menu toggle
function toggleMenu() {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.classList.toggle('active');
  }
}

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Form validation enhancement
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = 'var(--error-color)';
        } else {
          field.style.borderColor = 'var(--border-color)';
        }
      });

      if (!isValid) {
        e.preventDefault();
        alert('Please fill in all required fields');
      }
    });
  });

  // Add animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe cards and other elements
  const animatedElements = document.querySelectorAll('.card, .event-card, .team-member, .partner-card');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// Handle window resize for mobile menu
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const nav = document.getElementById('mainNav');
    if (window.innerWidth > 768 && nav) {
      nav.classList.remove('active');
    }
  }, 250);
});

// Weather Widget for Dhaka
async function loadWeather() {
  const API_KEY = 'b8090ef2545baef94323412356b50050';
  const CITY = 'Dhaka';
  const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},BD&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.cod === 200) {
      updateWeatherWidget(data);
    } else {
      console.error('Weather data error:', data.message);
    }
  } catch (error) {
    console.error('Failed to fetch weather:', error);
  }
}

function updateWeatherWidget(data) {
  const widget = document.getElementById('weatherWidget');
  if (!widget) return;

  const temp = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const humidity = data.main.humidity;
  const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
  const icon = getWeatherIcon(data.weather[0].main);

  widget.innerHTML = `
    <div class="city-name">
      📍 ${data.name}
    </div>
    <div class="weather-info">
      <div class="weather-icon">${icon}</div>
      <div class="weather-details">
        <div class="temperature">${temp}°C</div>
        <div class="description">${description}</div>
      </div>
    </div>
    <div class="extra-info">
      <span>💧 ${humidity}%</span>
      <span>💨 ${windSpeed} km/h</span>
    </div>
  `;

  widget.classList.remove('loading');
}

function getWeatherIcon(condition) {
  const icons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌫️',
    'Squall': '💨',
    'Tornado': '🌪️'
  };
  return icons[condition] || '🌤️';
}

// Load weather on page load
if (window.location.pathname === '/') {
  document.addEventListener('DOMContentLoaded', () => {
    loadWeather();
    // Refresh weather every 10 minutes
    setInterval(loadWeather, 600000);
  });
}
