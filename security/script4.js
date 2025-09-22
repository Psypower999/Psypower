// Function to create the grid of buttons
function createButtonGrid() {
    const grid = document.getElementById('buttonGrid');
    const totalButtons = 100;
    
    // Array to store custom URLs (leave blank as requested)
    const buttonUrls = new Array(totalButtons).fill('');
    
    // You can set custom URLs here by uncommenting and modifying:
    buttonUrls[5] = './security5.html';
    // buttonUrls[1] = 'https://example.com/page2';
    // ... and so on
    
    for (let i = 0; i < totalButtons; i++) {
        // Create link element
        const link = document.createElement('a');
        link.href = buttonUrls[i] || '#'; // Use # for empty URLs
        link.className = 'button-link';
        
        // Create button element
        const button = document.createElement('button');
        button.className = 'grid-button';
        button.textContent = i + 1; // Button numbers from 1 to 100
        
        // Determine color group (each group has 10 buttons)
        const groupNumber = Math.floor(i / 10) + 1;
        button.classList.add(`group-${groupNumber}`);
        
        // Add click event to prevent default if URL is empty
        button.addEventListener('click', function(e) {
            if (!buttonUrls[i]) {
                e.preventDefault();
                console.log('No URL set for button ' + (i + 1));
            }
        });
        
        // Add hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Append button to link, and link to grid
        link.appendChild(button);
        grid.appendChild(link);
    }
}

// Initialize the grid when the page loads
document.addEventListener('DOMContentLoaded', createButtonGrid);

// Optional: Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key >= '1' && e.key <= '9') {
        const buttonNumber = parseInt(e.key);
        if (buttonNumber <= 100) {
            const buttons = document.querySelectorAll('.grid-button');
            buttons[buttonNumber - 1].click();
        }
    }
});