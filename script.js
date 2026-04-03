document.addEventListener('DOMContentLoaded', () => {
    
    // Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach(el => observer.observe(el));

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(252, 252, 252, 0.95)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.03)';
        } else {
            navbar.style.background = 'rgba(252, 252, 252, 0.85)';
            navbar.style.boxShadow = 'none';
        }
    });
});
