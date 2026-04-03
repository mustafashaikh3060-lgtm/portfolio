document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Custom Cursor and Magnetic Elements Logic --- */
    const cursor = document.querySelector('.custom-cursor') as HTMLDivElement;
    const cursorFollower = document.querySelector('.custom-cursor-follower') as HTMLDivElement;
    const magnetics = document.querySelectorAll('.magnetic');
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    // Detect if device supports touch
    const isTouchDevice: boolean = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouchDevice && cursor && cursorFollower) {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Fix: offset top/left by subtracting half the width/height to center perfectly
            // Default sizes: cursor is 8x8, follower is 40x40. 
            // In CSS, when active, cursor is 0x0, follower is 60x60.
            // We read computed style width/height for accuracy, or just approximate.
            const cWidth = cursor.offsetWidth / 2;
            const cHeight = cursor.offsetHeight / 2;

            cursor.style.left = (mouseX - cWidth) + 'px';
            cursor.style.top = (mouseY - cHeight) + 'px';
        });

        const renderFollower = () => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            const fWidth = cursorFollower.offsetWidth / 2;
            const fHeight = cursorFollower.offsetHeight / 2;

            // Apply translation offset directly in transform
            cursorFollower.style.transform = `translate(${followerX - fWidth}px, ${followerY - fHeight}px)`;
            requestAnimationFrame(renderFollower);
        };
        requestAnimationFrame(renderFollower);

        // Magnetic hover effect
        magnetics.forEach((btn: any) => {
            btn.addEventListener('mousemove', (e: MouseEvent) => {
                const b = btn as HTMLElement;
                const rect = b.getBoundingClientRect();
                const btnX = rect.left + rect.width / 2;
                const btnY = rect.top + rect.height / 2;
                
                const distX = e.clientX - btnX;
                const distY = e.clientY - btnY;

                b.style.transform = `translate(${distX * 0.25}px, ${distY * 0.25}px)`;
                b.style.transition = `transform 0.1s linear`;
                
                document.body.classList.add('cursor-hover');
            });

            btn.addEventListener('mouseleave', () => {
                const b = btn as HTMLElement;
                b.style.transform = `translate(0px, 0px)`;
                b.style.transition = `transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)`;
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    /* --- 2. 3D Tilt Effect on Hero Image --- */
    const tiltElement = document.querySelector('.tilt-element') as HTMLElement;
    if (!isTouchDevice && tiltElement) {
        document.addEventListener('mousemove', (e) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const pX = (e.clientX - centerX) / centerX;
            const pY = (e.clientY - centerY) / centerY;
            
            tiltElement.style.transform = `perspective(1000px) rotateY(${pX * 8}deg) rotateX(${pY * -8}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        document.addEventListener('mouseleave', () => {
            tiltElement.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
            tiltElement.style.transition = `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)`;
        });
        
        tiltElement.addEventListener('mouseenter', () => {
            tiltElement.style.transition = `none`;
        });
    }


    /* --- 3. Scroll Dynamics & Intersection Observers --- */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-wrapper, .scroll-fade-up');
    revealElements.forEach(el => observer.observe(el));

    /* --- 4. Canvas Snow Effect --- */
    const canvas = document.getElementById('snow-canvas') as HTMLCanvasElement;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initSnowflakes();
        });

        class Snowflake {
            x: number;
            y: number;
            radius: number;
            speedX: number;
            speedY: number;
            opacity: number;
            angle: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.radius = Math.random() * 2 + 0.5; // size variation
                this.speedY = Math.random() * 0.8 + 0.2; // slow fall
                this.speedX = Math.random() * 0.4 - 0.2;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.angle = Math.random() * Math.PI * 2;
            }

            update() {
                this.y += this.speedY;
                // Add a sine wave drift for natural falling effect
                this.angle += 0.01;
                this.x += Math.sin(this.angle) * 0.2 + this.speedX;

                if (this.y > height) {
                    this.y = 0;
                    this.x = Math.random() * width;
                }
                
                if (this.x > width) this.x = 0;
                else if (this.x < 0) this.x = width;
            }

            draw(context: CanvasRenderingContext2D) {
                context.beginPath();
                context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                // "Dirty White"
                context.fillStyle = `rgba(203, 213, 225, ${this.opacity})`;
                context.fill();
                context.closePath();
            }
        }

        let snowflakes: Snowflake[] = [];

        function initSnowflakes() {
            snowflakes = [];
            let maxParticles = window.innerWidth < 768 ? 50 : 150;
            for (let i = 0; i < maxParticles; i++) {
                snowflakes.push(new Snowflake());
            }
        }

        function animateSnow() {
            ctx!.clearRect(0, 0, width, height);
            for (let flake of snowflakes) {
                flake.update();
                flake.draw(ctx!);
            }
            requestAnimationFrame(animateSnow);
        }

        initSnowflakes();
        animateSnow();
    }
});
