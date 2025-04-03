// Set current year in footer
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("current-year").textContent = new Date().getFullYear();
  
  // Initialize animations
  initAnimations();
  
  // Show hero elements with animation
  setTimeout(() => {
    document.querySelector(".hero-title").style.opacity = "1";
    document.querySelector(".hero-title").style.transform = "translateY(0)";
    
    setTimeout(() => {
      document.querySelector(".hero-subtitle").style.opacity = "1";
      document.querySelector(".hero-subtitle").style.transform = "translateY(0)";
      
      setTimeout(() => {
        document.querySelector(".hero-btn").style.opacity = "1";
        document.querySelector(".hero-btn").style.transform = "translateY(0)";
      }, 300);
    }, 300);
  }, 500);
  
  // Initialize authentication
  if (typeof initAuth === 'function') {
    initAuth();
  }
  
  // Add event listeners to profile dropdown
  const profileToggle = document.querySelector('.profile-toggle');
  if (profileToggle) {
    profileToggle.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  }
  
  // Add event listener to logout button
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof logoutUser === 'function') {
        logoutUser();
      }
    });
  }
});

// Navbar scroll effect
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;
  if (scrollPosition > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Enhanced parallax effect for hero background
const heroBackground = document.querySelector(".hero-background");
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const parallaxSpeed = 1;
  
  if (heroBackground) {
    heroBackground.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
    
    // Adjust opacity for fade effect
    const opacity = Math.max(1 - scrollY * 0.002, 0);
    heroBackground.style.opacity = opacity;
  }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const startPosition = window.pageYOffset;
      const targetPosition = targetElement.getBoundingClientRect().top + startPosition - 80;
      const distance = targetPosition - startPosition;
      const duration = 1000;
      let start = null;
      
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
        
        window.scrollTo(0, startPosition + distance * easeInOutCubic(Math.min(progress / duration, 1)));
        
        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  });
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    const navLinks = document.querySelector(".nav-links");
    const authLinks = document.querySelector(".auth-links");
    
    // Toggle mobile menu visibility
    if (navLinks) {
      navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
      navLinks.classList.toggle("show");
      
      if (navLinks.classList.contains("show")) {
        // Animate each link individually when opening
        const links = navLinks.querySelectorAll(".nav-link");
        links.forEach((link, index) => {
          setTimeout(() => {
            link.style.opacity = "1";
            link.style.transform = "translateY(0)";
          }, 100 * index);
        });
      } else {
        // Reset animations when closing
        const links = navLinks.querySelectorAll(".nav-link");
        links.forEach((link) => {
          link.style.opacity = "0";
          link.style.transform = "translateY(20px)";
        });
      }
    }
    
    // Toggle auth links visibility
    if (authLinks) {
      authLinks.style.display = authLinks.style.display === "flex" ? "none" : "flex";
      authLinks.classList.toggle("show");
      
      if (authLinks.classList.contains("show")) {
        // Animate each link individually when opening
        const links = authLinks.querySelectorAll(".auth-link");
        links.forEach((link, index) => {
          setTimeout(() => {
            link.style.opacity = "1";
            link.style.transform = "translateY(0)";
          }, 100 * index);
        });
      } else {
        // Reset animations when closing
        const links = authLinks.querySelectorAll(".auth-link");
        links.forEach((link) => {
          link.style.opacity = "0";
          link.style.transform = "translateY(20px)";
        });
      }
    }
  });
}

// Form submission handling with validation
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Basic form validation
    const formInputs = contactForm.querySelectorAll("input, textarea");
    let isValid = true;
    
    formInputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
        input.classList.add("error");
        
        // Shake animation for invalid fields
        input.style.animation = "shake 0.5s ease";
        setTimeout(() => {
          input.style.animation = "";
        }, 500);
      } else {
        input.classList.remove("error");
      }
    });
    
    if (isValid) {
      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <p>Thank you for your message! We will get back to you soon.(This feature is under development)</p>
      `;
      
      // Insert success message after form
      contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
      
      // Hide form with animation
      contactForm.style.opacity = "0";
      contactForm.style.transform = "translateY(-20px)";
      
      // Reset form after animation
      setTimeout(() => {
        contactForm.reset();
        contactForm.style.display = "none";
        
        // Show form again after 5 seconds
        setTimeout(() => {
          successMessage.remove();
          contactForm.style.display = "flex";
          contactForm.style.opacity = "1";
          contactForm.style.transform = "translateY(0)";
        }, 5000);
      }, 500);
    }
  });
  
  // Real-time validation feedback
  contactForm.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("focus", () => {
      input.parentElement.classList.add("focused");
    });
    
    input.addEventListener("blur", () => {
      input.parentElement.classList.remove("focused");
      
      if (!input.value.trim()) {
        input.classList.add("error");
      } else {
        input.classList.remove("error");
      }
    });
    
    input.addEventListener("input", () => {
      if (input.value.trim()) {
        input.classList.remove("error");
      }
    });
  });
}

// Initialize animations with Intersection Observer
function initAnimations() {
  const elements = document.querySelectorAll(
    ".section, .about-content, .services-grid, .service-card, .contact-content"
  );
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );
  
  elements.forEach((element) => {
    element.classList.add("animate-on-scroll");
    observer.observe(element);
  });
  
  // Add animation styles
  const style = document.createElement("style");
  style.textContent = `
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s cubic-bezier(0.215, 0.61, 0.355, 1), 
                  transform 0.8s cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    
    .animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .about-content.animate-on-scroll > div:first-child {
      transform: translateX(-50px);
    }
    
    .about-content.animate-on-scroll > div:last-child {
      transform: translateX(50px);
    }
    
    .about-content.animate-in > div {
      transform: translateX(0);
    }
    
    .service-card.animate-on-scroll {
      transform: translateY(40px) scale(0.95);
    }
    
    .service-card.animate-in {
      transform: translateY(0) scale(1);
    }
    
    .contact-content.animate-on-scroll > div:first-child {
      transform: translateX(-50px);
    }
    
    .contact-content.animate-on-scroll > div:last-child {
      transform: translateX(50px);
    }
    
    .contact-content.animate-in > div {
      transform: translateX(0);
    }
    
    @keyframes float {
      0% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-15px) rotate(5deg);
      }
      100% {
        transform: translateY(0) rotate(0deg);
      }
    }
    
    .circle-1 {
      animation: float 6s ease-in-out infinite;
    }
    
    .circle-2 {
      animation: float 8s ease-in-out infinite reverse;
    }
  `;
  document.head.appendChild(style);
}