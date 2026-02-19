/**
 * MyFestMap — Festival Map Feature
 * Interactive map showing festivals you've attended by year
 */

(function() {
    'use strict';
    
    const MAP_KEY = 'myfestmap_been';
    const YEARS_KEY = 'myfestmap_years';
    
    // Year colors
    const YEAR_COLORS = {
        2018: '#ff6b6b',
        2019: '#feca57',
        2020: '#48dbfb',
        2021: '#ff9ff3',
        2022: '#54a0ff',
        2023: '#5f27cd',
        2024: '#00d2d3',
        2025: '#00ff88',
        2026: '#ff8800'
    };
    
    // Get festivals user has been to
    function getBeen() {
        return JSON.parse(localStorage.getItem(MAP_KEY) || '[]');
    }
    
    // Get years for each festival
    function getYears() {
        return JSON.parse(localStorage.getItem(YEARS_KEY) || '{}');
    }
    
    // Save years
    function saveYears(years) {
        localStorage.setItem(YEARS_KEY, JSON.stringify(years));
    }
    
    // Add festival with year
    function addFestivalYear(slug, year) {
        // Add to been list if not already there
        let been = getBeen();
        if (!been.includes(slug)) {
            been.push(slug);
            localStorage.setItem(MAP_KEY, JSON.stringify(been));
        }
        
        // Add year
        let years = getYears();
        if (!years[slug]) years[slug] = [];
        if (!years[slug].includes(year)) {
            years[slug].push(year);
            years[slug].sort();
            saveYears(years);
        }
        
        return years[slug];
    }
    
    // Remove festival year
    function removeFestivalYear(slug, year) {
        let years = getYears();
        if (years[slug]) {
            years[slug] = years[slug].filter(y => y !== year);
            if (years[slug].length === 0) {
                delete years[slug];
                // Also remove from been list
                let been = getBeen();
                been = been.filter(s => s !== slug);
                localStorage.setItem(MAP_KEY, JSON.stringify(been));
            }
            saveYears(years);
        }
    }
    
    // Get years for a festival
    function getFestivalYears(slug) {
        const years = getYears();
        return years[slug] || [];
    }
    
    // Show year picker modal
    function showYearPicker(slug, buttonEl) {
        // Remove any existing picker
        const existing = document.getElementById('year-picker-modal');
        if (existing) existing.remove();
        
        const currentYears = getFestivalYears(slug);
        const currentYear = new Date().getFullYear();
        const availableYears = [];
        for (let y = currentYear; y >= 2015; y--) {
            availableYears.push(y);
        }
        
        const modal = document.createElement('div');
        modal.id = 'year-picker-modal';
        modal.innerHTML = `
            <div class="year-picker-backdrop" onclick="GroundScoreMap.closeYearPicker()"></div>
            <div class="year-picker-content">
                <div class="year-picker-header">
                    <h3>📍 Add to My Map</h3>
                    <p>Which year(s) did you attend?</p>
                </div>
                <div class="year-picker-grid">
                    ${availableYears.map(y => `
                        <button class="year-btn ${currentYears.includes(y) ? 'selected' : ''}" 
                                data-year="${y}"
                                style="${currentYears.includes(y) ? `background: ${YEAR_COLORS[y] || '#00ff88'}; color: #000;` : ''}"
                                onclick="GroundScoreMap.toggleYear('${slug}', ${y}, this)">
                            ${y}
                        </button>
                    `).join('')}
                </div>
                <div class="year-picker-actions">
                    <button class="year-picker-done" onclick="GroundScoreMap.closeYearPicker()">Done</button>
                </div>
            </div>
        `;
        
        // Add styles if not present
        if (!document.getElementById('year-picker-styles')) {
            const style = document.createElement('style');
            style.id = 'year-picker-styles';
            style.textContent = `
                #year-picker-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .year-picker-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                }
                .year-picker-content {
                    position: relative;
                    background: #1a1a2e;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 360px;
                    width: 90%;
                    border: 1px solid #2a2a4a;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                }
                .year-picker-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .year-picker-header h3 {
                    font-size: 1.25rem;
                    margin-bottom: 4px;
                    color: #fff;
                }
                .year-picker-header p {
                    color: #a0a0b0;
                    font-size: 0.9rem;
                }
                .year-picker-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-bottom: 20px;
                }
                .year-btn {
                    padding: 12px;
                    border: 1px solid #3a3a5a;
                    border-radius: 8px;
                    background: #12121a;
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .year-btn:hover {
                    border-color: #00ff88;
                    background: rgba(0,255,136,0.1);
                }
                .year-btn.selected {
                    border-color: transparent;
                }
                .year-picker-actions {
                    display: flex;
                    justify-content: center;
                }
                .year-picker-done {
                    background: linear-gradient(135deg, #00ff88, #00cc6a);
                    color: #000;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .year-picker-done:hover {
                    transform: scale(1.02);
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(modal);
    }
    
    // Toggle year selection
    function toggleYear(slug, year, btnEl) {
        const currentYears = getFestivalYears(slug);
        
        if (currentYears.includes(year)) {
            // Remove year
            removeFestivalYear(slug, year);
            btnEl.classList.remove('selected');
            btnEl.style.background = '';
            btnEl.style.color = '';
        } else {
            // Add year
            addFestivalYear(slug, year);
            btnEl.classList.add('selected');
            btnEl.style.background = YEAR_COLORS[year] || '#00ff88';
            btnEl.style.color = '#000';
            
            // Show toast
            if (typeof GroundScoreLists !== 'undefined' && GroundScoreLists.showToast) {
                GroundScoreLists.showToast(`📍 Added ${year} to your map!`);
            }
        }
        
        // Update map button on detail page
        const mapBtn = document.querySelector('.gs-btn-map');
        if (mapBtn) {
            updateMapButton(slug, mapBtn);
        }
        
        // Trigger lists update if available
        if (typeof GroundScoreLists !== 'undefined' && GroundScoreLists.updateAllButtons) {
            GroundScoreLists.updateAllButtons();
        }
    }
    
    // Close year picker
    function closeYearPicker() {
        const modal = document.getElementById('year-picker-modal');
        if (modal) modal.remove();
    }
    
    // Update map button appearance based on state
    function updateMapButton(slug, btnEl) {
        const years = getFestivalYears(slug);
        if (years.length > 0) {
            btnEl.classList.add('active');
            const yearText = years.length === 1 ? years[0] : `${years.length} years`;
            btnEl.innerHTML = `<span class="gs-btn-icon">✓</span><span class="gs-btn-text">${yearText}</span>`;
        } else {
            btnEl.classList.remove('active');
            btnEl.innerHTML = `<span class="gs-btn-icon">📍</span><span class="gs-btn-text">Add to Map</span>`;
        }
    }
    
    // Get map data for my-map.html
    function getMapData() {
        const been = getBeen();
        const years = getYears();
        return { been, years };
    }
    
    // Copy share link
    function copyShareLink() {
        const data = getMapData();
        const encoded = btoa(JSON.stringify(data));
        const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
        
        navigator.clipboard.writeText(url).then(() => {
            if (typeof GroundScoreLists !== 'undefined' && GroundScoreLists.showToast) {
                GroundScoreLists.showToast('📋 Share link copied!');
            } else {
                alert('Share link copied to clipboard!');
            }
        });
    }
    
    // Load from share link
    function loadFromShare() {
        const params = new URLSearchParams(window.location.search);
        const shareData = params.get('share');
        if (shareData) {
            try {
                const data = JSON.parse(atob(shareData));
                return data;
            } catch (e) {
                console.error('Invalid share data');
            }
        }
        return null;
    }
    
    // Get stats
    function getStats() {
        const been = getBeen();
        const years = getYears();
        
        let totalVisits = 0;
        const uniqueYears = new Set();
        
        Object.values(years).forEach(festYears => {
            festYears.forEach(y => {
                totalVisits++;
                uniqueYears.add(y);
            });
        });
        
        return {
            festivals: been.length,
            totalVisits: totalVisits || been.length,
            years: uniqueYears.size
        };
    }
    
    // Export to window
    window.GroundScoreMap = {
        getBeen,
        getYears,
        getFestivalYears,
        addFestivalYear,
        removeFestivalYear,
        showYearPicker,
        toggleYear,
        closeYearPicker,
        updateMapButton,
        getMapData,
        copyShareLink,
        loadFromShare,
        getStats,
        YEAR_COLORS
    };
    
})();
