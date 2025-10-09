
function createButtonGrid() {
    const grid = document.getElementById('buttonGrid');
    const totalButtons = 100;
    

    const buttonUrls = new Array(totalButtons).fill('');
    
    buttonUrls[95] = './security2.html';
    
    for (let i = 0; i < totalButtons; i++) {

        const link = document.createElement('a');
        link.href = buttonUrls[i] || '#';
        link.className = 'button-link';
        

        const button = document.createElement('button');
        button.className = 'grid-button';
        button.textContent = i + 1;
        

        const groupNumber = Math.floor(i / 10) + 1;
        button.classList.add(`group-${groupNumber}`);
        

        button.addEventListener('click', function(e) {
            if (!buttonUrls[i]) {
                e.preventDefault();
                console.log('No URL set for button ' + (i + 1));
            }
        });
        

        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        

        link.appendChild(button);
        grid.appendChild(link);
    }
}

document.addEventListener('DOMContentLoaded', createButtonGrid);


document.addEventListener('keydown', function(e) {
    if (e.key >= '1' && e.key <= '9') {
        const buttonNumber = parseInt(e.key);
        if (buttonNumber <= 100) {
            const buttons = document.querySelectorAll('.grid-button');
            buttons[buttonNumber - 1].click();
        }
    }
});