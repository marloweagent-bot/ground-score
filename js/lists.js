/**
 * Ground Score — Wishlist & "I've Been" Feature
 * Shared JS for localStorage persistence and UI
 */

(function() {
    'use strict';
    
    const WISHLIST_KEY = 'groundscore_wishlist';
    const BEEN_KEY = 'groundscore_been';
    
    // Festival data cache (populated on index page)
    let festivalData = {};
    
    // ==================== STORAGE ====================
    
    function getWishlist() {
        try {
            return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
        } catch (e) {
            return [];
        }
    }
    
    function getBeen() {
        try {
            return JSON.parse(localStorage.getItem(BEEN_KEY)) || [];
        } catch (e) {
            return [];
        }
    }
    
    function saveWishlist(list) {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    }
    
    function saveBeen(list) {
        localStorage.setItem(BEEN_KEY, JSON.stringify(list));
    }
    
    function toggleWishlist(slug) {
        const list = getWishlist();
        const idx = list.indexOf(slug);
        if (idx === -1) {
            list.push(slug);
        } else {
            list.splice(idx, 1);
        }
        saveWishlist(list);
        updateAllButtons();
        updateMyFestivalsSection();
        return idx === -1; // returns true if added
    }
    
    function toggleBeen(slug) {
        const list = getBeen();
        const idx = list.indexOf(slug);
        if (idx === -1) {
            list.push(slug);
        } else {
            list.splice(idx, 1);
        }
        saveBeen(list);
        updateAllButtons();
        updateMyFestivalsSection();
        return idx === -1; // returns true if added
    }
    
    function isInWishlist(slug) {
        return getWishlist().includes(slug);
    }
    
    function isInBeen(slug) {
        return getBeen().includes(slug);
    }
    
    // ==================== URL RESTORE ====================
    
    function checkUrlRestore() {
        const params = new URLSearchParams(window.location.search);
        const wishlistParam = params.get('wishlist');
        const beenParam = params.get('been');
        
        if (!wishlistParam && !beenParam) return;
        
        let restored = false;
        
        if (wishlistParam) {
            const slugs = wishlistParam.split(',').filter(s => s.trim());
            if (slugs.length > 0) {
                saveWishlist(slugs);
                restored = true;
            }
        }
        
        if (beenParam) {
            const slugs = beenParam.split(',').filter(s => s.trim());
            if (slugs.length > 0) {
                saveBeen(slugs);
                restored = true;
            }
        }
        
        if (restored) {
            showToast('🎉 List restored!');
            // Clean URL without reload
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        }
    }
    
    // ==================== TOAST ====================
    
    function showToast(message) {
        // Remove existing toast
        const existing = document.querySelector('.gs-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'gs-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-hide
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // ==================== BUTTON RENDERING ====================
    
    function createListButtons(slug, context) {
        const wrapper = document.createElement('div');
        wrapper.className = 'gs-list-buttons';
        wrapper.setAttribute('data-slug', slug);
        
        const wishBtn = document.createElement('button');
        wishBtn.className = 'gs-btn gs-btn-wish';
        wishBtn.setAttribute('aria-label', 'Add to wishlist');
        wishBtn.setAttribute('title', 'Wishlist');
        wishBtn.innerHTML = '<span class="gs-btn-icon">♡</span>';
        wishBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const added = toggleWishlist(slug);
            showToast(added ? '❤️ Added to Wishlist' : 'Removed from Wishlist');
        };
        
        const beenBtn = document.createElement('button');
        beenBtn.className = 'gs-btn gs-btn-been';
        beenBtn.setAttribute('aria-label', 'Mark as attended');
        beenBtn.setAttribute('title', "I've Been");
        beenBtn.innerHTML = '<span class="gs-btn-icon">○</span>';
        beenBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const added = toggleBeen(slug);
            showToast(added ? '✅ Marked as Attended' : 'Removed from Attended');
        };
        
        wrapper.appendChild(wishBtn);
        wrapper.appendChild(beenBtn);
        
        return wrapper;
    }
    
    function updateAllButtons() {
        const wishlist = getWishlist();
        const been = getBeen();
        
        document.querySelectorAll('.gs-list-buttons').forEach(wrapper => {
            const slug = wrapper.getAttribute('data-slug');
            const wishBtn = wrapper.querySelector('.gs-btn-wish');
            const beenBtn = wrapper.querySelector('.gs-btn-been');
            
            if (wishBtn) {
                const inWish = wishlist.includes(slug);
                wishBtn.classList.toggle('active', inWish);
                wishBtn.innerHTML = `<span class="gs-btn-icon">${inWish ? '❤️' : '♡'}</span>`;
                wishBtn.setAttribute('aria-label', inWish ? 'Remove from wishlist' : 'Add to wishlist');
            }
            
            if (beenBtn) {
                const inBeen = been.includes(slug);
                beenBtn.classList.toggle('active', inBeen);
                beenBtn.innerHTML = `<span class="gs-btn-icon">${inBeen ? '✅' : '○'}</span>`;
                beenBtn.setAttribute('aria-label', inBeen ? 'Remove from attended' : 'Mark as attended');
            }
        });
    }
    
    // ==================== MY FESTIVALS SECTION ====================
    
    function buildFestivalDataFromCards() {
        document.querySelectorAll('.festival-card').forEach(card => {
            const href = card.getAttribute('href');
            if (!href) return;
            const slug = href.replace('festivals/', '').replace('.html', '');
            const name = card.querySelector('h3')?.textContent || slug;
            const score = card.querySelector('.score-badge')?.textContent || '';
            const location = card.querySelector('.location')?.textContent?.replace('📍 ', '') || '';
            
            festivalData[slug] = { name, score, location, href };
        });
    }
    
    function updateMyFestivalsSection() {
        const section = document.getElementById('my-festivals-section');
        if (!section) return;
        
        const wishlist = getWishlist();
        const been = getBeen();
        
        // Hide if empty
        if (wishlist.length === 0 && been.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        
        // Update wishlist
        const wishlistContent = document.getElementById('wishlist-content');
        const wishlistCount = document.getElementById('wishlist-count');
        if (wishlistContent && wishlistCount) {
            wishlistCount.textContent = wishlist.length;
            wishlistContent.innerHTML = wishlist.length === 0 
                ? '<p class="gs-empty">No festivals in your wishlist yet</p>'
                : wishlist.map(slug => {
                    const data = festivalData[slug] || { name: slug, href: `festivals/${slug}.html` };
                    return `<a href="${data.href}" class="gs-list-item">
                        <span class="gs-item-name">${data.name}</span>
                        ${data.score ? `<span class="gs-item-score">${data.score}</span>` : ''}
                    </a>`;
                }).join('');
        }
        
        // Update been
        const beenContent = document.getElementById('been-content');
        const beenCount = document.getElementById('been-count');
        if (beenContent && beenCount) {
            beenCount.textContent = been.length;
            beenContent.innerHTML = been.length === 0
                ? '<p class="gs-empty">No festivals attended yet</p>'
                : been.map(slug => {
                    const data = festivalData[slug] || { name: slug, href: `festivals/${slug}.html` };
                    return `<a href="${data.href}" class="gs-list-item">
                        <span class="gs-item-name">${data.name}</span>
                        ${data.score ? `<span class="gs-item-score">${data.score}</span>` : ''}
                    </a>`;
                }).join('');
        }
        
        // Update stats
        const statsEl = document.getElementById('my-festivals-stats');
        if (statsEl) {
            const allSlugs = [...new Set([...wishlist, ...been])];
            const states = new Set();
            allSlugs.forEach(slug => {
                const loc = festivalData[slug]?.location || '';
                // Extract state from "City, State" format
                const match = loc.match(/,\s*([A-Za-z\s]+)$/);
                if (match) states.add(match[1].trim());
            });
            
            const total = wishlist.length + been.length;
            if (total > 0) {
                statsEl.innerHTML = `You've tracked <strong>${total}</strong> festival${total !== 1 ? 's' : ''} across <strong>${states.size}</strong> state${states.size !== 1 ? 's' : ''}`;
            } else {
                statsEl.innerHTML = '';
            }
        }
    }
    
    function toggleMyFestivalsPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        
        const isExpanded = panel.classList.contains('expanded');
        
        // Close all panels
        document.querySelectorAll('.gs-panel').forEach(p => {
            p.classList.remove('expanded');
            p.previousElementSibling?.setAttribute('aria-expanded', 'false');
        });
        
        // Open this one if it was closed
        if (!isExpanded) {
            panel.classList.add('expanded');
            panel.previousElementSibling?.setAttribute('aria-expanded', 'true');
        }
    }
    
    // ==================== SAVE/SHARE ====================
    
    function generateShareUrl() {
        const wishlist = getWishlist();
        const been = getBeen();
        
        const baseUrl = 'https://marloweagent-bot.github.io/ground-score/';
        const params = [];
        
        if (wishlist.length > 0) {
            params.push(`wishlist=${wishlist.join(',')}`);
        }
        if (been.length > 0) {
            params.push(`been=${been.join(',')}`);
        }
        
        return params.length > 0 ? `${baseUrl}?${params.join('&')}` : baseUrl;
    }
    
    function generateEmailBody() {
        const wishlist = getWishlist();
        const been = getBeen();
        
        let body = '🎪 My Ground Score Festival List\n\n';
        
        if (wishlist.length > 0) {
            body += '❤️ WISHLIST:\n';
            wishlist.forEach(slug => {
                const data = festivalData[slug] || { name: slug };
                body += `• ${data.name}${data.score ? ` (${data.score})` : ''}\n`;
            });
            body += '\n';
        }
        
        if (been.length > 0) {
            body += "✅ I'VE BEEN:\n";
            been.forEach(slug => {
                const data = festivalData[slug] || { name: slug };
                body += `• ${data.name}${data.score ? ` (${data.score})` : ''}\n`;
            });
            body += '\n';
        }
        
        body += '---\n';
        body += `Restore this list: ${generateShareUrl()}\n\n`;
        body += 'Created with Ground Score — Find Your Perfect Festival\n';
        body += 'https://marloweagent-bot.github.io/ground-score/';
        
        return body;
    }
    
    function saveMyList() {
        const subject = encodeURIComponent('My Ground Score Festival List');
        const body = encodeURIComponent(generateEmailBody());
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
    
    function copyShareLink() {
        const url = generateShareUrl();
        navigator.clipboard.writeText(url).then(() => {
            showToast('📋 Link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('📋 Link copied!');
        });
    }
    
    // ==================== INIT ====================
    
    function initListButtons() {
        // For index page: add buttons to festival cards
        document.querySelectorAll('.festival-card').forEach(card => {
            const href = card.getAttribute('href');
            if (!href) return;
            const slug = href.replace('festivals/', '').replace('.html', '');
            
            const header = card.querySelector('.card-header');
            if (header && !header.querySelector('.gs-list-buttons')) {
                const buttons = createListButtons(slug, 'card');
                header.appendChild(buttons);
            }
        });
        
        // For detail pages: look for the placeholder
        const detailPlaceholder = document.getElementById('gs-detail-buttons');
        if (detailPlaceholder) {
            const slug = detailPlaceholder.getAttribute('data-slug');
            if (slug) {
                const buttons = createListButtons(slug, 'detail');
                buttons.classList.add('gs-detail-buttons');
                detailPlaceholder.replaceWith(buttons);
            }
        }
        
        // Update all button states
        updateAllButtons();
    }
    
    function init() {
        // Inject styles
        injectStyles();
        
        // Check for URL restore params
        checkUrlRestore();
        
        // Build festival data from cards (index page only)
        buildFestivalDataFromCards();
        
        // Init list buttons
        initListButtons();
        
        // Update My Festivals section (index page only)
        updateMyFestivalsSection();
    }
    
    function injectStyles() {
        if (document.getElementById('gs-list-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gs-list-styles';
        style.textContent = `
            /* List Buttons */
            .gs-list-buttons {
                display: flex;
                gap: 6px;
                margin-left: auto;
                padding-left: 10px;
            }
            
            .gs-btn {
                width: 32px;
                height: 32px;
                border: 1px solid var(--border);
                border-radius: 8px;
                background: var(--bg-dark);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                padding: 0;
            }
            
            .gs-btn:hover {
                border-color: var(--accent);
                transform: scale(1.1);
            }
            
            .gs-btn:focus {
                outline: 2px solid var(--accent);
                outline-offset: 2px;
            }
            
            .gs-btn-icon {
                font-size: 16px;
                line-height: 1;
            }
            
            .gs-btn-wish.active {
                background: rgba(255, 100, 100, 0.2);
                border-color: #ff6464;
            }
            
            .gs-btn-been.active {
                background: rgba(0, 255, 136, 0.2);
                border-color: var(--accent);
            }
            
            /* Detail page buttons */
            .gs-detail-buttons {
                display: flex;
                gap: 12px;
                margin-top: 16px;
            }
            
            .gs-detail-buttons .gs-btn {
                width: 48px;
                height: 48px;
                border-radius: 12px;
            }
            
            .gs-detail-buttons .gs-btn-icon {
                font-size: 24px;
            }
            
            /* Toast */
            .gs-toast {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: var(--bg-card);
                border: 1px solid var(--accent);
                color: var(--text-primary);
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
            
            /* My Festivals Section */
            #my-festivals-section {
                background: var(--bg-card);
                border-bottom: 1px solid var(--border);
                padding: 24px 0;
                display: none;
            }
            
            .gs-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                flex-wrap: wrap;
                gap: 12px;
            }
            
            .gs-section-title {
                font-family: 'Space Grotesk', sans-serif;
                font-size: 1.5rem;
                color: var(--accent);
            }
            
            .gs-section-actions {
                display: flex;
                gap: 8px;
            }
            
            .gs-action-btn {
                padding: 8px 16px;
                background: transparent;
                border: 1px solid var(--border);
                border-radius: 8px;
                color: var(--text-primary);
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .gs-action-btn:hover {
                border-color: var(--accent);
                background: rgba(0, 255, 136, 0.1);
            }
            
            .gs-panels {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 16px;
            }
            
            .gs-panel-toggle {
                width: 100%;
                background: var(--bg-dark);
                border: 1px solid var(--border);
                border-radius: 12px 12px 0 0;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                color: var(--text-primary);
                font-family: 'Space Grotesk', sans-serif;
                font-size: 1rem;
                transition: all 0.2s;
            }
            
            .gs-panel-toggle:hover {
                border-color: var(--accent);
            }
            
            .gs-panel-toggle[aria-expanded="true"] {
                border-bottom: none;
                border-radius: 12px 12px 0 0;
            }
            
            .gs-panel-toggle .gs-count {
                background: rgba(0, 255, 136, 0.2);
                color: var(--accent);
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 0.85rem;
            }
            
            .gs-panel-toggle .gs-arrow {
                transition: transform 0.2s;
            }
            
            .gs-panel-toggle[aria-expanded="true"] .gs-arrow {
                transform: rotate(180deg);
            }
            
            .gs-panel {
                background: var(--bg-dark);
                border: 1px solid var(--border);
                border-top: none;
                border-radius: 0 0 12px 12px;
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }
            
            .gs-panel.expanded {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .gs-panel-content {
                padding: 16px 20px;
            }
            
            .gs-list-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                background: var(--bg-card);
                border-radius: 8px;
                margin-bottom: 8px;
                text-decoration: none;
                color: var(--text-primary);
                transition: all 0.2s;
            }
            
            .gs-list-item:hover {
                background: rgba(0, 255, 136, 0.1);
                transform: translateX(4px);
            }
            
            .gs-list-item:last-child {
                margin-bottom: 0;
            }
            
            .gs-item-name {
                font-size: 0.9rem;
            }
            
            .gs-item-score {
                background: rgba(0, 255, 136, 0.15);
                color: var(--accent);
                padding: 2px 8px;
                border-radius: 8px;
                font-size: 0.75rem;
                font-family: 'Space Grotesk', sans-serif;
                font-weight: 600;
            }
            
            .gs-empty {
                color: var(--text-secondary);
                font-size: 0.85rem;
                font-style: italic;
            }
            
            .gs-stats {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid var(--border);
                font-size: 0.9rem;
                color: var(--text-secondary);
                text-align: center;
            }
            
            .gs-stats strong {
                color: var(--accent);
            }
            
            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .gs-panels {
                    grid-template-columns: 1fr;
                }
                
                .gs-section-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .gs-section-actions {
                    width: 100%;
                }
                
                .gs-action-btn {
                    flex: 1;
                    text-align: center;
                }
                
                .gs-list-buttons {
                    gap: 4px;
                }
                
                .gs-btn {
                    width: 28px;
                    height: 28px;
                }
                
                .gs-btn-icon {
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Expose public API
    window.GroundScoreLists = {
        init,
        toggleWishlist,
        toggleBeen,
        isInWishlist,
        isInBeen,
        getWishlist,
        getBeen,
        saveMyList,
        copyShareLink,
        toggleMyFestivalsPanel,
        updateMyFestivalsSection
    };
    
    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
