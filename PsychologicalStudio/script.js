document.addEventListener('DOMContentLoaded', function() {
    // Create effects popup first, before any functions that might reference it
    const effectsPopup = document.createElement('div');
    effectsPopup.className = 'effects-popup';
    effectsPopup.style.display = 'none';
    
    // Function to update the viewport height
    function updateViewportHeight() {
        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // For all devices, adjust the container height
        const container = document.querySelector('.container');
        const controls = document.querySelector('.controls');
        const gridContainer = document.querySelector('.grid-container');
        
        if (container && controls && gridContainer) {
            // Reset container dimensions first
            container.style.width = '';
            container.style.height = '';
            gridContainer.style.width = '';
            gridContainer.style.height = '';
            
            // For desktop
            if (window.innerWidth > 768) {
                // Desktop layout: controls on the left, grid on the right
                container.style.width = '100%';
                container.style.height = '100vh';
                controls.style.width = '300px';
                controls.style.height = '100%';
                gridContainer.style.width = 'calc(100% - 300px)';
                gridContainer.style.height = '100%';
                
                // Reset to original control structure for desktop
                resetControlStructure();
            } 
            // For mobile
            else {
                // Mobile layout: controls on top, grid below
                container.style.width = '100%';
                container.style.height = '100vh';
                
                // Adjust for browser UI
                let availableHeight = window.innerHeight;
                if (window.orientation === 90 || window.orientation === -90) {
                    // Landscape mode
                    availableHeight -= 30;
                } else {
                    // Portrait mode
                    availableHeight -= 40;
                }
                
                // Set container height
                container.style.height = `${availableHeight}px`;
                
                // Let CSS flexbox handle the rest
                controls.style.width = '';
                controls.style.height = '';
                gridContainer.style.width = '';
                gridContainer.style.height = '';
                
                // Organize controls for mobile portrait mode
                organizeMobileControls();
            }
            
            // Ensure grid container is visible
            gridContainer.style.display = 'flex';
            gridContainer.style.visibility = 'visible';
        }
        
        // Update grid size to maintain square aspect ratio
        updateGridSize();
    }

    // Function to organize controls for mobile portrait mode
    function organizeMobileControls() {
        const controls = document.querySelector('.controls');
        
        // Check if we already have the organized structure
        if (controls.querySelector('.left-controls')) {
            return;
        }
        
        // Create left and right control containers
        const leftControls = document.createElement('div');
        leftControls.className = 'left-controls';
        
        const rightControls = document.createElement('div');
        rightControls.className = 'right-controls';
        
        // Get all control elements
        const playButton = document.getElementById('playButton');
        const tempoControl = document.querySelector('.tempo-control');
        const highTempoControl = document.querySelector('.high-tempo-control');
        const longLoopTempoControl = document.querySelector('.long-loop-tempo-control');
        const loopControls = document.querySelector('.loop-controls');
        const longLoopControls = document.querySelector('.long-loop-controls');
        const volumeControls = document.querySelector('.volume-controls');
        
        // Move play button and tempo controls to left container
        if (playButton) leftControls.appendChild(playButton);
        if (tempoControl) leftControls.appendChild(tempoControl);
        if (highTempoControl) leftControls.appendChild(highTempoControl);
        if (longLoopTempoControl) leftControls.appendChild(longLoopTempoControl);
        
        // Move loop controls and volume controls to right container
        if (loopControls) rightControls.appendChild(loopControls);
        if (longLoopControls) rightControls.appendChild(longLoopControls);
        if (volumeControls) rightControls.appendChild(volumeControls);
        
        // Clear controls container and add new structure
        while (controls.firstChild) {
            controls.removeChild(controls.firstChild);
        }
        
        controls.appendChild(leftControls);
        controls.appendChild(rightControls);
    }
    
    // Function to reset control structure for desktop
    function resetControlStructure() {
        const controls = document.querySelector('.controls');
        
        // Check if we have the mobile structure
        if (!controls.querySelector('.left-controls')) {
            return;
        }
        
        // Get all control elements from left and right containers
        const leftControls = controls.querySelector('.left-controls');
        const rightControls = controls.querySelector('.right-controls');
        
        const playButton = leftControls.querySelector('#playButton');
        const tempoControl = leftControls.querySelector('.tempo-control');
        const highTempoControl = leftControls.querySelector('.high-tempo-control');
        const longLoopTempoControl = leftControls.querySelector('.long-loop-tempo-control');
        const loopControls = rightControls.querySelector('.loop-controls');
        const longLoopControls = rightControls.querySelector('.long-loop-controls');
        const volumeControls = rightControls.querySelector('.volume-controls');
        
        // Clear controls container
        while (controls.firstChild) {
            controls.removeChild(controls.firstChild);
        }
        
        // Add controls back in original order
        if (playButton) controls.appendChild(playButton);
        if (tempoControl) controls.appendChild(tempoControl);
        if (highTempoControl) controls.appendChild(highTempoControl);
        if (longLoopTempoControl) controls.appendChild(longLoopTempoControl);
        if (loopControls) controls.appendChild(loopControls);
        if (longLoopControls) controls.appendChild(longLoopControls);
        if (volumeControls) controls.appendChild(volumeControls);
    }

    // Function to update grid size to maintain square aspect ratio
    function updateGridSize() {
        const buttonGrid = document.getElementById('buttonGrid');
        const gridContainer = document.querySelector('.grid-container');
        
        if (!buttonGrid || !gridContainer) return;
        
        // Get container dimensions
        const containerWidth = gridContainer.offsetWidth;
        const containerHeight = gridContainer.offsetHeight;
        
        // Calculate the maximum possible square size that fits in the container
        let maxSize;
        
        // Special handling for very small screens like Apple Watch
        if (window.innerWidth <= 400 && window.innerHeight <= 500) {
            // For extremely small screens like Apple Watch
            maxSize = Math.min(containerWidth, containerHeight);
            
            // Ensure minimum size for usability on tiny screens
            if (maxSize < 150) {
                maxSize = 150;
            }
        } 
        // For mobile devices
        else if (window.innerWidth <= 768) {
            // For mobile, use the smaller dimension with some padding
            maxSize = Math.min(containerWidth, containerHeight) * 0.95;
            
            // Ensure minimum size for usability
            if (maxSize < 200) {
                maxSize = 200;
            }
        } 
        // For desktop
        else {
            // Use the smaller dimension with some padding
            maxSize = Math.min(containerWidth, containerHeight);
            
            // Ensure minimum size for usability
            if (maxSize < 200) {
                maxSize = 200;
            }
            
            // Ensure maximum size for consistency
            if (maxSize > 700) {
                maxSize = 700;
            }
        }
        
        // Set grid dimensions
        buttonGrid.style.width = `${maxSize}px`;
        buttonGrid.style.height = `${maxSize}px`;
        
        // Force a reflow to ensure the dimensions are applied
        buttonGrid.getBoundingClientRect();
        
        // Update effects popup size to match grid
        if (effectsPopup) {
            effectsPopup.style.width = `${maxSize}px`;
            effectsPopup.style.height = `${maxSize}px`;
        }
    }

    // Initialize the viewport height
    updateViewportHeight();

    // Update on resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            updateViewportHeight();
        }, 100);
    });

    // Update on orientation change
    window.addEventListener('orientationchange', function() {
        // Wait for the orientation change to complete and UI to adjust
        setTimeout(function() {
            updateViewportHeight();
        }, 300);
    });
    
    // Check if required elements exist
    const buttonGrid = document.getElementById('buttonGrid');
    const tempoSlider = document.getElementById('tempo');
    const tempoDisplay = document.getElementById('tempoDisplay');
    const playButton = document.getElementById('playButton');
    const gridContainer = document.querySelector('.grid-container');
    
    // Log any missing elements
    if (!buttonGrid) console.error('buttonGrid element not found');
    if (!tempoSlider) console.error('tempoSlider element not found');
    if (!tempoDisplay) console.error('tempoDisplay element not found');
    if (!playButton) console.error('playButton element not found');
    if (!gridContainer) console.error('gridContainer element not found');
    
    // Only proceed if all required elements exist
    if (!buttonGrid || !tempoSlider || !tempoDisplay || !playButton || !gridContainer) {
        console.error('One or more required elements are missing');
        return;
    }
    
    // Ensure grid container is visible
    gridContainer.style.display = 'flex';
    gridContainer.style.visibility = 'visible';
    
    // Audio context and timing variables
    let audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.error('Web Audio API is not supported in this browser');
        return;
    }
    
    let isPlaying = false;
    let tempo = 120;
    let highTempo = 0; // Additional tempo value from the second slider
    let longLoopTempo = 120; // Separate tempo for long loops
    let beatDuration = 60 / tempo;
    let barDuration = beatDuration * 4;
    let nextBarTime = 0;
    let lookahead = 25.0;
    let scheduleAheadTime = 0.1;
    let timerId = null;
    
    // Master clock variables for synchronization
    let masterStartTime = 0; // When the master clock started (audio context time)
    let masterCurrentBar = 0; // Current bar in the master timeline
    let masterTempo = tempo; // Current tempo of the master clock
    let tempoChangeTime = 0; // When the last tempo change happened
    let tempoHistory = []; // History of tempo changes for accurate timing
    
    // Separate bar grids for drum samples and long samples
    let drumBarGrid = {
        startTime: 0,    // Audio context time when the current bar started
        duration: barDuration, // Duration of the current bar in seconds
        nextStartTime: barDuration // Audio context time when the next bar starts
    };
    
    let longSampleBarGrid = {
        startTime: 0,    // Audio context time when the current bar started
        duration: (60 / longLoopTempo) * 4, // Duration of the current bar in seconds
        nextStartTime: (60 / longLoopTempo) * 4 // Audio context time when the next bar starts
    };
    
    // Default loop length (in bars)
    let loopLength = 1;
    
    // Default long sample loop length (in bars)
    let longLoopLength = 1;
    
    // Object to track currently playing audio for each button (1-100)
    const currentPlaying = {};
    
    // Set up the effects popup content with professional EQ
    effectsPopup.innerHTML = `
        <div class="popup-header">
            <h3>Effects for Sample <span id="popup-sample-number">1</span></h3>
            <button class="popup-close-btn">Close</button>
        </div>
        <div class="popup-content">
            <div class="effect-section">
                <h4>Sample</h4>
                <div class="sample-upload">
                    <label for="sample-upload">Upload Custom Sample:</label>
                    <input type="file" id="sample-upload" accept="audio/*">
                    <div class="upload-status"></div>
                </div>
            </div>
            <div class="effect-section">
                <h4>Delay</h4>
                <div class="slider-container">
                    <label>Time (ms)</label>
                    <input type="range" id="delay-time" min="0" max="1000" value="0" step="10">
                    <span id="delay-time-value">0</span>
                </div>
                <div class="slider-container">
                    <label>Feedback (%)</label>
                    <input type="range" id="delay-feedback" min="0" max="100" value="0" step="1">
                    <span id="delay-feedback-value">0</span>
                </div>
            </div>
            <div class="effect-section">
                <h4>Reverb</h4>
                <div class="slider-container">
                    <label>Decay (s)</label>
                    <input type="range" id="reverb-decay" min="0.1" max="5" value="0" step="0.1">
                    <span id="reverb-decay-value">0</span>
                </div>
                <div class="slider-container">
                    <label>Wet/Dry (%)</label>
                    <input type="range" id="reverb-mix" min="0" max="100" value="0" step="1">
                    <span id="reverb-mix-value">0</span>
                </div>
            </div>
            <div class="effect-section">
                <h4>Equalizer</h4>
                <div class="professional-eq-container">
                    <div class="eq-controls">
                        <div class="eq-instructions">
                            <p>Drag points to adjust frequency (left/right) and gain (up/down)</p>
                        </div>
                    </div>
                    <div class="visual-eq-container">
                        <canvas class="eq-canvas" id="eq-canvas"></canvas>
                        <div class="eq-frequency-labels">
                            <span>20Hz</span>
                            <span>100Hz</span>
                            <span>1kHz</span>
                            <span>10kHz</span>
                            <span>20kHz</span>
                        </div>
                        <div class="eq-gain-labels">
                            <span>+24dB</span>
                            <span>+12dB</span>
                            <span>0dB</span>
                            <span>-12dB</span>
                            <span>-24dB</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="popup-footer">
            <button class="popup-reset-btn">Reset All to 0</button>
            <button class="popup-accept-btn">Accept</button>
        </div>
    `;
    
    document.body.appendChild(effectsPopup);
    
    // Variables to track popup state
    let currentSampleForPopup = null;
    let longPressTimer = null;
    let isLongPress = false;
    
    // Visual EQ variables
    let eqCanvas = null;
    let eqCtx = null;
    let eqBands = [
        { frequency: 60, gain: 0, q: 0.7, type: 'lowshelf' },      // Low
        { frequency: 230, gain: 0, q: 1.0, type: 'peaking' },     // Low-Mid
        { frequency: 1000, gain: 0, q: 1.0, type: 'peaking' },    // Mid
        { frequency: 3500, gain: 0, q: 1.0, type: 'peaking' },    // High-Mid
        { frequency: 10000, gain: 0, q: 0.7, type: 'highshelf' }  // High
    ];
    let isDraggingEqBand = false;
    let draggedBandIndex = -1;
    
    // Original settings for revert functionality
    let originalSettings = null;
    
    // Waveform visualization variables
    let waveformAnalyzer = null;
    let waveformAnimationId = null;
    let waveformHistory = [];
    const waveformHistorySize = 100;
    
    // Function to initialize the visual EQ
    function initVisualEQ() {
        eqCanvas = document.getElementById('eq-canvas');
        eqCtx = eqCanvas.getContext('2d');
        
        // Set canvas size
        const container = eqCanvas.parentElement;
        eqCanvas.width = container.clientWidth;
        eqCanvas.height = container.clientHeight;
        
        // Draw initial EQ curve
        drawEQVisual();
        
        // Add event listeners for interaction
        eqCanvas.addEventListener('mousedown', startDraggingEQBand);
        eqCanvas.addEventListener('mousemove', dragEQBand);
        eqCanvas.addEventListener('mouseup', stopDraggingEQBand);
        eqCanvas.addEventListener('mouseleave', stopDraggingEQBand);
        
        // Touch events for mobile
        eqCanvas.addEventListener('touchstart', handleEQTouchStart);
        eqCanvas.addEventListener('touchmove', handleEQTouchMove);
        eqCanvas.addEventListener('touchend', stopDraggingEQBand);
        
        // Initialize waveform visualization
        initWaveformVisualization();
    }
    
    // Function to initialize waveform visualization
    function initWaveformVisualization() {
        if (!currentSampleForPopup || !currentPlaying[currentSampleForPopup].isScheduled) {
            return;
        }
        
        // Create analyzer node if it doesn't exist
        if (!waveformAnalyzer) {
            waveformAnalyzer = audioContext.createAnalyser();
            waveformAnalyzer.fftSize = 4096; // Increased for better resolution
            waveformAnalyzer.smoothingTimeConstant = 0.7; // Slightly reduced for more responsiveness
            
            // Connect the analyzer to the sample's output
            const sample = currentPlaying[currentSampleForPopup];
            
            // We need to insert the analyzer in the existing signal chain, not create a parallel path
            // First, disconnect the existing connection to the destination
            if (sample.eqHighNode) {
                sample.eqHighNode.disconnect();
                // Connect through the analyzer and then to destination
                sample.eqHighNode.connect(waveformAnalyzer);
                waveformAnalyzer.connect(audioContext.destination);
            } else if (sample.outputNode) {
                sample.outputNode.disconnect();
                // Connect through the analyzer and then to destination
                sample.outputNode.connect(waveformAnalyzer);
                waveformAnalyzer.connect(audioContext.destination);
            } else if (sample.gainNode) {
                // This is a fallback if effects aren't initialized yet
                sample.gainNode.disconnect();
                sample.gainNode.connect(waveformAnalyzer);
                waveformAnalyzer.connect(audioContext.destination);
            }
        }
        
        // Start waveform animation
        startWaveformAnimation();
    }
    
    // Function to start waveform animation
    function startWaveformAnimation() {
        if (waveformAnimationId) {
            cancelAnimationFrame(waveformAnimationId);
        }
        
        const bufferLength = waveformAnalyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        function animate() {
            waveformAnimationId = requestAnimationFrame(animate);
            
            // Get frequency data
            waveformAnalyzer.getByteFrequencyData(dataArray);
            
            // Add current data to history
            waveformHistory.push([...dataArray]);
            if (waveformHistory.length > waveformHistorySize) {
                waveformHistory.shift();
            }
            
            // Draw the EQ visual with waveform
            drawEQVisual();
        }
        
        animate();
    }
    
    // Function to stop waveform animation
    function stopWaveformAnimation() {
        if (waveformAnimationId) {
            cancelAnimationFrame(waveformAnimationId);
            waveformAnimationId = null;
        }
        
        // Clear waveform history
        waveformHistory = [];
        
        // Draw the EQ visual without waveform
        drawEQVisual();
    }
    
    // Function to draw the EQ visual with waveform
    function drawEQVisual() {
        const width = eqCanvas.width;
        const height = eqCanvas.height;
        const padding = 20;
        
        // Clear canvas with a darker background
        eqCtx.fillStyle = '#0a0a0f';
        eqCtx.fillRect(0, 0, width, height);
        
        // Draw subtle grid lines
        eqCtx.strokeStyle = '#1a1a2e';
        eqCtx.lineWidth = 1;
        
        // Horizontal lines (gain)
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i * (height - 2 * padding) / 4);
            eqCtx.beginPath();
            eqCtx.moveTo(padding, y);
            eqCtx.lineTo(width - padding, y);
            eqCtx.stroke();
        }
        
        // Vertical lines (frequency)
        for (let i = 0; i <= 4; i++) {
            const x = padding + (i * (width - 2 * padding) / 4);
            eqCtx.beginPath();
            eqCtx.moveTo(x, padding);
            eqCtx.lineTo(x, height - padding);
            eqCtx.stroke();
        }
        
        // Draw 0dB line with more visibility
        eqCtx.strokeStyle = '#333';
        eqCtx.lineWidth = 1;
        eqCtx.setLineDash([5, 3]);
        const zeroDbY = height / 2;
        eqCtx.beginPath();
        eqCtx.moveTo(padding, zeroDbY);
        eqCtx.lineTo(width - padding, zeroDbY);
        eqCtx.stroke();
        eqCtx.setLineDash([]);
        
        // Draw waveform if available
        if (waveformHistory.length > 0) {
            drawWaveform();
        }
        
        // Draw EQ curve with enhanced visibility
        drawEQCurve();
    }
    
    // Function to draw the waveform
    function drawWaveform() {
        const width = eqCanvas.width;
        const height = eqCanvas.height;
        const padding = 20;
        
        // Create a vibrant gradient for the waveform
        const gradient = eqCtx.createLinearGradient(0, height - padding, 0, padding);
        gradient.addColorStop(0, 'rgba(0, 255, 170, 0.9)'); // Bright cyan-green
        gradient.addColorStop(0.3, 'rgba(0, 200, 255, 0.95)'); // Bright blue
        gradient.addColorStop(0.6, 'rgba(128, 0, 255, 0.9)'); // Bright purple
        gradient.addColorStop(1, 'rgba(255, 0, 170, 0.85)'); // Bright pink
        
        // Calculate the width of each time slice
        const sliceWidth = (width - 2 * padding) / waveformHistorySize;
        
        // Draw the waveform history with enhanced visibility
        for (let h = 0; h < waveformHistory.length; h++) {
            const dataArray = waveformHistory[h];
            const x = padding + h * sliceWidth;
            
            // Calculate the alpha based on position in history (newer = more opaque)
            const alpha = 0.4 + (h / waveformHistory.length) * 0.6; // Increased base alpha
            eqCtx.globalAlpha = alpha;
            
            // Begin a new path for this time slice
            eqCtx.beginPath();
            eqCtx.moveTo(x, height - padding);
            
            // Draw the frequency spectrum for this time slice
            for (let i = 0; i < dataArray.length; i++) {
                // Convert frequency to x position (logarithmic scale)
                const freq = i * audioContext.sampleRate / (dataArray.length * 2);
                const freqX = padding + (Math.log10(freq / 20) / Math.log10(20000 / 20)) * (width - 2 * padding);
                
                // Only draw if within the visible range
                if (freqX >= x && freqX <= x + sliceWidth) {
                    // Convert amplitude to y position with enhanced scaling
                    const amplitude = dataArray[i] / 255;
                    
                    // Apply exponential scaling to make lower amplitudes more visible
                    const enhancedAmplitude = Math.pow(amplitude, 0.5);
                    const ampY = height - padding - (enhancedAmplitude * (height - 2 * padding));
                    
                    // Draw a line to this point
                    eqCtx.lineTo(freqX, ampY);
                }
            }
            
            // Close the path and fill
            eqCtx.lineTo(x + sliceWidth, height - padding);
            eqCtx.closePath();
            eqCtx.fill();
            
            // Add glow effect for newer waveforms
            if (h > waveformHistory.length * 0.7) {
                eqCtx.shadowColor = 'rgba(0, 255, 170, 0.8)';
                eqCtx.shadowBlur = 10;
                eqCtx.fill();
                eqCtx.shadowBlur = 0; // Reset shadow
            }
        }
        
        // Reset global alpha
        eqCtx.globalAlpha = 1;
        
        // Add a bright line at the top of the waveform for the most recent data
        if (waveformHistory.length > 0) {
            const latestData = waveformHistory[waveformHistory.length - 1];
            eqCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            eqCtx.lineWidth = 2;
            eqCtx.beginPath();
            
            for (let i = 0; i < latestData.length; i++) {
                // Convert frequency to x position (logarithmic scale)
                const freq = i * audioContext.sampleRate / (latestData.length * 2);
                const x = padding + (Math.log10(freq / 20) / Math.log10(20000 / 20)) * (width - 2 * padding);
                
                // Convert amplitude to y position with enhanced scaling
                const amplitude = latestData[i] / 255;
                const enhancedAmplitude = Math.pow(amplitude, 0.5);
                const y = height - padding - (enhancedAmplitude * (height - 2 * padding));
                
                if (i === 0) {
                    eqCtx.moveTo(x, y);
                } else {
                    eqCtx.lineTo(x, y);
                }
            }
            
            eqCtx.stroke();
        }
    }
    
    // Function to draw the EQ curve
    function drawEQCurve() {
        const width = eqCanvas.width;
        const height = eqCanvas.height;
        const padding = 20;
        
        // Draw EQ curve with enhanced visibility
        eqCtx.strokeStyle = '#4CAF50';
        eqCtx.lineWidth = 4;
        eqCtx.shadowColor = 'rgba(76, 175, 80, 0.8)';
        eqCtx.shadowBlur = 8;
        eqCtx.beginPath();
        
        // Calculate curve points
        const points = [];
        const numPoints = 200;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = padding + (i * (width - 2 * padding) / numPoints);
            
            // Convert x position to frequency (logarithmic scale)
            const freq = 20 * Math.pow(20000 / 20, (x - padding) / (width - 2 * padding));
            
            // Calculate gain at this frequency based on all EQ bands
            let gain = 0;
            
            for (const band of eqBands) {
                if (band.type === 'lowshelf') {
                    // Low shelf filter
                    if (freq < band.frequency) {
                        gain += band.gain;
                    } else {
                        // Transition region
                        const transitionFactor = Math.log10(freq / band.frequency) / 2;
                        gain += band.gain * (1 - Math.min(1, Math.max(0, transitionFactor)));
                    }
                } else if (band.type === 'highshelf') {
                    // High shelf filter
                    if (freq > band.frequency) {
                        gain += band.gain;
                    } else {
                        // Transition region
                        const transitionFactor = Math.log10(band.frequency / freq) / 2;
                        gain += band.gain * (1 - Math.min(1, Math.max(0, transitionFactor)));
                    }
                } else if (band.type === 'peaking') {
                    // Peaking filter
                    const freqRatio = freq / band.frequency;
                    const gainFactor = 1 / (1 + Math.pow(freqRatio - 1/freqRatio, 2) / Math.pow(band.q, 2));
                    gain += band.gain * gainFactor;
                }
            }
            
            // Convert gain to y position
            const y = height / 2 - (gain / 24) * (height / 2 - padding);
            
            points.push({ x, y });
            
            if (i === 0) {
                eqCtx.moveTo(x, y);
            } else {
                eqCtx.lineTo(x, y);
            }
        }
        
        eqCtx.stroke();
        eqCtx.shadowBlur = 0; // Reset shadow
        
        // Draw EQ band control points with enhanced visibility
        for (let i = 0; i < eqBands.length; i++) {
            const band = eqBands[i];
            
            // Convert frequency to x position (logarithmic scale)
            const x = padding + (Math.log10(band.frequency / 20) / Math.log10(20000 / 20)) * (width - 2 * padding);
            
            // Convert gain to y position
            const y = height / 2 - (band.gain / 24) * (height / 2 - padding);
            
            // Draw control point with glow
            eqCtx.fillStyle = i === draggedBandIndex ? '#FF5722' : '#4CAF50';
            eqCtx.shadowColor = i === draggedBandIndex ? 'rgba(255, 87, 34, 0.8)' : 'rgba(76, 175, 80, 0.8)';
            eqCtx.shadowBlur = 15;
            eqCtx.beginPath();
            eqCtx.arc(x, y, 12, 0, Math.PI * 2);
            eqCtx.fill();
            
            // Draw white center
            eqCtx.fillStyle = '#fff';
            eqCtx.shadowBlur = 0;
            eqCtx.beginPath();
            eqCtx.arc(x, y, 8, 0, Math.PI * 2);
            eqCtx.fill();
            
            // Draw frequency label with background for better visibility
            eqCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            eqCtx.fillRect(x - 25, y + 20, 50, 15);
            eqCtx.fillStyle = '#fff';
            eqCtx.font = 'bold 10px Arial';
            eqCtx.textAlign = 'center';
            eqCtx.fillText(band.frequency < 1000 ? `${band.frequency}Hz` : `${band.frequency/1000}k`, x, y + 30);
            
            // Draw gain label
            eqCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            eqCtx.fillRect(x - 25, y - 35, 50, 15);
            eqCtx.fillStyle = '#fff';
            eqCtx.fillText(`${band.gain > 0 ? '+' : ''}${band.gain.toFixed(1)}dB`, x, y - 25);
        }
    }
    
    // Function to start dragging an EQ band
    function startDraggingEQBand(e) {
        const rect = eqCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if we're clicking on a control point
        for (let i = 0; i < eqBands.length; i++) {
            const band = eqBands[i];
            
            // Convert frequency to x position (logarithmic scale)
            const bandX = 20 + (Math.log10(band.frequency / 20) / Math.log10(20000 / 20)) * (eqCanvas.width - 40);
            
            // Convert gain to y position
            const bandY = eqCanvas.height / 2 - (band.gain / 24) * (eqCanvas.height / 2 - 20);
            
            // Check if click is within control point
            const distance = Math.sqrt(Math.pow(x - bandX, 2) + Math.pow(y - bandY, 2));
            if (distance <= 12) {
                isDraggingEqBand = true;
                draggedBandIndex = i;
                break;
            }
        }
    }
    
    // Function to handle EQ touch start
    function handleEQTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        eqCanvas.dispatchEvent(mouseEvent);
    }
    
    // Function to handle EQ touch move
    function handleEQTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        eqCanvas.dispatchEvent(mouseEvent);
    }
    
    // Function to drag an EQ band
    function dragEQBand(e) {
        if (!isDraggingEqBand || draggedBandIndex === -1) return;
        
        const rect = eqCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate gain from y position
        const gain = -(y - eqCanvas.height / 2) / (eqCanvas.height / 2 - 20) * 24;
        
        // Clamp gain to valid range
        const clampedGain = Math.max(-24, Math.min(24, gain));
        
        // Calculate frequency from x position (logarithmic scale)
        const freq = 20 * Math.pow(20000 / 20, (x - 20) / (eqCanvas.width - 40));
        
        // Clamp frequency to valid range based on band type
        let clampedFreq = freq;
        if (draggedBandIndex === 0) { // Low shelf
            clampedFreq = Math.max(20, Math.min(200, freq));
        } else if (draggedBandIndex === 4) { // High shelf
            clampedFreq = Math.max(2000, Math.min(20000, freq));
        } else { // Peaking filters
            if (draggedBandIndex === 1) { // Low-Mid
                clampedFreq = Math.max(100, Math.min(1000, freq));
            } else if (draggedBandIndex === 2) { // Mid
                clampedFreq = Math.max(500, Math.min(3000, freq));
            } else if (draggedBandIndex === 3) { // High-Mid
                clampedFreq = Math.max(2000, Math.min(8000, freq));
            }
        }
        
        // Update band gain and frequency
        eqBands[draggedBandIndex].gain = clampedGain;
        eqBands[draggedBandIndex].frequency = clampedFreq;
        
        // Update EQ filters in real-time
        updateEQFiltersInRealTime();
        
        // Update stored effects
        if (currentSampleForPopup) {
            const sample = currentPlaying[currentSampleForPopup];
            if (sample.effects) {
                switch (draggedBandIndex) {
                    case 0: sample.effects.eq.low = clampedGain; break;
                    case 1: sample.effects.eq.lowMid = clampedGain; break;
                    case 2: sample.effects.eq.mid = clampedGain; break;
                    case 3: sample.effects.eq.highMid = clampedGain; break;
                    case 4: sample.effects.eq.high = clampedGain; break;
                }
            }
        }
        
        // Redraw EQ visual
        drawEQVisual();
    }
    
    // Function to stop dragging an EQ band
    function stopDraggingEQBand() {
        isDraggingEqBand = false;
        draggedBandIndex = -1;
        drawEQVisual();
    }
    
    // Function to update EQ filters in real-time
    function updateEQFiltersInRealTime() {
        if (!currentSampleForPopup) return;
        
        // Get the sample's EQ nodes
        const sample = currentPlaying[currentSampleForPopup];
        
        if (sample.eqLowNode) {
            sample.eqLowNode.frequency.value = eqBands[0].frequency;
            sample.eqLowNode.gain.value = eqBands[0].gain;
        }
        
        if (sample.eqLowMidNode) {
            sample.eqLowMidNode.frequency.value = eqBands[1].frequency;
            sample.eqLowMidNode.gain.value = eqBands[1].gain;
        }
        
        if (sample.eqMidNode) {
            sample.eqMidNode.frequency.value = eqBands[2].frequency;
            sample.eqMidNode.gain.value = eqBands[2].gain;
        }
        
        if (sample.eqHighMidNode) {
            sample.eqHighMidNode.frequency.value = eqBands[3].frequency;
            sample.eqHighMidNode.gain.value = eqBands[3].gain;
        }
        
        if (sample.eqHighNode) {
            sample.eqHighNode.frequency.value = eqBands[4].frequency;
            sample.eqHighNode.gain.value = eqBands[4].gain;
        }
    }
    
    // Function to update wet/dry mix based on current effect settings
    function updateWetDryMix() {
        if (!currentSampleForPopup) return;
        
        const sample = currentPlaying[currentSampleForPopup];
        const delayTime = parseInt(document.getElementById('delay-time').value);
        const reverbMix = parseInt(document.getElementById('reverb-mix').value);
        
        // Calculate wet level based on effect settings
        let wetLevel = 0;
        
        // Add delay contribution to wet level
        if (delayTime > 0) {
            wetLevel += 0.5; // Make delay more audible
        }
        
        // Add reverb contribution to wet level
        if (reverbMix > 0) {
            wetLevel += reverbMix / 100;
        }
        
        // Limit wet level to maximum of 0.8
        wetLevel = Math.min(wetLevel, 0.8);
        
        // Update wet and dry path gains
        if (sample.wetPathNode) {
            sample.wetPathNode.gain.value = wetLevel;
        }
        
        if (sample.dryPathNode) {
            sample.dryPathNode.gain.value = 1.0 - wetLevel;
        }
    }
    
    // Function to update delay in real-time
    function updateDelayInRealTime() {
        if (!currentSampleForPopup) return;
        
        const sample = currentPlaying[currentSampleForPopup];
        const delayTime = parseInt(document.getElementById('delay-time').value);
        const feedback = parseInt(document.getElementById('delay-feedback').value);
        
        if (sample.delayNode) {
            sample.delayNode.delayTime.value = delayTime / 1000;
            
            // Find the feedback gain node and update it
            if (sample.delayFeedbackNode) {
                sample.delayFeedbackNode.gain.value = feedback / 100;
            }
        }
        
        // Update wet/dry mix
        updateWetDryMix();
        
        // Update stored effects immediately
        if (currentSampleForPopup) {
            const sample = currentPlaying[currentSampleForPopup];
            if (sample.effects) {
                sample.effects.delay.time = delayTime;
                sample.effects.delay.feedback = feedback;
            }
        }
    }
    
    // Function to update reverb in real-time
    function updateReverbInRealTime() {
        if (!currentSampleForPopup) return;
        
        const sample = currentPlaying[currentSampleForPopup];
        const reverbDecay = parseFloat(document.getElementById('reverb-decay').value);
        const reverbMix = parseInt(document.getElementById('reverb-mix').value);
        
        if (sample.reverbNode && reverbDecay > 0 && reverbMix > 0) {
            // Re-create the convolver with new decay time
            const convolver = audioContext.createConvolver();
            const length = audioContext.sampleRate * reverbDecay;
            const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
                }
            }
            
            convolver.buffer = impulse;
            
            // Disconnect old convolver and connect new one
            if (sample.reverbNode) {
                sample.reverbNode.disconnect();
            }
            sample.reverbNode = convolver;
            
            // Reconnect the convolver
            if (sample.wetPathNode && sample.reverbMixNode) {
                sample.wetPathNode.connect(convolver);
                convolver.connect(sample.reverbMixNode);
                sample.reverbMixNode.connect(sample.outputNode);
            }
        }
        
        if (sample.reverbMixNode) {
            sample.reverbMixNode.gain.value = reverbMix / 100;
        }
        
        // Update wet/dry mix
        updateWetDryMix();
        
        // Update stored effects immediately
        if (currentSampleForPopup) {
            const sample = currentPlaying[currentSampleForPopup];
            if (sample.effects) {
                sample.effects.reverb.decay = reverbDecay;
                sample.effects.reverb.mix = reverbMix;
            }
        }
    }
    
    // Function to initialize effects for a sample
    function initializeEffectsForSample(sampleNumber) {
        if (!currentPlaying[sampleNumber].isScheduled || !currentPlaying[sampleNumber].source) return;
        
        const sample = currentPlaying[sampleNumber];
        
        // If effects are already initialized, just update them
        if (sample.outputNode) {
            updateSampleEffects(sampleNumber);
            return;
        }
        
        // Start with the gain node
        const sourceNode = sample.gainNode;
        
        // Create output node
        const outputNode = audioContext.createGain();
        outputNode.gain.value = 1.0;
        
        // Create a dry path
        const dryPath = audioContext.createGain();
        dryPath.gain.value = 1.0;
        
        // Create a wet path
        const wetPath = audioContext.createGain();
        wetPath.gain.value = 0.0; // Initially no wet signal
        
        // Store reference to wet path and output node for reverb updates
        sample.wetPathNode = wetPath;
        sample.dryPathNode = dryPath;
        sample.outputNode = outputNode;
        
        // Connect source to both paths
        sourceNode.connect(dryPath);
        sourceNode.connect(wetPath);
        
        // Connect dry path to output
        dryPath.connect(outputNode);
        
        // Create effects chain on wet path
        let lastEffectNode = wetPath;
        
        // Create delay effect
        const delayNode = audioContext.createDelay(1.0);
        delayNode.delayTime.value = 0; // Initial value
        
        const feedbackGain = audioContext.createGain();
        feedbackGain.gain.value = 0; // Initial value
        
        // Connect delay
        lastEffectNode.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode); // Feedback loop
        delayNode.connect(outputNode); // Connect to output
        
        // Update last effect node
        lastEffectNode = delayNode;
        
        // Store references
        sample.delayNode = delayNode;
        sample.delayFeedbackNode = feedbackGain;
        
        // Create reverb effect
        const convolver = audioContext.createConvolver();
        const length = audioContext.sampleRate * 0.1; // Initial decay time
        const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        convolver.buffer = impulse;
        
        // Create reverb mix node
        const reverbMix = audioContext.createGain();
        reverbMix.gain.value = 0; // Initial value
        
        // Connect reverb
        lastEffectNode.connect(convolver);
        convolver.connect(reverbMix);
        reverbMix.connect(outputNode);
        
        // Store references
        sample.reverbNode = convolver;
        sample.reverbMixNode = reverbMix;
        
        // Create EQ filters
        const lowFilter = audioContext.createBiquadFilter();
        lowFilter.type = 'lowshelf';
        lowFilter.frequency.value = eqBands[0].frequency;
        lowFilter.gain.value = eqBands[0].gain;
        
        const lowMidFilter = audioContext.createBiquadFilter();
        lowMidFilter.type = 'peaking';
        lowMidFilter.frequency.value = eqBands[1].frequency;
        lowMidFilter.Q.value = eqBands[1].q;
        lowMidFilter.gain.value = eqBands[1].gain;
        
        const midFilter = audioContext.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = eqBands[2].frequency;
        midFilter.Q.value = eqBands[2].q;
        midFilter.gain.value = eqBands[2].gain;
        
        const highMidFilter = audioContext.createBiquadFilter();
        highMidFilter.type = 'peaking';
        highMidFilter.frequency.value = eqBands[3].frequency;
        highMidFilter.Q.value = eqBands[3].q;
        highMidFilter.gain.value = eqBands[3].gain;
        
        const highFilter = audioContext.createBiquadFilter();
        highFilter.type = 'highshelf';
        highFilter.frequency.value = eqBands[4].frequency;
        highFilter.gain.value = eqBands[4].gain;
        
        // Connect EQ filters
        outputNode.connect(lowFilter);
        lowFilter.connect(lowMidFilter);
        lowMidFilter.connect(midFilter);
        midFilter.connect(highMidFilter);
        highMidFilter.connect(highFilter);
        highFilter.connect(audioContext.destination);
        
        // Store references
        sample.eqLowNode = lowFilter;
        sample.eqLowMidNode = lowMidFilter;
        sample.eqMidNode = midFilter;
        sample.eqHighMidNode = highMidFilter;
        sample.eqHighNode = highFilter;
        
        // Apply any existing effects settings
        if (sample.effects) {
            updateSampleEffects(sampleNumber);
        }
    }
    
    // Function to show effects popup
    function showEffectsPopup(sampleNumber, button) {
        currentSampleForPopup = sampleNumber;
        document.getElementById('popup-sample-number').textContent = sampleNumber;
        
        // Get current effects settings for this sample
        const effects = currentPlaying[sampleNumber].effects || {
            delay: { time: 0, feedback: 0 },
            reverb: { decay: 0, mix: 0 },
            eq: {
                low: 0,
                lowMid: 0,
                mid: 0,
                highMid: 0,
                high: 0
            }
        };
        
        // Store original settings for revert functionality
        originalSettings = JSON.parse(JSON.stringify(effects));
        
        // Set slider values
        document.getElementById('delay-time').value = effects.delay.time;
        document.getElementById('delay-time-value').textContent = effects.delay.time;
        document.getElementById('delay-feedback').value = effects.delay.feedback;
        document.getElementById('delay-feedback-value').textContent = effects.delay.feedback;
        
        document.getElementById('reverb-decay').value = effects.reverb.decay;
        document.getElementById('reverb-decay-value').textContent = effects.reverb.decay;
        document.getElementById('reverb-mix').value = effects.reverb.mix;
        document.getElementById('reverb-mix-value').textContent = effects.reverb.mix;
        
        // Set EQ band values
        eqBands[0].gain = effects.eq.low;
        eqBands[1].gain = effects.eq.lowMid;
        eqBands[2].gain = effects.eq.mid;
        eqBands[3].gain = effects.eq.highMid;
        eqBands[4].gain = effects.eq.high;
        
        // Position popup in the center of the screen
        const gridRect = gridContainer.getBoundingClientRect();
        const popupWidth = gridRect.width;
        const popupHeight = gridRect.height;
        
        effectsPopup.style.left = `${(window.innerWidth - popupWidth) / 2}px`;
        effectsPopup.style.top = `${(window.innerHeight - popupHeight) / 2}px`;
        effectsPopup.style.width = `${popupWidth}px`;
        effectsPopup.style.height = `${popupHeight}px`;
        
        // Show popup
        effectsPopup.style.display = 'flex';
        
        // Initialize effects for the sample if it's playing and effects aren't already initialized
        if (currentPlaying[sampleNumber].isScheduled && 
            currentPlaying[sampleNumber].isActive && 
            !currentPlaying[sampleNumber].outputNode) {
            initializeEffectsForSample(sampleNumber);
        }
        
        // Initialize visual EQ after popup is shown
        setTimeout(() => {
            initVisualEQ();
        }, 100);
    }
    
    // Function to hide effects popup
    function hideEffectsPopup() {
        effectsPopup.style.display = 'none';
        
        // Stop waveform animation
        stopWaveformAnimation();
        
        // Disconnect waveform analyzer and restore original connections
        if (waveformAnalyzer && currentSampleForPopup) {
            const sample = currentPlaying[currentSampleForPopup];
            
            // Disconnect the analyzer
            waveformAnalyzer.disconnect();
            
            // Restore the original connection
            if (sample.eqHighNode) {
                sample.eqHighNode.disconnect();
                sample.eqHighNode.connect(audioContext.destination);
            } else if (sample.outputNode) {
                sample.outputNode.disconnect();
                sample.outputNode.connect(audioContext.destination);
            } else if (sample.gainNode) {
                sample.gainNode.disconnect();
                sample.gainNode.connect(audioContext.destination);
            }
            
            waveformAnalyzer = null;
        }
        
        currentSampleForPopup = null;
    }
    
    // Function to reset effects to original settings
    function resetEffectsSettings() {
        if (!currentSampleForPopup) return;
        
        // Reset all sliders to 0
        document.getElementById('delay-time').value = 0;
        document.getElementById('delay-time-value').textContent = '0';
        document.getElementById('delay-feedback').value = 0;
        document.getElementById('delay-feedback-value').textContent = '0';
        
        document.getElementById('reverb-decay').value = 0;
        document.getElementById('reverb-decay-value').textContent = '0';
        document.getElementById('reverb-mix').value = 0;
        document.getElementById('reverb-mix-value').textContent = '0';
        
        // Reset EQ band values to 0
        eqBands[0].gain = 0;
        eqBands[1].gain = 0;
        eqBands[2].gain = 0;
        eqBands[3].gain = 0;
        eqBands[4].gain = 0;
        
        // Update stored effects
        const sample = currentPlaying[currentSampleForPopup];
        if (sample.effects) {
            sample.effects.delay.time = 0;
            sample.effects.delay.feedback = 0;
            sample.effects.reverb.decay = 0;
            sample.effects.reverb.mix = 0;
            sample.effects.eq.low = 0;
            sample.effects.eq.lowMid = 0;
            sample.effects.eq.mid = 0;
            sample.effects.eq.highMid = 0;
            sample.effects.eq.high = 0;
        }
        
        // Update all effects in real-time
        updateDelayInRealTime();
        updateReverbInRealTime();
        updateEQFiltersInRealTime();
        
        // Redraw EQ visual
        drawEQVisual();
    }
    
    // Function to apply effects settings
    function applyEffectsSettings() {
        if (!currentSampleForPopup) return;
        
        // Get effects settings from popup
        const effects = {
            delay: {
                time: parseInt(document.getElementById('delay-time').value),
                feedback: parseInt(document.getElementById('delay-feedback').value)
            },
            reverb: {
                decay: parseFloat(document.getElementById('reverb-decay').value),
                mix: parseInt(document.getElementById('reverb-mix').value)
            },
            eq: {
                low: eqBands[0].gain,
                lowMid: eqBands[1].gain,
                mid: eqBands[2].gain,
                highMid: eqBands[3].gain,
                high: eqBands[4].gain
            }
        };
        
        // Store effects settings
        currentPlaying[currentSampleForPopup].effects = effects;
        
        // Hide popup
        hideEffectsPopup();
    }
    
    // Function to handle sample upload
    function handleSampleUpload(event) {
        if (!currentSampleForPopup) return;
        
        const file = event.target.files[0];
        if (!file) return;
        
        const uploadStatus = document.querySelector('.upload-status');
        uploadStatus.textContent = 'Uploading...';
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result)
                .then(buffer => {
                    // Update the sample's buffer
                    currentPlaying[currentSampleForPopup].buffer = buffer;
                    currentPlaying[currentSampleForPopup].loopDuration = buffer.duration;
                    currentPlaying[currentSampleForPopup].bufferSampleNumber = currentSampleForPopup;
                    currentPlaying[currentSampleForPopup].isCustomSample = true;
                    
                    // Update the button to indicate it's a custom sample
                    const button = currentPlaying[currentSampleForPopup].button;
                    if (button) {
                        // Add custom indicator
                        let customIndicator = button.querySelector('.custom-indicator');
                        if (!customIndicator) {
                            customIndicator = document.createElement('div');
                            customIndicator.className = 'custom-indicator';
                            customIndicator.textContent = 'C';
                            button.appendChild(customIndicator);
                        }
                        customIndicator.style.display = 'block';
                    }
                    
                    // If the sample is currently playing, restart it with the new buffer
                    if (currentPlaying[currentSampleForPopup].isScheduled && 
                        currentPlaying[currentSampleForPopup].isActive) {
                        
                        // Stop the current sample
                        stopSample(currentSampleForPopup);
                        
                        // Restart it with the new buffer
                        currentPlaying[currentSampleForPopup].scheduledForNextBar = true;
                        scheduleSampleForNextBar(currentSampleForPopup);
                    }
                    
                    uploadStatus.textContent = 'Upload successful!';
                    uploadStatus.style.color = '#4CAF50';
                })
                .catch(error => {
                    console.error('Error decoding audio data:', error);
                    uploadStatus.textContent = 'Error: Invalid audio file';
                    uploadStatus.style.color = '#F44336';
                });
        };
        
        reader.onerror = function() {
            uploadStatus.textContent = 'Error reading file';
            uploadStatus.style.color = '#F44336';
        };
        
        reader.readAsArrayBuffer(file);
    }
    
    // Function to update sample effects
    function updateSampleEffects(sampleNumber) {
        if (!currentPlaying[sampleNumber].isScheduled || !currentPlaying[sampleNumber].source) return;
        
        const effects = currentPlaying[sampleNumber].effects;
        const sample = currentPlaying[sampleNumber];
        
        // If effects are not initialized, initialize them first
        if (!sample.outputNode) {
            initializeEffectsForSample(sampleNumber);
            return;
        }
        
        // Update delay effect
        if (sample.delayNode) {
            sample.delayNode.delayTime.value = effects.delay.time / 1000;
            
            if (sample.delayFeedbackNode) {
                sample.delayFeedbackNode.gain.value = effects.delay.feedback / 100;
            }
        }
        
        // Update reverb effect
        if (effects.reverb.decay > 0 && effects.reverb.mix > 0) {
            // Re-create the convolver with new decay time
            const convolver = audioContext.createConvolver();
            const length = audioContext.sampleRate * effects.reverb.decay;
            const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
                }
            }
            
            convolver.buffer = impulse;
            
            // Disconnect old convolver and connect new one
            if (sample.reverbNode) {
                sample.reverbNode.disconnect();
            }
            sample.reverbNode = convolver;
            
            // Reconnect the convolver
            if (sample.wetPathNode && sample.reverbMixNode) {
                sample.wetPathNode.connect(convolver);
                convolver.connect(sample.reverbMixNode);
                sample.reverbMixNode.connect(sample.outputNode);
            }
        }
        
        if (sample.reverbMixNode) {
            sample.reverbMixNode.gain.value = effects.reverb.mix / 100;
        }
        
        // Update EQ filters
        if (sample.eqLowNode) {
            sample.eqLowNode.frequency.value = eqBands[0].frequency;
            sample.eqLowNode.gain.value = eqBands[0].gain;
        }
        
        if (sample.eqLowMidNode) {
            sample.eqLowMidNode.frequency.value = eqBands[1].frequency;
            sample.eqLowMidNode.gain.value = eqBands[1].gain;
        }
        
        if (sample.eqMidNode) {
            sample.eqMidNode.frequency.value = eqBands[2].frequency;
            sample.eqMidNode.gain.value = eqBands[2].gain;
        }
        
        if (sample.eqHighMidNode) {
            sample.eqHighMidNode.frequency.value = eqBands[3].frequency;
            sample.eqHighMidNode.gain.value = eqBands[3].gain;
        }
        
        if (sample.eqHighNode) {
            sample.eqHighNode.frequency.value = eqBands[4].frequency;
            sample.eqHighNode.gain.value = eqBands[4].gain;
        }
        
        // Calculate wet level based on effect settings
        let wetLevel = 0;
        
        // Add delay contribution to wet level
        if (effects.delay.time > 0) {
            wetLevel += 0.5; // Make delay more audible
        }
        
        // Add reverb contribution to wet level
        if (effects.reverb.mix > 0) {
            wetLevel += effects.reverb.mix / 100;
        }
        
        // Limit wet level to maximum of 0.8
        wetLevel = Math.min(wetLevel, 0.8);
        
        // Update wet and dry path gains
        if (sample.wetPathNode) {
            sample.wetPathNode.gain.value = wetLevel;
        }
        
        if (sample.dryPathNode) {
            sample.dryPathNode.gain.value = 1.0 - wetLevel;
        }
        
        // If the popup is open for this sample, reconnect the waveform analyzer
        if (currentSampleForPopup === sampleNumber && waveformAnalyzer) {
            sample.eqHighNode.disconnect();
            sample.eqHighNode.connect(waveformAnalyzer);
            waveformAnalyzer.connect(audioContext.destination);
        }
    }
    
    // Add event listeners to popup
    document.querySelector('.popup-close-btn').addEventListener('click', function() {
        // Reset to original settings before closing
        resetEffectsSettings();
        hideEffectsPopup();
    });
    
    document.querySelector('.popup-reset-btn').addEventListener('click', resetEffectsSettings);
    document.querySelector('.popup-accept-btn').addEventListener('click', applyEffectsSettings);
    
    // Add event listener for sample upload
    document.getElementById('sample-upload').addEventListener('change', handleSampleUpload);
    
    // Add event listeners to sliders to update values in real-time
    document.getElementById('delay-time').addEventListener('input', function() {
        document.getElementById('delay-time-value').textContent = this.value;
        updateDelayInRealTime();
    });
    
    document.getElementById('delay-feedback').addEventListener('input', function() {
        document.getElementById('delay-feedback-value').textContent = this.value;
        updateDelayInRealTime();
    });
    
    document.getElementById('reverb-decay').addEventListener('input', function() {
        document.getElementById('reverb-decay-value').textContent = this.value;
        updateReverbInRealTime();
    });
    
    document.getElementById('reverb-mix').addEventListener('input', function() {
        document.getElementById('reverb-mix-value').textContent = this.value;
        updateReverbInRealTime();
    });
    
    // Get references to sliders
    const highTempoSlider = document.querySelector('.high-tempo-slider');
    const highTempoDisplay = document.querySelector('.high-tempo-display');
    const longLoopTempoSlider = document.querySelector('.long-loop-tempo-slider');
    const longLoopTempoDisplay = document.querySelector('.long-loop-tempo-display');
    
    // Create volume controls for each group
    const volumeControlsContainer = document.querySelector('.volume-controls');
    
    // Create volume sliders for each group
    for (let group = 0; group < 10; group++) {
        const volumeControl = document.createElement('div');
        volumeControl.className = 'volume-control';
        
        const volumeLabel = document.createElement('label');
        volumeLabel.textContent = `${group}: `;
        volumeLabel.className = `group-${group}-label`;
        
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '80';
        volumeSlider.step = '1';
        volumeSlider.className = `volume-slider volume-slider-${group}`;
        volumeSlider.id = `volumeSlider${group}`;
        
        const volumeValue = document.createElement('span');
        volumeValue.className = 'volume-value';
        volumeValue.textContent = '80%';
        volumeValue.id = `volumeValue${group}`;
        
        volumeControl.appendChild(volumeLabel);
        volumeControl.appendChild(volumeSlider);
        volumeControl.appendChild(volumeValue);
        
        volumeControlsContainer.appendChild(volumeControl);
        
        // Add event listener to update volume value display and gain node
        volumeSlider.addEventListener('input', function() {
            const volume = this.value;
            volumeValue.textContent = `${volume}%`;
            
            // Update gain for all samples in this group
            for (let i = 1; i <= 100; i++) {
                if (currentPlaying[i] && currentPlaying[i].gainNode && Math.floor((i - 1) / 10) === group) {
                    currentPlaying[i].gainNode.gain.value = volume / 100;
                    currentPlaying[i].volume = volume / 100;
                }
            }
        });
    }
    
    // Ensure all controls are visible
    const controls = document.querySelector('.controls');
    controls.style.display = 'block';
    controls.style.visibility = 'visible';
    
    // Create buttons and audio elements
    for (let i = 1; i <= 100; i++) {
        // Create button
        const button = document.createElement('button');
        button.className = 'audio-button';
        button.textContent = i;
        button.id = `but${i}`;
        
        // Add loop indicator
        const loopIndicator = document.createElement('div');
        loopIndicator.className = 'loop-indicator';
        button.appendChild(loopIndicator);
        
        // Add custom sample indicator (initially hidden)
        const customIndicator = document.createElement('div');
        customIndicator.className = 'custom-indicator';
        customIndicator.textContent = 'C';
        customIndicator.style.display = 'none';
        button.appendChild(customIndicator);
        
        // Determine group (0-9)
        const group = Math.floor((i - 1) / 10);
        
        // Add group class for styling
        button.classList.add(`group-${group}`);
        
        // Initialize sample if not exists
        if (!currentPlaying[i]) {
            currentPlaying[i] = {
                button: null,
                buffer: null,
                source: null,
                gainNode: null,
                loopDuration: null,
                sampleNumber: null,
                isScheduled: false,
                startTime: 0,
                scheduledForNextBar: false,
                isLongSample: i > 70,
                nextLoopTime: 0,
                scheduledTimeout: null,
                loopStartTime: 0,
                originalTempo: tempo,
                volume: 0.8,
                bufferSampleNumber: null,
                isActive: false,
                tempoChangeTime: 0, // Track when tempo last changed
                positionAtTempoChange: 0, // Track position in loop when tempo changed
                masterStartBar: 0, // Master bar when this sample started
                masterStartOffset: 0, // Offset within the bar when this sample started
                barGridAligned: false, // Whether this sample is aligned to the bar grid
                isCustomSample: false, // Whether this is a custom uploaded sample
                effects: { // Effects settings
                    delay: { time: 0, feedback: 0 },
                    reverb: { decay: 0, mix: 0 },
                    eq: {
                        low: 0,
                        lowMid: 0,
                        mid: 0,
                        highMid: 0,
                        high: 0
                    }
                },
                // Effect nodes
                delayNode: null,
                delayFeedbackNode: null,
                reverbNode: null,
                reverbMixNode: null,
                wetPathNode: null,
                dryPathNode: null,
                outputNode: null,
                eqLowNode: null,
                eqLowMidNode: null,
                eqMidNode: null,
                eqHighMidNode: null,
                eqHighNode: null
            };
        }
        
        // Add click event to button
        button.addEventListener('click', function() {
            // If this audio is currently playing
            if (currentPlaying[i].button === button) {
                // If it's playing, stop it but keep it active
                if (currentPlaying[i].isScheduled) {
                    stopSample(i);
                    button.classList.remove('active');
                    currentPlaying[i].isActive = false;
                } else {
                    // If it's stopped but still active, play it again
                    button.classList.add('active');
                    currentPlaying[i].isActive = true;
                    currentPlaying[i].scheduledForNextBar = true;
                    
                    if (isPlaying && currentPlaying[i].buffer) {
                        scheduleSampleForNextBar(i);
                    }
                }
            } else {
                // Stop any other audio in the same group
                for (let j = 1; j <= 100; j++) {
                    if (Math.floor((j - 1) / 10) === group && currentPlaying[j].button) {
                        currentPlaying[j].button.classList.remove('active');
                        stopSample(j);
                        currentPlaying[j].isActive = false;
                    }
                }
                
                // Set this as the active sample
                currentPlaying[i].button = button;
                currentPlaying[i].sampleNumber = i;
                currentPlaying[i].isLongSample = i > 70;
                currentPlaying[i].originalTempo = tempo;
                button.classList.add('active');
                currentPlaying[i].isActive = true;
                currentPlaying[i].scheduledForNextBar = true;
                currentPlaying[i].barGridAligned = false; // Needs to be aligned to bar grid
                
                // Load audio if not already loaded or if it's a different sample
                if (!currentPlaying[i].buffer || currentPlaying[i].bufferSampleNumber !== i) {
                    loadAudio(i, i);
                } else if (isPlaying) {
                    // If buffer is already loaded and we're playing, schedule it
                    scheduleSampleForNextBar(i);
                }
            }
        });
        
        // Add right-click event for desktop
        button.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showEffectsPopup(i, button);
        });
        
        // Add touch events for mobile long press
        button.addEventListener('touchstart', function(e) {
            isLongPress = false;
            longPressTimer = setTimeout(function() {
                isLongPress = true;
                showEffectsPopup(i, button);
            }, 500); // 500ms for long press
        });
        
        button.addEventListener('touchend', function(e) {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            // If it was a long press, prevent the click event
            if (isLongPress) {
                e.preventDefault();
                isLongPress = false;
            }
        });
        
        button.addEventListener('touchmove', function(e) {
            // If the user moves their finger, cancel the long press
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });
        
        // Add to grid
        buttonGrid.appendChild(button);
    }
    
    // Set up loop length buttons
    const loopButtons = document.querySelectorAll('.loop-button');
    loopButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons of the same type
            const isLongLoopButton = button.classList.contains('long-loop-button');
            const buttonsToClear = isLongLoopButton ? 
                document.querySelectorAll('.long-loop-button') : 
                document.querySelectorAll('.loop-button:not(.long-loop-button)');
            
            buttonsToClear.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get loop length from dataset with validation
            const newLoopLength = parseInt(this.dataset.loop || this.dataset.longLoop);
            
            // Validate the parsed value
            if (isNaN(newLoopLength) || newLoopLength <= 0) {
                console.error('Invalid loop length value:', this.dataset.loop || this.dataset.longLoop);
                return;
            }
            
            if (isLongLoopButton) {
                // Set long loop length
                const newLongLoopLength = newLoopLength * 4;
                longLoopLength = newLongLoopLength;
                
                // If playing, update all long samples with new loop length
                if (isPlaying) {
                    for (let i = 1; i <= 100; i++) {
                        if (currentPlaying[i].button && 
                            currentPlaying[i].buffer && 
                            currentPlaying[i].scheduledForNextBar &&
                            currentPlaying[i].isActive &&
                            currentPlaying[i].isScheduled &&
                            currentPlaying[i].isLongSample) {
                            
                            // Update the long sample with new loop length
                            updateLongSampleLoop(i);
                        }
                    }
                }
                
                console.log(`Long sample loop length set to ${longLoopLength} bars (double of ${newLoopLength})`);
            } else {
                // Set regular loop length
                loopLength = newLoopLength;
                
                // If playing, update all drum samples with new loop length
                if (isPlaying) {
                    for (let i = 1; i <= 100; i++) {
                        if (currentPlaying[i].button && 
                            currentPlaying[i].buffer && 
                            currentPlaying[i].scheduledForNextBar &&
                            currentPlaying[i].isActive &&
                            currentPlaying[i].isScheduled &&
                            !currentPlaying[i].isLongSample) {
                            
                            // Update the drum sample with new loop length
                            updateDrumSampleLoop(i);
                        }
                    }
                }
                
                console.log(`Loop length set to ${loopLength} bars`);
            }
        });
    });
    
    // Set default loop length buttons as active
    const defaultLoopButton = document.querySelector('.loop-button[data-loop="1"]');
    if (defaultLoopButton) {
        defaultLoopButton.classList.add('active');
    }
    
    const defaultLongLoopButton = document.querySelector('.long-loop-button[data-long-loop="1"]');
    if (defaultLongLoopButton) {
        defaultLongLoopButton.classList.add('active');
    }
    
    // Load audio file
    function loadAudio(sampleNumber, index) {
        const audio = new Audio();
        audio.src = `./mykicks/${sampleNumber}.wav`;
        
        // When audio is loaded, decode it and store as buffer
        audio.addEventListener('canplaythrough', function() {
            fetch(audio.src)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    currentPlaying[index].buffer = audioBuffer;
                    // Store the original duration
                    currentPlaying[index].loopDuration = audioBuffer.duration;
                    // Track which sample this buffer is for
                    currentPlaying[index].bufferSampleNumber = sampleNumber;
                    
                    // If this sample is scheduled for next bar and we're playing, schedule it
                    if (isPlaying && currentPlaying[index].scheduledForNextBar && currentPlaying[index].isActive) {
                        // Cancel any existing timeout for this sample
                        if (currentPlaying[index].scheduledTimeout) {
                            clearTimeout(currentPlaying[index].scheduledTimeout);
                            currentPlaying[index].scheduledTimeout = null;
                        }
                        
                        // Schedule the sample for the next bar
                        scheduleSampleForNextBar(index);
                    }
                })
                .catch(e => console.error("Error loading audio:", e));
        });
        
        // Set initial loading state
        audio.load();
    }
    
    // Update the drum bar grid
    function updateDrumBarGrid(newTempo) {
        const currentTime = audioContext.currentTime;
        
        // Calculate the current position in the current bar (0 to 1)
        const currentBarProgress = (currentTime - drumBarGrid.startTime) / drumBarGrid.duration;
        
        // Calculate the new bar duration
        const effectiveTempo = newTempo + highTempo;
        const newBarDuration = (60 / effectiveTempo) * 4;
        
        // Adjust the drum bar grid to preserve the current bar position
        drumBarGrid.startTime = currentTime - (currentBarProgress * newBarDuration);
        drumBarGrid.duration = newBarDuration;
        drumBarGrid.nextStartTime = drumBarGrid.startTime + drumBarGrid.duration;
        
        console.log(`Drum bar grid updated: bar progress ${currentBarProgress}, new duration ${newBarDuration}`);
    }
    
    // Update the long sample bar grid
    function updateLongSampleBarGrid(newTempo) {
        const currentTime = audioContext.currentTime;
        
        // Calculate the current position in the current bar (0 to 1)
        const currentBarProgress = (currentTime - longSampleBarGrid.startTime) / longSampleBarGrid.duration;
        
        // Calculate the new bar duration
        const newBarDuration = (60 / newTempo) * 4;
        
        // Adjust the long sample bar grid to preserve the current bar position
        longSampleBarGrid.startTime = currentTime - (currentBarProgress * newBarDuration);
        longSampleBarGrid.duration = newBarDuration;
        longSampleBarGrid.nextStartTime = longSampleBarGrid.startTime + longSampleBarGrid.duration;
        
        console.log(`Long sample bar grid updated: bar progress ${currentBarProgress}, new duration ${newBarDuration}`);
    }
    
    // Synchronize the two bar grids to ensure they start at the same time
    function synchronizeBarGrids() {
        // Use the drum bar grid as the reference
        const currentTime = audioContext.currentTime;
        
        // Calculate the current position in the drum bar grid
        const drumBarProgress = (currentTime - drumBarGrid.startTime) / drumBarGrid.duration;
        
        // Apply the same position to the long sample bar grid
        longSampleBarGrid.startTime = currentTime - (drumBarProgress * longSampleBarGrid.duration);
        longSampleBarGrid.nextStartTime = longSampleBarGrid.startTime + longSampleBarGrid.duration;
        
        console.log(`Bar grids synchronized: drum progress ${drumBarProgress}`);
    }
    
    // Schedule a sample to play at the next bar
    function scheduleSampleForNextBar(sampleNumber) {
        if (!currentPlaying[sampleNumber].buffer || !currentPlaying[sampleNumber].scheduledForNextBar) return;
        
        // Use the appropriate bar grid
        const barGrid = currentPlaying[sampleNumber].isLongSample ? longSampleBarGrid : drumBarGrid;
        const nextBarTime = barGrid.nextStartTime;
        const currentTime = audioContext.currentTime;
        
        // Set a timeout to play the sample at the right time
        const timeUntilNextBar = (nextBarTime - currentTime) * 1000;
        
        // Cancel any existing timeout for this sample
        if (currentPlaying[sampleNumber].scheduledTimeout) {
            clearTimeout(currentPlaying[sampleNumber].scheduledTimeout);
        }
        
        // Store the timeout reference
        currentPlaying[sampleNumber].scheduledTimeout = setTimeout(() => {
            if (currentPlaying[sampleNumber].scheduledForNextBar && currentPlaying[sampleNumber].isActive) {
                playSampleAtTime(sampleNumber, audioContext.currentTime);
                currentPlaying[sampleNumber].barGridAligned = true;
            }
            currentPlaying[sampleNumber].scheduledTimeout = null;
        }, Math.max(0, timeUntilNextBar));
    }
    
    // Play a sample at a specific time
    function playSampleAtTime(sampleNumber, startTime) {
        if (!currentPlaying[sampleNumber].buffer || !currentPlaying[sampleNumber].scheduledForNextBar) return;
        
        // Stop any existing sample
        if (currentPlaying[sampleNumber].source) {
            try {
                currentPlaying[sampleNumber].source.stop();
                currentPlaying[sampleNumber].source.disconnect();
            } catch (e) {
                console.warn('Error stopping audio source:', e);
            }
            currentPlaying[sampleNumber].source = null;
            currentPlaying[sampleNumber].gainNode = null;
            
            // Clean up effect nodes
            if (currentPlaying[sampleNumber].delayNode) {
                currentPlaying[sampleNumber].delayNode.disconnect();
                currentPlaying[sampleNumber].delayNode = null;
            }
            
            if (currentPlaying[sampleNumber].delayFeedbackNode) {
                currentPlaying[sampleNumber].delayFeedbackNode.disconnect();
                currentPlaying[sampleNumber].delayFeedbackNode = null;
            }
            
            if (currentPlaying[sampleNumber].reverbNode) {
                currentPlaying[sampleNumber].reverbNode.disconnect();
                currentPlaying[sampleNumber].reverbNode = null;
            }
            
            if (currentPlaying[sampleNumber].reverbMixNode) {
                currentPlaying[sampleNumber].reverbMixNode.disconnect();
                currentPlaying[sampleNumber].reverbMixNode = null;
            }
            
            if (currentPlaying[sampleNumber].wetPathNode) {
                currentPlaying[sampleNumber].wetPathNode.disconnect();
                currentPlaying[sampleNumber].wetPathNode = null;
            }
            
            if (currentPlaying[sampleNumber].dryPathNode) {
                currentPlaying[sampleNumber].dryPathNode.disconnect();
                currentPlaying[sampleNumber].dryPathNode = null;
            }
            
            if (currentPlaying[sampleNumber].outputNode) {
                currentPlaying[sampleNumber].outputNode.disconnect();
                currentPlaying[sampleNumber].outputNode = null;
            }
            
            if (currentPlaying[sampleNumber].eqLowNode) {
                currentPlaying[sampleNumber].eqLowNode.disconnect();
                currentPlaying[sampleNumber].eqLowNode = null;
            }
            
            if (currentPlaying[sampleNumber].eqLowMidNode) {
                currentPlaying[sampleNumber].eqLowMidNode.disconnect();
                currentPlaying[sampleNumber].eqLowMidNode = null;
            }
            
            if (currentPlaying[sampleNumber].eqMidNode) {
                currentPlaying[sampleNumber].eqMidNode.disconnect();
                currentPlaying[sampleNumber].eqMidNode = null;
            }
            
            if (currentPlaying[sampleNumber].eqHighMidNode) {
                currentPlaying[sampleNumber].eqHighMidNode.disconnect();
                currentPlaying[sampleNumber].eqHighMidNode = null;
            }
            
            if (currentPlaying[sampleNumber].eqHighNode) {
                currentPlaying[sampleNumber].eqHighNode.disconnect();
                currentPlaying[sampleNumber].eqHighNode = null;
            }
        }
        
        // Create a new source
        const source = audioContext.createBufferSource();
        source.buffer = currentPlaying[sampleNumber].buffer;
        
        // Create a gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = currentPlaying[sampleNumber].volume;
        
        // Connect nodes
        source.connect(gainNode);
        
        // Store references
        currentPlaying[sampleNumber].source = source;
        currentPlaying[sampleNumber].gainNode = gainNode;
        currentPlaying[sampleNumber].startTime = startTime;
        currentPlaying[sampleNumber].isScheduled = true;
        currentPlaying[sampleNumber].loopStartTime = startTime;
        currentPlaying[sampleNumber].tempoChangeTime = startTime; // Initialize tempo change time
        
        if (currentPlaying[sampleNumber].isLongSample) {
            // For long samples (71-100): use long loop tempo
            const longLoopBeatDuration = 60 / longLoopTempo;
            const longLoopBarDuration = longLoopBeatDuration * 4;
            const desiredLoopDuration = longLoopBarDuration * longLoopLength;
            
            // Validate values before calculating playback rate
            if (!isFinite(desiredLoopDuration) || desiredLoopDuration <= 0 || 
                !isFinite(currentPlaying[sampleNumber].loopDuration) || currentPlaying[sampleNumber].loopDuration <= 0) {
                console.error('Invalid values for long sample:', {
                    desiredLoopDuration,
                    loopDuration: currentPlaying[sampleNumber].loopDuration
                });
                return;
            }
            
            const playbackRate = currentPlaying[sampleNumber].loopDuration / desiredLoopDuration;
            
            // Validate playback rate before setting it
            if (!isFinite(playbackRate) || playbackRate <= 0) {
                console.error('Invalid playback rate for long sample:', playbackRate);
                return;
            }
            
            source.loop = true;
            source.loopStart = 0;
            source.loopEnd = currentPlaying[sampleNumber].loopDuration;
            source.playbackRate.value = playbackRate;
            
            // Start playback at the specified time
            source.start(startTime);
            
            // No onended needed for long samples because they loop
        } else {
            // For drum samples (1-70): use regular tempo
            const effectiveTempo = tempo + highTempo;
            const effectiveBeatDuration = 60 / effectiveTempo;
            const effectiveBarDuration = effectiveBeatDuration * 4;
            const desiredLoopDuration = effectiveBarDuration * loopLength;
            
            // Validate values before calculating playback rate
            if (!isFinite(desiredLoopDuration) || desiredLoopDuration <= 0 || 
                !isFinite(currentPlaying[sampleNumber].loopDuration) || currentPlaying[sampleNumber].loopDuration <= 0) {
                console.error('Invalid values for drum sample:', {
                    desiredLoopDuration,
                    loopDuration: currentPlaying[sampleNumber].loopDuration,
                    effectiveBarDuration,
                    loopLength
                });
                return;
            }
            
            const playbackRate = currentPlaying[sampleNumber].loopDuration / desiredLoopDuration;
            
            // Validate playback rate before setting it
            if (!isFinite(playbackRate) || playbackRate <= 0) {
                console.error('Invalid playback rate for drum sample:', playbackRate);
                return;
            }
            
            source.loop = true;
            source.loopStart = 0;
            source.loopEnd = currentPlaying[sampleNumber].loopDuration;
            source.playbackRate.value = playbackRate;
            
            // Start playback at the specified time
            source.start(startTime);
            
            // No onended needed for drum samples because they loop
        }
        
        // Initialize effects for the sample immediately
        initializeEffectsForSample(sampleNumber);
        
        console.log(`Sample ${sampleNumber} (${currentPlaying[sampleNumber].isLongSample ? 'long' : 'drum'}) started at ${startTime}`);
    }
    
    // Update a drum sample's loop parameters
    function updateDrumSampleLoop(sampleNumber) {
        if (!currentPlaying[sampleNumber].source || currentPlaying[sampleNumber].isLongSample) return;
        
        // Calculate new playback rate based on current tempo and loop length
        const effectiveTempo = tempo + highTempo;
        const effectiveBeatDuration = 60 / effectiveTempo;
        const effectiveBarDuration = effectiveBeatDuration * 4;
        const desiredLoopDuration = effectiveBarDuration * loopLength;
        
        // Validate values before calculating playback rate
        if (!isFinite(desiredLoopDuration) || desiredLoopDuration <= 0 || 
            !isFinite(currentPlaying[sampleNumber].loopDuration) || currentPlaying[sampleNumber].loopDuration <= 0) {
            console.error('Invalid values for updating drum sample:', {
                desiredLoopDuration,
                loopDuration: currentPlaying[sampleNumber].loopDuration,
                effectiveBarDuration,
                loopLength
            });
            return;
        }
        
        const playbackRate = currentPlaying[sampleNumber].loopDuration / desiredLoopDuration;
        
        // Validate playback rate before setting it
        if (!isFinite(playbackRate) || playbackRate <= 0) {
            console.error('Invalid playback rate for updating drum sample:', playbackRate);
            return;
        }
        
        // Calculate the current position in the sample's loop
        const currentTime = audioContext.currentTime;
        const elapsedTime = currentTime - currentPlaying[sampleNumber].loopStartTime;
        const loopProgress = (elapsedTime * currentPlaying[sampleNumber].source.playbackRate.value) % currentPlaying[sampleNumber].loopDuration;
        
        // Update the playback rate
        currentPlaying[sampleNumber].source.playbackRate.value = playbackRate;
        
        // Adjust the loop start time to align with the drum bar grid
        currentPlaying[sampleNumber].loopStartTime = currentTime - (loopProgress / playbackRate);
        
        console.log(`Sample ${sampleNumber} tempo updated: loop progress ${loopProgress / currentPlaying[sampleNumber].loopDuration}`);
    }
    
    // Update a long sample's loop parameters
    function updateLongSampleLoop(sampleNumber) {
        if (!currentPlaying[sampleNumber].source || !currentPlaying[sampleNumber].isLongSample) return;
        
        // Calculate new playback rate based on long loop tempo and loop length
        const longLoopBeatDuration = 60 / longLoopTempo;
        const longLoopBarDuration = longLoopBeatDuration * 4;
        const desiredLoopDuration = longLoopBarDuration * longLoopLength;
        
        // Validate values before calculating playback rate
        if (!isFinite(desiredLoopDuration) || desiredLoopDuration <= 0 || 
            !isFinite(currentPlaying[sampleNumber].loopDuration) || currentPlaying[sampleNumber].loopDuration <= 0) {
            console.error('Invalid values for updating long sample:', {
                desiredLoopDuration,
                loopDuration: currentPlaying[sampleNumber].loopDuration,
                longLoopBarDuration,
                longLoopLength
            });
            return;
        }
        
        const playbackRate = currentPlaying[sampleNumber].loopDuration / desiredLoopDuration;
        
        // Validate playback rate before setting it
        if (!isFinite(playbackRate) || playbackRate <= 0) {
            console.error('Invalid playback rate for updating long sample:', playbackRate);
            return;
        }
        
        // Calculate the current position in the sample's loop
        const currentTime = audioContext.currentTime;
        const elapsedTime = currentTime - currentPlaying[sampleNumber].loopStartTime;
        const loopProgress = (elapsedTime * currentPlaying[sampleNumber].source.playbackRate.value) % currentPlaying[sampleNumber].loopDuration;
        
        // Update the playback rate
        currentPlaying[sampleNumber].source.playbackRate.value = playbackRate;
        
        // Adjust the loop start time to align with the long sample bar grid
        currentPlaying[sampleNumber].loopStartTime = currentTime - (loopProgress / playbackRate);
        
        console.log(`Sample ${sampleNumber} long tempo updated: loop progress ${loopProgress / currentPlaying[sampleNumber].loopDuration}`);
    }
    
    // Stop a sample
    function stopSample(sampleNumber) {
        // Cancel any scheduled timeout for this sample
        if (currentPlaying[sampleNumber].scheduledTimeout) {
            clearTimeout(currentPlaying[sampleNumber].scheduledTimeout);
            currentPlaying[sampleNumber].scheduledTimeout = null;
        }
        
        if (currentPlaying[sampleNumber].source) {
            try {
                // Only call stop if the source has been started
                if (currentPlaying[sampleNumber].isScheduled) {
                    currentPlaying[sampleNumber].source.stop();
                }
                currentPlaying[sampleNumber].source.disconnect();
                currentPlaying[sampleNumber].source = null;
                currentPlaying[sampleNumber].gainNode = null;
                
                // Clean up effect nodes
                if (currentPlaying[sampleNumber].delayNode) {
                    currentPlaying[sampleNumber].delayNode.disconnect();
                    currentPlaying[sampleNumber].delayNode = null;
                }
                
                if (currentPlaying[sampleNumber].delayFeedbackNode) {
                    currentPlaying[sampleNumber].delayFeedbackNode.disconnect();
                    currentPlaying[sampleNumber].delayFeedbackNode = null;
                }
                
                if (currentPlaying[sampleNumber].reverbNode) {
                    currentPlaying[sampleNumber].reverbNode.disconnect();
                    currentPlaying[sampleNumber].reverbNode = null;
                }
                
                if (currentPlaying[sampleNumber].reverbMixNode) {
                    currentPlaying[sampleNumber].reverbMixNode.disconnect();
                    currentPlaying[sampleNumber].reverbMixNode = null;
                }
                
                if (currentPlaying[sampleNumber].wetPathNode) {
                    currentPlaying[sampleNumber].wetPathNode.disconnect();
                    currentPlaying[sampleNumber].wetPathNode = null;
                }
                
                if (currentPlaying[sampleNumber].dryPathNode) {
                    currentPlaying[sampleNumber].dryPathNode.disconnect();
                    currentPlaying[sampleNumber].dryPathNode = null;
                }
                
                if (currentPlaying[sampleNumber].outputNode) {
                    currentPlaying[sampleNumber].outputNode.disconnect();
                    currentPlaying[sampleNumber].outputNode = null;
                }
                
                if (currentPlaying[sampleNumber].eqLowNode) {
                    currentPlaying[sampleNumber].eqLowNode.disconnect();
                    currentPlaying[sampleNumber].eqLowNode = null;
                }
                
                if (currentPlaying[sampleNumber].eqLowMidNode) {
                    currentPlaying[sampleNumber].eqLowMidNode.disconnect();
                    currentPlaying[sampleNumber].eqLowMidNode = null;
                }
                
                if (currentPlaying[sampleNumber].eqMidNode) {
                    currentPlaying[sampleNumber].eqMidNode.disconnect();
                    currentPlaying[sampleNumber].eqMidNode = null;
                }
                
                if (currentPlaying[sampleNumber].eqHighMidNode) {
                    currentPlaying[sampleNumber].eqHighMidNode.disconnect();
                    currentPlaying[sampleNumber].eqHighMidNode = null;
                }
                
                if (currentPlaying[sampleNumber].eqHighNode) {
                    currentPlaying[sampleNumber].eqHighNode.disconnect();
                    currentPlaying[sampleNumber].eqHighNode = null;
                }
            } catch (e) {
                console.warn('Error stopping audio source:', e);
                currentPlaying[sampleNumber].source = null;
                currentPlaying[sampleNumber].gainNode = null;
            }
        }
        
        currentPlaying[sampleNumber].isScheduled = false;
        currentPlaying[sampleNumber].barGridAligned = false;
        // Don't set scheduledForNextBar to false here, as we want to allow replaying
    }
    
    // Update timing when tempo changes
    function updateTiming() {
        // Validate tempo before calculating beat duration
        if (!isFinite(tempo) || tempo <= 0) {
            console.error('Invalid tempo value:', tempo);
            return;
        }
        
        // Calculate effective tempo (regular + high tempo if applicable)
        const effectiveTempo = tempo + highTempo;
        
        beatDuration = 60 / effectiveTempo;
        barDuration = beatDuration * 4;
    }
    
    // Scheduler function to keep samples in sync
    function scheduler() {
        // Calculate the current time
        const currentTime = audioContext.currentTime;
        
        // Update the drum bar grid if we've passed the next bar time
        if (currentTime >= drumBarGrid.nextStartTime) {
            drumBarGrid.startTime = drumBarGrid.nextStartTime;
            drumBarGrid.nextStartTime = drumBarGrid.startTime + drumBarGrid.duration;
            
            // Synchronize the long sample bar grid with the drum bar grid
            synchronizeBarGrids();
        }
        
        // Update the long sample bar grid if we've passed the next bar time
        if (currentTime >= longSampleBarGrid.nextStartTime) {
            longSampleBarGrid.startTime = longSampleBarGrid.nextStartTime;
            longSampleBarGrid.nextStartTime = longSampleBarGrid.startTime + longSampleBarGrid.duration;
        }
        
        // Schedule the next scheduler call
        if (isPlaying) {
            timerId = setTimeout(scheduler, lookahead);
        }
    }
    
    // Tempo slider event
    tempoSlider.addEventListener('input', function() {
        tempo = parseInt(this.value);
        
        // Validate tempo
        if (!isFinite(tempo) || tempo <= 0) {
            console.error('Invalid tempo value from slider:', tempo);
            return;
        }
        
        // Update tempo display
        tempoDisplay.textContent = `${tempo} BPM`;
        
        // Enable or disable high tempo slider based on regular tempo value
        if (tempo >= 240) {
            highTempoSlider.disabled = false;
            highTempoSlider.style.opacity = '1';
        } else {
            highTempoSlider.disabled = true;
            highTempoSlider.style.opacity = '0.5';
            highTempo = 0;
            highTempoSlider.value = '240';
            highTempoDisplay.textContent = '240 BPM';
        }
        
        // Update timing
        updateTiming();
        
        // Update the drum bar grid
        updateDrumBarGrid(tempo);
        
        // Update all active drum samples with the new tempo
        for (let i = 1; i <= 100; i++) {
            if (currentPlaying[i].button && 
                currentPlaying[i].buffer && 
                currentPlaying[i].scheduledForNextBar &&
                currentPlaying[i].isActive &&
                currentPlaying[i].isScheduled &&
                !currentPlaying[i].isLongSample) {
                
                // Update the drum sample with new loop parameters
                updateDrumSampleLoop(i);
            }
        }
    });
    
    // High tempo slider event
    highTempoSlider.addEventListener('input', function() {
        highTempo = parseInt(this.value) - 240; // Subtract 240 since it starts from 240
        
        // Validate high tempo
        if (!isFinite(highTempo) || highTempo < 0) {
            console.error('Invalid high tempo value from slider:', highTempo);
            return;
        }
        
        // Update high tempo display
        highTempoDisplay.textContent = `${parseInt(this.value)} BPM`;
        
        // Update timing
        updateTiming();
        
        // Update the drum bar grid
        updateDrumBarGrid(tempo);
        
        // Update all active drum samples with the new tempo
        for (let i = 1; i <= 100; i++) {
            if (currentPlaying[i].button && 
                currentPlaying[i].buffer && 
                currentPlaying[i].scheduledForNextBar &&
                currentPlaying[i].isActive &&
                currentPlaying[i].isScheduled &&
                !currentPlaying[i].isLongSample) {
                
                // Update the drum sample with new loop parameters
                updateDrumSampleLoop(i);
            }
        }
    });
    
    // Long loop tempo slider event
    longLoopTempoSlider.addEventListener('input', function() {
        longLoopTempo = parseInt(this.value);
        
        // Validate long loop tempo
        if (!isFinite(longLoopTempo) || longLoopTempo <= 0) {
            console.error('Invalid long loop tempo value from slider:', longLoopTempo);
            return;
        }
        
        // Update long loop tempo display
        longLoopTempoDisplay.textContent = `${longLoopTempo} BPM`;
        
        // Update the long sample bar grid
        updateLongSampleBarGrid(longLoopTempo);
        
        // Synchronize the bar grids to ensure they stay aligned
        synchronizeBarGrids();
        
        // Update all active long samples with the new tempo
        for (let i = 1; i <= 100; i++) {
            if (currentPlaying[i].button && 
                currentPlaying[i].buffer && 
                currentPlaying[i].scheduledForNextBar &&
                currentPlaying[i].isActive &&
                currentPlaying[i].isScheduled &&
                currentPlaying[i].isLongSample) {
                
                // Update the long sample with new loop parameters
                updateLongSampleLoop(i);
            }
        }
    });
    
    // Play button event
    playButton.addEventListener('click', function() {
        if (!isPlaying) {
            // Start playing
            isPlaying = true;
            playButton.textContent = 'Stop';
            playButton.classList.add('playing');
            
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(e => console.error('Error resuming audio context:', e));
            }
            
            // Initialize bar grids
            const currentTime = audioContext.currentTime;
            
            // Initialize drum bar grid
            drumBarGrid.startTime = currentTime;
            drumBarGrid.duration = barDuration;
            drumBarGrid.nextStartTime = drumBarGrid.startTime + drumBarGrid.duration;
            
            // Initialize long sample bar grid
            longSampleBarGrid.startTime = currentTime;
            longSampleBarGrid.duration = (60 / longLoopTempo) * 4;
            longSampleBarGrid.nextStartTime = longSampleBarGrid.startTime + longSampleBarGrid.duration;
            
            // Start all active samples
            for (let i = 1; i <= 100; i++) {
                if (currentPlaying[i].button && 
                    currentPlaying[i].buffer && 
                    currentPlaying[i].scheduledForNextBar &&
                    currentPlaying[i].isActive) {
                    
                    // Cancel any existing timeout for this sample
                    if (currentPlaying[i].scheduledTimeout) {
                        clearTimeout(currentPlaying[i].scheduledTimeout);
                        currentPlaying[i].scheduledTimeout = null;
                    }
                    
                    // For both drum and long samples, schedule for the next bar
                    scheduleSampleForNextBar(i);
                }
            }
            
            // Start the scheduler
            scheduler();
        } else {
            // Stop playing
            isPlaying = false;
            playButton.textContent = 'Play';
            playButton.classList.remove('playing');
            
            // Stop the scheduler
            clearTimeout(timerId);
            
            // Stop all samples
            for (let i = 1; i <= 100; i++) {
                stopSample(i);
            }
        }
    });
});