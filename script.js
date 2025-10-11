// Base URL detection for GitHub Pages compatibility
const getBaseUrl = () => {
    if (window.location.hostname.includes('github.io')) {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
            return '/' + pathParts[0] + '/';
        }
    }
    return '/';
};

const baseUrl = getBaseUrl();

let currentSong = new Audio();
let songs = [];
let currFolder = '';
let currentAlbum = '';
let currentSongIndex = 0; // Track current song index

// Global album index for search
let albumToSongs = {}; // { [albumName: string]: string[] }
let albumLoadInFlight = {}; // { [albumName: string]: Promise<string[]> }

// Performance optimizations
let isMobile = window.innerWidth <= 768;
let searchTimeout = null;
let resizeTimeout = null;

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Loading indicator functions
function showLoading() {
    const loadingIndicator = document.querySelector('.loading-indicator');
    const songInfo = document.querySelector('.songinfo');
    if (loadingIndicator && songInfo) {
        loadingIndicator.style.display = 'flex';
        songInfo.style.display = 'none';
    }
}

function hideLoading() {
    const loadingIndicator = document.querySelector('.loading-indicator');
    const songInfo = document.querySelector('.songinfo');
    if (loadingIndicator && songInfo) {
        loadingIndicator.style.display = 'none';
        songInfo.style.display = 'block';
    }
}

// Add event listeners to the audio element for debugging and user feedback
currentSong.addEventListener('loadstart', () => {
    console.log('Audio: loadstart');
    showLoading();
});

currentSong.addEventListener('loadeddata', () => {
    console.log('Audio: loadeddata');
    hideLoading();
});

currentSong.addEventListener('canplay', () => {
    console.log('Audio: canplay');
    hideLoading();
});

currentSong.addEventListener('play', () => {
    console.log('Audio: play event');
    hideLoading();
});

currentSong.addEventListener('pause', () => {
    console.log('Audio: pause event');
});

currentSong.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    hideLoading();
    // Show user-friendly error message
    const songInfoEl = document.querySelector(".songinfo");
    if (songInfoEl) {
        songInfoEl.innerHTML = "Error loading track";
        songInfoEl.style.color = "#ff6b6b";
    }
});

