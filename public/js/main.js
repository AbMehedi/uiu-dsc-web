// ==========================================
// UIU Data Science Club - Modern JavaScript
// ==========================================

// Mobile menu toggle
function toggleMenu() {
  const nav = document.getElementById('mainNav');
  const menuToggle = document.getElementById('menuToggle');
  if (nav && menuToggle) {
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
  }
}

// Header scroll effect
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
}

// Initialize all scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe fade-in elements
  document.querySelectorAll('.fade-in, .scale-in').forEach(el => {
    observer.observe(el);
  });

  // Observe cards
  document.querySelectorAll('.card, .team-card, .partner-card, .question-card').forEach((el, index) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(el);
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
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
}

// Form validation enhancement
function initFormValidation() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(field => {
        removeError(field);
        
        if (!field.value.trim()) {
          isValid = false;
          showError(field, 'This field is required');
        } else if (field.type === 'email' && !isValidEmail(field.value)) {
          isValid = false;
          showError(field, 'Please enter a valid email');
        }
      });

      if (!isValid) {
        e.preventDefault();
        showToast('Please fill in all required fields correctly', 'error');
      }
    });
    
    // Real-time validation
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => {
        validateField(field);
      });
      
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          validateField(field);
        }
      });
    });
  });
}

function validateField(field) {
  removeError(field);
  
  if (field.required && !field.value.trim()) {
    showError(field, 'This field is required');
    return false;
  }
  
  if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
    showError(field, 'Please enter a valid email');
    return false;
  }
  
  return true;
}

function showError(field, message) {
  field.classList.add('error');
  field.style.borderColor = '#ef4444';
  
  const errorEl = document.createElement('span');
  errorEl.className = 'field-error';
  errorEl.style.cssText = 'color: #ef4444; font-size: 0.85rem; margin-top: 0.25rem; display: block;';
  errorEl.textContent = message;
  
  field.parentNode.appendChild(errorEl);
}

function removeError(field) {
  field.classList.remove('error');
  field.style.borderColor = '';
  
  const errorEl = field.parentNode.querySelector('.field-error');
  if (errorEl) errorEl.remove();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Toast notification
function showToast(message, type = 'success') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '⚠'}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Weather Widget for Dhaka
async function loadWeather() {
  const widget = document.getElementById('weatherWidget');
  if (!widget) return;
  
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
      widget.style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    widget.style.display = 'none';
  }
}

function updateWeatherWidget(data) {
  const widget = document.getElementById('weatherWidget');
  if (!widget) return;

  const temp = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const iconEl = document.getElementById('weatherIcon');
  const tempEl = document.getElementById('weatherTemp');
  const descEl = document.getElementById('weatherDesc');
  
  if (iconEl) {
    iconEl.src = iconUrl;
    iconEl.alt = description;
  }
  if (tempEl) tempEl.textContent = `${temp}°C`;
  if (descEl) descEl.textContent = description;
}

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

// Typed text effect (optional enhancement)
function typeText(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Counter animation for stats
function animateCounters() {
  const counters = document.querySelectorAll('.stat-value');
  
  counters.forEach(counter => {
    const target = parseInt(counter.textContent.replace(/\D/g, ''));
    const suffix = counter.textContent.replace(/[0-9]/g, '');
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const updateCounter = () => {
            current += increment;
            if (current < target) {
              counter.textContent = Math.floor(current) + suffix;
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target + suffix;
            }
          };
          updateCounter();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(counter);
  });
}

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initScrollAnimations();
  initSmoothScroll();
  initFormValidation();
  animateCounters();
  
  // Load weather on home page
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    loadWeather();
    // Refresh weather every 10 minutes
    setInterval(loadWeather, 600000);
  }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const nav = document.getElementById('mainNav');
  const menuToggle = document.getElementById('menuToggle');
  
  if (nav && nav.classList.contains('active')) {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
      nav.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  }
});
