const container = document.getElementById("container");
const canvas = document.getElementById("canvas1");
const file = document.getElementById("selfile");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let audioSource;
let analyser;

container.addEventListener('click', function(){
    const audio1 = document.getElementById("audio1");
    audio1.src = '/media/untitled.mp3';
    const audioContext = new AudioContext();
    audio1.play();
    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 5;
    let barHeight;
    let x;

    function animate(){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualiser(bufferLength, x ,barWidth, barHeight, dataArray);
        requestAnimationFrame(animate);    
    }
    animate();
});

file.addEventListener('change', function(){
    const files = this.files;
    const audio1 = document.getElementById("audio1");
    audio1.src = URL.createObjectURL(files[0]);
    audio1.load();
    audio1.play();

    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 521;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = 5;
    let barHeight;
    let x;

    function animate(){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualiser(bufferLength, x ,barWidth, barHeight, dataArray)

        requestAnimationFrame(animate);
    }
    animate();    
});

function drawVisualiser(bufferLength, x ,barWidth, barHeight, dataArray){
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i] * 2;
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(i * Math.PI * 8 / bufferLength);
        const hue = i * 10;
        ctx.fillStyle = 'white';
        ctx.fillRect(canvas.width/1.75 - x, 0, barWidth, 1);
        ctx.fillStyle = 'hsl(' + hue + ', 100%,' + barHeight/5 + '%)';
        ctx.fillRect(canvas.width/2 - x, 0, barWidth * 1.5, barHeight * 1.5);
        x += barWidth;
        ctx.restore()
    }
}
