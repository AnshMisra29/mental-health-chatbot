/* 
   -------------------------------------------------------------------------
   MAIN APPLICATION SCRIPT
   ------------------------------------------------------------------------- 
*/

document.addEventListener('DOMContentLoaded', () => {

    // 1. DASHBOARD NAVIGATION LOGIC
    // Only run if we are on the dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        const sections = document.querySelectorAll('.content-section');
        const pageTitle = document.getElementById('pageTitle');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('data-section');

                // If it's a real link (not a section switch), let it function normally
                if (!targetId) return;

                e.preventDefault();

                // Update Active Link
                navLinks.forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');

                // Show/Hide Sections
                sections.forEach(section => {
                    section.classList.remove('active');
                    section.style.display = 'none'; // Explicitly hide
                    if (section.id === targetId) {
                        section.classList.add('active');
                        section.style.display = 'block'; // Explicitly show
                        // Update Header Title based on section
                        if (pageTitle) {
                            pageTitle.innerText = targetId.charAt(0).toUpperCase() + targetId.slice(1);
                            if (targetId === 'chat') pageTitle.innerText = 'Quick Chat';
                        }
                    }
                });
            });
        });

        // Initialize Chart if on analysis section (or preload it)
        initChart();
    }

    // 2. CHAT FUNCTIONALITY (Shared between Dashboard & Full Chat Page)
    const chatInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');

    if (chatInput && sendBtn && chatMessages) {

        function addMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message', sender);
            msgDiv.textContent = text;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll to bottom
        }

        function getBotResponse(input) {
            const lowerInput = input.toLowerCase();

            // Simple keyword matching for demo
            if (lowerInput.includes('sad') || lowerInput.includes('depressed') || lowerInput.includes('bad')) {
                return "I'm really sorry to hear that you're feeling this way. Remember, I'm here to listen. Would you like to try a quick breathing exercise or connect with a specialist?";
            } else if (lowerInput.includes('happy') || lowerInput.includes('good') || lowerInput.includes('great')) {
                return "That's fantastic to hear! Focusing on these positive moments is key to mental well-being. What made your day so good?";
            } else if (lowerInput.includes('anapxiety') || lowerInput.includes('anxious') || lowerInput.includes('stress')) {
                return "It sounds like you're under a lot of pressure. Let's take a moment. Take a deep breath in... and out. I've logged this in your alert history for you to track.";
            } else if (lowerInput.includes('doctor') || lowerInput.includes('help')) {
                return "I can help you connect with a professional. You can view our recommended list in the 'Analysis' or 'Find Doctors' section.";
            } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                return "Hello there! How are you feeling right now?";
            } else {
                return "I hear you. Tell me more about that. I'm listening.";
            }
        }

        function handleSend() {
            const text = chatInput.value.trim();
            if (text) {
                addMessage(text, 'user');
                chatInput.value = '';

                // Simulate typing delay
                setTimeout(() => {
                    const response = getBotResponse(text);
                    addMessage(response, 'bot');
                }, 1000);
            }
        }

        sendBtn.addEventListener('click', handleSend);

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
    }

    // 3. CHART.JS INITIALIZATION
    function initChart() {
        const ctx = document.getElementById('moodChart');
        if (ctx) {
            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Mood Score (1-10)',
                        data: [5, 6, 5, 7, 6, 8, 9],
                        borderColor: '#4a90e2',
                        backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        borderWidth: 3,
                        tension: 0.4, // Smooths the curve
                        fill: true,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#4a90e2',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            grid: {
                                borderDash: [5, 5]
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
});
