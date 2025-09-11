/* AudioContext() calls an audio function which is compatible with all browsers */
/* the symbol * in js targets all elements of the project */


const audioCtx = new AudioContext();
console.log(audioCtx);


const but1 = document.getElementById('but1');
let audio1 = new Audio();
audio1.src = '/media/170bpm.mp3';

but1.addEventListener('click', function(){
    audio1.play();
    audio1.addEventListener('playing', function(){
        console.log('Audio 1 started playing');
    });
    audio1.addEventListener('ended', function(){
        console.log('Audio 1 ended');
    });
});    

/* The code above links a button to a sound that can be played back by clicking the button */

const but2 = document.getElementById('but2');
but2.addEventListener('click', playSound);
function playSound(){
    const oscillator = audioCtx.createOscillator();
    oscillator.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.start();
    setTimeout(function(){
        oscillator.stop();
    }, 1000);
}

const but3 = document.getElementById('but3');
but3.addEventListener('click', playSound);
function playSound(){
    const oscillator2 = audioCtx.createOscillator();
    oscillator2.connect(audioCtx.destination);
    oscillator2.type = 'sawtooth';
    oscillator2.frequency.setValueAtTime(880, AudioContext.currentTime);
    oscillator2.start();
    setTimeout(function(){
        oscillator2.stop();
    }, 1000);
}

const but4 = document.getElementById('but4');
but4.addEventListener('click', playSound);
function playSound(){
    const oscillator3 = audioCtx.createOscillator();
    oscillator3.connect(audioCtx.destination);
    oscillator3.type = 'triangle';
    oscillator3.start();
    setTimeout(function(){
        oscillator3.stop();
    }, 1000);
}

