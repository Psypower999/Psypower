/* AudioContext() calls an audio function which is compatible with all browsers */
/* the symbol * in js targets all elements of the project */


const audioCtx = new AudioContext();
console.log(audioCtx);


const but1 = document.getElementById('but1');
let audio1 = new Audio();
audio1.src = './mykicks/4.wav';

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
};

const but3 = document.getElementById('but3');
let audio2 = new Audio();
audio2.src = './media/one.wav';

but3.addEventListener('click', function(){
    audio2.play();
    audio2.addEventListener('playing', function(){
        console.log('Audio 3 started playing');
    });
    audio2.addEventListener('ended', function(){
        console.log('Audio 3 ended');
    });
}); 

const but4 = document.getElementById('but4');
let audio3 = new Audio();
audio3.src = './mykicks/3.wav';

but4.addEventListener('click', function(){
    audio3.play();
    audio3.addEventListener('playing', function(){
        console.log('Audio 4 started playing');
    });
    audio3.addEventListener('ended', function(){
        console.log('Audio 4 ended');
    });
});    

const but5 = document.getElementById('but5');
let audio4 = new Audio();
audio4.src = './media/two.wav';

but5.addEventListener('click', function(){
    audio4.play();
    audio4.addEventListener('playing', function(){
        console.log('Audio 4 started playing');
    });
    audio4.addEventListener('ended', function(){
        console.log('Audio 4 ended');
    });
});    

const but6 = document.getElementById('but6');
let audio5 = new Audio();
audio5.src = './media/three.wav';

but6.addEventListener('click', function(){
    audio5.play();
    audio5.addEventListener('playing', function(){
        console.log('Audio 5 started playing');
    });
    audio5.addEventListener('ended', function(){
        console.log('Audio 5 ended');
    });
});    

const but7 = document.getElementById('but7');
let audio6 = new Audio();
audio6.src = './media/four.wav';

but7.addEventListener('click', function(){
    audio6.play();
    audio6.addEventListener('playing', function(){
        console.log('Audio 6 started playing');
    });
    audio6.addEventListener('ended', function(){
        console.log('Audio 6 ended');
    });
});    

const but8 = document.getElementById('but8');
let audio7 = new Audio();
audio7.src = './media/five.wav';

but8.addEventListener('click', function(){
    audio7.play();
    audio7.addEventListener('playing', function(){
        console.log('Audio 7 started playing');
    });
    audio7.addEventListener('ended', function(){
        console.log('Audio 7 ended');
    });
});    