// Function to clean song names by removing track numbers and file extensions
function cleanSongName(filename) {
    // Remove .mp3 extension
    let cleanName = filename.replace('.mp3', '');
    
    // Remove track numbers (patterns like "01 - ", "1. ", "01.", etc.)
    cleanName = cleanName.replace(/^\d+\.?\s*-?\s*/, '');
    
    // Decode URL encoding (%20 becomes space, etc.)
    cleanName = decodeURIComponent(cleanName);
    
    // Remove any remaining leading/trailing spaces
    cleanName = cleanName.trim();
    
    return cleanName;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Load songs for an album from the manifest
async function loadAlbumSongs(albumName) {
    if (albumToSongs[albumName]) return albumToSongs[albumName];
    if (albumLoadInFlight[albumName]) return albumLoadInFlight[albumName];

    const p = (async () => {
        try {
            const manifestUrl = `${baseUrl}Website/songs/manifest.json`;
            const res = await fetch(manifestUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const manifest = await res.json();
            
            const album = manifest.albums.find(a => a.folder === albumName);
            if (!album) {
                console.error('Album not found in manifest:', albumName);
                albumToSongs[albumName] = [];
                return [];
            }
            
            albumToSongs[albumName] = album.songs || [];
            return albumToSongs[albumName];
        } catch (e) {
            console.error('Failed loading album songs for', albumName, e);
            albumToSongs[albumName] = [];
            return [];
        } finally {
            delete albumLoadInFlight[albumName];
        }
    })();

    albumLoadInFlight[albumName] = p;
    return p;
}

// Render global search results (songs across all albums) into the sidebar
async function renderSongSearchResults(query) {
    const q = query.trim().toLowerCase();
    const ul = document.querySelector('.songList ul');
    if (!ul) return;
    ul.innerHTML = '';
    if (q === '') return;

    // Fetch the manifest to get all albums and songs
    try {
        const manifestUrl = `${baseUrl}Website/songs/manifest.json`;
        const res = await fetch(manifestUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const manifest = await res.json();
        
        // Collect matching songs
        const results = [];
        for (const album of manifest.albums) {
            for (const filename of album.songs || []) {
                const name = cleanSongName(filename).toLowerCase();
                if (name.includes(q)) {
                    results.push({ 
                        albumName: album.folder, 
                        filename, 
                        cleanName: cleanSongName(filename),
                        albumTitle: album.title
                    });
                }
            }
        }

        // Render results
        if (results.length === 0) {
            ul.innerHTML = `<li style="text-align: center; padding: 20px; color: #666;">No matching songs</li>`;
            return;
        }

        const fragments = [];
        for (const r of results) {
            const cover = `${baseUrl}Website/songs/${r.albumName}/cover.jpg`;
            fragments.push(
                `<li data-album="${r.albumName}" data-track="${encodeURIComponent(r.filename)}">
                    <img width="40" height="40" src="${cover}" alt="Album cover" style="border-radius:4px;object-fit:cover;">
                    <div class="info">
                        <div>${r.cleanName}</div>
                        <div>${r.albumTitle}</div>
                    </div>
                </li>`
            );
        }
        ul.innerHTML = fragments.join('');

        // Attach click listeners to play the selected global result
        Array.from(ul.querySelectorAll('li[data-album][data-track]')).forEach(li => {
            li.addEventListener('click', () => {
                const albumName = li.getAttribute('data-album');
                const track = decodeURIComponent(li.getAttribute('data-track'));
                // Set context to the album of the clicked song
                currFolder = `${baseUrl}Website/songs/${albumName}`;
                currentAlbum = albumName;
                songs = albumToSongs[albumName] ? [...albumToSongs[albumName]] : [];
                // Update current song index
                currentSongIndex = songs.findIndex(song => cleanSongName(song) === cleanSongName(track));
                if (currentSongIndex === -1) currentSongIndex = 0;
                // Highlight the corresponding album card
                document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
                const card = document.querySelector(`.card[data-folder="${CSS.escape(albumName)}"]`);
                if (card) card.classList.add('selected');
                // Play the song
                playMusic(track);
                // Ensure sidebar visible
                document.querySelector('.left').style.left = '0';
            });
        });
    } catch (error) {
        console.error('Error fetching manifest for search:', error);
        ul.innerHTML = `<li style="text-align: center; padding: 20px; color: #666;">Error loading songs</li>`;
    }
}

// Live search helpers
function filterAlbums(query) {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll('.card[data-folder]');
    cards.forEach(card => {
        const folder = (card.getAttribute('data-folder') || '').toLowerCase();
        const title = (card.querySelector('h2')?.textContent || '').toLowerCase();
        const matches = q === '' || folder.includes(q) || title.includes(q);
        card.style.display = matches ? '' : 'none';
    });
}

function filterSongs(query) {
    const q = query.trim().toLowerCase();
    const lis = document.querySelectorAll('.songList ul li');
    lis.forEach(li => {
        const nameEl = li.querySelector('.info div');
        const songName = (nameEl?.textContent || '').toLowerCase();
        const matches = q === '' || songName.includes(q);
        li.style.display = matches ? '' : 'none';
    });
}

async function getSongs(albumName) {
    console.log('Getting songs for album:', albumName);
    
    currFolder = `${baseUrl}Website/songs/${albumName}`;
    currentAlbum = albumName;
    currentSongIndex = 0; // Reset index when changing albums
    
    try {
        // Fetch the manifest to get album info and songs
        const manifestUrl = `${baseUrl}Website/songs/manifest.json`;
        console.log('Fetching manifest from:', manifestUrl);
        let response = await fetch(manifestUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const manifest = await response.json();
        console.log('Manifest loaded:', manifest);
        
        // Find the album in the manifest
        const album = manifest.albums.find(a => a.folder === albumName);
        if (!album) {
            throw new Error(`Album ${albumName} not found in manifest`);
        }
        
        songs = album.songs || [];
        console.log('Songs found:', songs);
        
    } catch (error) {
        console.error('Error fetching songs from server:', error);
        songs = [];
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    
    if (songs.length > 0) {
        for (let i = 0; i < songs.length; i++) {
            const song = songs[i];
            const cleanName = cleanSongName(song);
            songUL.innerHTML = songUL.innerHTML + `<li data-index="${i}"><img width="40" height="40" src="${currFolder}/cover.jpg" alt="Album cover" style="border-radius:4px;object-fit:cover;">
                                <div class="info">
                                    <div>${cleanName}</div>
                                    <div>Psypower</div>
                                </div>
                                </li>`;
        }

        // Attach an event listener to each song
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                const index = parseInt(e.getAttribute('data-index'));
                currentSongIndex = index;
                playMusic(songs[index]); // Pass the original filename
            })
        })
    } else {
        songUL.innerHTML = `<li style="text-align: center; padding: 20px; color: #666;">No songs found in this album</li>`;
    }

    // Apply current search filter to songs as well (if user typed already)
    const searchInput = document.querySelector('.searchbar input');
    if (searchInput) {
        filterSongs(searchInput.value || '');
    }

    return songs
}

const playMusic = (track, pause = false) => {
    // Show loading indicator
    showLoading();
    
    // Find the original filename from the songs array
    const originalFilename = songs.find(song => cleanSongName(song) === cleanSongName(track));
    const filenameToPlay = originalFilename || track;
    
    // Get the clean song name for display
    const cleanDisplayName = cleanSongName(filenameToPlay);
    
    // Update current song index
    currentSongIndex = songs.findIndex(song => cleanSongName(song) === cleanSongName(track));
    
    currentSong.src = `${currFolder}/` + filenameToPlay
    console.log('Playing music from:', currentSong.src);
    console.log('Current folder:', currFolder);
    console.log('Track:', track);
    console.log('Original filename:', filenameToPlay);
    console.log('Clean display name:', cleanDisplayName);
    console.log('Current song index:', currentSongIndex);
    
    if (!pause) {
        currentSong.play()
            .then(() => {
                console.log('Audio started playing successfully');
                play.src = `${baseUrl}Website/img/pause.svg`;
                hideLoading();
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                console.log('Audio source:', currentSong.src);
                hideLoading();
            });
    }
    
    // Update song info
    const songInfoEl = document.querySelector(".songinfo");
    if (songInfoEl) {
        songInfoEl.innerHTML = cleanDisplayName;
    }
    
    // Reset current time to 00:00
    const currentTimeEl = document.querySelector(".current-time");
    if (currentTimeEl) {
        currentTimeEl.innerHTML = "00:00";
    }
    
    // The total time will be updated by the loadedmetadata event
}

// Next and previous song functions
const playNextSong = () => {
    if (songs.length === 0) return;
    
    // Move to next song, loop to beginning if at end
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    console.log('Next song index:', currentSongIndex);
    const nextSong = songs[currentSongIndex];
    playMusic(nextSong); // Pass the original filename
}

const playPreviousSong = () => {
    if (songs.length === 0) return;
    
    // Move to previous song, loop to end if at beginning
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    console.log('Previous song index:', currentSongIndex);
    const prevSong = songs[currentSongIndex];
    playMusic(prevSong); // Pass the original filename
}

async function displayAlbums() {
    console.log("displaying albums")
    
    try {
        const manifestUrl = `${baseUrl}Website/songs/manifest.json`;
        const response = await fetch(manifestUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const manifest = await response.json();
        console.log('Manifest loaded:', manifest);
        
        let cardContainer = document.querySelector(".cardContainer")
        // Clear existing albums before adding new ones
        cardContainer.innerHTML = ""
        
        for (const album of manifest.albums) {
            cardContainer.innerHTML = cardContainer.innerHTML + ` 
                <div data-folder="${album.folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="${baseUrl}Website/songs/${album.folder}/cover.jpg" alt="">
                    <h2>${album.title}</h2>
                    <p>${album.description}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error displaying albums:', error);
        document.querySelector(".cardContainer").innerHTML = `<p style="text-align: center; padding: 20px; color: #666;">Error loading albums</p>`;
    }
}

async function main() {

    // Handle hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const closeBtn = document.querySelector('.close');
    const leftContainer = document.querySelector('.left');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            leftContainer.classList.add('active');
            leftContainer.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            leftContainer.classList.remove('active');
            // Hide the sidebar after transition completes
            setTimeout(() => {
                if (!leftContainer.classList.contains('active')) {
                    leftContainer.style.display = 'none';
                }
            }, 300); // Match the transition duration
        });
    }

    // Close sidebar when clicking outside of it
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1200 && 
            leftContainer.classList.contains('active') && 
            !leftContainer.contains(e.target) && 
            !hamburger.contains(e.target)) {
            leftContainer.classList.remove('active');
            setTimeout(() => {
                if (!leftContainer.classList.contains('active')) {
                    leftContainer.style.display = 'none';
                }
            }, 300);
        }
    });

    // Handle window resize with throttling for better performance
    const throttledResize = throttle(() => {
        isMobile = window.innerWidth <= 768;
        if (window.innerWidth > 1200) {
            // Reset to default display on larger screens
            leftContainer.style.display = '';
            leftContainer.classList.remove('active');
        } else if (!leftContainer.classList.contains('active')) {
            // Hide sidebar on small screens if not active
            leftContainer.style.display = 'none';
        }
    }, 100);

    window.addEventListener('resize', throttledResize);
    // Helper: auto-hide sidebar on small screens
    function adjustSidebarForViewport() {
        const leftEl = document.querySelector('.left');
        if (!leftEl) return;
        if (window.innerWidth <= 1024) {
            // Hide off-canvas on small screens
            leftEl.style.left = "-120%";
        } else {
            // Show normally on larger screens
            leftEl.style.left = ""; // reset to stylesheet default
        }
    }

    // Run once and on resize
    adjustSidebarForViewport();
    window.addEventListener('resize', adjustSidebarForViewport);

    // Display albums
    await displayAlbums();

    // Use event delegation for album cards to handle dynamically added elements
    document.querySelector(".cardContainer").addEventListener("click", async (e) => {
        // Find the closest card element from the target
        const card = e.target.closest('.card[data-folder]');
        if (card) {
            console.log('Album card clicked!');
            
            // Remove selected class from all cards
            document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            card.classList.add('selected');
            
            let albumName = card.getAttribute('data-folder');
            console.log('Album name:', albumName);
            
            try {
                await getSongs(albumName);
                console.log('Songs loaded:', songs);
                
                if (songs && songs.length > 0) {
                    console.log('Playing first song:', songs[0]);
                    // Explicitly set index to 0 and play the first song
                    currentSongIndex = 0;
                    playMusic(songs[0]);
                    // Show the left sidebar with the song list
                    document.querySelector('.left').style.left = '0';
                } else {
                    console.log('No songs found in this album');
                }
            } catch (error) {
                console.error('Error loading songs:', error);
            }
        }
    });

    // Wire up left menu: Home and Search
    const leftLis = Array.from(document.querySelectorAll('#lefthomecontainer .home ul li'));
    const homeBtn = leftLis.find(li => (li.textContent || '').trim().toLowerCase().includes('home'));
    const searchBtn = leftLis.find(li => (li.textContent || '').trim().toLowerCase().includes('search'));

    if (homeBtn) {
        homeBtn.style.cursor = 'pointer';
        homeBtn.addEventListener('click', async () => {
            // Clear both search inputs
            const mainInput = document.querySelector('.searchbar input');
            const sidebarInput = document.querySelector('.sidebar-search-input');
            if (mainInput) mainInput.value = '';
            if (sidebarInput) sidebarInput.value = '';
            
            // Show all albums
            filterAlbums('');
            // Restore current album songs if we have context
            if (currentAlbum) {
                await getSongs(currentAlbum);
            }
            // Ensure sidebar visible
            const left = document.querySelector('.left');
            if (left) left.style.left = '0';
        });
    }

    if (searchBtn) {
        searchBtn.style.cursor = 'pointer';
        searchBtn.addEventListener('click', () => {
            // Focus on sidebar search if it exists, otherwise main search
            const sidebarInput = document.querySelector('.sidebar-search-input');
            const mainInput = document.querySelector('.searchbar input');
            
            if (sidebarInput) {
                sidebarInput.focus();
                sidebarInput.select();
            } else if (mainInput) {
                mainInput.focus();
                mainInput.select();
            }
        });
    }

    // Shared search function for both main and sidebar search bars
    const performSearch = debounce(async (query) => {
        filterAlbums(query);
        if (query.trim() === '') {
            // If cleared, restore current album song list filter (hide none)
            filterSongs('');
            // Also restore current album songs if available
            if (currentAlbum) {
                await getSongs(currentAlbum);
            }
        } else {
            // Render global song results across albums
            await renderSongSearchResults(query);
        }
    }, isMobile ? 300 : 150); // Longer delay on mobile for better performance

    // Sync search inputs function
    const syncSearchInputs = (sourceInput, targetInput) => {
        if (targetInput && targetInput.value !== sourceInput.value) {
            targetInput.value = sourceInput.value;
        }
    };

    // Main search bar listener
    const mainSearchInput = document.querySelector('.searchbar input');
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', (e) => {
            const q = e.target.value || '';
            performSearch(q);
            
            // Sync with sidebar search
            const sidebarSearchInput = document.querySelector('.sidebar-search-input');
            syncSearchInputs(e.target, sidebarSearchInput);
        });
    }

    // Sidebar search bar listener
    const sidebarSearchInput = document.querySelector('.sidebar-search-input');
    if (sidebarSearchInput) {
        sidebarSearchInput.addEventListener('input', (e) => {
            const q = e.target.value || '';
            performSearch(q);
            
            // Sync with main search
            const mainSearchInput = document.querySelector('.searchbar input');
            syncSearchInputs(e.target, mainSearchInput);
        });
    }

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = `${baseUrl}Website/img/pause.svg`
        }
        else {
            currentSong.pause()
            play.src = `${baseUrl}Website/img/play.svg`
        }
    })

    // Add event listeners for next and previous buttons
    document.getElementById('next').addEventListener('click', playNextSong);
    document.getElementById('previous').addEventListener('click', playPreviousSong);

    // Auto-play next song when current song ends
    currentSong.addEventListener('ended', playNextSong);

    // Listen for timeupdate event with throttling for better performance
    const throttledTimeUpdate = throttle(() => {
        // Update current time (left side of seekbar)
        const currentTimeEl = document.querySelector(".current-time");
        const totalTimeEl = document.querySelector(".total-time");
        const circleEl = document.querySelector(".circle");
        
        if (currentTimeEl) {
            currentTimeEl.innerHTML = secondsToMinutesSeconds(currentSong.currentTime);
        }
        if (totalTimeEl) {
            totalTimeEl.innerHTML = secondsToMinutesSeconds(currentSong.duration);
        }
        
        if (!window.__isSeeking && circleEl && currentSong.duration) {
            circleEl.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    }, isMobile ? 100 : 50); // Less frequent updates on mobile

    currentSong.addEventListener("timeupdate", throttledTimeUpdate);

    // Add loadedmetadata event listener to update duration when a new song loads
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".total-time").innerHTML = secondsToMinutesSeconds(currentSong.duration);
    });

    // Precise draggable seekbar with live scrubbing and mobile touch support
    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");

    function setTimeFromClientX(clientX) {
        const rect = seekbar.getBoundingClientRect();
        let percent = (clientX - rect.left) / rect.width;
        if (percent < 0) percent = 0;
        if (percent > 1) percent = 1;
        circle.style.left = (percent * 100) + "%";
        if (!isNaN(currentSong.duration)) {
            currentSong.currentTime = currentSong.duration * percent;
        }
    }

    // Touch events for mobile
    seekbar.addEventListener('touchstart', (e) => {
        e.preventDefault();
        window.__isSeeking = true;
        const touch = e.touches[0];
        setTimeFromClientX(touch.clientX);
    });

    seekbar.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (window.__isSeeking) {
            const touch = e.touches[0];
            setTimeFromClientX(touch.clientX);
        }
    });

    seekbar.addEventListener('touchend', (e) => {
        e.preventDefault();
        window.__isSeeking = false;
    });

    // Mouse/pointer events for desktop
    seekbar.addEventListener('pointerdown', (e) => {
        window.__isSeeking = true;
        seekbar.setPointerCapture(e.pointerId);
        setTimeFromClientX(e.clientX);
    });

    seekbar.addEventListener('pointermove', (e) => {
        if (window.__isSeeking) {
            setTimeFromClientX(e.clientX);
        }
    });

    const endSeek = (e) => {
        if (window.__isSeeking) {
            window.__isSeeking = false;
            if (e && e.pointerId) {
                try { seekbar.releasePointerCapture(e.pointerId); } catch (_) {}
            }
        }
    };
    seekbar.addEventListener('pointerup', endSeek);
    seekbar.addEventListener('pointercancel', endSeek);
    seekbar.addEventListener('pointerleave', (e) => { if (window.__isSeeking) setTimeFromClientX(e.clientX); });

    // Configure and improve volume slider responsiveness
    const volumeInput = document.querySelector(".range").getElementsByTagName("input")[0];
    if (volumeInput) {
        volumeInput.min = "0";
        volumeInput.max = "100";
        volumeInput.step = "1";
        volumeInput.value = String(Math.round((currentSong.volume || 0.1) * 100));

        const applyVolumeIcon = (vol) => {
            const volImg = document.querySelector(".volume>img");
            if (!volImg) return;
            if (vol <= 0) {
                volImg.src = volImg.src.replace("volume.svg", "mute.svg");
            } else {
                volImg.src = volImg.src.replace("mute.svg", "volume.svg");
            }
        };

        const onVolumeInput = (e) => {
            const val = parseInt(e.target.value);
            const vol = isNaN(val) ? 0 : (val / 100);
            currentSong.volume = vol;
            applyVolumeIcon(vol);
        };

        volumeInput.addEventListener("input", onVolumeInput);
        volumeInput.addEventListener("change", onVolumeInput);

        // Initialize icon
        applyVolumeIcon(currentSong.volume || 0.1);
    }

    // Add event listener to mute the track (toggle)
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        const volImg = e.target;
        if(volImg.src.includes("volume.svg")){
            volImg.src = volImg.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            if (volumeInput) volumeInput.value = 0;
        }
        else{
            volImg.src = volImg.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            if (volumeInput) volumeInput.value = 10;
        }
    })

    // Add keyboard accessibility
    document.addEventListener('keydown', (e) => {
        // Prevent default behavior for space bar to avoid page scrolling
        if (e.code === 'Space' && (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA')) {
            e.preventDefault();
            // Toggle play/pause
            if (currentSong.paused) {
                currentSong.play();
                play.src = `${baseUrl}Website/img/pause.svg`;
            } else {
                currentSong.pause();
                play.src = `${baseUrl}Website/img/play.svg`;
            }
        }
        
        // Arrow keys for seeking
        if (e.code === 'ArrowLeft') {
            e.preventDefault();
            currentSong.currentTime = Math.max(0, currentSong.currentTime - 10);
        }
        if (e.code === 'ArrowRight') {
            e.preventDefault();
            currentSong.currentTime = Math.min(currentSong.duration, currentSong.currentTime + 10);
        }
        
        // N and P for next/previous
        if (e.code === 'KeyN') {
            e.preventDefault();
            playNextSong();
        }
        if (e.code === 'KeyP') {
            e.preventDefault();
            playPreviousSong();
        }
        
        // M for mute
        if (e.code === 'KeyM') {
            e.preventDefault();
            const volImg = document.querySelector(".volume>img");
            if (volImg) {
                volImg.click();
            }
        }
    });
}

main()