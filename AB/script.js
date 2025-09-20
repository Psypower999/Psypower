document.addEventListener('DOMContentLoaded', function() {
    // Check if required elements exist
    const buttonGrid = document.getElementById('buttonGrid');
    const tempoSlider = document.getElementById('tempo');
    const tempoDisplay = document.getElementById('tempoDisplay');
    const playButton = document.getElementById('playButton');
    
    // Log any missing elements
    if (!buttonGrid) console.error('buttonGrid element not found');
    if (!tempoSlider) console.error('tempoSlider element not found');
    if (!tempoDisplay) console.error('tempoDisplay element not found');
    if (!playButton) console.error('playButton element not found');
    
    // Only proceed if all required elements exist
    if (!buttonGrid || !tempoSlider || !tempoDisplay || !playButton) {
        console.error('One or more required elements are missing');
        return;
    }
    
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
    let beatDuration = 60 / tempo; // Duration of one beat in seconds
    let barDuration = beatDuration * 4; // 4 beats per bar
    let nextBarTime = 0; // When the next bar starts
    let lookahead = 25.0; // ms
    let scheduleAheadTime = 0.1; // seconds
    let timerId = null;
    
    // Default loop length (in bars)
    let loopLength = 1;
    
    // Default long sample loop length (in bars)
    let longLoopLength = 1;
    
    // Object to track currently playing audio in each group
    const currentPlaying = {};
    
    // Create volume controls for each group
    const volumeControlsContainer = document.createElement('div');
    volumeControlsContainer.className = 'volume-controls';
    volumeControlsContainer.innerHTML = '<h3>Group Volumes</h3>';
    
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
        volumeSlider.value = '80'; // Default volume at 80%
        volumeSlider.step = '1'; // Precision of 1%
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
            
            // Update gain if the group is currently playing
            if (currentPlaying[group] && currentPlaying[group].gainNode) {
                currentPlaying[group].gainNode.gain.value = volume / 100;
            }
            
            // Store the volume for future use
            if (!currentPlaying[group].volume) {
                currentPlaying[group].volume = {};
            }
            currentPlaying[group].volume.value = volume / 100;
        });
    }
    
    // Add volume controls to the controls section
    document.querySelector('.controls').appendChild(volumeControlsContainer);
    
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
        
        // Determine group (0-9)
        const group = Math.floor((i - 1) / 10);
        
        // Add group class for styling
        button.classList.add(`group-${group}`);
        
        // Initialize group if not exists
        if (!currentPlaying[group]) {
            currentPlaying[group] = {
                button: null,
                buffer: null,
                source: null,
                gainNode: null,
                loopDuration: null, // Store the original loop duration in seconds
                sampleNumber: null, // Store the sample number for this group
                isScheduled: false, // Changed from isPlaying to isScheduled
                startTime: 0, // When the sample started playing
                scheduledForNextBar: false, // Track if scheduled for next bar
                isLongSample: i > 70, // Flag for long samples (71-100)
                nextLoopTime: 0, // When the next loop should start
                scheduledTimeout: null, // Track any scheduled timeouts
                loopStartTime: 0, // When the current loop cycle started
                originalTempo: tempo, // Store the original tempo for this sample
                volume: { value: 0.8 }, // Default volume at 80%
                bufferSampleNumber: null, // Track which sample the buffer is for
                isActive: false // Track if the button is active (selected)
            };
        }
        
        // Add click event to button
        button.addEventListener('click', function() {
            // If this audio is currently playing in its group
            if (currentPlaying[group].button === button) {
                // If it's playing, stop it but keep it active
                if (currentPlaying[group].isScheduled) {
                    stopSample(group);
                    button.classList.remove('active');
                    currentPlaying[group].isActive = false;
                } else {
                    // If it's stopped but still active, play it again
                    button.classList.add('active');
                    currentPlaying[group].isActive = true;
                    currentPlaying[group].scheduledForNextBar = true;
                    
                    if (isPlaying && currentPlaying[group].buffer) {
                        scheduleSampleForNextBar(group);
                    }
                }
            } else {
                // Stop any other audio in the same group
                if (currentPlaying[group].button) {
                    currentPlaying[group].button.classList.remove('active');
                    stopSample(group);
                    currentPlaying[group].isActive = false;
                }
                
                // Set this as the active sample
                currentPlaying[group].button = button;
                currentPlaying[group].sampleNumber = i;
                currentPlaying[group].isLongSample = i > 70;
                currentPlaying[group].originalTempo = tempo;
                button.classList.add('active');
                currentPlaying[group].isActive = true;
                currentPlaying[group].scheduledForNextBar = true;
                
                // Load audio if not already loaded or if it's a different sample
                if (!currentPlaying[group].buffer || currentPlaying[group].bufferSampleNumber !== i) {
                    loadAudio(i, group);
                } else if (isPlaying) {
                    // If buffer is already loaded and we're playing, schedule it
                    scheduleSampleForNextBar(group);
                }
            }
        });
        
        // Add to grid
        buttonGrid.appendChild(button);
    }
    
    // Set up loop length buttons
    const loopButtons = document.querySelectorAll('.loop-button');
    loopButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            loopButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get loop length from dataset with validation
            const newLoopLength = parseInt(this.dataset.loop);
            
            // Validate the parsed value
            if (isNaN(newLoopLength) || newLoopLength <= 0) {
                console.error('Invalid loop length value:', this.dataset.loop);
                return;
            }
            
            // Set loop length
            loopLength = newLoopLength;
            
            // If playing, update all drum samples with new loop length
            if (isPlaying) {
                for (let group = 0; group < 10; group++) {
                    if (currentPlaying[group].button && 
                        currentPlaying[group].buffer && 
                        currentPlaying[group].scheduledForNextBar &&
                        !currentPlaying[group].isLongSample) {
                        
                        // Update the drum sample with new loop length
                        updateDrumSampleLoop(group);
                    }
                }
            }
            
            console.log(`Loop length set to ${loopLength} bars`);
        });
    });
    
    // Set default loop length button as active
    const defaultLoopButton = document.querySelector('.loop-button[data-loop="1"]');
    if (defaultLoopButton) {
        defaultLoopButton.classList.add('active');
    }
    
    // Set up long sample loop length buttons
    const longLoopButtons = document.querySelectorAll('.long-loop-button');
    longLoopButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            longLoopButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get long loop length from dataset with validation
            const newLongLoopLength = parseInt(this.dataset.longLoop);
            
            // Validate the parsed value
            if (isNaN(newLongLoopLength) || newLongLoopLength <= 0) {
                console.error('Invalid long loop length value:', this.dataset.longLoop);
                return;
            }
            
            // Set long loop length
            longLoopLength = newLongLoopLength;
            
            // If playing, update all long samples with new loop length
            if (isPlaying) {
                for (let group = 0; group < 10; group++) {
                    if (currentPlaying[group].button && 
                        currentPlaying[group].buffer && 
                        currentPlaying[group].scheduledForNextBar &&
                        currentPlaying[group].isLongSample) {
                        
                        // Update the long sample with new loop length
                        updateLongSampleLoop(group);
                    }
                }
            }
            
            console.log(`Long sample loop length set to ${longLoopLength} bars`);
        });
    });
    
    // Set default long loop length button as active
    const defaultLongLoopButton = document.querySelector('.long-loop-button[data-long-loop="1"]');
    if (defaultLongLoopButton) {
        defaultLongLoopButton.classList.add('active');
    }
    
    // Load audio file
    function loadAudio(sampleNumber, group) {
        const audio = new Audio();
        audio.src = `./mykicks/${sampleNumber}.wav`;
        
        // When audio is loaded, decode it and store as buffer
        audio.addEventListener('canplaythrough', function() {
            fetch(audio.src)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    currentPlaying[group].buffer = audioBuffer;
                    // Store the original duration
                    currentPlaying[group].loopDuration = audioBuffer.duration;
                    // Track which sample this buffer is for
                    currentPlaying[group].bufferSampleNumber = sampleNumber;
                    
                    // If this sample is scheduled for next bar and we're playing, schedule it
                    if (isPlaying && currentPlaying[group].scheduledForNextBar && currentPlaying[group].isActive) {
                        // Cancel any existing timeout for this group
                        if (currentPlaying[group].scheduledTimeout) {
                            clearTimeout(currentPlaying[group].scheduledTimeout);
                            currentPlaying[group].scheduledTimeout = null;
                        }
                        
                        // Schedule the sample for the next bar
                        scheduleSampleForNextBar(group);
                    }
                })
                .catch(e => console.error("Error loading audio:", e));
        });
        
        // Set initial loading state
        audio.load();
    }
    
    // Schedule a sample to play at the next bar
    function scheduleSampleForNextBar(group) {
        if (!currentPlaying[group].buffer || !currentPlaying[group].scheduledForNextBar) return;
        
        // Store the scheduling time
        const scheduleTime = nextBarTime;
        
        // Set a timeout to play the sample at the right time
        const timeUntilNextBar = (scheduleTime - audioContext.currentTime) * 1000;
        
        // Cancel any existing timeout for this group
        if (currentPlaying[group].scheduledTimeout) {
            clearTimeout(currentPlaying[group].scheduledTimeout);
        }
        
        // Store the timeout reference
        currentPlaying[group].scheduledTimeout = setTimeout(() => {
            if (currentPlaying[group].scheduledForNextBar && currentPlaying[group].isActive) {
                playSampleAtTime(group, audioContext.currentTime);
            }
            currentPlaying[group].scheduledTimeout = null;
        }, Math.max(0, timeUntilNextBar));
    }
    
    // Play a sample at a specific time
    function playSampleAtTime(group, startTime) {
        if (!currentPlaying[group].buffer || !currentPlaying[group].scheduledForNextBar) return;
        
        // Stop any existing sample in this group
        if (currentPlaying[group].source) {
            try {
                currentPlaying[group].source.stop();
                currentPlaying[group].source.disconnect();
            } catch (e) {
                console.warn('Error stopping audio source:', e);
            }
            currentPlaying[group].source = null;
            currentPlaying[group].gainNode = null;
        }
        
        // Create a new source
        const source = audioContext.createBufferSource();
        source.buffer = currentPlaying[group].buffer;
        
        // Create a gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = currentPlaying[group].volume.value;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Store references
        currentPlaying[group].source = source;
        currentPlaying[group].gainNode = gainNode;
        currentPlaying[group].startTime = startTime;
        currentPlaying[group].isScheduled = true;
        currentPlaying[group].loopStartTime = startTime;
        
        if (currentPlaying[group].isLongSample) {
            // For long samples (71-100): stretch to fit the loop length
            const desiredLoopDuration = barDuration * longLoopLength;
            
            // Validate values before calculating playback rate
            if (!isFinite(desiredLoopDuration) || desiredLoopDuration <= 0 || 
                !isFinite(currentPlaying[group].loopDuration) || currentPlaying[group].loopDuration <= 0) {
                console.error('Invalid values for long sample:', {
                    desiredLoopDuration,
                    loopDuration: currentPlaying[group].loopDuration
                });
                return;
            }
            
            const playbackRate = currentPlaying[group].loopDuration / desiredLoopDuration;
            
            // Validate playback rate before setting it
            if (!isFinite(playbackRate) || playbackRate <= 0) {
                console.error('Invalid playback rate for long sample:', playbackRate);
                return;
            }
            
            source.loop = true;
            source.loopStart = 0;
            source.loopEnd = currentPlaying[group].loopDuration;
            source.playbackRate.value = playbackRate;
            
            // Start playback at the specified time
            source.start(startTime);
            
            // No onended needed for long samples because they loop
        } else {
            // For drum samples (1-70): use built-in looping with adjusted playback rate
            const desiredLoopDuration = barDuration * loopLength;
            
            // Validate values before calculating playback rate
            if (!isFinite(desiredLoopDuration) || desiredLoopDuration <= 0 || 
                !isFinite(currentPlaying[group].loopDuration) || currentPlaying[group].loopDuration <= 0) {
                console.error('Invalid values for drum sample:', {
                    desiredLoopDuration,
                    loopDuration: currentPlaying[group].loopDuration
                });
                return;
            }
            
            const playbackRate = currentPlaying[group].loopDuration / desiredLoopDuration;
            
            // Validate playback rate before setting it
            if (!isFinite(playbackRate) || playbackRate <= 0) {
                console.error('Invalid playback rate for drum sample:', playbackRate);
                return;
            }
            
            source.loop = true;
            source.loopStart = 0;
            source.loopEnd = currentPlaying[group].loopDuration;
            source.playbackRate.value = playbackRate;
            
            // Start playback at the specified time
            source.start(startTime);
            
            // No onended needed for drum samples because they loop
        }
        
        console.log(`Group ${group} (${currentPlaying[group].isLongSample ? 'long' : 'drum'}) started at ${startTime}`);
    }
    
    // Update a drum sample's loop parameters
    function updateDrumSampleLoop(group) {
        if (!currentPlaying[group].source || currentPlaying[group].isLongSample) return;
        
        // Calculate new playback rate based on current tempo and loop length
        const desiredLoopDuration = barDuration * loopLength;
        
        // Validate values before calculating playback rate
        if (!isFinite(desiredLoopDuration) || desiredLoopDuration <= 0 || 
            !isFinite(currentPlaying[group].loopDuration) || currentPlaying[group].loopDuration <= 0) {
            console.error('Invalid values for updating drum sample:', {
                desiredLoopDuration,
                loopDuration: currentPlaying[group].loopDuration,
                barDuration,
                loopLength
            });
            return;
        }
        
        const playbackRate = currentPlaying[group].loopDuration / desiredLoopDuration;
        
        // Validate playback rate before setting it
        if (!isFinite(playbackRate) || playbackRate <= 0) {
            console.error('Invalid playback rate for updating drum sample:', playbackRate);
            return;
        }
        
        // Update the playback rate
        currentPlaying[group].source.playbackRate.value = playbackRate;
    }
    
    // Update a long sample's loop parameters
    function updateLongSampleLoop(group) {
        if (!currentPlaying[group].source || !currentPlaying[group].isLongSample) return;
        
        // Calculate new playback rate based on long loop length
        const desiredLoopDuration = barDuration * longLoopLength;
        
        // Validate values before calculating playback rate
        if (!isFinite(desiredLoopDuration) || desiredLoopDuration <= 0 || 
            !isFinite(currentPlaying[group].loopDuration) || currentPlaying[group].loopDuration <= 0) {
            console.error('Invalid values for updating long sample:', {
                desiredLoopDuration,
                loopDuration: currentPlaying[group].loopDuration,
                barDuration,
                longLoopLength
            });
            return;
        }
        
        const playbackRate = currentPlaying[group].loopDuration / desiredLoopDuration;
        
        // Validate playback rate before setting it
        if (!isFinite(playbackRate) || playbackRate <= 0) {
            console.error('Invalid playback rate for updating long sample:', playbackRate);
            return;
        }
        
        // Update the playback rate
        currentPlaying[group].source.playbackRate.value = playbackRate;
    }
    
    // Stop a sample
    function stopSample(group) {
        // Cancel any scheduled timeout for this group
        if (currentPlaying[group].scheduledTimeout) {
            clearTimeout(currentPlaying[group].scheduledTimeout);
            currentPlaying[group].scheduledTimeout = null;
        }
        
        if (currentPlaying[group].source) {
            try {
                // Only call stop if the source has been started
                if (currentPlaying[group].isScheduled) {
                    currentPlaying[group].source.stop();
                }
                currentPlaying[group].source.disconnect();
                currentPlaying[group].source = null;
                currentPlaying[group].gainNode = null;
            } catch (e) {
                console.warn('Error stopping audio source:', e);
                currentPlaying[group].source = null;
                currentPlaying[group].gainNode = null;
            }
        }
        
        currentPlaying[group].isScheduled = false;
        // Don't set scheduledForNextBar to false here, as we want to allow replaying
    }
    
    // Update timing when tempo changes
    function updateTiming() {
        // Validate tempo before calculating beat duration
        if (!isFinite(tempo) || tempo <= 0) {
            console.error('Invalid tempo value:', tempo);
            return;
        }
        
        beatDuration = 60 / tempo; // Duration of one beat in seconds
        barDuration = beatDuration * 4; // 4 beats per bar
    }
    
    // Scheduler function to keep samples in sync
    function scheduler() {
        // Calculate the current time
        const currentTime = audioContext.currentTime;
        
        // Schedule samples for the next bar if it's within our lookahead window
        while (nextBarTime < currentTime + scheduleAheadTime) {
            // Move to the next bar
            nextBarTime += barDuration;
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
        
        tempoDisplay.textContent = `${tempo} BPM`;
        updateTiming();
        
        // If we're playing, update all drum samples with new tempo
        if (isPlaying) {
            for (let group = 0; group < 10; group++) {
                if (currentPlaying[group].button && 
                    currentPlaying[group].buffer && 
                    currentPlaying[group].scheduledForNextBar &&
                    !currentPlaying[group].isLongSample) {
                    
                    // Update the drum sample with new tempo
                    updateDrumSampleLoop(group);
                }
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
            
            // Set the next bar time to the current time
            nextBarTime = audioContext.currentTime;
            
            // Start all active samples
            for (let group = 0; group < 10; group++) {
                if (currentPlaying[group].button && 
                    currentPlaying[group].buffer && 
                    currentPlaying[group].scheduledForNextBar &&
                    currentPlaying[group].isActive) {
                    
                    // Cancel any existing timeout for this group
                    if (currentPlaying[group].scheduledTimeout) {
                        clearTimeout(currentPlaying[group].scheduledTimeout);
                        currentPlaying[group].scheduledTimeout = null;
                    }
                    
                    // For both drum and long samples, schedule for the next bar
                    scheduleSampleForNextBar(group);
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
            for (let group = 0; group < 10; group++) {
                stopSample(group);
            }
        }
    });
});