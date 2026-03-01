        // Get email from URL parameter or localStorage
        function getEmailFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('email');
        }

        // Set user email
        function setUserEmail() {
            const emailDisplay = document.getElementById('emailDisplay');
            
            // Try to get email from URL first
            let email = getEmailFromUrl();
            
            // If not in URL, try localStorage
            if (!email) {
                email = localStorage.getItem('userEmail') || 'bhardwajluv123@gmail.com';
            }
            
            if (emailDisplay) {
                emailDisplay.textContent = email;
            }
        }

        // Go to home function
        function goToHome() {
            window.location.href = '/'; // Navigate to home
        }

        // Create confetti
        function createConfetti() {
            const container = document.getElementById('confetti-container');
            const colors = ['#ffb866', '#ff7e5f', '#ffd700', '#ffa07a', '#ffb6c1'];
            
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    
                    // Random properties
                    const size = Math.random() * 15 + 5;
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    const left = Math.random() * 100;
                    const duration = Math.random() * 2 + 2;
                    const delay = Math.random() * 2;
                    
                    confetti.style.width = size + 'px';
                    confetti.style.height = size + 'px';
                    confetti.style.background = color;
                    confetti.style.left = left + '%';
                    confetti.style.animationDuration = duration + 's';
                    confetti.style.animationDelay = delay + 's';
                    confetti.style.opacity = Math.random() * 0.6 + 0.2;
                    
                    // Random shape (circle or square)
                    if (Math.random() > 0.5) {
                        confetti.style.borderRadius = '50%';
                    }
                    
                    container.appendChild(confetti);
                    
                    // Remove confetti after animation
                    setTimeout(() => {
                        confetti.remove();
                    }, (duration + delay) * 1000);
                }, i * 100);
            }
        }

        // Run on page load
        window.onload = function() {
            setUserEmail();
            createConfetti();
            
            // Continue creating confetti periodically
            setInterval(createConfetti, 5000);
        };

        // Handle responsive behavior
        window.addEventListener('resize', function() {
            // Adjust any responsive elements if needed
        });