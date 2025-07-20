// ===== THEME SWITCHING FUNCTIONALITY =====

// Theme management
export const ThemeManager = {
    // Get current theme from localStorage or default to light
    getCurrentTheme: function() {
        return localStorage.getItem('theme') || 'light';
    },
    
    // Set theme and save to localStorage
    setTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateToggleIcon(theme);
    },
    
    // Update the toggle button icon
    updateToggleIcon: function(theme) {
        const toggleButton = document.getElementById('theme-toggle');
        if (theme === 'dark') {
            toggleButton.textContent = '☀️';
            toggleButton.title = 'Switch to light theme';
        } else {
            toggleButton.textContent = '🌙';
            toggleButton.title = 'Switch to dark theme';
        }
    },
    
    // Toggle between light and dark themes
    toggleTheme: function() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },
    
    // Initialize theme on page load
    init: function() {
        const savedTheme = this.getCurrentTheme();
        this.setTheme(savedTheme);
        
        // Add click event listener to toggle button
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Optional: Auto-detect system preference if no saved theme
        if (!localStorage.getItem('theme')) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.setTheme('dark');
            }
        }
        
        // Optional: Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-change if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
};