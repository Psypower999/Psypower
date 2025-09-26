document.addEventListener('DOMContentLoaded', function() {
    // Create effects popup first, before any functions that might reference it
    const effectsPopup = document.createElement('div');
    effectsPopup.className = 'effects-popup';
    effectsPopup.style.display = 'none';
    
    // Add CSS for buttons without samples and slider styling
    const style = document.createElement('style');
    style.textContent = `
        .audio-button.active.no-sample {
            background-color: #333333 !important;
            color: white !important;
        }
        .audio-button.active.no-sample .loop-indicator {
            background-color: #555555 !important;
        }
        
        /* Dark grey slider styling */
        input[type="range"] {
            background-color: #444444 !important;
            height: 8px;
            border-radius: 4px;
            outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4CAF50;
            cursor: pointer;
        }
        
        input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4CAF50;
            cursor: pointer;
        }
        
        /* Custom indicator styling - changed to almost black */
        .custom-indicator {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 10px;
            height: 10px;
            background-color: #111111 !important; /* Changed to almost black */
            border-radius: 50%;
            z-index: 2;
            box-shadow: 0 0 3px rgba(0,0,0,0.5);
        }
        
        /* Piano roll styling */
        .piano-roll-container {
            display: flex;
            flex-direction: column;
            height: 200px;
            margin-top: 10px;
            position: relative;
            order: 10;
            overflow: visible;
        }
        
        .piano-roll-scrollable {
            display: flex;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
        }
        
        .piano-keys {
            width: 40px;
            background-color: #222;
            border-right: 1px solid #444;
            flex-shrink: 0;
        }
        
        .piano-key {
            height: 20px;
            border-bottom: 1px solid #444;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #aaa;
            position: relative;
            cursor: pointer;
        }
        
        .piano-key.white {
            background-color: #444;
            color: #ddd;
        }
        
        .piano-key.black {
            background-color: #222;
            color: #fff;
            height: 12px;
            margin: 4px 0;
            z-index: 2;
        }
        
        .piano-key:hover {
            background-color: #555;
        }
        
        .piano-key.active {
            background-color: #4CAF50;
        }
        
        .piano-roll-grid-container {
            flex-grow: 1;
            position: relative;
            overflow: visible;
            min-height: 100%;
        }
        
        .piano-roll-grid {
            position: relative;
            top: auto;
            left: auto;
            background-color: #333;
            display: grid;
            grid-template-columns: repeat(16, 1fr);
            grid-auto-rows: 20px;
            width: 100%;
            height: auto;
            min-height: 1680px;
        }
        
        .piano-roll-cell {
            border-right: 1px solid crimson; /* Changed to crimson */
            border-bottom: 1px solid crimson; /* Changed to crimson */
            cursor: pointer;
            position: relative;
        }
        
        .piano-roll-cell.bar-start {
            border-left: 2px solid black; /* Kept black */
        }
        
        .piano-roll-cell.bar-end {
            border-right: 2px solid black; /* Added for bar end */
        }
        
        .piano-roll-cell.active {
            background-color: #111;
            height: 20px;
            margin-top: auto;
            margin-bottom: auto;
        }
        
        .piano-roll-controls {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            color: white; /* Added for white text color */
        }
        
        .piano-roll-sound-source {
            display: flex;
            align-items: center;
        }
        
        .piano-roll-sound-source label {
            margin-right: 10px;
            color: white; /* Added for white text color */
        }
        
        .piano-roll-sound-source select {
            color: white; /* Added for white text color */
            background-color: #333;
            border: 1px solid #555;
            padding: 5px;
        }
        
        .piano-roll-preview-controls {
            display: flex;
            gap: 10px;
        }
        
        .piano-roll-preview-controls button {
            color: white; /* Added for white text color */
            background-color: #4CAF50;
            border: none;
            padding: 5px  10px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .piano-roll-preview-controls button:hover {
            background-color: #45a049;
        }
        
        .piano-roll-clear-btn {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .piano-roll-clear-btn:hover {
            background-color: #d32f2f;
        }
        
        /* Piano roll visualizer styling */
        .piano-roll-visualizer-container {
            height: 100px;
            background-color: #111;
            border: 1px solid #333;
            border-radius: 4px;
            margin: 10px 0;
            position: relative;
            overflow: hidden;
        }
        
        .piano-roll-visualizer {
            width: 100%;
            height: 100%;
        }
        
        /* Sample selection popup styling */
        .sample-selection-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #222;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 20px;
            z-index: 1001;
            width: 500px;
            max-width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
            display: none;
        }
        
        .sample-selection-popup h3 {
            margin-top: 0;
            color: #fff;
        }
        
        .sample-selection-popup .popup-content {
            margin-bottom: 20px;
        }
        
        .sample-selection-popup .popup-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .sample-selection-popup button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .sample-selection-popup .popup-close-btn {
            background-color: #555;
            color: white;
        }
        
        .sample-selection-popup .popup-accept-btn {
            background-color: #4CAF50;
            color: white;
        }
        
        .sample-selection-popup .popup-close-btn:hover {
            background-color: #444;
        }
        
        .sample-selection-popup .popup-accept-btn:hover {
            background-color: #45a049;
        }
        
        .sample-waveform-container {
            height: 150px;
            background-color: #333;
            border: 1px solid #444;
            border-radius: 4px;
            position: relative;
            margin: 15px 0;
            overflow: hidden;
        }
        
        .sample-waveform {
            width: 100%;
            height: 100%;
        }
        
        .sample-selection-range {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        
        .sample-selection-range input {
            flex-grow: 1;
            margin: 0 10px;
        }
        
        .sample-selection-values {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #aaa;
        }
        
        /* Piano roll filter controls styling - MODIFIED */
        .piano-roll-filters {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #444;
        }
        
        .piano-roll-filters h4 {
            margin-bottom: 10px;
            color: #fff;
        }
        
        .filter-control {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .filter-control label {
            width: 100px;
            font-size: 12px;
            color: #aaa;
        }
        
        .filter-control input {
            flex-grow: 1;
            margin-right: 10px;
        }
        
        .filter-control span {
            width: 50px;
            text-align: right;
            font-size: 12px;
            color: #aaa;
        }
        
        /* Enhanced filter controls styling - MOBILE FIX */
        .enhanced-filter-controls {
            display: grid;
            grid-template-columns: 1fr; /* Changed to single column for all devices */
            gap: 15px;
            margin-top: 10px;
        }
        
        @media (min-width: 768px) {
            .enhanced-filter-controls {
                grid-template-columns: 1fr 1fr; /* Two columns for larger screens */
            }
        }
        
        .filter-group {
            background-color: #2a2a2a;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #444;
        }
        
        .filter-group h5 {
            margin: 0 0 8px 0;
            color: #4CAF50;
            font-size: 14px;
        }
        
        .filter-group .filter-control {
            margin-bottom: 5px;
        }
        
        .filter-group .filter-control:last-child {
            margin-bottom: 0;
        }
        
        /* Loading indicator for piano roll rendering */
        .loading-indicator {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .loading-indicator .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 3px solid #4CAF50;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Toggle switch for piano roll section */
        .piano-roll-toggle-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .piano-roll-toggle-container h4 {
            margin: 0;
        }
        
        /* The switch - the box around the slider */
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        /* Hide default HTML checkbox */
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        /* The slider */
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #444;
            transition: .4s;
            border-radius: 24px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #4CAF50;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        /* Piano roll content - hidden by default */
        .piano-roll-content {
            display: none;
        }
        
        .piano-roll-content.visible {
            display: block;
        }
        
        /* Recording button styles */
        .microphone-record-btn {
            background-color: #d68100ff !important; /* Orange */
            color: black !important;
            padding: 3px;
        }
        
        .microphone-save-btn {
            background-color: #deae12ff !important; /* Dull yellow */
            color: black !important;
            padding: 3px;
        }
        
        .microphone-download-btn {
            background-color: #4ca427ff !important; /* Dull green */
            color: black !important;
            padding: 3px;
        }
        
        .microphone-delete-btn {
            background-color: #ff3f31ff !important; /* Red */
            color: black !important;
            padding: 3px;
        }
    `;
    document.head.appendChild(style);
    
    // Variable to store recorded blob
    let recordedBlob = null;
    
    // Object to store recorded blobs per sample
    const recordedBlobs = {};
    
    // Object to store upload status per sample
    const uploadStatusPerSample = {};
    
    // Object to store record status per sample
    const recordStatusPerSample = {};
    
    // Object to store uploaded file names per sample
    const uploadedFileNames = {};
    
    // Piano roll variables
    let pianoRollData = {}; // Store piano roll data for each sample
    let isPreviewingPianoRoll = false;
    let pianoRollPreviewNodes = {}; // Store audio nodes for preview
    let currentPianoRollSample = null;
    let pianoRollLoopInterval = null; // For continuous looping
    
    // Piano roll filter nodes
    let pianoRollFilterNodes = {
        // Enhanced filters
        lowShelf: null,
        highShelf: null,
        peaking1: null,
        peaking2: null,
        peaking3: null,
        // Delay filters
        delay: null,
        delayFeedback: null
    };
    
    // Piano roll visualizer variables
    let pianoRollVisualizer = null;
    let pianoRollVisualizerCtx = null;
    let pianoRollVisualizerAnalyzer = null;
    let pianoRollVisualizerAnimationId = null;
    let pianoRollVisualizerHistory = [];
    const pianoRollVisualizerHistorySize = 100;
    
    // Sample selection popup variables
    let sampleSelectionPopup = null;
    let currentSampleForSelection = null;
    let sampleSelectionStart = 0;
    let sampleSelectionEnd = 0;
    
    // Function to update the viewport height
    function updateViewportHeight() {
        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Update grid size to maintain square aspect ratio
        updateGridSize();
    }

    // Function to update grid size to maintain square aspect ratio
    function updateGridSize() {
        const buttonGrid = document.getElementById('buttonGrid');
        const gridPanel = document.querySelector('.grid-panel');
        
        if (!buttonGrid || !gridPanel) return;
        
        // Get container dimensions
        const containerWidth = gridPanel.offsetWidth;
        const containerHeight = gridPanel.offsetHeight;
        
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
    const recordButton = document.getElementById('recordButton');
    const saveButton = document.getElementById('saveButton');
    const gridPanel = document.querySelector('.grid-panel');
    
    // Log any missing elements
    if (!buttonGrid) console.error('buttonGrid element not found');
    if (!tempoSlider) console.error('tempoSlider element not found');
    if (!tempoDisplay) console.error('tempoDisplay element not found');
    if (!playButton) console.error('playButton element not found');
    if (!recordButton) console.error('recordButton element not found');
    if (!saveButton) console.error('saveButton element not found');
    if (!gridPanel) console.error('gridPanel element not found');
    
    // Only proceed if all required elements exist
    if (!buttonGrid || !tempoSlider || !tempoDisplay || !playButton || !recordButton || !saveButton || !gridPanel) {
        console.error('One or more required elements are missing');
        return;
    }
    
    // Ensure grid panel is visible
    gridPanel.style.display = 'flex';
    gridPanel.style.visibility = 'visible';
    
    // Create sample selection popup
    sampleSelectionPopup = document.createElement('div');
    sampleSelectionPopup.className = 'sample-selection-popup';
    sampleSelectionPopup.innerHTML = `
        <div class="popup-header">
            <h3>Select Sample Range</h3>
            <button class="popup-close-btn">Close</button>
        </div>
        <div class="popup-content">
            <div class="sample-waveform-container">
                <canvas class="sample-waveform" id="sample-selection-waveform"></canvas>
            </div>
            <div class="sample-selection-range">
                <label>Start:</label>
                <input type="range" id="sample-selection-start" min="0" max="100" value="0">
                <label>End:</label>
                <input type="range" id="sample-selection-end" min="0" max="100" value="100">
            </div>
            <div class="sample-selection-values">
                <span id="sample-selection-start-value">0.00s</span>
                <span id="sample-selection-end-value">0.00s</span>
            </div>
        </div>
        <div class="popup-footer">
            <button class="popup-close-btn">Close</button>
            <button class="popup-accept-btn">Accept</button>
        </div>
    `;
    document.body.appendChild(sampleSelectionPopup);
    
    // Set up event listeners for sample selection popup
    setupSampleSelectionPopupEventListeners();
    
    // Function to set up event listeners for sample selection popup
    function setupSampleSelectionPopupEventListeners() {
        // Close buttons
        const closeButtons = sampleSelectionPopup.querySelectorAll('.popup-close-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                sampleSelectionPopup.style.display = 'none';
            });
        });
        
        // Accept button
        const acceptButton = sampleSelectionPopup.querySelector('.popup-accept-btn');
        acceptButton.addEventListener('click', function() {
            if (!currentSampleForSelection) return;
            
            // Update sample range in piano roll data
            const data = pianoRollData[currentSampleForSelection];
            data.sampleRange = {
                start: sampleSelectionStart,
                end: sampleSelectionEnd
            };
            
            // Close popup
            sampleSelectionPopup.style.display = 'none';
        });
        
        // Range sliders
        const startSlider = document.getElementById('sample-selection-start');
        const endSlider = document.getElementById('sample-selection-end');
        
        startSlider.addEventListener('input', function() {
            sampleSelectionStart = parseInt(this.value);
            
            // Ensure start is not greater than end
            if (sampleSelectionStart > sampleSelectionEnd) {
                sampleSelectionStart = sampleSelectionEnd;
                this.value = sampleSelectionStart;
            }
            
            updateSampleSelectionDisplay();
            drawSampleWaveform();
        });
        
        endSlider.addEventListener('input', function() {
            sampleSelectionEnd = parseInt(this.value);
            
            // Ensure end is not less than start
            if (sampleSelectionEnd < sampleSelectionStart) {
                sampleSelectionEnd = sampleSelectionStart;
                this.value = sampleSelectionEnd;
            }
            
            updateSampleSelectionDisplay();
            drawSampleWaveform();
        });
    }
    
    // Function to update sample selection display
    function updateSampleSelectionDisplay() {
        if (!currentSampleForSelection) return;
        
        const sample = currentPlaying[currentSampleForSelection];
        
        if (!sample.buffer) return;
        
        const bufferDuration = sample.buffer.duration;
        const startTime = bufferDuration * (sampleSelectionStart / 100);
        const endTime = bufferDuration * (sampleSelectionEnd / 100);
        
        document.getElementById('sample-selection-start-value').textContent = startTime.toFixed(2) + 's';
        document.getElementById('sample-selection-end-value').textContent = endTime.toFixed(2) + 's';
    }
    
    // Function to draw sample waveform
    function drawSampleWaveform() {
        if (!currentSampleForSelection) return;
        
        const sample = currentPlaying[currentSampleForSelection];
        const canvas = document.getElementById('sample-selection-waveform');
        const ctx = canvas.getContext('2d');
        
        if (!sample.buffer) return;
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get waveform data
        const buffer = sample.buffer;
        const data = buffer.getChannelData(0); // Use first channel
        const step = Math.ceil(data.length / canvas.width);
        const amp = canvas.height / 2;
        
        // Draw waveform
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        
        for (let i = 0; i < canvas.width; i++) {
            let min = 1.0;
            let max = -1.0;
            
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            
            ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
        
        // Draw selection range
        const startPercent = sampleSelectionStart / 100;
        const endPercent = sampleSelectionEnd / 100;
        
        ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.fillRect(startPercent * canvas.width, 0, (endPercent - startPercent) * canvas.width, canvas.height);
        
        // Draw selection handles
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(startPercent * canvas.width - 2, 0, 4, canvas.height);
        ctx.fillRect(endPercent * canvas.width - 2, 0, 4, canvas.height);
    }
    
    // Audio context and timing variables
    let audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.error('Web Audio API is not supported in this browser');
        return;
    }
    
    // Create master output node for recording
    let masterOutputNode = audioContext.createGain();
    masterOutputNode.connect(audioContext.destination);
    
    let isPlaying = false;
    let isRecording = false;
    let tempo = 120;
    let highTempo = 0; // Additional tempo value from the second slider
    let longLoopTempo = 120; // Separate tempo for long loops
    let beatDuration = 60 / tempo;
    let barDuration = beatDuration * 4;
    let nextBarTime = 0;
    let lookahead = 25.0;
    let scheduleAheadTime = 0.1;
    let timerId = null;
    
    // Recording variables
    let mediaRecorder;
    let recordedChunks = [];
    let recordingStartTime;
    let recordingDuration = 0;
    let recordingDestination = null; // Store recording destination
    
    // Microphone recording variables
    let microphoneMediaRecorder = null;
    let microphoneMediaStream = null;
    let microphoneRecordedChunks = [];
    let isMicrophoneRecording = false;
    
    // Master clock variables for synchronization
    let masterStartTime = 0; // When the master clock started (audio context time)
    let masterCurrentBar = 0; // Current bar in the master timeline
    let masterTempo = tempo; // Current tempo of the master clock
    let tempoChangeTime = 0; // When the last tempo change happened
    let tempoHistory = []; // History of tempo changes for accurate timing
    
    // Unified master timeline for all samples
    let masterBarGrid = {
        startTime: 0,    // Audio context time when the current bar started
        duration: barDuration, // Duration of the current bar in seconds
        nextStartTime: barDuration // Audio context time when the next bar starts
    };
    
    // Default loop length (in bars)
    let loopLength = 1;
    
    // Default long sample loop length (in bars)
    let longLoopLength = 1;
    
    // Object to track currently playing audio for each button (1-100)
    const currentPlaying = {};
    
    // Set up the effects popup content with professional EQ and pitch controls
    effectsPopup.innerHTML = `
        <div class="popup-header">
            <h3>Effects for Sample <span id="popup-sample-number">1</span></h3>
            <button class="popup-close-btn">Close</button>
        </div>
        <div class="popup-content">
            <div class="effect-section">
                <h4>Sample</h4>
                <div class="sample-upload">
                    <label for="sample-upload"></label>
                    <input type="file" id="sample-upload" accept="audio/*,.wav,.mp3,.ogg,.aac,.flac,.m4a,.wma">
                    <div class="upload-status" id="upload-status"></div>
                </div>
                <div class="sample-record">
                    <label>Record:</label>
                    <div class="record-controls">
                        <button id="microphone-record-btn" class="microphone-record-btn">Start Recording</button>
                        <button id="microphone-save-btn" class="microphone-save-btn" style="display: none;">Save Recording</button>
                        <button id="microphone-download-btn" class="microphone-download-btn" style="display: none;">Download</button>
                        <button id="microphone-delete-btn" class="microphone-delete-btn" style="display: none;">Delete</button>
                    </div>
                    <div class="record-status" id="record-status"></div>
                </div>
            </div>
            <div class="effect-section">
            <hr color="purple">
            <br>
                <h4>Volume</h4>
                <div class="slider-container">
                    <label>Gain</label>
                    <input type="range" id="sample-volume" min="0" max="200" value="100" step="1">
                    <span id="sample-volume-value">100%</span>
                </div>
            </div>
            <div class="effect-section">
            <hr color="grey">
            <br>
                <h4>Speed</h4>
                <div class="speed-selector">
                    <label for="speed-select">Speed:</label>
                    <select id="speed-select">
                        <option value="0.1">0.1x</option>
                        <option value="0.25">0.25x</option>
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1" selected>1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>
                </div>
            </div>
            <div class="effect-section individual-tempo-section">
            <hr color="grey">
            <br>
                <h4>Individual Tempo</h4>
                <div class="slider-container">
                    <label>Tempo Multiplier</label>
                    <!-- Expanded range from 0.1-5.0 -->
                    <input type="range" id="individual-tempo" min="0.1" max="5.0" value="1.0" step="0.01">
                    <span id="individual-tempo-value">1.0</span>
                </div>
            </div>
            <div class="effect-section">
            <hr color="grey">
            <br>
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
            <hr color="grey">
            <br>
                <h4>Reverb</h4>
                <div class="slider-container">
                    <label>Decay (s)</label>
                    <input type="range" id="reverb-decay" min="0.1" max="5" value="0" step="0.1">
                    <span id="reverb-decay-value">0</span>
                </div>
                <div class="slider-container">
                    <label>Pre-delay (ms)</label>
                    <input type="range" id="reverb-predelay" min="0" max="100" value="0" step="1">
                    <span id="reverb-predelay-value">0</span>
                </div>
                <div class="slider-container">
                    <label>Diffusion (%)</label>
                    <input type="range" id="reverb-diffusion" min="0" max="100" value="50" step="1">
                    <span id="reverb-diffusion-value">50</span>
                </div>
                <div class="slider-container">
                    <label>Low Cut (Hz)</label>
                    <input type="range" id="reverb-lowcut" min="20" max="1000" value="20" step="10">
                    <span id="reverb-lowcut-value">20</span>
                </div>
                <div class="slider-container">
                    <label>High Cut (Hz)</label>
                    <input type="range" id="reverb-highcut" min="1000" max="20000" value="20000" step="100">
                    <span id="reverb-highcut-value">20000</span>
                </div>
                <div class="slider-container">
                    <label>Damping (%)</label>
                    <input type="range" id="reverb-damping" min="0" max="100" value="50" step="1">
                    <span id="reverb-damping-value">50</span>
                </div>
                <div class="slider-container">
                    <label>Wet/Dry (%)</label>
                    <input type="range" id="reverb-mix" min="0" max="100" value="0" step="1">
                    <span id="reverb-mix-value">0</span>
                </div>
            </div>
            <div class="effect-section">
            <hr color="grey">
            <br>
                <h4>Equalizer</h4>
                <div class="professional-eq-container">
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
            <div class="effect-section piano-roll-section">
            <hr color="brightgrey">
            <br>
                <div class="piano-roll-toggle-container">
                    <h4>Synth</h4>
                    <label class="switch">
                        <input type="checkbox" id="piano-roll-toggle">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="piano-roll-content">
                    <div class="piano-roll-container">
                        <div class="piano-roll-scrollable">
                            <div class="piano-keys">
                                <!-- Piano keys will be generated here -->
                            </div>
                            <div class="piano-roll-grid-container">
                                <div class="piano-roll-grid">
                                    <!-- Grid cells will be generated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="piano-roll-visualizer-container">
                        <canvas class="piano-roll-visualizer" id="piano-roll-visualizer"></canvas>
                    </div>
                    <div class="piano-roll-controls">
                        <div class="piano-roll-sound-source">
                            <label for="piano-roll-sound-source">Sound Source:</label>
                            <select id="piano-roll-sound-source">
                                <option value="piano">Grand Piano</option>
                                <option value="synth">Synth</option>
                                <option value="strings">Strings</option>
                                <option value="bass">Bass</option>
                                <option value="lead">Lead</option>
                                <option value="pad">Pad</option>
                                <option value="pluck">Pluck</option>
                                <option value="sample">Use Sample</option>
                            </select>
                        </div>
                        <div class="piano-roll-preview-controls">
                            <button id="piano-roll-preview-btn">Preview</button>
                            <button id="piano-roll-stop-btn">Stop</button>
                            <button id="piano-roll-clear-btn" class="piano-roll-clear-btn">Clear</button>
                        </div>
                    </div>
                    
                    <!-- MODIFIED Piano Roll Filter Controls -->
                    <div class="piano-roll-filters">
                        <h4>Synth Filters</h4>
                        
                        <div class="enhanced-filter-controls">
                            <div class="filter-group">
                                <h5>EQ Controls</h5>
                                <div class="filter-control">
                                    <label>Low Shelf:</label>
                                    <input type="range" id="piano-roll-lowshelf" min="-24" max="24" value="0" step="0.5">
                                    <span id="piano-roll-lowshelf-value">0dB</span>
                                </div>
                                <div class="filter-control">
                                    <label>Low Mid:</label>
                                    <input type="range" id="piano-roll-lowmid" min="-24" max="24" value="0" step="0.5">
                                    <span id="piano-roll-lowmid-value">0dB</span>
                                </div>
                                <div class="filter-control">
                                    <label>Mid:</label>
                                    <input type="range" id="piano-roll-mid" min="-24" max="24" value="0" step="0.5">
                                    <span id="piano-roll-mid-value">0dB</span>
                                </div>
                                <div class="filter-control">
                                    <label>High Mid:</label>
                                    <input type="range" id="piano-roll-highmid" min="-24" max="24" value="0" step="0.5">
                                    <span id="piano-roll-highmid-value">0dB</span>
                                </div>
                                <div class="filter-control">
                                    <label>High Shelf:</label>
                                    <input type="range" id="piano-roll-highshelf" min="-24" max="24" value="0" step="0.5">
                                    <span id="piano-roll-highshelf-value">0dB</span>
                                </div>
                            </div>
                            
                            <div class="filter-group">
                                <h5>Delay</h5>
                                <div class="filter-control">
                                    <label>Time (ms):</label>
                                    <input type="range" id="piano-roll-delay-time" min="0" max="1000" value="0" step="10">
                                    <span id="piano-roll-delay-time-value">0ms</span>
                                </div>
                                <div class="filter-control">
                                    <label>Feedback (%):</label>
                                    <input type="range" id="piano-roll-delay-feedback" min="0" max="100" value="0" step="1">
                                    <span id="piano-roll-delay-feedback-value">0%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Loading Indicator -->
            <div class="loading-indicator" id="piano-roll-loading">
                <div class="spinner"></div>
                <div>Rendering piano roll...</div>
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
    // Maximum number of EQ points
    const MAX_EQ_POINTS = 12;
    
    let isDraggingEqBand = false;
    let draggedPoint = null; // Track the actual point object being dragged
    let isCreatingNewPoint = false; // Flag to track if we're creating a new point
    
    // Waveform visualization variables
    let waveformAnalyzer = null;
    let waveformAnimationId = null;
    let waveformHistory = [];
    const waveformHistorySize = 100;
    
    // Variables to track effects state
    let originalEffects = null; // Stores the effects when popup was opened
    let temporaryEffects = null; // Stores the current temporary effects
    
    // Function to interpolate gain at a specific frequency using Catmull-Rom spline
    function interpolateGainSpline(frequency, sortedPoints) {
        // If no points, return 0
        if (sortedPoints.length === 0) return 0;
        
        // If only one point, return its gain
        if (sortedPoints.length === 1) return sortedPoints[0].gain;
        
        // Convert points to log domain for interpolation
        const logPoints = sortedPoints.map(p => ({
            x: Math.log10(p.frequency),
            y: p.gain
        }));
        
        const x = Math.log10(frequency);
        
        // If x is outside the range, return the first or last point
        if (x <= logPoints[0].x) return logPoints[0].y;
        if (x >= logPoints[logPoints.length - 1].x) return logPoints[logPoints.length - 1].y;
        
        // Find the segment that contains x
        let i = 0;
        for (i = 0; i < logPoints.length - 1; i++) {
            if (x >= logPoints[i].x && x <= logPoints[i + 1].x) {
                break;
            }
        }
        
        // Get 4 points: p0, p1, p2, p3
        const p0 = logPoints[Math.max(0, i - 1)];
        const p1 = logPoints[i];
        const p2 = logPoints[i + 1];
        const p3 = logPoints[Math.min(logPoints.length - 1, i + 2)];
        
        // Normalize t to [0,1] for the segment [p1, p2]
        const t = (x - p1.x) / (p2.x - p1.x);
        const t2 = t * t;
        const t3 = t2 * t;
        
        // Catmull-Rom formula
        return 0.5 * (
            (2 * p1.y) +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );
    }
    
    // Function to add a new EQ point at the specified position
    function addEQPoint(frequency, gain) {
        if (!temporaryEffects || !temporaryEffects.eq) return;
        if (temporaryEffects.eq.length >= MAX_EQ_POINTS) return;
        
        // Don't allow adding points at the fixed frequencies (20Hz and 20000Hz)
        if (frequency <= 20 || frequency >= 20000) return;
        
        // Determine the appropriate filter type based on frequency
        let type = 'peaking';
        if (frequency < 200) type = 'lowshelf';
        else if (frequency > 8000) type = 'highshelf';
        
        // Add new point
        const newPoint = {
            frequency: frequency,
            gain: gain,
            q: 1.0,
            type: type
        };
        
        temporaryEffects.eq.push(newPoint);
        
        // Sort points by frequency
        temporaryEffects.eq.sort((a, b) => a.frequency - b.frequency);
        
        // Update the EQ filters
        updateEQFiltersInRealTime();
        
        // Redraw the EQ visual
        drawEQVisual();
        
        return newPoint;
    }
    
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
            // First, disconnect the existing connection to the master output node
            if (sample.eqVeryHighNode) {
                sample.eqVeryHighNode.disconnect();
                // Connect through the analyzer and then to master output node
                sample.eqVeryHighNode.connect(waveformAnalyzer);
                waveformAnalyzer.connect(masterOutputNode);
            } else if (sample.outputNode) {
                sample.outputNode.disconnect();
                // Connect through the analyzer and then to master output node
                sample.outputNode.connect(waveformAnalyzer);
                waveformAnalyzer.connect(masterOutputNode);
            } else if (sample.gainNode) {
                // This is a fallback if effects aren't initialized yet
                sample.gainNode.disconnect();
                sample.gainNode.connect(waveformAnalyzer);
                waveformAnalyzer.connect(masterOutputNode);
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
        if (!eqCanvas || !eqCtx) return;
        
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
        
        // Draw EQ curve with smooth Catmull-Rom spline interpolation
        eqCtx.strokeStyle = '#4CAF50';
        eqCtx.lineWidth = 4;
        eqCtx.shadowColor = 'rgba(76, 175, 80, 0.8)';
        eqCtx.shadowBlur = 8;
        eqCtx.beginPath();
        
        // Get EQ points from temporary effects
        const eqPoints = temporaryEffects && temporaryEffects.eq ? temporaryEffects.eq : [];
        
        // Sort EQ points by frequency
        const sortedPoints = [...eqPoints].sort((a, b) => a.frequency - b.frequency);
        
        // Calculate curve points with smooth interpolation
        const points = [];
        const numPoints = 200;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = padding + (i * (width - 2 * padding) / numPoints);
            
            // Convert x position to frequency (logarithmic scale)
            const freq = 20 * Math.pow(20000 / 20, (x - padding) / (width - 2 * padding));
            
            // Calculate gain at this frequency using smooth spline interpolation
            let gain = interpolateGainSpline(freq, sortedPoints);
            
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
        
        // Draw EQ point control points with increased size
        for (let i = 0; i < eqPoints.length; i++) {
            const point = eqPoints[i];
            
            // Convert frequency to x position (logarithmic scale)
            const x = padding + (Math.log10(point.frequency / 20) / Math.log10(20000 / 20)) * (eqCanvas.width - 2 * padding);
            
            // Convert gain to y position
            const y = height / 2 - (point.gain / 24) * (height / 2 - padding);
            
            // Draw control point with glow
            // Use different color for fixed points
            if (point.fixed) {
                eqCtx.fillStyle = '#FFC107'; // Amber color for fixed points
                eqCtx.shadowColor = 'rgba(255, 193, 7, 0.8)';
            } else {
                eqCtx.fillStyle = point === draggedPoint ? '#FF5722' : '#4CAF50';
                eqCtx.shadowColor = point === draggedPoint ? 'rgba(255, 87, 34, 0.8)' : 'rgba(76, 175, 80, 0.8)';
            }
            
            eqCtx.shadowBlur = 15;
            eqCtx.beginPath();
            eqCtx.arc(x, y, 9, 0, Math.PI * 2);
            eqCtx.fill();
            
            // Draw white center
            eqCtx.fillStyle = '#fff';
            eqCtx.shadowBlur = 0;
            eqCtx.beginPath();
            eqCtx.arc(x, y, 6, 0, Math.PI * 2);
            eqCtx.fill();
            
            // Draw frequency label with background for better visibility
            eqCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            eqCtx.fillRect(x - 25, y + 20, 50, 15);
            eqCtx.fillStyle = '#fff';
            eqCtx.font = 'bold 10px Arial';
            eqCtx.textAlign = 'center';

            // Round the frequency and format appropriately
            let freqLabel;
            if (point.frequency < 1000) {
                // For frequencies below 1000Hz, round to nearest whole number
                freqLabel = `${Math.round(point.frequency)}Hz`;
            } else {
                // For frequencies 1000Hz and above, convert to kHz with one decimal place
                const kHzValue = point.frequency / 1000;
                // Check if it's a whole number when converted to kHz
                if (kHzValue === Math.round(kHzValue)) {
                    freqLabel = `${Math.round(kHzValue)}k`;
                } else {
                    freqLabel = `${kHzValue.toFixed(1)}k`;
                }
            }

            eqCtx.fillText(freqLabel, x, y + 30);
            
            // Draw gain label
            eqCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            eqCtx.fillRect(x - 25, y - 35, 50, 15);
            eqCtx.fillStyle = '#fff';
            eqCtx.fillText(`${point.gain > 0 ? '+' : ''}${point.gain.toFixed(1)}dB`, x, y - 25);
        }
    }
    
    // Function to draw the waveform
    function drawWaveform() {
        const width = eqCanvas.width;
        const height = eqCanvas.height;
        const padding = 20;
        
        // Create a vibrant gradient for the waveform
        const gradient = eqCtx.createLinearGradient(0, height - padding, 0, padding);
        gradient.addColorStop(0, 'rgba(28, 0, 212, 0.9)');
        gradient.addColorStop(0.1, 'rgba(0, 191, 255, 0.95)');
        gradient.addColorStop(0.3, 'rgba(0, 210, 154, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 196, 0, 0.85)');
        gradient.addColorStop(0.7, 'rgba(255, 0, 0, 0.85)');
        gradient.addColorStop(0.9, 'rgba(255, 0, 157, 0.85)');
        gradient.addColorStop(1, 'rgba(170, 0, 255, 0.85)');
        
        // Calculate the width of each time slice
        const sliceWidth = (width - 2 * padding) / waveformHistorySize;
        
        // Draw the waveform history with enhanced visibility
        for (let h = 0; h < waveformHistory.length; h++) {
            const dataArray = waveformHistory[h];
            const x = padding + h * sliceWidth;
            
            // Calculate the alpha based on position in history (newer = more opaque)
            const alpha = 0.4 + (h / waveformHistory.length) * 0.6; // Increased base alpha
            
            // Begin a new path for this time slice
            eqCtx.beginPath();
            eqCtx.moveTo(x, height - padding);
            
            // Create a more accurate frequency mapping
            const maxFreq = audioContext.sampleRate / 2; // Nyquist frequency
            const minLogFreq = Math.log10(20); // 20 Hz in log scale
            const maxLogFreq = Math.log10(maxFreq); // Nyquist frequency in log scale
            
            // Draw the frequency spectrum for this time slice with improved mapping
            for (let i = 0; i < dataArray.length; i++) {
                // Calculate frequency for this bin
                const freq = i * maxFreq / dataArray.length;
                
                // Map frequency to x position using logarithmic scale
                // This improved mapping prevents the flatline issue around 10kHz
                const logFreq = Math.log10(Math.max(20, freq)); // Ensure minimum frequency of 20Hz
                const normalizedLogFreq = (logFreq - minLogFreq) / (maxLogFreq - minLogFreq);
                const freqX = padding + normalizedLogFreq * (width - 2 * padding);
                
                // Only draw if within the visible range for this time slice
                if (freqX >= x && freqX <= x + sliceWidth) {
                    // Convert amplitude to y position with enhanced scaling
                    const amplitude = dataArray[i] / 255;
                    
                    // Apply improved scaling with a slight curve to make lower amplitudes more visible
                    const enhancedAmplitude = Math.pow(amplitude, 0.4); // Adjusted exponent for better visibility
                    const ampY = height - padding - (enhancedAmplitude * (height - 2 * padding));
                    
                    // Draw a line to this point
                    eqCtx.lineTo(freqX, ampY);
                }
            }
            
            // Close the path and fill
            eqCtx.lineTo(x + sliceWidth, height - padding);
            eqCtx.closePath();
            
            // Apply gradient with alpha
            eqCtx.globalAlpha = alpha;
            eqCtx.fillStyle = gradient;
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
            eqCtx.strokeStyle = 'rgba(96, 96, 96, 1)';
            eqCtx.lineWidth = 2;
            eqCtx.beginPath();
            
            // Use the same improved frequency mapping for the highlight line
            const maxFreq = audioContext.sampleRate / 2;
            const minLogFreq = Math.log10(20);
            const maxLogFreq = Math.log10(maxFreq);
            
            for (let i = 0; i < latestData.length; i++) {
                // Calculate frequency for this bin
                const freq = i * maxFreq / latestData.length;
                
                // Map frequency to x position using logarithmic scale
                const logFreq = Math.log10(Math.max(20, freq));
                const normalizedLogFreq = (logFreq - minLogFreq) / (maxLogFreq - minLogFreq);
                const x = padding + normalizedLogFreq * (width - 2 * padding);
                
                // Convert amplitude to y position with enhanced scaling
                const amplitude = latestData[i] / 255;
                const enhancedAmplitude = Math.pow(amplitude, 0.4);
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
    
    // Function to start dragging an EQ band
    function startDraggingEQBand(e) {
        if (!temporaryEffects || !temporaryEffects.eq) return;
        
        const rect = eqCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const padding = 20;
        const height = eqCanvas.height;
        
        // Check if we're clicking on an existing control point (increased size)
        for (let i = 0; i < temporaryEffects.eq.length; i++) {
            const point = temporaryEffects.eq[i];
            
            // Skip fixed points
            if (point.fixed) continue;
            
            // Convert frequency to x position (logarithmic scale)
            const pointX = padding + (Math.log10(point.frequency / 20) / Math.log10(20000 / 20)) * (eqCanvas.width - 2 * padding);
            
            // Convert gain to y position
            const pointY = height / 2 - (point.gain / 24) * (height / 2 - padding);
            
            // Check if click is within control point (increased from 6 to 9)
            const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
            if (distance <= 9) { // Changed from 6 to 9 (50% bigger)
                isDraggingEqBand = true;
                draggedPoint = point; // Store the point object, not index
                isCreatingNewPoint = false; // We're not creating a new point
                return;
            }
        }
        
        // If not clicking on an existing point, add a new one
        if (temporaryEffects.eq.length < MAX_EQ_POINTS) {
            // Calculate frequency from x position (logarithmic scale)
            const frequency = 20 * Math.pow(20000 / 20, (x - padding) / (eqCanvas.width - 2 * padding));
            
            // Don't allow adding points at the fixed frequencies (20Hz and 20000Hz)
            if (frequency <= 20 || frequency >= 20000) return;
            
            // Calculate gain from y position
            const gain = -(y - eqCanvas.height / 2) / (eqCanvas.height / 2 - padding) * 24;
            
            // Add the new point
            const newPoint = addEQPoint(frequency, gain);
            
            // Set the new point as being dragged
            isDraggingEqBand = true;
            draggedPoint = newPoint; // Store the point object
            isCreatingNewPoint = true; // We're creating a new point
        }
    }
    
    // Function to handle EQ touch start
    function handleEQTouchStart(e) {
        e.preventDefault();
        if (!temporaryEffects || !temporaryEffects.eq) return;
        
        const touch = e.touches[0];
        const rect = eqCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const padding = 20;
        const height = eqCanvas.height;
        
        // Check if we're touching on an existing control point (increased size)
        for (let i = 0; i < temporaryEffects.eq.length; i++) {
            const point = temporaryEffects.eq[i];
            
            // Skip fixed points
            if (point.fixed) continue;
            
            // Convert frequency to x position (logarithmic scale)
            const pointX = padding + (Math.log10(point.frequency / 20) / Math.log10(20000 / 20)) * (eqCanvas.width - 2 * padding);
            
            // Convert gain to y position
            const pointY = height / 2 - (point.gain / 24) * (height / 2 - padding);
            
            // Check if touch is within control point (increased from 6 to 9)
            const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
            if (distance <= 9) { // Changed from 6 to 9 (50% bigger)
                isDraggingEqBand = true;
                draggedPoint = point; // Store the point object, not index
                isCreatingNewPoint = false; // We're not creating a new point
                return;
            }
        }
        
        // If not touching on an existing point, add a new one
        if (temporaryEffects.eq.length < MAX_EQ_POINTS) {
            // Calculate frequency from x position (logarithmic scale)
            const frequency = 20 * Math.pow(20000 / 20, (x - padding) / (eqCanvas.width - 2 * padding));
            
            // Don't allow adding points at the fixed frequencies (20Hz and 20000Hz)
            if (frequency <= 20 || frequency >= 20000) return;
            
            // Calculate gain from y position
            const gain = -(y - height / 2) / (height / 2 - padding) * 24;
            
            // Add the new point
            const newPoint = addEQPoint(frequency, gain);
            
            // Set the new point as being dragged
            isDraggingEqBand = true;
            draggedPoint = newPoint; // Store the point object
            isCreatingNewPoint = true; // We're creating a new point
        }
    }
    
    // Function to handle EQ touch move
    function handleEQTouchMove(e) {
        e.preventDefault();
        if (!isDraggingEqBand || !draggedPoint || !temporaryEffects || !temporaryEffects.eq) return;
        
        const touch = e.touches[0];
        const rect = eqCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const padding = 20;
        const height = eqCanvas.height;
        
        // Calculate gain from y position
        const gain = -(y - height / 2) / (height / 2 - padding) * 24;
        
        // Clamp gain to valid range
        const clampedGain = Math.max(-24, Math.min(24, gain));
        
        // Calculate frequency from x position (logarithmic scale)
        const freq = 20 * Math.pow(20000 / 20, (x - padding) / (eqCanvas.width - 2 * padding));
        
        // Clamp frequency to audible range (20Hz to 20000Hz) without additional restrictions
        const clampedFreq = Math.max(20, Math.min(20000, freq));
        
        // Update point gain and frequency
        draggedPoint.gain = clampedGain;
        draggedPoint.frequency = clampedFreq;
        
        // Update EQ filters in real-time
        updateEQFiltersInRealTime();
        
        // Redraw EQ visual
        drawEQVisual();
    }
    
    // Function to drag an EQ band
    function dragEQBand(e) {
        if (!isDraggingEqBand || !draggedPoint || !temporaryEffects || !temporaryEffects.eq) return;
        
        const rect = eqCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const padding = 20;
        const height = eqCanvas.height;
        
        // Calculate gain from y position
        const gain = -(y - height / 2) / (height / 2 - padding) * 24;
        
        // Clamp gain to valid range
        const clampedGain = Math.max(-24, Math.min(24, gain));
        
        // Calculate frequency from x position (logarithmic scale)
        const freq = 20 * Math.pow(20000 / 20, (x - padding) / (eqCanvas.width - 2 * padding));
        
        // Clamp frequency to audible range (20Hz to 20000Hz) without additional restrictions
        const clampedFreq = Math.max(20, Math.min(20000, freq));
        
        // Update point gain and frequency
        draggedPoint.gain = clampedGain;
        draggedPoint.frequency = clampedFreq;
        
        // Update EQ filters in real-time
        updateEQFiltersInRealTime();
        
        // Redraw EQ visual
        drawEQVisual();
    }
    
    // Function to stop dragging an EQ band
    function stopDraggingEQBand() {
        isDraggingEqBand = false;
        draggedPoint = null;
        isCreatingNewPoint = false;
        drawEQVisual();
    }
    
    // Function to update EQ filters in real-time
    function updateEQFiltersInRealTime() {
        if (!currentSampleForPopup || !temporaryEffects || !temporaryEffects.eq) return;
        
        // Get the sample's EQ nodes
        const sample = currentPlaying[currentSampleForPopup];
        
        // Reset all EQ filters to default
        if (sample.eqLowNode) sample.eqLowNode.gain.value = 0;
        if (sample.eqLowMidNode) sample.eqLowMidNode.gain.value = 0;
        if (sample.eqMidNode) sample.eqMidNode.gain.value = 0;
        if (sample.eqHighMidNode) sample.eqHighMidNode.gain.value = 0;
        if (sample.eqHighMid2Node) sample.eqHighMid2Node.gain.value = 0;
        if (sample.eqHighNode) sample.eqHighNode.gain.value = 0;
        if (sample.eqVeryHighNode) sample.eqVeryHighNode.gain.value = 0;
        
        // Apply EQ points from the temporary effects
        const sortedEqPoints = [...temporaryEffects.eq].sort((a, b) => a.frequency - b.frequency);
        
        // Apply the first point to the low shelf
        if (sortedEqPoints[0] && sortedEqPoints[0].type === 'lowshelf') {
            if (sample.eqLowNode) {
                sample.eqLowNode.frequency.value = sortedEqPoints[0].frequency;
                sample.eqLowNode.gain.value = sortedEqPoints[0].gain;
            }
        }
        
        // Apply the last point to the high shelf
        if (sortedEqPoints[sortedEqPoints.length - 1] && sortedEqPoints[sortedEqPoints.length - 1].type === 'highshelf') {
            if (sample.eqHighNode) {
                sample.eqHighNode.frequency.value = sortedEqPoints[sortedEqPoints.length - 1].frequency;
                sample.eqHighNode.gain.value = sortedEqPoints[sortedEqPoints.length - 1].gain;
            }
        }
        
        // Apply peaking filters for points in between
        let peakingIndex = 0;
        for (let i = 0; i < sortedEqPoints.length; i++) {
            if (sortedEqPoints[i].type === 'peaking') {
                let filterNode;
                switch (peakingIndex) {
                    case 0: filterNode = sample.eqLowMidNode; break;
                    case 1: filterNode = sample.eqMidNode; break;
                    case 2: filterNode = sample.eqHighMidNode; break;
                    case 3: filterNode = sample.eqHighMid2Node; break;
                    default: break;
                }
                
                if (filterNode) {
                    filterNode.frequency.value = sortedEqPoints[i].frequency;
                    filterNode.gain.value = sortedEqPoints[i].gain;
                    filterNode.Q.value = sortedEqPoints[i].q || 1.0;
                    peakingIndex++;
                }
            }
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
    }
    
    // Function to update reverb in real-time
    function updateReverbInRealTime() {
        if (!currentSampleForPopup) return;
        
        const sample = currentPlaying[currentSampleForPopup];
        const reverbDecay = parseFloat(document.getElementById('reverb-decay').value);
        const reverbPredelay = parseFloat(document.getElementById('reverb-predelay').value);
        const reverbDiffusion = parseFloat(document.getElementById('reverb-diffusion').value);
        const reverbLowcut = parseFloat(document.getElementById('reverb-lowcut').value);
        const reverbHighcut = parseFloat(document.getElementById('reverb-highcut').value);
        const reverbDamping = parseFloat(document.getElementById('reverb-damping').value);
        const reverbMix = parseInt(document.getElementById('reverb-mix').value);
        
        // Always update the reverb mix node gain
        if (sample.reverbMixNode) {
            sample.reverbMixNode.gain.value = reverbMix / 100;
        }
        
        // Update the convolver if decay is greater than 0
        if (reverbDecay > 0) {
            // Re-create the convolver with new parameters
            const convolver = audioContext.createConvolver();
            const length = audioContext.sampleRate * reverbDecay;
            const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
            
            // Apply pre-delay
            const predelaySamples = audioContext.sampleRate * (reverbPredelay / 1000);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                
                // Create the impulse response with the new parameters
                for (let i = 0; i < length; i++) {
                    // Apply pre-delay
                    if (i < predelaySamples) {
                        channelData[i] = 0;
                    } else {
                        // Apply decay and diffusion
                        const decayFactor = Math.pow(1 - (i - predelaySamples) / (length - predelaySamples), 2);
                        const diffusionFactor = reverbDiffusion / 100;
                        
                        // Generate random noise for diffusion
                        channelData[i] = (Math.random() * 2 - 1) * decayFactor * diffusionFactor;
                        
                        // Apply damping (reduce high frequencies over time)
                        const dampingFactor = 1 - (reverbDamping / 100) * (i / length);
                        channelData[i] *= dampingFactor;
                    }
                }
                
                // Apply low cut and high cut filters
                // Note: This is a simplified approach. In a real implementation, you would use actual filters.
                // For now, we'll just adjust the frequency response in the frequency domain.
                // But since we're in the time domain, we'll skip this for now and rely on the EQ.
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
        } else {
            // If decay is 0, disconnect the convolver if it exists
            if (sample.reverbNode) {
                sample.reverbNode.disconnect();
                sample.reverbNode = null;
            }
        }
        
        // Update wet/dry mix
        updateWetDryMix();
    }
    
    // Function to update sample volume in real-time
    function updateSampleVolumeInRealTime() {
        if (!currentSampleForPopup) return;
        
        const sample = currentPlaying[currentSampleForPopup];
        const volume = parseInt(document.getElementById('sample-volume').value);
        
        // Update volume display
        document.getElementById('sample-volume-value').textContent = `${volume}%`;
        
        // Apply volume if sample is playing
        if (sample.gainNode && sample.isScheduled) {
            // Convert percentage to gain value (0-2.0 range)
            const gainValue = volume / 100;
            sample.gainNode.gain.value = gainValue;
        }
    }
    
    // Function to update speed in real-time while maintaining sync
    function updateSpeedInRealTime() {
        if (!currentSampleForPopup) return;
        
        const sample = currentPlaying[currentSampleForPopup];
        const speed = parseFloat(document.getElementById('speed-select').value);
        
        // Apply speed if sample is playing
        if (sample.source && sample.isScheduled) {
            let basePlaybackRate;
            
            if (sample.isLongSample) {
                // For long samples (61-100): use long loop tempo
                const longLoopBeatDuration = 60 / longLoopTempo;
                const longLoopBarDuration = longLoopBeatDuration * 4;
                const desiredLoopDuration = longLoopBarDuration * longLoopLength;
                basePlaybackRate = sample.loopDuration / desiredLoopDuration;
            } else {
                // For drum samples (1-60): use regular tempo
                const effectiveTempo = tempo + highTempo;
                const effectiveBeatDuration = 60 / effectiveTempo;
                const effectiveBarDuration = effectiveBeatDuration * 4;
                const desiredLoopDuration = effectiveBarDuration * loopLength;
                basePlaybackRate = sample.loopDuration / desiredLoopDuration;
            }
            
            // Get individual tempo from effects (only for long samples)
            let individualTempo = 1.0;
            if (sample.isLongSample && sample.effects && sample.effects.individualTempo) {
                individualTempo = sample.effects.individualTempo;
            }
            
            // Calculate new playback rate
            const newPlaybackRate = basePlaybackRate * individualTempo * speed;
            
            // Get current playback rate
            const currentPlaybackRate = sample.source.playbackRate.value;
            
            // Calculate elapsed time since the last loop start
            const currentTime = audioContext.currentTime;
            const elapsedTime = currentTime - sample.loopStartTime;
            
            // Calculate current position in the buffer (in seconds)
            const currentPosition = (elapsedTime * currentPlaybackRate) % sample.loopDuration;
            
            // Update the playback rate
            sample.source.playbackRate.value = newPlaybackRate;
            
            // Adjust the loop start time to maintain the current position
            sample.loopStartTime = currentTime - (currentPosition / newPlaybackRate);
            
            console.log(`Sample ${currentSampleForPopup} speed updated: new rate ${newPlaybackRate}, position ${currentPosition}`);
        }
    }
    
    // Function to update individual tempo in real-time
    function updateIndividualTempoInRealTime() {
        if (!currentSampleForPopup) return;
        
        const sample = currentPlaying[currentSampleForPopup];
        const individualTempo = parseFloat(document.getElementById('individual-tempo').value);
        
        // Apply individual tempo if sample is playing and it's a long sample
        if (sample.source && sample.isScheduled && sample.isLongSample) {
            // Calculate the base playback rate (without individual tempo)
            const longLoopBeatDuration = 60 / longLoopTempo;
            const longLoopBarDuration = longLoopBeatDuration * 4;
            const desiredLoopDuration = longLoopBarDuration * longLoopLength;
            const basePlaybackRate = sample.loopDuration / desiredLoopDuration;
            
            // Get speed from effects
            const speed = sample.effects ? sample.effects.speed || 1.0 : 1.0;
            
            // Calculate new playback rate
            const newPlaybackRate = basePlaybackRate * individualTempo * speed;
            
            // Get current playback rate
            const currentPlaybackRate = sample.source.playbackRate.value;
            
            // Calculate elapsed time since the last loop start
            const currentTime = audioContext.currentTime;
            const elapsedTime = currentTime - sample.loopStartTime;
            
            // Calculate current position in the buffer (in seconds)
            const currentPosition = (elapsedTime * currentPlaybackRate) % sample.loopDuration;
            
            // Update the playback rate
            sample.source.playbackRate.value = newPlaybackRate;
            
            // Adjust the loop start time to maintain the current position
            sample.loopStartTime = currentTime - (currentPosition / newPlaybackRate);
            
            console.log(`Sample ${currentSampleForPopup} individual tempo updated: new rate ${newPlaybackRate}, position ${currentPosition}`);
        }
    }
    
    // Function to initialize speed and individual tempo controls
    function initializeSpeedAndTempoControls() {
        const speedSelect = document.getElementById('speed-select');
        const individualTempoSlider = document.getElementById('individual-tempo');
        const individualTempoValue = document.getElementById('individual-tempo-value');
        const sampleVolumeSlider = document.getElementById('sample-volume');
        
        // Add event listeners for real-time updates
        speedSelect.addEventListener('change', function() {
            updateSpeedInRealTime();
            if (temporaryEffects) {
                temporaryEffects.speed = parseFloat(this.value);
            }
        });
        
        individualTempoSlider.addEventListener('input', function() {
            individualTempoValue.textContent = this.value;
            updateIndividualTempoInRealTime();
            if (temporaryEffects) {
                temporaryEffects.individualTempo = parseFloat(this.value);
            }
        });
        
        sampleVolumeSlider.addEventListener('input', function() {
            updateSampleVolumeInRealTime();
            if (temporaryEffects) {
                temporaryEffects.volume = parseInt(this.value);
            }
        });
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
        
        // Create reverb mix node with initial value from effects
        const reverbMix = audioContext.createGain();
        const effects = sample.effects || {};
        reverbMix.gain.value = (effects.reverb && effects.reverb.mix) ? effects.reverb.mix / 100 : 0;
        
        // Connect reverb
        lastEffectNode.connect(convolver);
        convolver.connect(reverbMix);
        reverbMix.connect(outputNode);
        
        // Store references
        sample.reverbNode = convolver;
        sample.reverbMixNode = reverbMix;
        
        // Get the sample's stored effects or create default ones
        const storedEffects = sample.effects || {
            delay: { time: 0, feedback: 0 },
            reverb: { 
                decay: 0, 
                mix: 0,
                predelay: 0,
                diffusion: 50,
                lowcut: 20,
                highcut: 20000,
                damping: 50
            },
            eq: [
                { frequency: 20, gain: 0, q: 1.0, type: 'lowshelf', fixed: true },
                { frequency: 20000, gain: 0, q: 1.0, type: 'highshelf', fixed: true }
            ],
            volume: 100,
            speed: 1.0,
            individualTempo: 1.0,
            pianoRoll: {
                notes: [],
                soundSource: 'piano',
                gridWidth: sample.isLongSample ? 32 : 16,
                gridHeight: 84, // 7 octaves (12*7)
                scrollX: 0,
                scrollY: 0,
                sampleRange: { start: 0, end: 100 },
                filters: {
                    // Enhanced filters
                    lowShelf: 0,
                    highShelf: 0,
                    lowMid: 0,
                    mid: 0,
                    highMid: 0,
                    // Delay filters
                    delay: {
                        time: 0,
                        feedback: 0
                    }
                },
                isEnabled: false // Track piano roll toggle state
            }
        };
        
        // Store piano roll data
        if (storedEffects.pianoRoll && !pianoRollData[sampleNumber]) {
            pianoRollData[sampleNumber] = JSON.parse(JSON.stringify(storedEffects.pianoRoll));
        }
        
        // Create EQ filters using the sample's stored effects
        const lowFilter = audioContext.createBiquadFilter();
        lowFilter.type = 'lowshelf';
        lowFilter.frequency.value = 60; // Default frequency
        lowFilter.gain.value = 0; // Default gain
        
        const lowMidFilter = audioContext.createBiquadFilter();
        lowMidFilter.type = 'peaking';
        lowMidFilter.frequency.value = 230; // Default frequency
        lowMidFilter.Q.value = 1.0;
        lowMidFilter.gain.value = 0; // Default gain
        
        const midFilter = audioContext.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = 910; // Default frequency
        midFilter.Q.value = 1.0;
        midFilter.gain.value = 0; // Default gain
        
        const highMidFilter = audioContext.createBiquadFilter();
        highMidFilter.type = 'peaking';
        highMidFilter.frequency.value = 3000; // Default frequency
        highMidFilter.Q.value = 1.0;
        highMidFilter.gain.value = 0; // Default gain
        
        const highMid2Filter = audioContext.createBiquadFilter();
        highMid2Filter.type = 'peaking';
        highMid2Filter.frequency.value = 6000; // Default frequency
        highMid2Filter.Q.value = 1.0;
        highMid2Filter.gain.value = 0; // Default gain
        
        const highFilter = audioContext.createBiquadFilter();
        highFilter.type = 'highshelf';
        highFilter.frequency.value = 10000; // Default frequency
        highFilter.gain.value = 0; // Default gain
        
        const veryHighFilter = audioContext.createBiquadFilter();
        veryHighFilter.type = 'highshelf';
        veryHighFilter.frequency.value = 14000; // Default frequency
        veryHighFilter.gain.value = 0; // Default gain
        
        // Connect EQ filters
        outputNode.connect(lowFilter);
        lowFilter.connect(lowMidFilter);
        lowMidFilter.connect(midFilter);
        midFilter.connect(highMidFilter);
        highMidFilter.connect(highMid2Filter);
        highMid2Filter.connect(highFilter);
        highFilter.connect(veryHighFilter);
        veryHighFilter.connect(masterOutputNode);
        
        // Store references
        sample.eqLowNode = lowFilter;
        sample.eqLowMidNode = lowMidFilter;
        sample.eqMidNode = midFilter;
        sample.eqHighMidNode = highMidFilter;
        sample.eqHighMid2Node = highMid2Filter;
        sample.eqHighNode = highFilter;
        sample.eqVeryHighNode = veryHighFilter;
        
        // Apply any existing effects settings
        if (sample.effects) {
            updateSampleEffects(sampleNumber);
        }
    }
    
    // Function to show effects popup
    function showEffectsPopup(sampleNumber, button) {
        currentSampleForPopup = sampleNumber;
        document.getElementById('popup-sample-number').textContent = sampleNumber;
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('piano-roll-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Get current effects settings for this sample
        const effects = currentPlaying[sampleNumber].effects || {
            delay: { time: 0, feedback: 0 },
            reverb: { 
                decay: 0, 
                mix: 0,
                predelay: 0,
                diffusion: 50,
                lowcut: 20,
                highcut: 20000,
                damping: 50
            },
            eq: [
                { frequency: 20, gain: 0, q: 1.0, type: 'lowshelf', fixed: true },
                { frequency: 20000, gain: 0, q: 1.0, type: 'highshelf', fixed: true }
            ],
            volume: 100,
            speed: 1.0,
            individualTempo: 1.0,
            pianoRoll: {
                notes: [],
                soundSource: 'piano',
                gridWidth: sampleNumber > 60 ? 32 : 16,
                gridHeight: 84, // 7 octaves (12*7)
                scrollX: 0,
                scrollY: 0,
                sampleRange: { start: 0, end: 100 },
                filters: {
                    // Enhanced filters
                    lowShelf: 0,
                    highShelf: 0,
                    lowMid: 0,
                    mid: 0,
                    highMid: 0,
                    // Delay filters
                    delay: {
                        time: 0,
                        feedback: 0
                    }
                },
                isEnabled: false // Track piano roll toggle state
            }
        };
        
        // Store the original effects (last saved state)
        originalEffects = JSON.parse(JSON.stringify(effects));
        // Create a copy for the current popup state
        temporaryEffects = JSON.parse(JSON.stringify(effects));
        
        // Load piano roll data
        if (effects.pianoRoll) {
            pianoRollData[sampleNumber] = JSON.parse(JSON.stringify(effects.pianoRoll));
            // Ensure isEnabled is present
            if (pianoRollData[sampleNumber].isEnabled === undefined) {
                pianoRollData[sampleNumber].isEnabled = false;
            }
        } else if (!pianoRollData[sampleNumber]) {
            pianoRollData[sampleNumber] = {
                notes: [],
                soundSource: 'piano',
                gridWidth: sampleNumber > 60 ? 32 : 16,
                gridHeight: 84, // 7 octaves (12*7)
                scrollX: 0,
                scrollY: 0,
                sampleRange: { start: 0, end: 100 },
                filters: {
                    // Enhanced filters
                    lowShelf: 0,
                    highShelf: 0,
                    lowMid: 0,
                    mid: 0,
                    highMid: 0,
                    // Delay filters
                    delay: {
                        time: 0,
                        feedback: 0
                    }
                },
                isEnabled: false // Track piano roll toggle state
            };
        }
        
        // Set slider values from temporaryEffects
        document.getElementById('sample-volume').value = temporaryEffects.volume || 100;
        document.getElementById('sample-volume-value').textContent = `${temporaryEffects.volume || 100}%`;
        
        document.getElementById('delay-time').value = temporaryEffects.delay.time;
        document.getElementById('delay-time-value').textContent = temporaryEffects.delay.time;
        document.getElementById('delay-feedback').value = temporaryEffects.delay.feedback;
        document.getElementById('delay-feedback-value').textContent = temporaryEffects.delay.feedback;
        
        document.getElementById('reverb-decay').value = temporaryEffects.reverb.decay;
        document.getElementById('reverb-decay-value').textContent = temporaryEffects.reverb.decay;
        document.getElementById('reverb-predelay').value = temporaryEffects.reverb.predelay;
        document.getElementById('reverb-predelay-value').textContent = temporaryEffects.reverb.predelay;
        document.getElementById('reverb-diffusion').value = temporaryEffects.reverb.diffusion;
        document.getElementById('reverb-diffusion-value').textContent = temporaryEffects.reverb.diffusion;
        document.getElementById('reverb-lowcut').value = temporaryEffects.reverb.lowcut;
        document.getElementById('reverb-lowcut-value').textContent = temporaryEffects.reverb.lowcut;
        document.getElementById('reverb-highcut').value = temporaryEffects.reverb.highcut;
        document.getElementById('reverb-highcut-value').textContent = temporaryEffects.reverb.highcut;
        document.getElementById('reverb-damping').value = temporaryEffects.reverb.damping;
        document.getElementById('reverb-damping-value').textContent = temporaryEffects.reverb.damping;
        document.getElementById('reverb-mix').value = temporaryEffects.reverb.mix;
        document.getElementById('reverb-mix-value').textContent = temporaryEffects.reverb.mix;
        
        // Set speed value
        document.getElementById('speed-select').value = temporaryEffects.speed || 1.0;
        
        // Set individual tempo value (only for long samples)
        if (sampleNumber > 60) {
            document.getElementById('individual-tempo').value = temporaryEffects.individualTempo || 1.0;
            document.getElementById('individual-tempo-value').textContent = temporaryEffects.individualTempo || 1.0;
        }
        
        // Set piano roll filter values
        if (temporaryEffects.pianoRoll && temporaryEffects.pianoRoll.filters) {
            // Enhanced filters
            document.getElementById('piano-roll-lowshelf').value = temporaryEffects.pianoRoll.filters.lowShelf || 0;
            document.getElementById('piano-roll-lowshelf-value').textContent = `${temporaryEffects.pianoRoll.filters.lowShelf || 0}dB`;
            document.getElementById('piano-roll-lowmid').value = temporaryEffects.pianoRoll.filters.lowMid || 0;
            document.getElementById('piano-roll-lowmid-value').textContent = `${temporaryEffects.pianoRoll.filters.lowMid || 0}dB`;
            document.getElementById('piano-roll-mid').value = temporaryEffects.pianoRoll.filters.mid || 0;
            document.getElementById('piano-roll-mid-value').textContent = `${temporaryEffects.pianoRoll.filters.mid || 0}dB`;
            document.getElementById('piano-roll-highmid').value = temporaryEffects.pianoRoll.filters.highMid || 0;
            document.getElementById('piano-roll-highmid-value').textContent = `${temporaryEffects.pianoRoll.filters.highMid || 0}dB`;
            document.getElementById('piano-roll-highshelf').value = temporaryEffects.pianoRoll.filters.highShelf || 0;
            document.getElementById('piano-roll-highshelf-value').textContent = `${temporaryEffects.pianoRoll.filters.highShelf || 0}dB`;
            
            // Delay filters
            document.getElementById('piano-roll-delay-time').value = temporaryEffects.pianoRoll.filters.delay.time || 0;
            document.getElementById('piano-roll-delay-time-value').textContent = `${temporaryEffects.pianoRoll.filters.delay.time || 0}ms`;
            document.getElementById('piano-roll-delay-feedback').value = temporaryEffects.pianoRoll.filters.delay.feedback || 0;
            document.getElementById('piano-roll-delay-feedback-value').textContent = `${temporaryEffects.pianoRoll.filters.delay.feedback || 0}%`;
        }
        
        // Position popup in the center of the screen
        const gridRect = gridPanel.getBoundingClientRect();
        const popupWidth = gridRect.width;
        const popupHeight = gridRect.height;
        
        effectsPopup.style.left = `${(window.innerWidth - popupWidth) / 2}px`;
        effectsPopup.style.top = `${(window.innerHeight - popupHeight) / 2}px`;
        effectsPopup.style.width = `${popupWidth}px`;
        effectsPopup.style.height = `${popupHeight}px`;
        
        // Show popup
        effectsPopup.style.display = 'flex';
        
        // Hide individual tempo section for drum samples (1-60)
        const individualTempoSection = document.querySelector('.individual-tempo-section');
        if (individualTempoSection) {
            if (sampleNumber <= 60) {
                individualTempoSection.style.display = 'none';
            } else {
                individualTempoSection.style.display = 'block';
            }
        }
        
        // Initialize visual EQ, speed/tempo controls, and piano roll after popup is shown
        setTimeout(() => {
            initVisualEQ();
            initializeSpeedAndTempoControls();
            
            // Set up piano roll toggle
            const pianoRollToggle = document.getElementById('piano-roll-toggle');
            const pianoRollContent = document.querySelector('.piano-roll-content');
            
            // Remove existing event listeners
            pianoRollToggle.replaceWith(pianoRollToggle.cloneNode(true));
            
            // Get the new toggle reference
            const newPianoRollToggle = document.getElementById('piano-roll-toggle');
            
            // Set the checked state based on stored data
            newPianoRollToggle.checked = pianoRollData[sampleNumber].isEnabled;
            
            // Set initial visibility of the piano roll content
            if (pianoRollData[sampleNumber].isEnabled) {
                pianoRollContent.classList.add('visible');
            } else {
                pianoRollContent.classList.remove('visible');
            }
            
            // Add event listener for toggle
            newPianoRollToggle.addEventListener('change', function() {
                if (this.checked) {
                    pianoRollContent.classList.add('visible');
                    pianoRollData[sampleNumber].isEnabled = true;
                    // Initialize piano roll when toggled on
                    initPianoRoll();
                    initPianoRollFilters();
                } else {
                    pianoRollContent.classList.remove('visible');
                    pianoRollData[sampleNumber].isEnabled = false;
                    // Stop piano roll preview when toggled off
                    if (isPreviewingPianoRoll) {
                        stopPianoRollPreview();
                    }
                }
            });
            
            // Set up status elements for this sample
            const uploadStatus = document.getElementById('upload-status');
            const recordStatus = document.getElementById('record-status');
            
            // Clear status text and set per-sample status
            uploadStatus.textContent = uploadStatusPerSample[sampleNumber] || '';
            recordStatus.textContent = recordStatusPerSample[sampleNumber] || '';
            
            // Set up microphone recording button
            const microphoneRecordBtn = document.getElementById('microphone-record-btn');
            if (microphoneRecordBtn) {
                // Remove any existing event listeners
                microphoneRecordBtn.replaceWith(microphoneRecordBtn.cloneNode(true));
                
                // Get the new button reference
                const newMicrophoneRecordBtn = document.getElementById('microphone-record-btn');
                
                // Add event listener
                newMicrophoneRecordBtn.addEventListener('click', function() {
                    handleMicrophoneRecording(sampleNumber);
                });
                
                // Update button text if there's a recorded blob
                if (recordedBlobs[sampleNumber]) {
                    newMicrophoneRecordBtn.textContent = 'Record New';
                } else {
                    newMicrophoneRecordBtn.textContent = 'Start Recording';
                }
            }
            
            // Set up microphone save button
            const microphoneSaveBtn = document.getElementById('microphone-save-btn');
            if (microphoneSaveBtn) {
                // Remove any existing event listeners
                microphoneSaveBtn.replaceWith(microphoneSaveBtn.cloneNode(true));
                
                // Get the new button reference
                const newMicrophoneSaveBtn = document.getElementById('microphone-save-btn');
                
                // Add event listener
                newMicrophoneSaveBtn.addEventListener('click', function() {
                    saveMicrophoneRecording(sampleNumber);
                });
                
                // Show save button if there's a recorded blob
                if (recordedBlobs[sampleNumber]) {
                    newMicrophoneSaveBtn.style.display = 'inline-block';
                } else {
                    newMicrophoneSaveBtn.style.display = 'none';
                }
            }
            
            // Set up microphone download button
            const microphoneDownloadBtn = document.getElementById('microphone-download-btn');
            if (microphoneDownloadBtn) {
                // Remove any existing event listeners
                microphoneDownloadBtn.replaceWith(microphoneDownloadBtn.cloneNode(true));
                
                // Get the new button reference
                const newMicrophoneDownloadBtn = document.getElementById('microphone-download-btn');
                
                // Add event listener
                newMicrophoneDownloadBtn.addEventListener('click', function() {
                    downloadMicrophoneRecording(sampleNumber);
                });
                
                // Show download button if there's a recorded blob
                if (recordedBlobs[sampleNumber]) {
                    newMicrophoneDownloadBtn.style.display = 'inline-block';
                } else {
                    newMicrophoneDownloadBtn.style.display = 'none';
                }
            }
            
            // Set up microphone delete button
            const microphoneDeleteBtn = document.getElementById('microphone-delete-btn');
            if (microphoneDeleteBtn) {
                // Remove any existing event listeners
                microphoneDeleteBtn.replaceWith(microphoneDeleteBtn.cloneNode(true));
                
                // Get the new button reference
                const newMicrophoneDeleteBtn = document.getElementById('microphone-delete-btn');
                
                // Add event listener
                newMicrophoneDeleteBtn.addEventListener('click', function() {
                    deleteMicrophoneRecording(sampleNumber);
                });
                
                // Show delete button if there's a recorded blob
                if (recordedBlobs[sampleNumber]) {
                    newMicrophoneDeleteBtn.style.display = 'inline-block';
                } else {
                    newMicrophoneDeleteBtn.style.display = 'none';
                }
            }
            
            // Initialize waveform visualization if sample is playing
            if (currentPlaying[sampleNumber] && currentPlaying[sampleNumber].isScheduled) {
                initWaveformVisualization();
            }
        }, 100);
    }
    
    // Function to format frequency display
    function formatFrequency(freq) {
        if (freq >= 1000) {
            return `${(freq / 1000).toFixed(1)}kHz`;
        }
        return `${freq}Hz`;
    }
    
    // Function to initialize piano roll filters
    function initPianoRollFilters() {
        if (!currentSampleForPopup) return;
        
        // Get filter controls
        // Enhanced filters
        const lowShelfSlider = document.getElementById('piano-roll-lowshelf');
        const lowMidSlider = document.getElementById('piano-roll-lowmid');
        const midSlider = document.getElementById('piano-roll-mid');
        const highMidSlider = document.getElementById('piano-roll-highmid');
        const highShelfSlider = document.getElementById('piano-roll-highshelf');
        
        // Delay filters
        const delayTimeSlider = document.getElementById('piano-roll-delay-time');
        const delayFeedbackSlider = document.getElementById('piano-roll-delay-feedback');
        
        // Get value displays
        // Enhanced value displays
        const lowShelfValue = document.getElementById('piano-roll-lowshelf-value');
        const lowMidValue = document.getElementById('piano-roll-lowmid-value');
        const midValue = document.getElementById('piano-roll-mid-value');
        const highMidValue = document.getElementById('piano-roll-highmid-value');
        const highShelfValue = document.getElementById('piano-roll-highshelf-value');
        
        // Delay value displays
        const delayTimeValue = document.getElementById('piano-roll-delay-time-value');
        const delayFeedbackValue = document.getElementById('piano-roll-delay-feedback-value');
        
        // Add event listeners
        // Enhanced filter event listeners
        lowShelfSlider.addEventListener('input', function() {
            lowShelfValue.textContent = `${this.value}dB`;
            updatePianoRollFilters();
        });
        
        lowMidSlider.addEventListener('input', function() {
            lowMidValue.textContent = `${this.value}dB`;
            updatePianoRollFilters();
        });
        
        midSlider.addEventListener('input', function() {
            midValue.textContent = `${this.value}dB`;
            updatePianoRollFilters();
        });
        
        highMidSlider.addEventListener('input', function() {
            highMidValue.textContent = `${this.value}dB`;
            updatePianoRollFilters();
        });
        
        highShelfSlider.addEventListener('input', function() {
            highShelfValue.textContent = `${this.value}dB`;
            updatePianoRollFilters();
        });
        
        // Delay filter event listeners
        delayTimeSlider.addEventListener('input', function() {
            delayTimeValue.textContent = `${this.value}ms`;
            updatePianoRollFilters();
        });
        
        delayFeedbackSlider.addEventListener('input', function() {
            delayFeedbackValue.textContent = `${this.value}%`;
            updatePianoRollFilters();
        });
    }
    
    // Function to update piano roll filters
    function updatePianoRollFilters() {
        if (!currentSampleForPopup || !pianoRollFilterNodes.lowShelf) return;
        
        // Get filter values
        // Enhanced filter values
        const lowShelf = parseFloat(document.getElementById('piano-roll-lowshelf').value);
        const lowMid = parseFloat(document.getElementById('piano-roll-lowmid').value);
        const mid = parseFloat(document.getElementById('piano-roll-mid').value);
        const highMid = parseFloat(document.getElementById('piano-roll-highmid').value);
        const highShelf = parseFloat(document.getElementById('piano-roll-highshelf').value);
        
        // Delay filter values
        const delayTime = parseInt(document.getElementById('piano-roll-delay-time').value);
        const delayFeedback = parseInt(document.getElementById('piano-roll-delay-feedback').value);
        
        // Update filter nodes
        // Update enhanced filter nodes
        if (pianoRollFilterNodes.lowShelf) {
            pianoRollFilterNodes.lowShelf.gain.value = lowShelf;
        }
        if (pianoRollFilterNodes.lowMid) {
            pianoRollFilterNodes.lowMid.gain.value = lowMid;
        }
        if (pianoRollFilterNodes.mid) {
            pianoRollFilterNodes.mid.gain.value = mid;
        }
        if (pianoRollFilterNodes.highMid) {
            pianoRollFilterNodes.highMid.gain.value = highMid;
        }
        if (pianoRollFilterNodes.highShelf) {
            pianoRollFilterNodes.highShelf.gain.value = highShelf;
        }
        
        // Update delay filter nodes
        if (pianoRollFilterNodes.delay) {
            pianoRollFilterNodes.delay.delayTime.value = delayTime / 1000;
        }
        if (pianoRollFilterNodes.delayFeedback) {
            pianoRollFilterNodes.delayFeedback.gain.value = delayFeedback / 100;
        }
        
        // Store filter values in piano roll data
        if (pianoRollData[currentSampleForPopup]) {
            if (!pianoRollData[currentSampleForPopup].filters) {
                pianoRollData[currentSampleForPopup].filters = {};
            }
            // Enhanced filters
            pianoRollData[currentSampleForPopup].filters.lowShelf = lowShelf;
            pianoRollData[currentSampleForPopup].filters.lowMid = lowMid;
            pianoRollData[currentSampleForPopup].filters.mid = mid;
            pianoRollData[currentSampleForPopup].filters.highMid = highMid;
            pianoRollData[currentSampleForPopup].filters.highShelf = highShelf;
            
            // Delay filters
            pianoRollData[currentSampleForPopup].filters.delay = {
                time: delayTime,
                feedback: delayFeedback
            };
        }
    }
    
    // Function to handle microphone recording
    function handleMicrophoneRecording(sampleNumber) {
        const microphoneRecordBtn = document.getElementById('microphone-record-btn');
        const microphoneSaveBtn = document.getElementById('microphone-save-btn');
        const microphoneDownloadBtn = document.getElementById('microphone-download-btn');
        const microphoneDeleteBtn = document.getElementById('microphone-delete-btn');
        const recordStatus = document.getElementById('record-status');
        
        if (!isMicrophoneRecording) {
            // Start recording
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    microphoneMediaStream = stream;
                    microphoneMediaRecorder = new MediaRecorder(stream);
                    microphoneRecordedChunks = [];
                    
                    microphoneMediaRecorder.ondataavailable = function(event) {
                        if (event.data.size > 0) {
                            microphoneRecordedChunks.push(event.data);
                        }
                    };
                    
                    microphoneMediaRecorder.onstop = function() {
                        // Create a blob from the recorded chunks
                        const blob = new Blob(microphoneRecordedChunks, { type: 'audio/wav' });
                        recordedBlobs[sampleNumber] = blob; // Store per sample
                        
                        // Show save, download, and delete buttons
                        microphoneSaveBtn.style.display = 'inline-block';
                        microphoneDownloadBtn.style.display = 'inline-block';
                        microphoneDeleteBtn.style.display = 'inline-block';
                        
                        // Update record status for this sample
                        recordStatusPerSample[sampleNumber] = 'Recording complete!';
                        recordStatus.textContent = recordStatusPerSample[sampleNumber];
                        recordStatus.style.color = '#7a7a7aff';
                    };
                    
                    // Start recording
                    microphoneMediaRecorder.start();
                    isMicrophoneRecording = true;
                    
                    // Update UI
                    microphoneRecordBtn.textContent = 'Stop Recording';
                    microphoneRecordBtn.classList.add('recording');
                    
                    // Update record status for this sample
                    recordStatusPerSample[sampleNumber] = 'Recording...';
                    recordStatus.textContent = recordStatusPerSample[sampleNumber];
                    recordStatus.style.color = '#FF9800';
                })
                .catch(error => {
                    console.error('Error accessing microphone:', error);
                    
                    // Update record status for this sample
                    recordStatusPerSample[sampleNumber] = 'Error: Could not access microphone';
                    recordStatus.textContent = recordStatusPerSample[sampleNumber];
                    recordStatus.style.color = '#F44336';
                });
        } else {
            // Stop recording
            if (microphoneMediaRecorder && microphoneMediaRecorder.state !== 'inactive') {
                microphoneMediaRecorder.stop();
            }
            
            if (microphoneMediaStream) {
                microphoneMediaStream.getTracks().forEach(track => track.stop());
                microphoneMediaStream = null;
            }
            
            isMicrophoneRecording = false;
            
            // Update UI
            microphoneRecordBtn.textContent = 'Record New';
            microphoneRecordBtn.classList.remove('recording');
        }
    }
    
    // Function to save microphone recording to sample
    function saveMicrophoneRecording(sampleNumber) {
        const blob = recordedBlobs[sampleNumber];
        if (!blob) return;
        
        const recordStatus = document.getElementById('record-status');
        const microphoneSaveBtn = document.getElementById('microphone-save-btn');
        
        // Update the sample's buffer
        const fileReader = new FileReader();
        fileReader.onload = function() {
            audioContext.decodeAudioData(fileReader.result)
                .then(buffer => {
                    currentPlaying[sampleNumber].buffer = buffer;
                    currentPlaying[sampleNumber].loopDuration = buffer.duration;
                    currentPlaying[sampleNumber].bufferSampleNumber = sampleNumber;
                    currentPlaying[sampleNumber].isCustomSample = true;
                    
                    // Update the button to indicate it's a custom sample
                    const button = currentPlaying[sampleNumber].button;
                    if (button) {
                        // Add custom indicator
                        addCustomIndicator(button);
                        
                        // Remove no-sample class if it exists
                        button.classList.remove('no-sample');
                    }
                    
                    // If the sample is currently playing, restart it with the new buffer
                    if (currentPlaying[sampleNumber].isScheduled && 
                        currentPlaying[sampleNumber].isActive) {
                        
                        // Stop the current sample
                        stopSample(sampleNumber);
                        
                        // Restart it with the new buffer
                        currentPlaying[sampleNumber].scheduledForNextBar = true;
                        scheduleSampleForNextBar(sampleNumber);
                    }
                    
                    // Update record status for this sample
                    recordStatusPerSample[sampleNumber] = 'Recording saved successfully!';
                    recordStatus.textContent = recordStatusPerSample[sampleNumber];
                    recordStatus.style.color = '#4CAF50';
                })
                .catch(error => {
                    console.error('Error decoding audio data:', error);
                    
                    // Update record status for this sample
                    recordStatusPerSample[sampleNumber] = 'Error: Invalid audio data';
                    recordStatus.textContent = recordStatusPerSample[sampleNumber];
                    recordStatus.style.color = '#F44336';
                });
        };
        fileReader.readAsArrayBuffer(blob);
    }
    
    // Function to add custom indicator to button
    function addCustomIndicator(button) {
        let customIndicator = button.querySelector('.custom-indicator');
        if (!customIndicator) {
            customIndicator = document.createElement('div');
            customIndicator.className = 'custom-indicator';
            button.appendChild(customIndicator);
        }
        customIndicator.style.display = 'block';
    }
    
    // Function to download microphone recording
    function downloadMicrophoneRecording(sampleNumber) {
        const blob = recordedBlobs[sampleNumber];
        if (!blob) return;
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create a download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `psychological-studio-recording-sample-${sampleNumber}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;
        a.click();
        
        // Revoke the URL to free up memory
        URL.revokeObjectURL(url);
    }
    
    // Function to delete microphone recording
    function deleteMicrophoneRecording(sampleNumber) {
        // Remove the blob for this sample
        delete recordedBlobs[sampleNumber];
        
        // If the sample is currently using a custom buffer (recorded or uploaded), revert to the original
        if (currentPlaying[sampleNumber] && currentPlaying[sampleNumber].isCustomSample) {
            // Revert to the original sample
            currentPlaying[sampleNumber].isCustomSample = false;
            currentPlaying[sampleNumber].buffer = null; // This will cause a reload of the original sample next time it's played
            currentPlaying[sampleNumber].bufferSampleNumber = null;
            
            // Remove the custom indicator
            const button = currentPlaying[sampleNumber].button;
            if (button) {
                const customIndicator = button.querySelector('.custom-indicator');
                if (customIndicator) {
                    customIndicator.style.display = 'none';
                }
                
                // Add no-sample class if button is active
                if (button.classList.contains('active')) {
                    button.classList.add('no-sample');
                }
            }
            
            // If the sample is currently playing, stop it
            if (currentPlaying[sampleNumber].isScheduled) {
                stopSample(sampleNumber);
                // If it was active, we want to restart it with the original buffer
                // We don't restart immediately since we're in the popup
            }
        }
        
        // Update UI: hide save, download, and delete buttons, reset record button
        const microphoneRecordBtn = document.getElementById('microphone-record-btn');
        const microphoneSaveBtn = document.getElementById('microphone-save-btn');
        const microphoneDownloadBtn = document.getElementById('microphone-download-btn');
        const microphoneDeleteBtn = document.getElementById('microphone-delete-btn');
        const recordStatus = document.getElementById('record-status');
        
        microphoneSaveBtn.style.display = 'none';
        microphoneDownloadBtn.style.display = 'none';
        microphoneDeleteBtn.style.display = 'none';
        microphoneRecordBtn.textContent = 'Start Recording';
        
        // Clear record status for this sample
        recordStatusPerSample[sampleNumber] = '';
        recordStatus.textContent = '';
    }
    
    // Function to hide effects popup
    function hideEffectsPopup() {
        // Stop any piano roll preview
        if (isPreviewingPianoRoll) {
            stopPianoRollPreview();
        }
        
        // Stop waveform animation
        stopWaveformAnimation();
        
        // Disconnect waveform analyzer and restore original connections
        if (waveformAnalyzer && currentSampleForPopup) {
            const sample = currentPlaying[currentSampleForPopup];
            
            // Disconnect the analyzer
            waveformAnalyzer.disconnect();
            
            // Restore the original connection
            if (sample.eqVeryHighNode) {
                sample.eqVeryHighNode.disconnect();
                sample.eqVeryHighNode.connect(masterOutputNode);
            } else if (sample.outputNode) {
                sample.outputNode.disconnect();
                sample.outputNode.connect(masterOutputNode);
            } else if (sample.gainNode) {
                sample.gainNode.disconnect();
                sample.gainNode.connect(masterOutputNode);
            }
            
            waveformAnalyzer = null;
        }
        
        // Stop microphone recording if active
        if (isMicrophoneRecording) {
            if (microphoneMediaRecorder && microphoneMediaRecorder.state !== 'inactive') {
                microphoneMediaRecorder.stop();
            }
            
            if (microphoneMediaStream) {
                microphoneMediaStream.getTracks().forEach(track => track.stop());
                microphoneMediaStream = null;
            }
            
            isMicrophoneRecording = false;
        }
        
        // Hide the effects popup
        effectsPopup.style.display = 'none';
        
        currentSampleForPopup = null;
        originalEffects = null;
        temporaryEffects = null;
    }
    
    // Function to reset effects to original settings
    function resetEffectsSettings() {
        if (!currentSampleForPopup) return;
        
        // Reset temporaryEffects to default with fixed points
        temporaryEffects = {
            delay: { time: 0, feedback: 0 },
            reverb: { 
                decay: 0, 
                mix: 0,
                predelay: 0,
                diffusion: 50,
                lowcut: 20,
                highcut: 20000,
                damping: 50
            },
            eq: [
                { frequency: 20, gain: 0, q: 1.0, type: 'lowshelf', fixed: true },
                { frequency: 20000, gain: 0, q: 1.0, type: 'highshelf', fixed: true }
            ],
            volume: 100,
            speed: 1.0,
            individualTempo: 1.0,
            pianoRoll: {
                notes: [],
                soundSource: 'piano',
                gridWidth: currentSampleForPopup > 60 ? 32 : 16,
                gridHeight: 84, // 7 octaves (12*7)
                scrollX: 0,
                scrollY: 0,
                sampleRange: { start: 0, end: 100 },
                filters: {
                    // Enhanced filters
                    lowShelf: 0,
                    highShelf: 0,
                    lowMid: 0,
                    mid: 0,
                    highMid: 0,
                    // Delay filters
                    delay: {
                        time: 0,
                        feedback: 0
                    }
                },
                isEnabled: false // Reset piano roll toggle state
            }
        };
        
        // Reset the popup controls to temporaryEffects
        document.getElementById('sample-volume').value = temporaryEffects.volume;
        document.getElementById('sample-volume-value').textContent = `${temporaryEffects.volume}%`;
        
        document.getElementById('delay-time').value = temporaryEffects.delay.time;
        document.getElementById('delay-time-value').textContent = temporaryEffects.delay.time;
        document.getElementById('delay-feedback').value = temporaryEffects.delay.feedback;
        document.getElementById('delay-feedback-value').textContent = temporaryEffects.delay.feedback;
        
        document.getElementById('reverb-decay').value = temporaryEffects.reverb.decay;
        document.getElementById('reverb-decay-value').textContent = temporaryEffects.reverb.decay;
        document.getElementById('reverb-predelay').value = temporaryEffects.reverb.predelay;
        document.getElementById('reverb-predelay-value').textContent = temporaryEffects.reverb.predelay;
        document.getElementById('reverb-diffusion').value = temporaryEffects.reverb.diffusion;
        document.getElementById('reverb-diffusion-value').textContent = temporaryEffects.reverb.diffusion;
        document.getElementById('reverb-lowcut').value = temporaryEffects.reverb.lowcut;
        document.getElementById('reverb-lowcut-value').textContent = temporaryEffects.reverb.lowcut;
        document.getElementById('reverb-highcut').value = temporaryEffects.reverb.highcut;
        document.getElementById('reverb-highcut-value').textContent = temporaryEffects.reverb.highcut;
        document.getElementById('reverb-damping').value = temporaryEffects.reverb.damping;
        document.getElementById('reverb-damping-value').textContent = temporaryEffects.reverb.damping;
        document.getElementById('reverb-mix').value = temporaryEffects.reverb.mix;
        document.getElementById('reverb-mix-value').textContent = temporaryEffects.reverb.mix;
        
        // Reset speed to default
        document.getElementById('speed-select').value = temporaryEffects.speed;
        
        // Reset individual tempo to default (only if it's visible)
        const individualTempoSection = document.querySelector('.individual-tempo-section');
        if (individualTempoSection && individualTempoSection.style.display !== 'none') {
            document.getElementById('individual-tempo').value = temporaryEffects.individualTempo;
            document.getElementById('individual-tempo-value').textContent = temporaryEffects.individualTempo;
        }
        
        // Reset piano roll toggle and content
        const pianoRollToggle = document.getElementById('piano-roll-toggle');
        const pianoRollContent = document.querySelector('.piano-roll-content');
        if (pianoRollToggle) {
            pianoRollToggle.checked = false;
        }
        if (pianoRollContent) {
            pianoRollContent.classList.remove('visible');
        }
        
        // Reset piano roll filters to default
        // Enhanced filters
        document.getElementById('piano-roll-lowshelf').value = temporaryEffects.pianoRoll.filters.lowShelf;
        document.getElementById('piano-roll-lowshelf-value').textContent = `${temporaryEffects.pianoRoll.filters.lowShelf}dB`;
        document.getElementById('piano-roll-lowmid').value = temporaryEffects.pianoRoll.filters.lowMid;
        document.getElementById('piano-roll-lowmid-value').textContent = `${temporaryEffects.pianoRoll.filters.lowMid}dB`;
        document.getElementById('piano-roll-mid').value = temporaryEffects.pianoRoll.filters.mid;
        document.getElementById('piano-roll-mid-value').textContent = `${temporaryEffects.pianoRoll.filters.mid}dB`;
        document.getElementById('piano-roll-highmid').value = temporaryEffects.pianoRoll.filters.highMid;
        document.getElementById('piano-roll-highmid-value').textContent = `${temporaryEffects.pianoRoll.filters.highMid}dB`;
        document.getElementById('piano-roll-highshelf').value = temporaryEffects.pianoRoll.filters.highShelf;
        document.getElementById('piano-roll-highshelf-value').textContent = `${temporaryEffects.pianoRoll.filters.highShelf}dB`;
        
        // Delay filters
        document.getElementById('piano-roll-delay-time').value = temporaryEffects.pianoRoll.filters.delay.time;
        document.getElementById('piano-roll-delay-time-value').textContent = `${temporaryEffects.pianoRoll.filters.delay.time}ms`;
        document.getElementById('piano-roll-delay-feedback').value = temporaryEffects.pianoRoll.filters.delay.feedback;
        document.getElementById('piano-roll-delay-feedback-value').textContent = `${temporaryEffects.pianoRoll.filters.delay.feedback}%`;
        
        // Reset all EQ filter gains to 0
        if (currentSampleForPopup) {
            const sample = currentPlaying[currentSampleForPopup];
            if (sample.eqLowNode) sample.eqLowNode.gain.value = 0;
            if (sample.eqLowMidNode) sample.eqLowMidNode.gain.value = 0;
            if (sample.eqMidNode) sample.eqMidNode.gain.value = 0;
            if (sample.eqHighMidNode) sample.eqHighMidNode.gain.value = 0;
            if (sample.eqHighMid2Node) sample.eqHighMid2Node.gain.value = 0;
            if (sample.eqHighNode) sample.eqHighNode.gain.value = 0;
            if (sample.eqVeryHighNode) sample.eqVeryHighNode.gain.value = 0;
        }
        
        // Update all effects in real-time
        updateSampleVolumeInRealTime();
        updateDelayInRealTime();
        updateReverbInRealTime();
        updateSpeedInRealTime();
        updateIndividualTempoInRealTime();
        
        // Redraw EQ visual
        drawEQVisual();
        
        // Reinitialize the piano roll
        initPianoRoll();
    }
    
    // Function to apply effects settings
    async function applyEffectsSettings() {
        if (!currentSampleForPopup) return;
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('piano-roll-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        
        try {
            // Apply piano roll settings
            applyPianoRollSettings();
            
            // Save piano roll as sample if there are notes
            if (pianoRollData[currentSampleForPopup] && 
                pianoRollData[currentSampleForPopup].notes && 
                pianoRollData[currentSampleForPopup].notes.length > 0) {
                
                // Wait for the piano roll to be rendered and saved
                await savePianoRollAsSampleForCurrentButton();
            }
            
            // Save temporaryEffects to the sample
            currentPlaying[currentSampleForPopup].effects = JSON.parse(JSON.stringify(temporaryEffects));
            
            // Hide popup
            hideEffectsPopup();
        } catch (error) {
            console.error('Error applying effects settings:', error);
            
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // Show error message
            const uploadStatus = document.getElementById('upload-status');
            if (uploadStatus) {
                uploadStatus.textContent = 'Error saving piano roll. Please try again.';
                uploadStatus.style.color = '#F44336';
            }
        }
    }
    
    // Function to handle sample upload
    function handleSampleUpload(event) {
        if (!currentSampleForPopup) return;
        
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if file is an audio file
        if (!file.type.startsWith('audio/')) {
            // Update upload status for this sample
            uploadStatusPerSample[currentSampleForPopup] = 'Error: Please select an audio file';
            const uploadStatus = document.getElementById('upload-status');
            uploadStatus.textContent = uploadStatusPerSample[currentSampleForPopup];
            uploadStatus.style.color = '#F44336';
            return;
        }
        
        const uploadStatus = document.getElementById('upload-status');
        uploadStatusPerSample[currentSampleForPopup] = 'Uploading...';
        uploadStatus.textContent = uploadStatusPerSample[currentSampleForPopup];
        uploadStatus.style.color = '';
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result)
                .then(buffer => {
                    // Update the sample's buffer
                    currentPlaying[currentSampleForPopup].buffer = buffer;
                    currentPlaying[currentSampleForPopup].loopDuration = buffer.duration;
                    currentPlaying[currentSampleForPopup].bufferSampleNumber = currentSampleForPopup;
                    currentPlaying[currentSampleForPopup].isCustomSample = true;
                    
                    // Store the uploaded file name for this sample
                    uploadedFileNames[currentSampleForPopup] = file.name;
                    
                    // Update the button to indicate it's a custom sample
                    const button = currentPlaying[currentSampleForPopup].button;
                    if (button) {
                        // Add custom indicator
                        addCustomIndicator(button);
                        
                        // Remove no-sample class if it exists
                        button.classList.remove('no-sample');
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
                    
                    // Update upload status for this sample
                    uploadStatusPerSample[currentSampleForPopup] = `Upload successful: ${file.name}`;
                    uploadStatus.textContent = uploadStatusPerSample[currentSampleForPopup];
                    uploadStatus.style.color = '#4CAF50';
                })
                .catch(error => {
                    console.error('Error decoding audio data:', error);
                    
                    // Update upload status for this sample
                    uploadStatusPerSample[currentSampleForPopup] = 'Error: Invalid audio file';
                    uploadStatus.textContent = uploadStatusPerSample[currentSampleForPopup];
                    uploadStatus.style.color = '#F44336';
                });
        };
        
        reader.onerror = function() {
            // Update upload status for this sample
            uploadStatusPerSample[currentSampleForPopup] = 'Error reading file';
            uploadStatus.textContent = uploadStatusPerSample[currentSampleForPopup];
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
        
        // Update volume effect
        if (sample.gainNode && effects.volume !== undefined) {
            // Convert percentage to gain value (0-2.0 range)
            const gainValue = effects.volume / 100;
            sample.gainNode.gain.value = gainValue;
        }
        
        // Update delay effect
        if (sample.delayNode) {
            sample.delayNode.delayTime.value = effects.delay.time / 1000;
            
            if (sample.delayFeedbackNode) {
                sample.delayFeedbackNode.gain.value = effects.delay.feedback / 100;
            }
        }
        
        // Update reverb effect
        // Always update the reverb mix node gain
        if (sample.reverbMixNode) {
            sample.reverbMixNode.gain.value = effects.reverb.mix / 100;
        }
        
        // Update the convolver if decay is greater than 0
        if (effects.reverb.decay > 0) {
            // Re-create the convolver with new parameters
            const convolver = audioContext.createConvolver();
            const length = audioContext.sampleRate * effects.reverb.decay;
            const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
            
            // Apply pre-delay
            const predelaySamples = audioContext.sampleRate * (effects.reverb.predelay / 1000);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                
                // Create the impulse response with the new parameters
                for (let i = 0; i < length; i++) {
                    // Apply pre-delay
                    if (i < predelaySamples) {
                        channelData[i] = 0;
                    } else {
                        // Apply decay and diffusion
                        const decayFactor = Math.pow(1 - (i - predelaySamples) / (length - predelaySamples), 2);
                        const diffusionFactor = effects.reverb.diffusion / 100;
                        
                        // Generate random noise for diffusion
                        channelData[i] = (Math.random() * 2 - 1) * decayFactor * diffusionFactor;
                        
                        // Apply damping (reduce high frequencies over time)
                        const dampingFactor = 1 - (effects.reverb.damping / 100) * (i / length);
                        channelData[i] *= dampingFactor;
                    }
                }
                
                // Apply low cut and high cut filters
                // Note: This is a simplified approach. In a real implementation, you would use actual filters.
                // For now, we'll just adjust the frequency response in the frequency domain.
                // But since we're in the time domain, we'll skip this for now and rely on the EQ.
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
        } else {
            // If decay is 0, disconnect the convolver if it exists
            if (sample.reverbNode) {
                sample.reverbNode.disconnect();
                sample.reverbNode = null;
            }
        }
        
        // Update EQ filters using the sample's stored effects
        if (sample.eqLowNode) {
            // Reset all EQ filters to default
            sample.eqLowNode.gain.value = 0;
            sample.eqLowMidNode.gain.value = 0;
            sample.eqMidNode.gain.value = 0;
            sample.eqHighMidNode.gain.value = 0;
            sample.eqHighMid2Node.gain.value = 0;
            sample.eqHighNode.gain.value = 0;
            sample.eqVeryHighNode.gain.value = 0;
            
            // Apply EQ points from the effects
            if (effects.eq && effects.eq.length > 0) {
                // Sort EQ points by frequency
                const sortedEqPoints = [...effects.eq].sort((a, b) => a.frequency - b.frequency);
                
                // Apply the first point to the low shelf
                if (sortedEqPoints[0] && sortedEqPoints[0].type === 'lowshelf') {
                    sample.eqLowNode.frequency.value = sortedEqPoints[0].frequency;
                    sample.eqLowNode.gain.value = sortedEqPoints[0].gain;
                }
                
                // Apply the last point to the high shelf
                if (sortedEqPoints[sortedEqPoints.length - 1] && sortedEqPoints[sortedEqPoints.length - 1].type === 'highshelf') {
                    sample.eqHighNode.frequency.value = sortedEqPoints[sortedEqPoints.length - 1].frequency;
                    sample.eqHighNode.gain.value = sortedEqPoints[sortedEqPoints.length - 1].gain;
                }
                
                // Apply peaking filters for points in between
                let peakingIndex = 0;
                for (let i = 0; i < sortedEqPoints.length; i++) {
                    if (sortedEqPoints[i].type === 'peaking') {
                        let filterNode;
                        switch (peakingIndex) {
                            case 0: filterNode = sample.eqLowMidNode; break;
                            case 1: filterNode = sample.eqMidNode; break;
                            case 2: filterNode = sample.eqHighMidNode; break;
                            case 3: filterNode = sample.eqHighMid2Node; break;
                            default: break;
                        }
                        
                        if (filterNode) {
                            filterNode.frequency.value = sortedEqPoints[i].frequency;
                            filterNode.gain.value = sortedEqPoints[i].gain;
                            filterNode.Q.value = sortedEqPoints[i].q || 1.0;
                            peakingIndex++;
                        }
                    }
                }
            }
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
        
        // Apply speed effect
        if (sample.source && effects.speed) {
            let basePlaybackRate;
            
            if (sample.isLongSample) {
                // For long samples (61-100): use long loop tempo
                const longLoopBeatDuration = 60 / longLoopTempo;
                const longLoopBarDuration = longLoopBeatDuration * 4;
                const desiredLoopDuration = longLoopBarDuration * longLoopLength;
                basePlaybackRate = sample.loopDuration / desiredLoopDuration;
            } else {
                // For drum samples (1-60): use regular tempo
                const effectiveTempo = tempo + highTempo;
                const effectiveBeatDuration = 60 / effectiveTempo;
                const effectiveBarDuration = effectiveBeatDuration * 4;
                const desiredLoopDuration = effectiveBarDuration * loopLength;
                basePlaybackRate = sample.loopDuration / desiredLoopDuration;
            }
            
            // Get individual tempo from effects (only for long samples)
            let individualTempo = 1.0;
            if (sample.isLongSample && effects.individualTempo) {
                individualTempo = effects.individualTempo;
            }
            
            // Calculate new playback rate
            const newPlaybackRate = basePlaybackRate * individualTempo * effects.speed;
            
            // Get current playback rate
            const currentPlaybackRate = sample.source.playbackRate.value;
            
            // Calculate elapsed time since the last loop start
            const currentTime = audioContext.currentTime;
            const elapsedTime = currentTime - sample.loopStartTime;
            
            // Calculate current position in the buffer (in seconds)
            const currentPosition = (elapsedTime * currentPlaybackRate) % sample.loopDuration;
            
            // Update the playback rate
            sample.source.playbackRate.value = newPlaybackRate;
            
            // Adjust the loop start time to maintain the current position
            sample.loopStartTime = currentTime - (currentPosition / newPlaybackRate);
        }
        
        // Process piano roll if it exists
        if (effects.pianoRoll && effects.pianoRoll.notes.length > 0) {
            // Store piano roll data
            pianoRollData[sampleNumber] = JSON.parse(JSON.stringify(effects.pianoRoll));
            
            // If the sample is playing, we could process the piano roll here
            // For now, we'll just store it
        }
        
        // If the popup is open for this sample, reconnect the waveform analyzer
        if (currentSampleForPopup === sampleNumber && waveformAnalyzer) {
            // Disconnect existing connections
            if (sample.eqVeryHighNode) {
                sample.eqVeryHighNode.disconnect();
                sample.eqVeryHighNode.connect(waveformAnalyzer);
                waveformAnalyzer.connect(masterOutputNode);
            } else if (sample.outputNode) {
                sample.outputNode.disconnect();
                sample.outputNode.connect(waveformAnalyzer);
                waveformAnalyzer.connect(masterOutputNode);
            } else if (sample.gainNode) {
                sample.gainNode.disconnect();
                sample.gainNode.connect(waveformAnalyzer);
                waveformAnalyzer.connect(masterOutputNode);
            }
        }
    }
    
    // Add event listeners to popup
    function setupPopupEventListeners(popup) {
        const closeBtn = popup.querySelector('.popup-close-btn');
        const acceptBtn = popup.querySelector('.popup-accept-btn');
        const resetBtn = popup.querySelector('.popup-reset-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                if (currentSampleForPopup) {
                    // Revert to originalEffects (last saved state)
                    currentPlaying[currentSampleForPopup].effects = JSON.parse(JSON.stringify(originalEffects));
                    
                    // Update the sample's effects in real-time if it's playing
                    if (currentPlaying[currentSampleForPopup].isScheduled && currentPlaying[currentSampleForPopup].isActive) {
                        updateSampleEffects(currentSampleForPopup);
                    }
                }
                hideEffectsPopup();
            });
        }
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', async function() {
                await applyEffectsSettings();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetEffectsSettings);
        }
    }
    
    // Initialize popup event listeners
    setupPopupEventListeners(effectsPopup);
    
    // Add event listener for sample upload
    document.getElementById('sample-upload').addEventListener('change', handleSampleUpload);
    
    // Add event listeners to sliders to update values in real-time
    document.getElementById('delay-time').addEventListener('input', function() {
        document.getElementById('delay-time-value').textContent = this.value;
        updateDelayInRealTime();
        if (temporaryEffects) {
            temporaryEffects.delay.time = parseInt(this.value);
        }
    });
    
    document.getElementById('delay-feedback').addEventListener('input', function() {
        document.getElementById('delay-feedback-value').textContent = this.value;
        updateDelayInRealTime();
        if (temporaryEffects) {
            temporaryEffects.delay.feedback = parseInt(this.value);
        }
    });
    
    document.getElementById('reverb-decay').addEventListener('input', function() {
        document.getElementById('reverb-decay-value').textContent = this.value;
        updateReverbInRealTime();
        if (temporaryEffects) {
            temporaryEffects.reverb.decay = parseFloat(this.value);
        }
    });
    
    document.getElementById('reverb-predelay').addEventListener('input', function() {
        document.getElementById('reverb-predelay-value').textContent = this.value;
        updateReverbInRealTime();
        if (temporaryEffects) {
            temporaryEffects.reverb.predelay = parseFloat(this.value);
        }
    });
    
    document.getElementById('reverb-diffusion').addEventListener('input', function() {
        document.getElementById('reverb-diffusion-value').textContent = this.value;
        updateReverbInRealTime();
        if (temporaryEffects) {
            temporaryEffects.reverb.diffusion = parseFloat(this.value);
        }
    });
    
    document.getElementById('reverb-lowcut').addEventListener('input', function() {
        document.getElementById('reverb-lowcut-value').textContent = this.value;
        updateReverbInRealTime();
        if (temporaryEffects) {
            temporaryEffects.reverb.lowcut = parseFloat(this.value);
        }
    });
    
    document.getElementById('reverb-highcut').addEventListener('input', function() {
        document.getElementById('reverb-highcut-value').textContent = this.value;
        updateReverbInRealTime();
        if (temporaryEffects) {
            temporaryEffects.reverb.highcut = parseFloat(this.value);
        }
    });
    
    document.getElementById('reverb-damping').addEventListener('input', function() {
        document.getElementById('reverb-damping-value').textContent = this.value;
        updateReverbInRealTime();
        if (temporaryEffects) {
            temporaryEffects.reverb.damping = parseFloat(this.value);
        }
    });
    
    document.getElementById('reverb-mix').addEventListener('input', function() {
        document.getElementById('reverb-mix-value').textContent = this.value;
        updateReverbInRealTime();
        if (temporaryEffects) {
            temporaryEffects.reverb.mix = parseInt(this.value);
        }
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
        volumeControl.className = `volume-control group-${group}`;
        
        const volumeLabel = document.createElement('label');
        volumeLabel.textContent = `${group}: `;
        
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '80';
        volumeSlider.step = '1';
        volumeSlider.className = `volume-slider`;
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
    
    // Create buttons and audio elements
    for (let i = 1; i <= 100; i++) {
        // Create button
        const button = document.createElement('button');
        button.className = 'audio-button';
        button.textContent = i;
        button.id = `but${i}`;
        button.style.position = 'relative'; // Needed for absolute positioning of indicators
        
        // Add loop indicator
        const loopIndicator = document.createElement('div');
        loopIndicator.className = 'loop-indicator';
        button.appendChild(loopIndicator);
        
        // Add custom sample indicator (initially hidden)
        const customIndicator = document.createElement('div');
        customIndicator.className = 'custom-indicator';
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
                isLongSample: i > 60, // Changed from 70 to 60
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
                    reverb: { 
                        decay: 0, 
                        mix: 0,
                        predelay: 0,
                        diffusion: 50,
                        lowcut: 20,
                        highcut: 20000,
                        damping: 50
                    },
                    eq: [
                        { frequency: 20, gain: 0, q: 1.0, type: 'lowshelf', fixed: true },
                        { frequency: 20000, gain: 0, q: 1.0, type: 'highshelf', fixed: true }
                    ],
                    volume: 100,
                    speed: 1.0,
                    individualTempo: 1.0,
                    pianoRoll: {
                        notes: [],
                        soundSource: 'piano',
                        gridWidth: i > 60 ? 32 : 16,
                        gridHeight: 84, // 7 octaves (12*7)
                        scrollX: 0,
                        scrollY: 0,
                        sampleRange: { start: 0, end: 100 },
                        filters: {
                            // Enhanced filters
                            lowShelf: 0,
                            highShelf: 0,
                            lowMid: 0,
                            mid: 0,
                            highMid: 0,
                            // Delay filters
                            delay: {
                                time: 0,
                                feedback: 0
                            }
                        },
                        isEnabled: false // Track piano roll toggle state
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
                eqHighMid2Node: null,
                eqHighNode: null,
                eqVeryHighNode: null
            };
        }
        
        // Add click event to button
        button.addEventListener('click', function() {
            // Determine group (0-9)
            const group = Math.floor((i - 1) / 10);
            
            // If this audio is currently active (has a button reference)
            if (currentPlaying[i].button === button) {
                // Check if it's a button without a sample
                if (button.classList.contains('no-sample')) {
                    // Deactivate the button
                    button.classList.remove('active', 'no-sample');
                    currentPlaying[i].isActive = false;
                    currentPlaying[i].scheduledForNextBar = false;
                    currentPlaying[i].button = null; // Reset the button reference
                } else if (currentPlaying[i].isScheduled) {
                    // If it's playing, stop it
                    stopSample(i);
                    button.classList.remove('active', 'no-sample');
                    currentPlaying[i].isActive = false;
                    button.classList.remove('loading');
                    // Don't remove indicators here - we want custom indicator to stay visible
                } else {
                    // If it's not playing but still active (was stopped), restart it
                    button.classList.add('active');
                    currentPlaying[i].isActive = true;
                    currentPlaying[i].scheduledForNextBar = true;
                    
                    // Add indicators
                    addIndicatorsForActiveSample(button, i);
                    
                    // Check if sample is loaded
                    if (currentPlaying[i].buffer && isPlaying) {
                        button.classList.remove('no-sample');
                        scheduleSampleForNextBar(i);
                    } else {
                        // Add no-sample class if buffer is not loaded
                        button.classList.add('no-sample');
                    }
                }
            } else {
                // Stop any other audio in the same group
                for (let j = 1; j <= 100; j++) {
                    if (Math.floor((j - 1) / 10) === group && currentPlaying[j].button) {
                        currentPlaying[j].button.classList.remove('active', 'no-sample', 'loading', 'error');
                        stopSample(j);
                        currentPlaying[j].isActive = false;
                        currentPlaying[j].scheduledForNextBar = false;
                        // Don't remove indicators here - we want custom indicator to stay visible
                        currentPlaying[j].button = null; // Reset the button reference
                    }
                }
                
                // Set this as the active sample
                currentPlaying[i].button = button;
                currentPlaying[i].sampleNumber = i;
                currentPlaying[i].isLongSample = i > 60; // Changed from 70 to 60
                currentPlaying[i].originalTempo = tempo;
                button.classList.add('active');
                currentPlaying[i].isActive = true;
                currentPlaying[i].scheduledForNextBar = true;
                currentPlaying[i].barGridAligned = false; // Needs to be aligned to bar grid
                
                // Add indicators
                addIndicatorsForActiveSample(button, i);
                
                // Check if sample is loaded
                if (currentPlaying[i].buffer) {
                    button.classList.remove('no-sample');
                    if (isPlaying) {
                        scheduleSampleForNextBar(i);
                    }
                } else {
                    // Add no-sample class if buffer is not loaded
                    button.classList.add('no-sample');
                    // Load the audio
                    loadAudio(i, i);
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
            // Only prevent default if this is a potential long press
            // This allows normal touch events to work
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
    
    // Helper functions for indicators
    function addIndicatorsForActiveSample(button, sampleNumber) {
        // Add custom indicator if it's a custom sample
        if (currentPlaying[sampleNumber] && currentPlaying[sampleNumber].isCustomSample) {
            addCustomIndicator(button);
        }
    }
    
    // Function to set custom indicator visibility
    function setCustomIndicatorVisibility(button, visible) {
        let customIndicator = button.querySelector('.custom-indicator');
        if (customIndicator) {
            customIndicator.style.display = visible ? 'block' : 'none';
        }
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
                    
                    // Remove loading state and no-sample class
                    if (currentPlaying[index].button) {
                        currentPlaying[index].button.classList.remove('loading', 'no-sample');
                    }
                    
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
                .catch(e => {
                    console.error("Error loading audio:", e);
                    // Remove loading state and show error
                    if (currentPlaying[index].button) {
                        currentPlaying[index].button.classList.remove('loading');
                        currentPlaying[index].button.classList.add('error');
                        
                        // Add no-sample class if button is active
                        if (currentPlaying[index].button.classList.contains('active')) {
                            currentPlaying[index].button.classList.add('no-sample');
                        }
                    }
                });
        });
        
        // Set initial loading state
        audio.load();
    }
    
    // Update the master bar grid when tempo changes
    function updateMasterBarGrid() {
        const currentTime = audioContext.currentTime;
        
        // Calculate the current position in the current bar (0 to 1)
        const currentBarProgress = (currentTime - masterBarGrid.startTime) / masterBarGrid.duration;
        
        // Calculate the new bar duration
        const effectiveTempo = tempo + highTempo;
        const newBarDuration = (60 / effectiveTempo) * 4;
        
        // Adjust the master bar grid to preserve the current bar position
        masterBarGrid.startTime = currentTime - (currentBarProgress * newBarDuration);
        masterBarGrid.duration = newBarDuration;
        masterBarGrid.nextStartTime = masterBarGrid.startTime + masterBarGrid.duration;
        
        console.log(`Master bar grid updated: bar progress ${currentBarProgress}, new duration ${newBarDuration}`);
    }
    
    // Function to smoothly update drum sample tempo without stopping
    function updateDrumSampleTempo(sampleNumber) {
        if (!currentPlaying[sampleNumber].source || currentPlaying[sampleNumber].isLongSample) return;
        
        const sample = currentPlaying[sampleNumber];
        const currentTime = audioContext.currentTime;
        
        // Calculate new effective tempo
        const effectiveTempo = tempo + highTempo;
        const effectiveBeatDuration = 60 / effectiveTempo;
        const effectiveBarDuration = effectiveBeatDuration * 4;
        const desiredLoopDuration = effectiveBarDuration * loopLength;
        
        // Validate values before calculating playback rate
        if (!isFinite(desiredLoopDuration) || desiredLoopDuration <= 0 || 
            !isFinite(currentPlaying[sampleNumber].loopDuration) || currentPlaying[sampleNumber].loopDuration <= 0) {
            console.error('Invalid values for drum sample:', {
                desiredLoopDuration,
                loopDuration: currentPlaying[sampleNumber].loopDuration
            });
            return;
        }
        
        // Calculate base playback rate (without individual tempo)
        const basePlaybackRate = sample.loopDuration / desiredLoopDuration;
        
        // Get speed from effects
        const effects = sample.effects || {};
        const speed = effects.speed || 1.0;
        
        // Calculate new playback rate
        const newPlaybackRate = basePlaybackRate * speed;
        
        // Get current playback rate
        const currentPlaybackRate = sample.source.playbackRate.value;
        
        // Calculate elapsed time since the last loop start
        const elapsedTime = currentTime - sample.loopStartTime;
        
        // Calculate current position in the buffer (in seconds)
        const currentPosition = (elapsedTime * currentPlaybackRate) % sample.loopDuration;
        
        // Update the playback rate
        sample.source.playbackRate.value = newPlaybackRate;
        
        // Adjust the loop start time to maintain the current position
        sample.loopStartTime = currentTime - (currentPosition / newPlaybackRate);
        
        console.log(`Sample ${sampleNumber} tempo updated: new rate ${newPlaybackRate}, position ${currentPosition}`);
    }
    
    // Function to smoothly update long sample tempo without stopping
    function updateLongSampleTempo(sampleNumber) {
        if (!currentPlaying[sampleNumber].source || !currentPlaying[sampleNumber].isLongSample) return;
        
        const sample = currentPlaying[sampleNumber];
        const currentTime = audioContext.currentTime;
        
        // Calculate new long loop tempo
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
        
        const basePlaybackRate = sample.loopDuration / desiredLoopDuration;
        
        // Get individual tempo from effects
        const effects = sample.effects || {};
        const individualTempo = effects.individualTempo || 1.0;
        
        // Get speed from effects
        const speed = effects.speed || 1.0;
        
        // Calculate new playback rate
        const newPlaybackRate = basePlaybackRate * individualTempo * speed;
        
        // Get current playback rate
        const currentPlaybackRate = sample.source.playbackRate.value;
        
        // Calculate elapsed time since the last loop start
        const elapsedTime = currentTime - sample.loopStartTime;
        
        // Calculate current position in the buffer (in seconds)
        const currentPosition = (elapsedTime * currentPlaybackRate) % sample.loopDuration;
        
        // Update the playback rate
        sample.source.playbackRate.value = newPlaybackRate;
        
        // Adjust the loop start time to align with the master bar grid
        sample.loopStartTime = currentTime - (currentPosition / newPlaybackRate);
        
        console.log(`Sample ${sampleNumber} long tempo updated: new rate ${newPlaybackRate}, position ${currentPosition}`);
    }
    
    // Schedule a sample to play at the next bar
    function scheduleSampleForNextBar(sampleNumber) {
        if (!currentPlaying[sampleNumber].buffer || !currentPlaying[sampleNumber].scheduledForNextBar) return;
        
        // Use the master bar grid for all samples
        const nextBarTime = masterBarGrid.nextStartTime;
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
    
    // Function to play a sample at a specific time
    function playSampleAtTime(sampleNumber, startTime) {
        if (!currentPlaying[sampleNumber].buffer || !currentPlaying[sampleNumber].scheduledForNextBar) return;
        
        // Stop any existing sample
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
                
                if (currentPlaying[sampleNumber].eqHighMid2Node) {
                    currentPlaying[sampleNumber].eqHighMid2Node.disconnect();
                    currentPlaying[sampleNumber].eqHighMid2Node = null;
                }
                
                if (currentPlaying[sampleNumber].eqHighNode) {
                    currentPlaying[sampleNumber].eqHighNode.disconnect();
                    currentPlaying[sampleNumber].eqHighNode = null;
                }
                
                if (currentPlaying[sampleNumber].eqVeryHighNode) {
                    currentPlaying[sampleNumber].eqVeryHighNode.disconnect();
                    currentPlaying[sampleNumber].eqVeryHighNode = null;
                }
            } catch (e) {
                console.warn('Error stopping audio source:', e);
                currentPlaying[sampleNumber].source = null;
                currentPlaying[sampleNumber].gainNode = null;
            }
        }
        
        // Create a new source
        const source = audioContext.createBufferSource();
        source.buffer = currentPlaying[sampleNumber].buffer;
        
        // Create a gain node for volume control
        const gainNode = audioContext.createGain();
        
        // Get effects from sample
        const effects = currentPlaying[sampleNumber].effects || {};
        
        // Set initial volume based on effects (default to 80% if not set)
        const volumePercent = effects.volume || 100;
        gainNode.gain.value = volumePercent / 100;
        
        // Connect nodes
        source.connect(gainNode);
        
        // Store references
        currentPlaying[sampleNumber].source = source;
        currentPlaying[sampleNumber].gainNode = gainNode;
        currentPlaying[sampleNumber].startTime = startTime;
        currentPlaying[sampleNumber].isScheduled = true;
        currentPlaying[sampleNumber].loopStartTime = startTime;
        currentPlaying[sampleNumber].tempoChangeTime = startTime; // Initialize tempo change time
        
        // Check if there's a piano roll to play
        if (effects.pianoRoll && effects.pianoRoll.notes.length > 0) {
            const pianoRoll = effects.pianoRoll;
            
            // Calculate timing
            const isLongSample = currentPlaying[sampleNumber].isLongSample;
            let beatDuration, barDuration;
            
            if (isLongSample) {
                beatDuration = 60 / longLoopTempo;
                barDuration = beatDuration * 4;
            } else {
                const effectiveTempo = tempo + highTempo;
                beatDuration = 60 / effectiveTempo;
                barDuration = beatDuration * 4;
            }
            
            const sixteenthDuration = barDuration / 16;
            
            // Sort notes by column (time)
            const sortedNotes = [...pianoRoll.notes].sort((a, b) => a.col - b.col);
            
            // Play each note
            sortedNotes.forEach(note => {
                const noteTime = startTime + note.col * sixteenthDuration;
                
                if (pianoRoll.soundSource === 'piano') {
                    // Use piano sound
                    playPianoNoteForSample(note.row, noteTime, sixteenthDuration, gainNode, sampleNumber);
                } else if (pianoRoll.soundSource === 'synth') {
                    // Use synth sound
                    playSynthNoteForSample(note.row, noteTime, sixteenthDuration, gainNode, sampleNumber);
                } else if (pianoRoll.soundSource === 'strings') {
                    // Use strings sound
                    playStringsNoteForSample(note.row, noteTime, sixteenthDuration, gainNode, sampleNumber);
                } else if (pianoRoll.soundSource === 'bass') {
                    // Use bass sound
                    playBassNoteForSample(note.row, noteTime, sixteenthDuration, gainNode, sampleNumber);
                } else if (pianoRoll.soundSource === 'lead') {
                    // Use lead sound
                    playLeadNoteForSample(note.row, noteTime, sixteenthDuration, gainNode, sampleNumber);
                } else if (pianoRoll.soundSource === 'pad') {
                    // Use pad sound
                    playPadNoteForSample(note.row, noteTime, sixteenthDuration, gainNode, sampleNumber);
                } else if (pianoRoll.soundSource === 'pluck') {
                    // Use pluck sound
                    playPluckNoteForSample(note.row, noteTime, sixteenthDuration, gainNode, sampleNumber);
                } else {
                    // Use sample
                    playSampleNoteForSample(note.row, noteTime, sixteenthDuration, gainNode, sampleNumber, pianoRoll.sampleRange);
                }
            });
        } else {
            // Original code for playing the sample normally
            if (currentPlaying[sampleNumber].isLongSample) {
                // For long samples (61-100): use long loop tempo
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
                
                // Calculate base playback rate for tempo
                const basePlaybackRate = currentPlaying[sampleNumber].loopDuration / desiredLoopDuration;
                
                // Get individual tempo from effects (only for long samples)
                let individualTempo = 1.0;
                if (effects.individualTempo) {
                    individualTempo = effects.individualTempo;
                }
                
                // Get speed from effects
                const speed = effects.speed || 1.0;
                
                // Combine tempo, individual tempo, and speed
                const playbackRate = basePlaybackRate * individualTempo * speed;
                
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
                // For drum samples (1-60): use regular tempo
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
                
                // Calculate base playback rate for tempo
                const basePlaybackRate = currentPlaying[sampleNumber].loopDuration / desiredLoopDuration;
                
                // Get speed from effects
                const speed = effects.speed || 1.0;
                
                // Combine tempo and speed
                const playbackRate = basePlaybackRate * speed;
                
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
        }
        
        // Initialize effects for the sample immediately
        initializeEffectsForSample(sampleNumber);
        
        // Apply effects after a short delay to ensure all nodes are properly connected
        setTimeout(() => {
            if (currentPlaying[sampleNumber].isScheduled) {
                updateSampleEffects(sampleNumber);
            }
        }, 50);
        
        console.log(`Sample ${sampleNumber} (${currentPlaying[sampleNumber].isLongSample ? 'long' : 'drum'}) started at ${startTime} with volume ${volumePercent}%, speed ${effects.speed || 1.0} and individual tempo ${effects.individualTempo || 1.0}`);
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
        
        const basePlaybackRate = currentPlaying[sampleNumber].loopDuration / desiredLoopDuration;
        
        // Get speed from effects
        const effects = currentPlaying[sampleNumber].effects || {};
        const speed = effects.speed || 1.0;
        
        // Calculate new playback rate
        const playbackRate = basePlaybackRate * speed;
        
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
        
        // Adjust the loop start time to align with the master bar grid
        currentPlaying[sampleNumber].loopStartTime = currentTime - (loopProgress / playbackRate);
        
        console.log(`Sample ${sampleNumber} tempo updated: loop progress ${loopProgress / currentPlaying[sampleNumber].loopDuration} with speed ${speed}`);
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
        
        const basePlaybackRate = currentPlaying[sampleNumber].loopDuration / desiredLoopDuration;
        
        // Get individual tempo from effects
        const effects = currentPlaying[sampleNumber].effects || {};
        const individualTempo = effects.individualTempo || 1.0;
        
        // Get speed from effects
        const speed = effects.speed || 1.0;
        
        // Calculate new playback rate
        const playbackRate = basePlaybackRate * individualTempo * speed;
        
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
        
        // Adjust the loop start time to align with the master bar grid
        currentPlaying[sampleNumber].loopStartTime = currentTime - (loopProgress / playbackRate);
        
        console.log(`Sample ${sampleNumber} long tempo updated: loop progress ${loopProgress / currentPlaying[sampleNumber].loopDuration} with individual tempo ${individualTempo} and speed ${speed}`);
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
                
                if (currentPlaying[sampleNumber].eqHighMid2Node) {
                    currentPlaying[sampleNumber].eqHighMid2Node.disconnect();
                    currentPlaying[sampleNumber].eqHighMid2Node = null;
                }
                
                if (currentPlaying[sampleNumber].eqHighNode) {
                    currentPlaying[sampleNumber].eqHighNode.disconnect();
                    currentPlaying[sampleNumber].eqHighNode = null;
                }
                
                if (currentPlaying[sampleNumber].eqVeryHighNode) {
                    currentPlaying[sampleNumber].eqVeryHighNode.disconnect();
                    currentPlaying[sampleNumber].eqVeryHighNode = null;
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
        
        // Update the master bar grid if we've passed the next bar time
        if (currentTime >= masterBarGrid.nextStartTime) {
            masterBarGrid.startTime = masterBarGrid.nextStartTime;
            masterBarGrid.nextStartTime = masterBarGrid.startTime + masterBarGrid.duration;
        }
        
        // Schedule the next scheduler call
        if (isPlaying) {
            timerId = setTimeout(scheduler, lookahead);
        }
    }
    
    // Function to start recording
    function startRecording() {
        if (isRecording) return;
        
        // Create a destination node for recording
        recordingDestination = audioContext.createMediaStreamDestination();
        
        // Connect the master output node to the recording destination
        masterOutputNode.connect(recordingDestination);
        
        // Create a media recorder
        mediaRecorder = new MediaRecorder(recordingDestination.stream);
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = function() {
            // Create a blob from the recorded chunks
            recordedBlob = new Blob(recordedChunks, { type: 'audio/wav' });
            
            // Keep the save button visible for user to download when ready
            saveButton.style.display = 'block';
        };
        
        // Start recording
        mediaRecorder.start();
        isRecording = true;
        recordingStartTime = Date.now();
        
        // Update UI
        recordButton.textContent = 'Stop Recording';
        recordButton.classList.add('recording');
        
        // Show save button
        saveButton.style.display = 'block';
    }
    
    // Function to stop recording
    function stopRecording() {
        if (!isRecording) return;
        
        // Stop the media recorder
        mediaRecorder.stop();
        isRecording = false;
        
        // Calculate recording duration
        recordingDuration = (Date.now() - recordingStartTime) / 1000;
        
        // Update UI
        recordButton.textContent = 'Record';
        recordButton.classList.remove('recording');
        
        // Disconnect the master output node from the recording destination
        if (recordingDestination) {
            masterOutputNode.disconnect(recordingDestination);
            recordingDestination = null;
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
        
        // Update the master bar grid
        updateMasterBarGrid();
        
        // Update all active drum samples with the new tempo
        for (let i = 1; i <= 100; i++) {
            if (currentPlaying[i].button && 
                currentPlaying[i].buffer && 
                currentPlaying[i].scheduledForNextBar &&
                currentPlaying[i].isActive &&
                currentPlaying[i].isScheduled &&
                !currentPlaying[i].isLongSample) {
                
                // Update the drum sample with new tempo
                updateDrumSampleTempo(i);
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
        
        // Update the master bar grid
        updateMasterBarGrid();
        
        // Update all active drum samples with the new tempo
        for (let i = 1; i <= 100; i++) {
            if (currentPlaying[i].button && 
                currentPlaying[i].buffer && 
                currentPlaying[i].scheduledForNextBar &&
                currentPlaying[i].isActive &&
                currentPlaying[i].isScheduled &&
                !currentPlaying[i].isLongSample) {
                
                // Update the drum sample with new tempo
                updateDrumSampleTempo(i);
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
        
        // Update all active long samples with the new tempo
        for (let i = 1; i <= 100; i++) {
            if (currentPlaying[i].button && 
                currentPlaying[i].buffer && 
                currentPlaying[i].scheduledForNextBar &&
                currentPlaying[i].isActive &&
                currentPlaying[i].isScheduled &&
                currentPlaying[i].isLongSample) {
                
                // Update the long sample with new tempo
                updateLongSampleTempo(i);
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
            
            // Initialize master bar grid
            const currentTime = audioContext.currentTime;
            
            masterBarGrid.startTime = currentTime;
            masterBarGrid.duration = barDuration;
            masterBarGrid.nextStartTime = masterBarGrid.startTime + masterBarGrid.duration;
            
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
                    
                    // Schedule the sample for the next bar
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
    
    // Record button event
    recordButton.addEventListener('click', function() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
    
    // Save button event
    saveButton.addEventListener('click', function() {
        if (recordedBlob) {
            // Create a URL for the blob
            const url = URL.createObjectURL(recordedBlob);
            
            // Create a download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `psychological-studio-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;
            a.click();
            
            // Revoke the URL to free up memory
            URL.revokeObjectURL(url);
            
            // Don't hide the save button after download - user can download multiple times
        }
    }); 
    
    // ============ PIANO ROLL FUNCTIONS ============
    
    // Function to initialize piano roll
    function initPianoRoll() {
        if (!currentSampleForPopup) return;
        
        const isLongSample = currentSampleForPopup > 60;
        
        // Initialize piano roll data for this sample if it doesn't exist
        if (!pianoRollData[currentSampleForPopup]) {
            pianoRollData[currentSampleForPopup] = {
                notes: [],
                soundSource: 'piano',
                gridWidth: isLongSample ? 32 : 16, // More columns for long samples
                gridHeight: 84, // 7 octaves (12*7)
                scrollX: 0,
                scrollY: 0,
                sampleRange: { start: 0, end: 100 },
                filters: {
                    // Enhanced filters
                    lowShelf: 0,
                    highShelf: 0,
                    lowMid: 0,
                    mid: 0,
                    highMid: 0,
                    // Delay filters
                    delay: {
                        time: 0,
                        feedback: 0
                    }
                },
                isEnabled: false // Track piano roll toggle state
            };
        }
        
        // Get piano roll elements
        const pianoKeys = document.querySelector('.piano-keys');
        const pianoRollGrid = document.querySelector('.piano-roll-grid');
        const soundSourceSelect = document.getElementById('piano-roll-sound-source');
        
        // Clear existing content
        pianoKeys.innerHTML = '';
        pianoRollGrid.innerHTML = '';
        
        // Set grid dimensions
        const data = pianoRollData[currentSampleForPopup];
        pianoRollGrid.style.gridTemplateColumns = `repeat(${data.gridWidth}, 1fr)`;
        
        // Generate piano keys - from high to low (C6 to C0)
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octaves = 7; // 7 octaves
        
        // Generate keys from high to low (C6 to C0)
        for (let octave = octaves - 1; octave >= 0; octave--) {
            for (let i = 0; i < 12; i++) {
                const key = document.createElement('div');
                key.className = `piano-key ${noteNames[i].includes('#') ? 'black' : 'white'}`;
                key.textContent = noteNames[i] + octave;
                key.dataset.note = noteNames[i];
                key.dataset.octave = octave;
                
                // Add click event to play the note
                key.addEventListener('click', function() {
                    playPianoKey(noteNames[i], octave);
                });
                
                pianoKeys.appendChild(key);
            }
        }
        
        // Generate grid cells - from high to low (C6 to C0)
        // Modified: Now iterating from highest row (gridHeight-1) to lowest (0)
        for (let row = data.gridHeight - 1; row >= 0; row--) {
            for (let col = 0; col < data.gridWidth; col++) {
                const cell = document.createElement('div');
                cell.className = 'piano-roll-cell';
                
                // Add bar-start class for every 4th column (0, 4, 8, ...)
                if (col % 4 === 0) {
                    cell.classList.add('bar-start');
                }
                
                // Add bar-end class for every 4th column (3, 7, 11, ...)
                if ((col + 1) % 4 === 0) {
                    cell.classList.add('bar-end');
                }
                
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Check if this cell should be active based on stored data
                const isActive = data.notes.some(note => 
                    note.row === row && note.col === col
                );
                
                if (isActive) {
                    cell.classList.add('active');
                }
                
                // Add click event
                cell.addEventListener('click', function() {
                    togglePianoRollCell(row, col);
                });
                
                pianoRollGrid.appendChild(cell);
            }
        }
        
        // Set sound source
        soundSourceSelect.value = data.soundSource;
        
        // Add event listeners
        soundSourceSelect.addEventListener('change', function() {
            data.soundSource = this.value;
            
            // If "sample" is selected, open sample selection popup
            if (this.value === 'sample') {
                openSampleSelectionPopup();
            }
        });
        
        // Preview buttons
        const previewBtn = document.getElementById('piano-roll-preview-btn');
        const stopBtn = document.getElementById('piano-roll-stop-btn');
        const clearBtn = document.getElementById('piano-roll-clear-btn');
        
        // Remove existing event listeners
        previewBtn.replaceWith(previewBtn.cloneNode(true));
        stopBtn.replaceWith(stopBtn.cloneNode(true));
        clearBtn.replaceWith(clearBtn.cloneNode(true));
        
        // Get new button references
        const newPreviewBtn = document.getElementById('piano-roll-preview-btn');
        const newStopBtn = document.getElementById('piano-roll-stop-btn');
        const newClearBtn = document.getElementById('piano-roll-clear-btn');
        
        // Add event listeners
        newPreviewBtn.addEventListener('click', previewPianoRoll);
        newStopBtn.addEventListener('click', stopPianoRollPreview);
        newClearBtn.addEventListener('click', function() {
            clearPianoRoll();
            stopPianoRollPreview(); // Also stop the preview
        });
        
        // Initialize piano roll visualizer
        initPianoRollVisualizer();
    }
    
    // Function to initialize piano roll visualizer
    function initPianoRollVisualizer() {
        if (!currentSampleForPopup) return;
        
        // Get canvas element
        pianoRollVisualizer = document.getElementById('piano-roll-visualizer');
        pianoRollVisualizerCtx = pianoRollVisualizer.getContext('2d');
        
        // Set canvas size
        const container = pianoRollVisualizer.parentElement;
        pianoRollVisualizer.width = container.clientWidth;
        pianoRollVisualizer.height = container.clientHeight;
        
        // Clear any existing animation
        if (pianoRollVisualizerAnimationId) {
            cancelAnimationFrame(pianoRollVisualizerAnimationId);
            pianoRollVisualizerAnimationId = null;
        }
        
        // Clear history
        pianoRollVisualizerHistory = [];
        
        // Draw initial visualizer
        drawPianoRollVisualizer();
    }
    
    // Function to draw piano roll visualizer
    function drawPianoRollVisualizer() {
        if (!pianoRollVisualizer || !pianoRollVisualizerCtx) return;
        
        const width = pianoRollVisualizer.width;
        const height = pianoRollVisualizer.height;
        
        // Clear canvas with a dark background
        pianoRollVisualizerCtx.fillStyle = '#111';
        pianoRollVisualizerCtx.fillRect(0, 0, width, height);
        
        // Draw waveform if available
        if (pianoRollVisualizerHistory.length > 0) {
            // Create a gradient for the waveform
            const gradient = pianoRollVisualizerCtx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, 'rgba(28, 0, 212, 0.9)');
        gradient.addColorStop(0.1, 'rgba(0, 191, 255, 0.95)');
        gradient.addColorStop(0.3, 'rgba(0, 210, 154, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 196, 0, 0.85)');
        gradient.addColorStop(0.7, 'rgba(255, 0, 132, 0.85)');
        gradient.addColorStop(0.9, 'rgba(255, 0, 255, 0.85)');
        gradient.addColorStop(1, 'rgba(170, 0, 255, 0.85)');
            
            // Calculate the width of each time slice
            const sliceWidth = width / pianoRollVisualizerHistorySize;
            
            // Draw the waveform history
            for (let h = 0; h < pianoRollVisualizerHistory.length; h++) {
                const dataArray = pianoRollVisualizerHistory[h];
                const x = h * sliceWidth;
                
                // Calculate the alpha based on position in history (newer = more opaque)
                const alpha = 0.4 + (h / pianoRollVisualizerHistory.length) * 0.6;
                
                // Begin a new path for this time slice
                pianoRollVisualizerCtx.beginPath();
                pianoRollVisualizerCtx.moveTo(x, height);
                
                // Create frequency mapping
                const maxFreq = audioContext.sampleRate / 2;
                const minLogFreq = Math.log10(20);
                const maxLogFreq = Math.log10(maxFreq);
                
                // Draw the frequency spectrum for this time slice
                for (let i = 0; i < dataArray.length; i++) {
                    // Calculate frequency for this bin
                    const freq = i * maxFreq / dataArray.length;
                    
                    // Map frequency to y position using logarithmic scale
                    const logFreq = Math.log10(Math.max(20, freq));
                    const normalizedLogFreq = (logFreq - minLogFreq) / (maxLogFreq - minLogFreq);
                    const y = height - (normalizedLogFreq * height);
                    
                    // Convert amplitude to height with enhanced scaling
                    const amplitude = dataArray[i] / 255;
                    const enhancedAmplitude = Math.pow(amplitude, 0.4);
                    const ampHeight = enhancedAmplitude * height * 0.8;
                    
                    // Draw a line to this point
                    pianoRollVisualizerCtx.lineTo(x, y - ampHeight);
                }
                
                // Close the path and fill
                pianoRollVisualizerCtx.lineTo(x + sliceWidth, height);
                pianoRollVisualizerCtx.closePath();
                
                // Apply gradient with alpha
                pianoRollVisualizerCtx.globalAlpha = alpha;
                pianoRollVisualizerCtx.fillStyle = gradient;
                pianoRollVisualizerCtx.fill();
            }
            
            // Reset global alpha
            pianoRollVisualizerCtx.globalAlpha = 1;
            
            // Add a bright line at the top of the waveform for the most recent data
            if (pianoRollVisualizerHistory.length > 0) {
                const latestData = pianoRollVisualizerHistory[pianoRollVisualizerHistory.length - 1];
                pianoRollVisualizerCtx.strokeStyle = 'rgba(96, 96, 96, 1)';
                pianoRollVisualizerCtx.lineWidth = 2;
                pianoRollVisualizerCtx.beginPath();
                
                // Use the same frequency mapping for the highlight line
                const maxFreq = audioContext.sampleRate / 2;
                const minLogFreq = Math.log10(20);
                const maxLogFreq = Math.log10(maxFreq);
                
                for (let i = 0; i < latestData.length; i++) {
                    // Calculate frequency for this bin
                    const freq = i * maxFreq / latestData.length;
                    
                    // Map frequency to x position using logarithmic scale
                    const logFreq = Math.log10(Math.max(20, freq));
                    const normalizedLogFreq = (logFreq - minLogFreq) / (maxLogFreq - minLogFreq);
                    const x = normalizedLogFreq * width;
                    
                    // Convert amplitude to y position with enhanced scaling
                    const amplitude = latestData[i] / 255;
                    const enhancedAmplitude = Math.pow(amplitude, 0.4);
                    const y = height - (enhancedAmplitude * height * 0.8);
                    
                    if (i === 0) {
                        pianoRollVisualizerCtx.moveTo(x, y);
                    } else {
                        pianoRollVisualizerCtx.lineTo(x, y);
                    }
                }
                
                pianoRollVisualizerCtx.stroke();
            }
        }
    }
    
    // Function to start piano roll visualizer animation
    function startPianoRollVisualizerAnimation() {
        if (!pianoRollVisualizerAnalyzer) return;
        
        const bufferLength = pianoRollVisualizerAnalyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        function animate() {
            pianoRollVisualizerAnimationId = requestAnimationFrame(animate);
            
            // Get frequency data
            pianoRollVisualizerAnalyzer.getByteFrequencyData(dataArray);
            
            // Add current data to history
            pianoRollVisualizerHistory.push([...dataArray]);
            if (pianoRollVisualizerHistory.length > pianoRollVisualizerHistorySize) {
                pianoRollVisualizerHistory.shift();
            }
            
            // Draw the visualizer
            drawPianoRollVisualizer();
        }
        
        animate();
    }
    
    // Function to stop piano roll visualizer animation
    function stopPianoRollVisualizerAnimation() {
        if (pianoRollVisualizerAnimationId) {
            cancelAnimationFrame(pianoRollVisualizerAnimationId);
            pianoRollVisualizerAnimationId = null;
        }
        
        // Clear history
        pianoRollVisualizerHistory = [];
        
        // Draw empty visualizer
        drawPianoRollVisualizer();
    }
    
    // Function to play a piano key
    function playPianoKey(noteName, octave) {
        // Calculate note frequency
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // Sine wave for a basic piano-like sound
        
        // Create a gain node
        const gainNode = audioContext.createGain();
        
        // Connect oscillator to gain and gain to output
        oscillator.connect(gainNode);
        gainNode.connect(masterOutputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope (ADSR-like)
        const now = audioContext.currentTime;
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        const releaseTime = 0.2;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        gainNode.gain.linearRampToValueAtTime(0, now + attackTime + decayTime + releaseTime);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + attackTime + decayTime + releaseTime);
    }
    
    // Function to toggle a piano roll cell
    function togglePianoRollCell(row, col) {
        if (!currentSampleForPopup) return;
        
        const data = pianoRollData[currentSampleForPopup];
        const cell = document.querySelector(`.piano-roll-cell[data-row="${row}"][data-col="${col}"]`);
        
        // Check if this cell is already active
        const existingNoteIndex = data.notes.findIndex(note => 
            note.row === row && note.col === col
        );
        
        if (existingNoteIndex !== -1) {
            // Remove the note
            data.notes.splice(existingNoteIndex, 1);
            cell.classList.remove('active');
        } else {
            // Add the note
            data.notes.push({ row, col });
            cell.classList.add('active');
        }
    }
    
    // Function to clear piano roll
    function clearPianoRoll() {
        if (!currentSampleForPopup) return;
        
        const data = pianoRollData[currentSampleForPopup];
        
        // Clear all notes
        data.notes = [];
        
        // Remove active class from all cells
        const cells = document.querySelectorAll('.piano-roll-cell.active');
        cells.forEach(cell => {
            cell.classList.remove('active');
        });
    }
    
    // Function to preview piano roll with looping
    function previewPianoRoll() {
        if (!currentSampleForPopup || isPreviewingPianoRoll) return;
        
        isPreviewingPianoRoll = true;
        currentPianoRollSample = currentSampleForPopup;
        
        const data = pianoRollData[currentSampleForPopup];
        
        // Sort notes by column (time)
        const sortedNotes = [...data.notes].sort((a, b) => a.col - b.col);
        
        if (sortedNotes.length === 0) return;
        
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(e => console.error('Error resuming audio context:', e));
        }
        
        // Get sound source
        const soundSource = data.soundSource;
        
        // Calculate timing
        const isLongSample = currentSampleForPopup > 60;
        let beatDuration, barDuration;
        
        if (isLongSample) {
            beatDuration = 60 / longLoopTempo;
            barDuration = beatDuration * 4;
        } else {
            const effectiveTempo = tempo + highTempo;
            beatDuration = 60 / effectiveTempo;
            barDuration = beatDuration * 4;
        }
        
        const sixteenthDuration = barDuration / 16;
        
        // Create a gain node for the preview
        const previewGain = audioContext.createGain();
        
        // Create filter nodes for the preview
        // Enhanced filters
        const lowShelfFilter = audioContext.createBiquadFilter();
        lowShelfFilter.type = 'lowshelf';
        lowShelfFilter.frequency.value = 200;
        lowShelfFilter.gain.value = data.filters.lowShelf || 0;
        
        const lowMidFilter = audioContext.createBiquadFilter();
        lowMidFilter.type = 'peaking';
        lowMidFilter.frequency.value = 500;
        lowMidFilter.Q.value = 1.0;
        lowMidFilter.gain.value = data.filters.lowMid || 0;
        
        const midFilter = audioContext.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = 1500;
        midFilter.Q.value = 1.0;
        midFilter.gain.value = data.filters.mid || 0;
        
        const highMidFilter = audioContext.createBiquadFilter();
        highMidFilter.type = 'peaking';
        highMidFilter.frequency.value = 4000;
        highMidFilter.Q.value = 1.0;
        highMidFilter.gain.value = data.filters.highMid || 0;
        
        const highShelfFilter = audioContext.createBiquadFilter();
        highShelfFilter.type = 'highshelf';
        highShelfFilter.frequency.value = 8000;
        highShelfFilter.gain.value = data.filters.highShelf || 0;
        
        // Delay filters
        const delayNode = audioContext.createDelay(1.0);
        delayNode.delayTime.value = (data.filters.delay.time || 0) / 1000;
        
        const delayFeedbackNode = audioContext.createGain();
        delayFeedbackNode.gain.value = (data.filters.delay.feedback || 0) / 100;
        
        // Connect filters: previewGain -> lowShelf -> lowMid -> mid -> highMid -> highShelf -> delay -> output
        previewGain.connect(lowShelfFilter);
        lowShelfFilter.connect(lowMidFilter);
        lowMidFilter.connect(midFilter);
        midFilter.connect(highMidFilter);
        highMidFilter.connect(highShelfFilter);
        
        // Connect delay
        highShelfFilter.connect(delayNode);
        delayNode.connect(delayFeedbackNode);
        delayFeedbackNode.connect(delayNode); // Feedback loop
        delayNode.connect(audioContext.destination);
        
        // Create analyzer for piano roll visualizer
        pianoRollVisualizerAnalyzer = audioContext.createAnalyser();
        pianoRollVisualizerAnalyzer.fftSize = 4096;
        pianoRollVisualizerAnalyzer.smoothingTimeConstant = 0.7;
        
        // Connect analyzer to the output
        delayNode.connect(pianoRollVisualizerAnalyzer);
        
        // Store filter nodes
        pianoRollFilterNodes = {
            // Enhanced filters
            lowShelf: lowShelfFilter,
            lowMid: lowMidFilter,
            mid: midFilter,
            highMid: highMidFilter,
            highShelf: highShelfFilter,
            // Delay filters
            delay: delayNode,
            delayFeedback: delayFeedbackNode
        };
        
        // Find the last column to determine loop length
        // MODIFIED: Use the full grid width instead of the last note position
        const loopDuration = data.gridWidth * sixteenthDuration;
        
        // Store preview nodes (without sortedNotes)
        pianoRollPreviewNodes[currentSampleForPopup] = {
            gain: previewGain,
            loopDuration: loopDuration,
            sixteenthDuration: sixteenthDuration,
            soundSource: soundSource,
            sampleRange: data.sampleRange,
            filters: data.filters
        };
        
        // Start the visualizer animation
        startPianoRollVisualizerAnimation();
        
        // Start the loop
        startPianoRollLoop();
    }
    
    // Function to start piano roll loop
    function startPianoRollLoop() {
        if (!isPreviewingPianoRoll || !currentPianoRollSample || !pianoRollPreviewNodes[currentPianoRollSample]) return;
        
        const nodes = pianoRollPreviewNodes[currentPianoRollSample];
        const currentTime = audioContext.currentTime;
        
        // Get the current notes from pianoRollData and sort them
        const currentNotes = pianoRollData[currentPianoRollSample].notes;
        const sortedNotes = [...currentNotes].sort((a, b) => a.col - b.col);
        
        // Schedule all notes for this loop
        sortedNotes.forEach(note => {
            const noteTime = currentTime + note.col * nodes.sixteenthDuration;
            
            if (nodes.soundSource === 'piano') {
                // Use piano sound
                playPianoNoteForPreview(note.row, noteTime, nodes.sixteenthDuration, nodes.gain);
            } else if (nodes.soundSource === 'synth') {
                // Use synth sound
                playSynthNoteForPreview(note.row, noteTime, nodes.sixteenthDuration, nodes.gain);
            } else if (nodes.soundSource === 'strings') {
                // Use strings sound
                playStringsNoteForPreview(note.row, noteTime, nodes.sixteenthDuration, nodes.gain);
            } else if (nodes.soundSource === 'bass') {
                // Use bass sound
                playBassNoteForPreview(note.row, noteTime, nodes.sixteenthDuration, nodes.gain);
            } else if (nodes.soundSource === 'lead') {
                // Use lead sound
                playLeadNoteForPreview(note.row, noteTime, nodes.sixteenthDuration, nodes.gain);
            } else if (nodes.soundSource === 'pad') {
                // Use pad sound
                playPadNoteForPreview(note.row, noteTime, nodes.sixteenthDuration, nodes.gain);
            } else if (nodes.soundSource === 'pluck') {
                // Use pluck sound
                playPluckNoteForPreview(note.row, noteTime, nodes.sixteenthDuration, nodes.gain);
            } else {
                // Use sample
                playSampleNoteForPreview(note.row, noteTime, nodes.sixteenthDuration, nodes.gain, currentPianoRollSample, nodes.sampleRange);
            }
        });
        
        // Set up interval for continuous looping
        pianoRollLoopInterval = setTimeout(() => {
            if (isPreviewingPianoRoll && currentPianoRollSample) {
                startPianoRollLoop();
            }
        }, nodes.loopDuration * 1000);
    }
    
    // Function to play a piano note for preview
    function playPianoNoteForPreview(row, time, duration, gainNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12); // Now 0-6 without adding 1
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // Sine wave for a basic piano-like sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Connect oscillator to gain and gain to output
        oscillator.connect(noteGain);
        noteGain.connect(gainNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope (ADSR-like)
        const now = time;
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a synth note for preview
    function playSynthNoteForPreview(row, time, duration, gainNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create two oscillators for a richer synth sound
        const oscillator1 = audioContext.createOscillator();
        oscillator1.type = 'sawtooth';
        
        const oscillator2 = audioContext.createOscillator();
        oscillator2.type = 'square';
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the synth sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 4;
        filter.Q.value = 10;
        
        // Connect oscillators to filter and filter to gain
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(gainNode);
        
        // Set frequencies
        oscillator1.frequency.value = frequency;
        oscillator2.frequency.value = frequency * 0.5; // One octave down for richness
        
        // Set up envelope
        const now = time;
        const attackTime = 0.05;
        const decayTime = 0.2;
        const sustainLevel = 0.6;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillators
        oscillator1.start(now);
        oscillator2.start(now);
        oscillator1.stop(now + duration);
        oscillator2.stop(now + duration);
    }
    
    // Function to play a strings note for preview
    function playStringsNoteForPreview(row, time, duration, gainNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'triangle'; // Triangle wave for strings-like sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the strings sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 2;
        filter.Q.value = 5;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(gainNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.1;
        const decayTime = 0.3;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a bass note for preview
    function playBassNoteForPreview(row, time, duration, gainNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sawtooth'; // Sawtooth wave for bass sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the bass sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 1.5;
        filter.Q.value = 5;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(gainNode);
        
        // Set frequency (one octave down for bass)
        oscillator.frequency.value = frequency * 0.5;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.05;
        const decayTime = 0.2;
        const sustainLevel = 0.8;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a lead note for preview
    function playLeadNoteForPreview(row, time, duration, gainNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sawtooth'; // Sawtooth wave for lead sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the lead sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 3;
        filter.Q.value = 2;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(gainNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.02;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a pad note for preview
    function playPadNoteForPreview(row, time, duration, gainNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // Sine wave for pad sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the pad sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 1.2;
        filter.Q.value = 3;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(gainNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.3;
        const decayTime = 0.5;
        const sustainLevel = 0.8;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a pluck note for preview
    function playPluckNoteForPreview(row, time, duration, gainNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'square'; // Square wave for pluck sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the pluck sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = frequency * 0.8;
        filter.Q.value = 5;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(gainNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.5;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a sample note for preview
    function playSampleNoteForPreview(row, time, duration, gainNode, sampleNumber, sampleRange) {
        if (!currentPlaying[sampleNumber] || !currentPlaying[sampleNumber].buffer) return;
        
        // Create a buffer source
        const source = audioContext.createBufferSource();
        source.buffer = currentPlaying[sampleNumber].buffer;
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Connect source to gain and gain to output
        source.connect(noteGain);
        noteGain.connect(gainNode);
        
        // Calculate playback rate based on row (pitch)
        // Each row is a semitone, so each row up is a multiplication of 2^(1/12)
        const semitoneRatio = Math.pow(2, 1/12);
        const middleRow = 42; // Middle row (C4)
        const pitchMultiplier = Math.pow(semitoneRatio, row - middleRow);
        
        source.playbackRate.value = pitchMultiplier;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Calculate start and end times based on sample range
        const bufferDuration = currentPlaying[sampleNumber].buffer.duration;
        const startTime = bufferDuration * (sampleRange.start / 100);
        const endTime = bufferDuration * (sampleRange.end / 100);
        
        // Start and stop the source
        source.start(now, startTime);
        source.stop(now + duration, endTime);
    }
    
    // Function to stop piano roll preview
    function stopPianoRollPreview() {
        if (!isPreviewingPianoRoll || !currentPianoRollSample) return;
        
        isPreviewingPianoRoll = false;
        
        // Clear the loop interval
        if (pianoRollLoopInterval) {
            clearTimeout(pianoRollLoopInterval);
            pianoRollLoopInterval = null;
        }
        
        // Stop and disconnect all preview nodes
        if (pianoRollPreviewNodes[currentPianoRollSample]) {
            const { gain } = pianoRollPreviewNodes[currentPianoRollSample];
            
            // Fade out quickly
            gain.gain.cancelScheduledValues(audioContext.currentTime);
            gain.gain.setValueAtTime(gain.gain.value, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
            
            // Disconnect after a short delay
            setTimeout(() => {
                gain.disconnect();
            }, 200);
            
            // Remove from preview nodes
            delete pianoRollPreviewNodes[currentPianoRollSample];
        }
        
        // Disconnect filter nodes
        if (pianoRollFilterNodes.lowShelf) {
            pianoRollFilterNodes.lowShelf.disconnect();
            pianoRollFilterNodes.lowShelf = null;
        }
        
        if (pianoRollFilterNodes.lowMid) {
            pianoRollFilterNodes.lowMid.disconnect();
            pianoRollFilterNodes.lowMid = null;
        }
        
        if (pianoRollFilterNodes.mid) {
            pianoRollFilterNodes.mid.disconnect();
            pianoRollFilterNodes.mid = null;
        }
        
        if (pianoRollFilterNodes.highMid) {
            pianoRollFilterNodes.highMid.disconnect();
            pianoRollFilterNodes.highMid = null;
        }
        
        if (pianoRollFilterNodes.highShelf) {
            pianoRollFilterNodes.highShelf.disconnect();
            pianoRollFilterNodes.highShelf = null;
        }
        
        // Disconnect delay filter nodes
        if (pianoRollFilterNodes.delay) {
            pianoRollFilterNodes.delay.disconnect();
            pianoRollFilterNodes.delay = null;
        }
        
        if (pianoRollFilterNodes.delayFeedback) {
            pianoRollFilterNodes.delayFeedback.disconnect();
            pianoRollFilterNodes.delayFeedback = null;
        }
        
        // Disconnect visualizer analyzer
        if (pianoRollVisualizerAnalyzer) {
            pianoRollVisualizerAnalyzer.disconnect();
            pianoRollVisualizerAnalyzer = null;
        }
        
        // Stop visualizer animation
        stopPianoRollVisualizerAnimation();
        
        currentPianoRollSample = null;
    }
    
    // Function to save piano roll as sample for current button
    async function savePianoRollAsSampleForCurrentButton() {
        if (!currentSampleForPopup) return;
        
        const data = pianoRollData[currentSampleForPopup];
        
        // Check if there are any notes to save
        if (data.notes.length === 0) {
            console.log('No notes to save');
            return;
        }
        
        // Sort notes by column (time)
        const sortedNotes = [...data.notes].sort((a, b) => a.col - b.col);
        
        // Get sound source
        const soundSource = data.soundSource;
        
        // Calculate timing
        const isLongSample = currentSampleForPopup > 60;
        let beatDuration, barDuration;
        
        if (isLongSample) {
            beatDuration = 60 / longLoopTempo;
            barDuration = beatDuration * 4;
        } else {
            const effectiveTempo = tempo + highTempo;
            beatDuration = 60 / effectiveTempo;
            barDuration = beatDuration * 4;
        }
        
        const sixteenthDuration = barDuration / 16;
        
        // Find the last column to determine buffer length
        // MODIFIED: Use the full grid width instead of the last note position
        const bufferLength = data.gridWidth * sixteenthDuration;
        
        // Create offline audio context for rendering
        const offlineContext = new OfflineAudioContext(2, audioContext.sampleRate * bufferLength, audioContext.sampleRate);
        
        // Create a master gain node for mixing
        const masterGain = offlineContext.createGain();
        
        // Create filter nodes
        // Enhanced filters
        const lowShelfFilter = offlineContext.createBiquadFilter();
        lowShelfFilter.type = 'lowshelf';
        lowShelfFilter.frequency.value = 200;
        lowShelfFilter.gain.value = data.filters.lowShelf || 0;
        
        const lowMidFilter = offlineContext.createBiquadFilter();
        lowMidFilter.type = 'peaking';
        lowMidFilter.frequency.value = 500;
        lowMidFilter.Q.value = 1.0;
        lowMidFilter.gain.value = data.filters.lowMid || 0;
        
        const midFilter = offlineContext.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = 1500;
        midFilter.Q.value = 1.0;
        midFilter.gain.value = data.filters.mid || 0;
        
        const highMidFilter = offlineContext.createBiquadFilter();
        highMidFilter.type = 'peaking';
        highMidFilter.frequency.value = 4000;
        highMidFilter.Q.value = 1.0;
        highMidFilter.gain.value = data.filters.highMid || 0;
        
        const highShelfFilter = offlineContext.createBiquadFilter();
        highShelfFilter.type = 'highshelf';
        highShelfFilter.frequency.value = 8000;
        highShelfFilter.gain.value = data.filters.highShelf || 0;
        
        // Delay filters
        const delayNode = offlineContext.createDelay(1.0);
        delayNode.delayTime.value = (data.filters.delay.time || 0) / 1000;
        
        const delayFeedbackNode = offlineContext.createGain();
        delayFeedbackNode.gain.value = (data.filters.delay.feedback || 0) / 100;
        
        // Connect filters: masterGain -> lowShelf -> lowMid -> mid -> highMid -> highShelf -> delay -> destination
        masterGain.connect(lowShelfFilter);
        lowShelfFilter.connect(lowMidFilter);
        lowMidFilter.connect(midFilter);
        midFilter.connect(highMidFilter);
        highMidFilter.connect(highShelfFilter);
        
        // Connect delay
        highShelfFilter.connect(delayNode);
        delayNode.connect(delayFeedbackNode);
        delayFeedbackNode.connect(delayNode); // Feedback loop
        delayNode.connect(offlineContext.destination);
        
        // Schedule all notes
        sortedNotes.forEach(note => {
            const noteTime = note.col * sixteenthDuration;
            
            if (soundSource === 'piano') {
                // Use piano sound
                renderPianoNote(offlineContext, note.row, noteTime, sixteenthDuration, masterGain);
            } else if (soundSource === 'synth') {
                // Use synth sound
                renderSynthNote(offlineContext, note.row, noteTime, sixteenthDuration, masterGain);
            } else if (soundSource === 'strings') {
                // Use strings sound
                renderStringsNote(offlineContext, note.row, noteTime, sixteenthDuration, masterGain);
            } else if (soundSource === 'bass') {
                // Use bass sound
                renderBassNote(offlineContext, note.row, noteTime, sixteenthDuration, masterGain);
            } else if (soundSource === 'lead') {
                // Use lead sound
                renderLeadNote(offlineContext, note.row, noteTime, sixteenthDuration, masterGain);
            } else if (soundSource === 'pad') {
                // Use pad sound
                renderPadNote(offlineContext, note.row, noteTime, sixteenthDuration, masterGain);
            } else if (soundSource === 'pluck') {
                // Use pluck sound
                renderPluckNote(offlineContext, note.row, noteTime, sixteenthDuration, masterGain);
            } else {
                // Use sample
                renderSampleNote(offlineContext, note.row, noteTime, sixteenthDuration, masterGain, currentSampleForPopup, data.sampleRange);
            }
        });
        
        // Render the audio
        try {
            const renderedBuffer = await offlineContext.startRendering();
            
            // Check if the buffer is valid
            if (!renderedBuffer || renderedBuffer.length === 0) {
                console.error('Error: Rendered buffer is empty or invalid');
                return;
            }
            
            // Update the sample's buffer
            currentPlaying[currentSampleForPopup].buffer = renderedBuffer;
            currentPlaying[currentSampleForPopup].loopDuration = renderedBuffer.duration;
            currentPlaying[currentSampleForPopup].bufferSampleNumber = currentSampleForPopup;
            currentPlaying[currentSampleForPopup].isCustomSample = true;
            
            // Update the button to indicate it's a custom sample
            const button = currentPlaying[currentSampleForPopup].button;
            if (button) {
                // Add custom indicator
                addCustomIndicator(button);
                
                // Remove no-sample class if it exists
                button.classList.remove('no-sample');
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
            
            console.log(`Piano roll saved as sample for ${currentSampleForPopup}`);
        } catch (error) {
            console.error('Error rendering piano roll:', error);
            throw error;
        }
    }
    
    // Function to render a piano note
    function renderPianoNote(offlineContext, row, time, duration, outputNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12); // Now 0-6 without adding 1
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = offlineContext.createOscillator();
        oscillator.type = 'sine'; // Sine wave for a basic piano-like sound
        
        // Create a gain node for this note
        const noteGain = offlineContext.createGain();
        
        // Connect oscillator to gain and gain to output
        oscillator.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope (ADSR-like)
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, time + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Start and stop the oscillator
        oscillator.start(time);
        oscillator.stop(time + duration);
    }
    
    // Function to render a synth note
    function renderSynthNote(offlineContext, row, time, duration, outputNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create two oscillators for a richer synth sound
        const oscillator1 = offlineContext.createOscillator();
        oscillator1.type = 'sawtooth';
        
        const oscillator2 = offlineContext.createOscillator();
        oscillator2.type = 'square';
        
        // Create a gain node for this note
        const noteGain = offlineContext.createGain();
        
        // Create a filter for the synth sound
        const filter = offlineContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 4;
        filter.Q.value = 10;
        
        // Connect oscillators to filter and filter to gain
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequencies
        oscillator1.frequency.value = frequency;
        oscillator2.frequency.value = frequency * 0.5; // One octave down for richness
        
        // Set up envelope
        const attackTime = 0.05;
        const decayTime = 0.2;
        const sustainLevel = 0.6;
        
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, time + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Start and stop the oscillators
        oscillator1.start(time);
        oscillator2.start(time);
        oscillator1.stop(time + duration);
        oscillator2.stop(time + duration);
    }
    
    // Function to render a strings note
    function renderStringsNote(offlineContext, row, time, duration, outputNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = offlineContext.createOscillator();
        oscillator.type = 'triangle'; // Triangle wave for strings-like sound
        
        // Create a gain node for this note
        const noteGain = offlineContext.createGain();
        
        // Create a filter for the strings sound
        const filter = offlineContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 2;
        filter.Q.value = 5;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const attackTime = 0.1;
        const decayTime = 0.3;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, time + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Start and stop the oscillator
        oscillator.start(time);
        oscillator.stop(time + duration);
    }
    
    // Function to render a bass note
    function renderBassNote(offlineContext, row, time, duration, outputNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = offlineContext.createOscillator();
        oscillator.type = 'sawtooth'; // Sawtooth wave for bass sound
        
        // Create a gain node for this note
        const noteGain = offlineContext.createGain();
        
        // Create a filter for the bass sound
        const filter = offlineContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 1.5;
        filter.Q.value = 5;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency (one octave down for bass)
        oscillator.frequency.value = frequency * 0.5;
        
        // Set up envelope
        const attackTime = 0.05;
        const decayTime = 0.2;
        const sustainLevel = 0.8;
        
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, time + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Start and stop the oscillator
        oscillator.start(time);
        oscillator.stop(time + duration);
    }
    
    // Function to render a lead note
    function renderLeadNote(offlineContext, row, time, duration, outputNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = offlineContext.createOscillator();
        oscillator.type = 'sawtooth'; // Sawtooth wave for lead sound
        
        // Create a gain node for this note
        const noteGain = offlineContext.createGain();
        
        // Create a filter for the lead sound
        const filter = offlineContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 3;
        filter.Q.value = 2;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const attackTime = 0.02;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, time + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Start and stop the oscillator
        oscillator.start(time);
        oscillator.stop(time + duration);
    }
    
    // Function to render a pad note
    function renderPadNote(offlineContext, row, time, duration, outputNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = offlineContext.createOscillator();
        oscillator.type = 'sine'; // Sine wave for pad sound
        
        // Create a gain node for this note
        const noteGain = offlineContext.createGain();
        
        // Create a filter for the pad sound
        const filter = offlineContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 1.2;
        filter.Q.value = 3;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const attackTime = 0.3;
        const decayTime = 0.5;
        const sustainLevel = 0.8;
        
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, time + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Start and stop the oscillator
        oscillator.start(time);
        oscillator.stop(time + duration);
    }
    
    // Function to render a pluck note
    function renderPluckNote(offlineContext, row, time, duration, outputNode) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = offlineContext.createOscillator();
        oscillator.type = 'square'; // Square wave for pluck sound
        
        // Create a gain node for this note
        const noteGain = offlineContext.createGain();
        
        // Create a filter for the pluck sound
        const filter = offlineContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = frequency * 0.8;
        filter.Q.value = 5;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.5;
        
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, time + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Start and stop the oscillator
        oscillator.start(time);
        oscillator.stop(time + duration);
    }
    
    // Function to render a sample note
    function renderSampleNote(offlineContext, row, time, duration, outputNode, sampleNumber, sampleRange) {
        if (!currentPlaying[sampleNumber] || !currentPlaying[sampleNumber].buffer) return;
        
        // Create a buffer source
        const source = offlineContext.createBufferSource();
        source.buffer = currentPlaying[sampleNumber].buffer;
        
        // Create a gain node for this note
        const noteGain = offlineContext.createGain();
        
        // Connect source to gain and gain to output
        source.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Calculate playback rate based on row (pitch)
        // Each row is a semitone, so each row up is a multiplication of 2^(1/12)
        const semitoneRatio = Math.pow(2, 1/12);
        const middleRow = 42; // Middle row (C4)
        const pitchMultiplier = Math.pow(semitoneRatio, row - middleRow);
        
        source.playbackRate.value = pitchMultiplier;
        
        // Set up envelope
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, time + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Calculate start and end times based on sample range
        const bufferDuration = currentPlaying[sampleNumber].buffer.duration;
        const startTime = bufferDuration * (sampleRange.start / 100);
        const endTime = bufferDuration * (sampleRange.end / 100);
        
        // Start and stop the source
        source.start(time, startTime);
        source.stop(time + duration, endTime);
    }
    
    // Function to apply piano roll settings
    function applyPianoRollSettings() {
        if (!currentSampleForPopup) return;
        
        // Store the piano roll data in the sample's effects
        if (!currentPlaying[currentSampleForPopup].effects) {
            currentPlaying[currentSampleForPopup].effects = {};
        }
        
        currentPlaying[currentSampleForPopup].effects.pianoRoll = JSON.parse(JSON.stringify(pianoRollData[currentSampleForPopup]));
    }
    
    // Function to play a piano note for a sample
    function playPianoNoteForSample(row, time, duration, outputNode, sampleNumber) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12); // Now 0-6 without adding 1
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // Sine wave for a basic piano-like sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Connect oscillator to gain and gain to output
        oscillator.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope (ADSR-like)
        const now = time;
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a synth note for a sample
    function playSynthNoteForSample(row, time, duration, outputNode, sampleNumber) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create two oscillators for a richer synth sound
        const oscillator1 = audioContext.createOscillator();
        oscillator1.type = 'sawtooth';
        
        const oscillator2 = audioContext.createOscillator();
        oscillator2.type = 'square';
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the synth sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 4;
        filter.Q.value = 10;
        
        // Connect oscillators to filter and filter to gain
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequencies
        oscillator1.frequency.value = frequency;
        oscillator2.frequency.value = frequency * 0.5; // One octave down for richness
        
        // Set up envelope
        const now = time;
        const attackTime = 0.05;
        const decayTime = 0.2;
        const sustainLevel = 0.6;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillators
        oscillator1.start(now);
        oscillator2.start(now);
        oscillator1.stop(now + duration);
        oscillator2.stop(now + duration);
    }
    
    // Function to play a strings note for a sample
    function playStringsNoteForSample(row, time, duration, outputNode, sampleNumber) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'triangle'; // Triangle wave for strings-like sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the strings sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 2;
        filter.Q.value = 5;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.1;
        const decayTime = 0.3;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a bass note for a sample
    function playBassNoteForSample(row, time, duration, outputNode, sampleNumber) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sawtooth'; // Sawtooth wave for bass sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the bass sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 1.5;
        filter.Q.value = 5;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency (one octave down for bass)
        oscillator.frequency.value = frequency * 0.5;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.05;
        const decayTime = 0.2;
        const sustainLevel = 0.8;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a lead note for a sample
    function playLeadNoteForSample(row, time, duration, outputNode, sampleNumber) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sawtooth'; // Sawtooth wave for lead sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the lead sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 3;
        filter.Q.value = 2;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.02;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a pad note for a sample
    function playPadNoteForSample(row, time, duration, outputNode, sampleNumber) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // Sine wave for pad sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the pad sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 1.2;
        filter.Q.value = 3;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.3;
        const decayTime = 0.5;
        const sustainLevel = 0.8;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a pluck note for a sample
    function playPluckNoteForSample(row, time, duration, outputNode, sampleNumber) {
        // Calculate note frequency from row
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = row % 12;
        const octave = Math.floor(row / 12);
        
        const noteName = noteNames[noteIndex];
        const frequency = getNoteFrequency(noteName, octave);
        
        // Create an oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'square'; // Square wave for pluck sound
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Create a filter for the pluck sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = frequency * 0.8;
        filter.Q.value = 5;
        
        // Connect oscillator to filter and filter to gain
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Set frequency
        oscillator.frequency.value = frequency;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.5;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Start and stop the oscillator
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Function to play a sample note for a sample
    function playSampleNoteForSample(row, time, duration, outputNode, sampleNumber, sampleRange) {
        if (!currentPlaying[sampleNumber] || !currentPlaying[sampleNumber].buffer) return;
        
        // Create a buffer source
        const source = audioContext.createBufferSource();
        source.buffer = currentPlaying[sampleNumber].buffer;
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        
        // Connect source to gain and gain to output
        source.connect(noteGain);
        noteGain.connect(outputNode);
        
        // Calculate playback rate based on row (pitch)
        // Each row is a semitone, so each row up is a multiplication of 2^(1/12)
        const semitoneRatio = Math.pow(2, 1/12);
        const middleRow = 42; // Middle row (C4)
        const pitchMultiplier = Math.pow(semitoneRatio, row - middleRow);
        
        source.playbackRate.value = pitchMultiplier;
        
        // Set up envelope
        const now = time;
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + attackTime);
        noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Calculate start and end times based on sample range
        const bufferDuration = currentPlaying[sampleNumber].buffer.duration;
        const startTime = bufferDuration * (sampleRange.start / 100);
        const endTime = bufferDuration * (sampleRange.end / 100);
        
        // Start and stop the source
        source.start(now, startTime);
        source.stop(now + duration, endTime);
    }
    
    // Function to get note frequency
    function getNoteFrequency(noteName, octave) {
        // A4 = 440Hz is the reference
        const A4 = 440;
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Find the position of the note in the scale
        const noteIndex = noteNames.indexOf(noteName);
        
        // Calculate the semitone distance from A4
        const semitoneDistance = (octave - 4) * 12 + (noteIndex - 9);
        
        // Calculate the frequency using the formula: f = 440 * 2^(n/12)
        return A4 * Math.pow(2, semitoneDistance / 12);
    }
    
    // Function to open sample selection popup
    function openSampleSelectionPopup() {
        if (!currentSampleForPopup) return;
        
        currentSampleForSelection = currentSampleForPopup;
        
        // Get sample data
        const sample = currentPlaying[currentSampleForPopup];
        
        if (!sample.buffer) {
            console.error('No sample buffer available for selection');
            return;
        }
        
        // Set initial values
        const data = pianoRollData[currentSampleForPopup];
        sampleSelectionStart = data.sampleRange.start;
        sampleSelectionEnd = data.sampleRange.end;
        
        // Update sliders
        document.getElementById('sample-selection-start').value = sampleSelectionStart;
        document.getElementById('sample-selection-end').value = sampleSelectionEnd;
        
        // Update display values
        updateSampleSelectionDisplay();
        
        // Draw waveform
        drawSampleWaveform();
        
        // Show popup
        sampleSelectionPopup.style.display = 'block';
    }
});