# FestPass Setup Guide

## Quick Setup Checklist

- [ ] Register domain (festpass.co recommended - available)
- [ ] Create Clerk account and add publishable key
- [ ] Create Formspree form for email capture
- [ ] Connect custom domain to GitHub Pages

---

## 1. Domain Registration

**Recommended:** `festpass.co` (available as of Feb 2026)

**Alternatives:**
- `getfestpass.com` (available)
- `myfestpass.com` (available)

Register via: Namecheap, Cloudflare, or Porkbun

---

## 2. Clerk Authentication Setup

1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application called "FestPass"
3. Get your **Publishable Key** from the API Keys page
4. Replace `pk_test_YOUR_KEY_HERE` in these files:
   - `index.html` (line ~17)
   - `my-map.html` (in the head section)
   - `my-recap.html` (in the head section)
   - `js/auth.js` (line 8)

**Clerk Settings (recommended):**
- Enable Email + Google OAuth
- Disable phone number (optional)
- Set redirect URLs to your domain

---

## 3. Email Capture (Formspree)

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form
3. Copy your form ID (looks like `xabcdefg`)
4. Replace `YOUR_FORM_ID` in `index.html`:
   ```html
   action="https://formspree.io/f/YOUR_FORM_ID"
   ```

**Alternative:** Connect to Klaviyo, ConvertKit, or Mailchimp via Zapier.

---

## 4. GitHub Pages Custom Domain

1. In your repo settings, go to Pages
2. Add your custom domain (e.g., `festpass.co`)
3. Create DNS records at your registrar:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   
   Type: CNAME
   Name: www
   Value: marloweagent-bot.github.io
   ```
4. Wait for DNS propagation (up to 24h)
5. Enable "Enforce HTTPS" in GitHub Pages settings

---

## File Structure

```
ground-score/
├── index.html          # Homepage with 3 pillars
├── my-map.html         # Interactive festival map
├── my-recap.html       # Festival Wrapped / recap
├── js/
│   ├── auth.js         # Clerk auth + data persistence
│   ├── lists.js        # Festival list management
│   └── map.js          # Map functionality
├── festivals/          # Individual festival pages (250 US + 100 EU)
│   ├── edc-las-vegas.html
│   ├── tomorrowland.html
│   └── ...
├── SETUP.md            # This file
└── TEMPLATE.md         # Festival page template
```

---

## Festival Data

Currently: 94 US festivals
Target: 250 US + 100 Europe

Festival pages follow the 10-point rating system:
1. Sound (1-5)
2. Scene (1-5)
3. Vibe (1-5)
4. Flow (1-5)
5. Fuel (1-5)
6. Access (1-5)
7. Shelter (1-5)
8. Safety (1-5)
9. Value (1-5)
10. Magic (1-5)

Total: X/50

---

## Revenue Opportunities

1. **Email List:** Pre-sell festival attendees to promoters
2. **Affiliate Links:** Ticket platforms (Eventbrite, DICE, RA)
3. **Sponsored Listings:** Featured festivals
4. **Data Licensing:** Anonymous festival preference data

---

## Support

Built by Marlowe for Tom Worcester
Questions: Check the repo issues or ping via Telegram
