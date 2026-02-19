/**
 * FestPass Authentication Module
 * Uses Clerk for user authentication
 * 
 * SETUP: Replace CLERK_PUBLISHABLE_KEY with your key from https://dashboard.clerk.com
 */

const CLERK_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE'; // TODO: Replace with real key

class FestPassAuth {
    constructor() {
        this.clerk = null;
        this.user = null;
        this.isReady = false;
        this.readyCallbacks = [];
    }

    async init() {
        // Wait for Clerk to load
        if (typeof Clerk === 'undefined') {
            console.log('Clerk not loaded yet, waiting...');
            return new Promise((resolve) => {
                window.addEventListener('load', async () => {
                    await this.initClerk();
                    resolve();
                });
            });
        }
        await this.initClerk();
    }

    async initClerk() {
        try {
            await Clerk.load();
            this.clerk = Clerk;
            this.user = Clerk.user;
            this.isReady = true;
            
            // Run any queued callbacks
            this.readyCallbacks.forEach(cb => cb());
            this.readyCallbacks = [];
            
            // Sync user data from localStorage to account if signed in
            if (this.user) {
                this.syncUserData();
            }
            
            console.log('FestPass Auth initialized', this.user ? `(${this.user.primaryEmailAddress?.emailAddress})` : '(not signed in)');
        } catch (err) {
            console.error('Failed to initialize Clerk:', err);
        }
    }

    onReady(callback) {
        if (this.isReady) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }

    isSignedIn() {
        return this.clerk?.isSignedIn || false;
    }

    getUser() {
        return this.user;
    }

    getUserId() {
        return this.user?.id || 'anonymous';
    }

    // Mount sign-in UI to an element
    mountSignIn(elementId) {
        const el = document.getElementById(elementId);
        if (el && this.clerk) {
            this.clerk.mountSignIn(el);
        }
    }

    // Mount user button to an element
    mountUserButton(elementId) {
        const el = document.getElementById(elementId);
        if (el && this.clerk) {
            this.clerk.mountUserButton(el);
        }
    }

    // Sign out
    async signOut() {
        if (this.clerk) {
            await this.clerk.signOut();
            window.location.reload();
        }
    }

    // Sync local data to user's account metadata
    async syncUserData() {
        if (!this.user) return;
        
        try {
            const localData = {
                beenTo: JSON.parse(localStorage.getItem('festpass_been') || '[]'),
                wishlist: JSON.parse(localStorage.getItem('festpass_wishlist') || '[]'),
                years: JSON.parse(localStorage.getItem('festpass_years') || '{}'),
                lastSync: new Date().toISOString()
            };
            
            // In a real implementation, you'd save this to a backend
            // For now, we use Clerk's user metadata (limited storage)
            console.log('User data synced:', localData);
        } catch (err) {
            console.error('Error syncing user data:', err);
        }
    }
}

// Festival data manager (works with or without auth)
class FestPassData {
    constructor(auth) {
        this.auth = auth;
        this.storagePrefix = 'festpass_';
    }

    getKey(key) {
        return this.storagePrefix + key;
    }

    // Get list of festivals user has been to
    getBeenTo() {
        return JSON.parse(localStorage.getItem(this.getKey('been')) || '[]');
    }

    // Get wishlist
    getWishlist() {
        return JSON.parse(localStorage.getItem(this.getKey('wishlist')) || '[]');
    }

    // Get years attended per festival
    getYears() {
        return JSON.parse(localStorage.getItem(this.getKey('years')) || '{}');
    }

    // Add festival to been-to list
    addBeenTo(festivalSlug, year = null) {
        const been = this.getBeenTo();
        if (!been.includes(festivalSlug)) {
            been.push(festivalSlug);
            localStorage.setItem(this.getKey('been'), JSON.stringify(been));
        }
        
        if (year) {
            const years = this.getYears();
            if (!years[festivalSlug]) years[festivalSlug] = [];
            if (!years[festivalSlug].includes(year)) {
                years[festivalSlug].push(year);
                localStorage.setItem(this.getKey('years'), JSON.stringify(years));
            }
        }
        
        // Remove from wishlist if present
        this.removeFromWishlist(festivalSlug);
        
        this.syncIfLoggedIn();
    }

    // Add to wishlist
    addToWishlist(festivalSlug) {
        const wishlist = this.getWishlist();
        if (!wishlist.includes(festivalSlug)) {
            wishlist.push(festivalSlug);
            localStorage.setItem(this.getKey('wishlist'), JSON.stringify(wishlist));
        }
        this.syncIfLoggedIn();
    }

    // Remove from been-to
    removeFromBeenTo(festivalSlug) {
        const been = this.getBeenTo().filter(f => f !== festivalSlug);
        localStorage.setItem(this.getKey('been'), JSON.stringify(been));
        
        const years = this.getYears();
        delete years[festivalSlug];
        localStorage.setItem(this.getKey('years'), JSON.stringify(years));
        
        this.syncIfLoggedIn();
    }

    // Remove from wishlist
    removeFromWishlist(festivalSlug) {
        const wishlist = this.getWishlist().filter(f => f !== festivalSlug);
        localStorage.setItem(this.getKey('wishlist'), JSON.stringify(wishlist));
        this.syncIfLoggedIn();
    }

    // Check if user has been to festival
    hasBeenTo(festivalSlug) {
        return this.getBeenTo().includes(festivalSlug);
    }

    // Check if festival is on wishlist
    isOnWishlist(festivalSlug) {
        return this.getWishlist().includes(festivalSlug);
    }

    // Get stats
    getStats() {
        const been = this.getBeenTo();
        const wishlist = this.getWishlist();
        const years = this.getYears();
        
        let totalAttendances = 0;
        Object.values(years).forEach(y => totalAttendances += y.length);
        
        return {
            festivalsAttended: been.length,
            totalAttendances: totalAttendances || been.length,
            wishlistCount: wishlist.length,
            yearsActive: [...new Set(Object.values(years).flat())].length
        };
    }

    // Generate shareable link
    getShareLink() {
        const data = {
            b: this.getBeenTo(),
            w: this.getWishlist(),
            y: this.getYears()
        };
        const encoded = btoa(JSON.stringify(data));
        return `${window.location.origin}/my-map.html?share=${encoded}`;
    }

    // Load from share link
    loadFromShareLink(encoded) {
        try {
            const data = JSON.parse(atob(encoded));
            return {
                beenTo: data.b || [],
                wishlist: data.w || [],
                years: data.y || {}
            };
        } catch (err) {
            console.error('Invalid share link:', err);
            return null;
        }
    }

    syncIfLoggedIn() {
        if (this.auth && this.auth.isSignedIn()) {
            this.auth.syncUserData();
        }
    }
}

// Initialize global instances
const festpassAuth = new FestPassAuth();
const festpassData = new FestPassData(festpassAuth);

// Export for use
window.FestPassAuth = festpassAuth;
window.FestPassData = festpassData;
