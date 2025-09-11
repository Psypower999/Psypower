function main(){
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    class Bar {
        constructor(x, y, width, height, color, index){
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.index = index;
        }
        update(micInput){
            const sound = micInput * 1000;
            if (sound > this.height){
                this.height = sound;
            } else {
                this.height -= this.height * 0.05;
            }
            // this.height = micInput * 1000;
            // this.x++;

        }
        draw(context, volume){
        // context.fillStyle = this.color;
        // context.fillRect(this.x, this.y, this.width, this.height);
        context.strokeStyle = this.color;
        context.save();
        context.translate(0, 0);
        context.rotate(this.index * 0.1);
        context.scale(1 + volume * 0.3, 1 + volume * 0.3);
        context.beginPath();
        // context.moveTo(this.x, this.y);
        context.moveTo(0, 0);
        context.lineTo(this.x, this.height);
        context.bezierCurveTo(100, 100, this.height, this.height, this.x, this.y * 4);
        context.stroke();

        context.rotate(this.index * -0.5);
        // context.strokeRect(this.y + this.index * 1.5, this.height, this.height/2, this.height);
        // context.strokeRect(this.x, this.y, this.width, this.height);
        context.strokeStyle = 'black';
        context.beginPath();
        context.arc(this.width, this.height, this.width * this.height, 0 , Math.PI * 8);
        context.stroke();

        context.restore();
        }
    }
    const fftSize = 512;
    const microphone = new Microphone(fftSize);
    let bars = [];
    let barWidth = canvas.width/(fftSize/2);
    function createBars(){
        for (let i = 0; i < (fftSize/2); i++){
            let color = 'hsl(' + i * 2 + ' , 100%, 50%)';
            // bars.push(new Bar(i * barWidth, canvas.height/2, 1, 10, color, i));
            bars.push(new Bar(0, i * 1.2, 4, 10, color, i));
        }
    }
    createBars();
    let angle = 0;

    function animate(){
        if (microphone.initialized){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const samples = microphone.getSamples();
            const volume = microphone.getVolume();
            angle += 0.01 + volume;
            ctx.save();
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(angle);
            bars.forEach(function(bar, i){
            bar.update(samples[i]);
            bar.draw(ctx, volume);
            });
            ctx.restore();
        }
        requestAnimationFrame(animate);   
    }
    animate();
}
