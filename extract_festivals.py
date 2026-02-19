import os
import re
import json
from pathlib import Path

festivals = []

# Genre keywords - more specific matching
genre_keywords = {
    'EDM': ['edm', 'electronic dance music', 'dj set', 'djs'],
    'House': ['house music', 'deep house', 'tech house', 'house dj'],
    'Techno': ['techno', 'industrial techno', 'berlin techno'],
    'Trance': ['trance', 'psytrance', 'psy-trance', 'goa trance'],
    'Bass': ['bass music', 'dubstep', 'drum and bass', 'dnb', 'riddim', 'heavy bass'],
    'Hardstyle': ['hardstyle', 'hardcore', 'hard dance'],
    'Indie/Alt': ['indie', 'alternative', 'rock band'],
    'Jam': ['jam band', 'bluegrass', 'string band', 'jam scene'],
}

location_map = {
    'USA': 'North America',
    'United States': 'North America', 
    'Canada': 'North America',
    'Mexico': 'North America',
    'UK': 'Europe',
    'England': 'Europe',
    'Netherlands': 'Europe',
    'Belgium': 'Europe',
    'Germany': 'Europe',
    'France': 'Europe',
    'Spain': 'Europe',
    'Portugal': 'Europe',
    'Italy': 'Europe',
    'Croatia': 'Europe',
    'Serbia': 'Europe',
    'Poland': 'Europe',
    'Czech': 'Europe',
    'Hungary': 'Europe',
    'Austria': 'Europe',
    'Switzerland': 'Europe',
    'Norway': 'Europe',
    'Sweden': 'Europe',
    'Finland': 'Europe',
    'Denmark': 'Europe',
    'Ireland': 'Europe',
    'Scotland': 'Europe',
    'Greece': 'Europe',
    'Romania': 'Europe',
    'Bulgaria': 'Europe',
    'Australia': 'Oceania',
    'Japan': 'Asia',
    'Thailand': 'Asia',
    'Indonesia': 'Asia',
    'Brazil': 'South America',
    'Argentina': 'South America',
    'Colombia': 'South America',
    'Chile': 'South America',
}

us_states = ['California', ', CA', 'Nevada', ', NV', 'Colorado', ', CO', 'Florida', ', FL', 
             'New York', ', NY', 'Texas', ', TX', 'Arizona', ', AZ', 'Illinois', ', IL',
             'Georgia', ', GA', 'Michigan', ', MI', 'Ohio', ', OH', 'Tennessee', ', TN',
             'Washington', ', WA', 'Oregon', ', OR', 'Pennsylvania', ', PA', 'Wisconsin', ', WI',
             'Maryland', ', MD', 'Virginia', ', VA', 'North Carolina', ', NC', 'Massachusetts', ', MA',
             'Minnesota', ', MN', 'Louisiana', ', LA', 'Kentucky', ', KY', 'Arkansas', ', AR',
             'Alabama', ', AL', 'Missouri', ', MO', 'New Mexico', ', NM', 'Delaware', ', DE']

for filepath in Path('festivals').glob('*.html'):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract title
    title_match = re.search(r'<h1[^>]*>([^<]+)</h1>', content)
    if not title_match:
        title_match = re.search(r'<title>([^—<]+)', content)
    title = title_match.group(1).strip() if title_match else filepath.stem.replace('-', ' ').title()
    title = re.sub(r'^[^\w\s]+\s*', '', title)  # Remove leading emoji
    
    # Extract location from meta spans
    location_match = re.search(r'📍\s*([^<]+)', content)
    location = location_match.group(1).strip() if location_match else ''
    
    # Determine country and continent
    country = ''
    continent = ''
    for loc_key, cont in location_map.items():
        if loc_key.lower() in location.lower():
            country = loc_key
            continent = cont
            break
    
    # Check for US states
    if not continent:
        for state in us_states:
            if state in location:
                country = 'USA'
                continent = 'North America'
                break
    
    # Extract capacity
    capacity_match = re.search(r'👥\s*([\d,]+)', content)
    capacity_str = capacity_match.group(1).replace(',', '') if capacity_match else ''
    try:
        capacity = int(capacity_str) if capacity_str else None
    except:
        capacity = None
    
    # Extract date
    date_match = re.search(r'📅\s*([^<]+)', content)
    date = date_match.group(1).strip() if date_match else ''
    
    # Determine month from date
    month = ''
    months = ['January', 'February', 'March', 'April', 'May', 'June', 
              'July', 'August', 'September', 'October', 'November', 'December']
    for m in months:
        if m in date:
            month = m
            break
    
    # Extract price
    price_match = re.search(r'💵\s*([^<]+)', content)
    price = price_match.group(1).strip() if price_match else ''
    
    # Determine genres from content - be more selective
    content_lower = content.lower()
    genres = []
    
    # Check title and first part of content for genre hints
    check_content = content_lower[:5000]
    
    for genre, keywords in genre_keywords.items():
        for kw in keywords:
            if kw in check_content:
                if genre not in genres:
                    genres.append(genre)
                break
    
    # Default to EDM if electronic festival indicators present
    if not genres:
        if any(x in check_content for x in ['electronic', 'dj', 'dance music', 'festival']):
            genres = ['EDM']
        else:
            genres = ['Multi-Genre']
    
    # Extract score if available
    score_match = re.search(r'class="number">(\d+\.?\d*)</span>', content)
    score = float(score_match.group(1)) if score_match else None
    
    # Size category
    size = 'Unknown'
    if capacity:
        if capacity < 10000:
            size = 'Boutique'
        elif capacity < 30000:
            size = 'Medium'
        elif capacity < 100000:
            size = 'Large'
        else:
            size = 'Massive'
    
    festival = {
        'slug': filepath.stem,
        'name': title,
        'location': location,
        'country': country,
        'continent': continent or 'Unknown',
        'capacity': capacity,
        'size': size,
        'date': date,
        'month': month,
        'price': price,
        'genres': genres,
        'score': score,
        'url': f'festivals/{filepath.name}'
    }
    festivals.append(festival)

# Sort by name
festivals.sort(key=lambda x: x['name'].lower())

print(f"Extracted {len(festivals)} festivals")

# Show continent distribution
continents = {}
for f in festivals:
    c = f['continent']
    continents[c] = continents.get(c, 0) + 1
print(f"By continent: {dict(sorted(continents.items(), key=lambda x: -x[1]))}")

# Show genre distribution
genre_counts = {}
for f in festivals:
    for g in f['genres']:
        genre_counts[g] = genre_counts.get(g, 0) + 1
print(f"By genre: {dict(sorted(genre_counts.items(), key=lambda x: -x[1]))}")

# Show size distribution  
sizes = {}
for f in festivals:
    s = f['size']
    sizes[s] = sizes.get(s, 0) + 1
print(f"By size: {sizes}")

# Save JSON
with open('js/festivals.json', 'w') as f:
    json.dump(festivals, f, indent=2)

print(f"\nSaved to js/festivals.json")
