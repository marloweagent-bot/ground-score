/**
 * Ground Score — Festival Map Feature
 * Interactive map showing festivals you've attended by year
 */

(function() {
    'use strict';
    
    const MAP_KEY = 'groundscore_map';
    
    // Festival coordinates (lat, lng)
    // Will be populated from festival data
    const FESTIVAL_COORDS = {
        'coachella': { lat: 33.6803, lng: -116.2389, name: 'Coachella', location: 'Indio, CA' },
        'edc-las-vegas': { lat: 36.2700, lng: -115.0095, name: 'EDC Las Vegas', location: 'Las Vegas, NV' },
        'ultra-miami': { lat: 25.7826, lng: -80.1868, name: 'Ultra Miami', location: 'Miami, FL' },
        'burning-man': { lat: 40.7864, lng: -119.2065, name: 'Burning Man', location: 'Black Rock City, NV' },
        'electric-forest': { lat: 43.6508, lng: -85.9781, name: 'Electric Forest', location: 'Rothbury, MI' },
        'bonnaroo': { lat: 35.4753, lng: -86.0559, name: 'Bonnaroo', location: 'Manchester, TN' },
        'lollapalooza': { lat: 41.8758, lng: -87.6189, name: 'Lollapalooza', location: 'Chicago, IL' },
        'austin-city-limits': { lat: 30.2653, lng: -97.7490, name: 'Austin City Limits', location: 'Austin, TX' },
        'outside-lands': { lat: 37.7694, lng: -122.4862, name: 'Outside Lands', location: 'San Francisco, CA' },
        'lightning-in-a-bottle': { lat: 35.6772, lng: -120.1625, name: 'Lightning in a Bottle', location: 'Bakersfield, CA' },
        'shambhala': { lat: 49.3194, lng: -117.6437, name: 'Shambhala', location: 'Salmo River Ranch, BC' },
        'movement': { lat: 42.3293, lng: -83.0458, name: 'Movement', location: 'Detroit, MI' },
        'edc-orlando': { lat: 28.3608, lng: -81.5507, name: 'EDC Orlando', location: 'Orlando, FL' },
        'bass-canyon': { lat: 47.1007, lng: -119.9940, name: 'Bass Canyon', location: 'George, WA' },
        'lost-lands': { lat: 39.8953, lng: -82.8833, name: 'Lost Lands', location: 'Thornville, OH' },
        'tomorrowland': { lat: 51.0909, lng: 4.3641, name: 'Tomorrowland', location: 'Boom, Belgium' },
        'ultra-europe': { lat: 43.5147, lng: -16.4435, name: 'Ultra Europe', location: 'Split, Croatia' },
        'creamfields': { lat: 53.2787, lng: -2.6970, name: 'Creamfields', location: 'Daresbury, UK' },
        'arc-music-festival': { lat: 41.8758, lng: -87.6270, name: 'ARC Music Festival', location: 'Chicago, IL' },
        'sonic-bloom': { lat: 38.8859, lng: -106.9808, name: 'Sonic Bloom', location: 'Rye, CO' },
        'desert-hearts': { lat: 33.7050, lng: -116.3950, name: 'Desert Hearts', location: 'Los Coyotes, CA' },
        'dirtybird-campout': { lat: 35.6772, lng: -120.1625, name: 'Dirtybird Campout', location: 'Modesto, CA' },
        'symbiosis': { lat: 39.6200, lng: -122.1900, name: 'Symbiosis', location: 'Oakdale, CA' },
        'imagine': { lat: 33.6409, lng: -84.4479, name: 'Imagine', location: 'Atlanta, GA' },
        'countdown': { lat: 34.0689, lng: -117.6480, name: 'Countdown', location: 'San Bernardino, CA' },
        'nocturnal-wonderland': { lat: 34.0689, lng: -117.6480, name: 'Nocturnal Wonderland', location: 'San Bernardino, CA' },
        'hard-summer': { lat: 34.0689, lng: -117.6480, name: 'Hard Summer', location: 'San Bernardino, CA' },
        'beyond-wonderland-socal': { lat: 34.0689, lng: -117.6480, name: 'Beyond Wonderland', location: 'San Bernardino, CA' },
        'escape': { lat: 34.0689, lng: -117.6480, name: 'Escape', location: 'San Bernardino, CA' },
        'firefly': { lat: 39.1882, lng: -75.5249, name: 'Firefly', location: 'Dover, DE' },
        'hangout': { lat: 30.2803, lng: -87.5697, name: 'Hangout', location: 'Gulf Shores, AL' },
        'sxsw': { lat: 30.2672, lng: -97.7431, name: 'SXSW', location: 'Austin, TX' },
        'governors-ball': { lat: 40.7935, lng: -73.9316, name: 'Governors Ball', location: 'New York, NY' },
        'panorama': { lat: 40.7935, lng: -73.9316, name: 'Panorama', location: 'New York, NY' },
        'okeechobee': { lat: 27.2439, lng: -80.8295, name: 'Okeechobee', location: 'Okeechobee, FL' },
        'hulaween': { lat: 30.2394, lng: -83.0099, name: 'Hulaween', location: 'Live Oak, FL' },
        'gem-and-jam': { lat: 32.2226, lng: -110.9747, name: 'Gem and Jam', location: 'Tucson, AZ' },
        'arise': { lat: 40.0150, lng: -105.2705, name: 'Arise', location: 'Loveland, CO' },
        'elements-lakewood': { lat: 41.8568, lng: -74.4654, name: 'Elements', location: 'Lakewood, PA' },
        'desert-daze': { lat: 33.6934, lng: -116.4142, name: 'Desert Daze', location: 'Lake Perris, CA' },
        'day-for-night': { lat: 29.7604, lng: -95.3698, name: 'Day for Night', location: 'Houston, TX' },
        'iii-points': { lat: 25.7860, lng: -80.1918, name: 'III Points', location: 'Miami, FL' },
        'decadence-colorado': { lat: 39.7392, lng: -104.9903, name: 'Decadence Colorado', location: 'Denver, CO' },
        'decadence-arizona': { lat: 33.4484, lng: -112.0740, name: 'Decadence Arizona', location: 'Phoenix, AZ' }
    };
    
    // Year colors for map pins
    const YEAR_COLORS = {
        2020: '#ff6b6b',
        2021: '#feca57',
        2022: '#48dbfb',
        2023: '#ff9ff3',
        2024: '#54a0ff',
        2025: '#5f27cd',
        2026: '#00d2d3',
        2027: '#ff9f43'
    };
    
    // ==================== STORAGE ====================
    
    function getMapData() {
        try {
            const data = JSON.parse(localStorage.getItem(MAP_KEY));
            if (!data) return [];
            // Handle legacy format (array of slugs)
            if (Array.isArray(data) && typeof data[0] === 'string') {
                return data.map(slug => ({ slug, year: new Date().getFullYear(), type: 'festival' }));
            }
            return data;
        } catch (e) {
            return [];
        }
    }
    
    function saveMapData(data) {
        localStorage.setItem(MAP_KEY, JSON.stringify(data));
    }
    
    function addToMap(slug, year, type = 'festival') {
        const data = getMapData();
        // Check if already exists for this year
        const exists = data.find(d => d.slug === slug && d.year === year);
        if (exists) return false;
        
        data.push({ slug, year, type });
        saveMapData(data);
        return true;
    }
    
    function removeFromMap(slug, year) {
        let data = getMapData();
        data = data.filter(d => !(d.slug === slug && d.year === year));
        saveMapData(data);
    }
    
    function getYearsForFestival(slug) {
        return getMapData()
            .filter(d => d.slug === slug)
            .map(d => d.year)
            .sort();
    }
    
    function isOnMap(slug, year = null) {
        const data = getMapData();
        if (year) {
            return data.some(d => d.slug === slug && d.year === year);
        }
        return data.some(d => d.slug === slug);
    }
    
    // ==================== MIGRATION ====================
    
    function migrateFromBeen() {
        // Migrate old "been" data to new map format
        const BEEN_KEY = 'groundscore_been';
        const oldBeen = JSON.parse(localStorage.getItem(BEEN_KEY) || '[]');
        const mapData = getMapData();
        
        if (oldBeen.length > 0 && mapData.length === 0) {
            const currentYear = new Date().getFullYear();
            oldBeen.forEach(slug => {
                if (typeof slug === 'string') {
                    mapData.push({ slug, year: currentYear, type: 'festival' });
                }
            });
            saveMapData(mapData);
            console.log('Migrated', oldBeen.length, 'festivals to map');
        }
    }
    
    // ==================== MAP RENDERING ====================
    
    let map = null;
    let markers = [];
    
    function initMap(containerId) {
        if (typeof L === 'undefined') {
            console.error('Leaflet not loaded');
            return;
        }
        
        // Initialize map centered on US
        map = L.map(containerId).setView([39.8283, -98.5795], 4);
        
        // Add dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        renderMarkers();
    }
    
    function renderMarkers() {
        if (!map) return;
        
        // Clear existing markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        
        const data = getMapData();
        const festivalYears = {};
        
        // Group by festival
        data.forEach(d => {
            if (!festivalYears[d.slug]) {
                festivalYears[d.slug] = [];
            }
            festivalYears[d.slug].push(d.year);
        });
        
        // Create markers
        Object.entries(festivalYears).forEach(([slug, years]) => {
            const coords = FESTIVAL_COORDS[slug];
            if (!coords) return;
            
            const yearsStr = years.sort().join(', ');
            const color = YEAR_COLORS[Math.max(...years)] || '#00ff88';
            
            const icon = L.divIcon({
                className: 'gs-map-marker',
                html: `<div class="gs-marker-pin" style="background: ${color}">
                    <span class="gs-marker-count">${years.length > 1 ? years.length : ''}</span>
                </div>`,
                iconSize: [30, 42],
                iconAnchor: [15, 42],
                popupAnchor: [0, -42]
            });
            
            const marker = L.marker([coords.lat, coords.lng], { icon })
                .addTo(map)
                .bindPopup(`
                    <div class="gs-popup">
                        <strong>${coords.name}</strong><br>
                        <span class="gs-popup-location">${coords.location}</span><br>
                        <span class="gs-popup-years">🎪 ${yearsStr}</span>
                    </div>
                `);
            
            markers.push(marker);
        });
        
        // Fit bounds if we have markers
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
        
        updateStats();
    }
    
    function updateStats() {
        const statsEl = document.getElementById('map-stats');
        if (!statsEl) return;
        
        const data = getMapData();
        const festivals = new Set(data.map(d => d.slug));
        const years = new Set(data.map(d => d.year));
        const states = new Set();
        
        data.forEach(d => {
            const coords = FESTIVAL_COORDS[d.slug];
            if (coords && coords.location) {
                const state = coords.location.split(', ').pop();
                if (state) states.add(state);
            }
        });
        
        statsEl.innerHTML = `
            <div class="gs-stat"><span class="gs-stat-num">${data.length}</span><span class="gs-stat-label">Total Visits</span></div>
            <div class="gs-stat"><span class="gs-stat-num">${festivals.size}</span><span class="gs-stat-label">Festivals</span></div>
            <div class="gs-stat"><span class="gs-stat-num">${years.size}</span><span class="gs-stat-label">Years</span></div>
            <div class="gs-stat"><span class="gs-stat-num">${states.size}</span><span class="gs-stat-label">States/Countries</span></div>
        `;
    }
    
    // ==================== YEAR PICKER ====================
    
    function showYearPicker(slug, buttonEl) {
        // Remove existing picker
        document.querySelectorAll('.gs-year-picker').forEach(p => p.remove());
        
        const coords = FESTIVAL_COORDS[slug];
        const festivalName = coords?.name || slug;
        const existingYears = getYearsForFestival(slug);
        const currentYear = new Date().getFullYear();
        
        const picker = document.createElement('div');
        picker.className = 'gs-year-picker';
        picker.innerHTML = `
            <div class="gs-year-picker-header">
                <span>When did you go to ${festivalName}?</span>
                <button class="gs-year-picker-close" onclick="this.closest('.gs-year-picker').remove()">✕</button>
            </div>
            <div class="gs-year-grid">
                ${Array.from({length: 8}, (_, i) => currentYear - 7 + i).map(year => {
                    const selected = existingYears.includes(year);
                    return `<button class="gs-year-btn ${selected ? 'selected' : ''}" data-year="${year}">${year}</button>`;
                }).join('')}
            </div>
            <div class="gs-year-picker-actions">
                <button class="gs-year-done">Done</button>
            </div>
        `;
        
        // Position near button
        const rect = buttonEl.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.top = `${rect.bottom + 8}px`;
        picker.style.left = `${rect.left}px`;
        picker.style.zIndex = '10000';
        
        document.body.appendChild(picker);
        
        // Handle year selection
        picker.querySelectorAll('.gs-year-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const year = parseInt(btn.dataset.year);
                if (btn.classList.contains('selected')) {
                    removeFromMap(slug, year);
                    btn.classList.remove('selected');
                } else {
                    addToMap(slug, year);
                    btn.classList.add('selected');
                }
            });
        });
        
        // Close on done
        picker.querySelector('.gs-year-done').addEventListener('click', () => {
            picker.remove();
            updateMapButton(slug, buttonEl);
            if (typeof GroundScoreLists !== 'undefined') {
                GroundScoreLists.updateMyFestivalsSection?.();
            }
        });
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeOnOutside(e) {
                if (!picker.contains(e.target) && e.target !== buttonEl) {
                    picker.remove();
                    document.removeEventListener('click', closeOnOutside);
                }
            });
        }, 100);
    }
    
    function updateMapButton(slug, buttonEl) {
        const years = getYearsForFestival(slug);
        const hasYears = years.length > 0;
        
        buttonEl.classList.toggle('active', hasYears);
        if (hasYears) {
            buttonEl.innerHTML = `<span class="gs-btn-icon">📍</span><span class="gs-btn-text">${years.join(', ')}</span>`;
        } else {
            buttonEl.innerHTML = `<span class="gs-btn-icon">📍</span><span class="gs-btn-text">Add to Map</span>`;
        }
    }
    
    // ==================== SHARING ====================
    
    function generateShareUrl() {
        const data = getMapData();
        if (data.length === 0) return window.location.origin + '/ground-score/my-map.html';
        
        const encoded = data.map(d => `${d.slug}:${d.year}`).join(',');
        return `${window.location.origin}/ground-score/my-map.html?map=${encodeURIComponent(encoded)}`;
    }
    
    function restoreFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const mapParam = params.get('map');
        if (!mapParam) return false;
        
        try {
            const entries = mapParam.split(',').map(e => {
                const [slug, year] = e.split(':');
                return { slug, year: parseInt(year), type: 'festival' };
            }).filter(e => e.slug && !isNaN(e.year));
            
            if (entries.length > 0) {
                saveMapData(entries);
                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
                return true;
            }
        } catch (e) {
            console.error('Failed to restore map data:', e);
        }
        return false;
    }
    
    function copyShareLink() {
        const url = generateShareUrl();
        navigator.clipboard.writeText(url).then(() => {
            showToast('📋 Map link copied!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('📋 Map link copied!');
        });
    }
    
    function showToast(message) {
        const existing = document.querySelector('.gs-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'gs-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // ==================== INIT ====================
    
    function init() {
        injectStyles();
        migrateFromBeen();
        
        // If on map page, restore from URL and init map
        const mapContainer = document.getElementById('festival-map');
        if (mapContainer) {
            restoreFromUrl();
            initMap('festival-map');
        }
    }
    
    function injectStyles() {
        if (document.getElementById('gs-map-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gs-map-styles';
        style.textContent = `
            /* Map Markers */
            .gs-map-marker {
                background: transparent;
                border: none;
            }
            
            .gs-marker-pin {
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            }
            
            .gs-marker-count {
                transform: rotate(45deg);
                font-size: 12px;
                font-weight: bold;
                color: #000;
            }
            
            /* Popup */
            .gs-popup {
                font-family: 'Inter', sans-serif;
                font-size: 14px;
            }
            
            .gs-popup strong {
                font-family: 'Space Grotesk', sans-serif;
            }
            
            .gs-popup-location {
                color: #666;
                font-size: 12px;
            }
            
            .gs-popup-years {
                color: #00ff88;
                font-size: 13px;
            }
            
            /* Year Picker */
            .gs-year-picker {
                background: #12121a;
                border: 1px solid #2a2a3a;
                border-radius: 12px;
                padding: 16px;
                min-width: 280px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            }
            
            .gs-year-picker-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                color: #fff;
                font-size: 14px;
            }
            
            .gs-year-picker-close {
                background: none;
                border: none;
                color: #a0a0b0;
                cursor: pointer;
                font-size: 18px;
            }
            
            .gs-year-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .gs-year-btn {
                padding: 10px;
                background: #0a0a0f;
                border: 1px solid #2a2a3a;
                border-radius: 8px;
                color: #fff;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .gs-year-btn:hover {
                border-color: #00ff88;
            }
            
            .gs-year-btn.selected {
                background: rgba(0, 255, 136, 0.2);
                border-color: #00ff88;
                color: #00ff88;
            }
            
            .gs-year-picker-actions {
                display: flex;
                justify-content: flex-end;
            }
            
            .gs-year-done {
                padding: 8px 20px;
                background: #00ff88;
                border: none;
                border-radius: 6px;
                color: #000;
                font-weight: 600;
                cursor: pointer;
            }
            
            /* Map Stats */
            #map-stats {
                display: flex;
                gap: 24px;
                justify-content: center;
                padding: 20px;
                background: #12121a;
                border-bottom: 1px solid #2a2a3a;
            }
            
            .gs-stat {
                text-align: center;
            }
            
            .gs-stat-num {
                display: block;
                font-family: 'Space Grotesk', sans-serif;
                font-size: 2rem;
                font-weight: 700;
                color: #00ff88;
            }
            
            .gs-stat-label {
                font-size: 0.75rem;
                color: #a0a0b0;
                text-transform: uppercase;
            }
            
            /* Map Button */
            .gs-btn-map {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: var(--bg-dark, #0a0a0f);
                border: 1px solid var(--border, #2a2a3a);
                border-radius: 8px;
                color: var(--text-primary, #fff);
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .gs-btn-map:hover {
                border-color: var(--accent, #00ff88);
            }
            
            .gs-btn-map.active {
                background: rgba(0, 255, 136, 0.15);
                border-color: var(--accent, #00ff88);
            }
            
            .gs-btn-map .gs-btn-text {
                font-size: 14px;
            }
            
            /* Toast - reuse from lists.js */
            .gs-toast {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: #12121a;
                border: 1px solid #00ff88;
                color: #fff;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 0.9rem;
                z-index: 10000;
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .gs-toast.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public API
    window.GroundScoreMap = {
        init,
        initMap,
        addToMap,
        removeFromMap,
        getMapData,
        getYearsForFestival,
        isOnMap,
        showYearPicker,
        updateMapButton,
        renderMarkers,
        copyShareLink,
        generateShareUrl,
        FESTIVAL_COORDS
    };
    
    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
