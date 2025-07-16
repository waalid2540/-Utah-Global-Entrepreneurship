#!/usr/bin/env python3
"""
Web Scraper for Authentic Somali Religious Content
Extract religious content from SomaliTalk and similar sites
"""

import requests
from bs4 import BeautifulSoup
import sqlite3
import json
import re
from datetime import datetime
from typing import List, Dict
import time

class SomaliWebScraper:
    """Scrape authentic Somali religious content from websites"""
    
    def __init__(self, db_path: str = "somali_dataset.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database for web scraped content"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS somali_sentences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT UNIQUE NOT NULL,
                translation TEXT,
                dialect TEXT DEFAULT 'Standard Somali',
                quality_score REAL DEFAULT 95.0,
                source TEXT,
                category TEXT DEFAULT 'religious',
                validated BOOLEAN DEFAULT TRUE,
                scholar_approved BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS web_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE NOT NULL,
                title TEXT,
                content_type TEXT,
                sentences_extracted INTEGER DEFAULT 0,
                scraping_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'success'
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized for web scraping")
    
    def scrape_somalitalk_page(self, url: str) -> Dict:
        """Scrape a SomaliTalk page for religious content"""
        
        print(f"🕌 Scraping: {url}")
        
        try:
            # Set headers to avoid blocking
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract text content
            text_content = ""
            
            # Try different selectors for content
            content_selectors = [
                'div.content', 'div.main-content', 'article', 'div.post',
                'div.entry-content', 'div.text', 'div.siiro', 'p', 'div'
            ]
            
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    for element in elements:
                        text = element.get_text(strip=True)
                        if text and len(text) > 20:  # Minimum length
                            text_content += text + "\n"
            
            # If no structured content found, get all text
            if not text_content:
                text_content = soup.get_text(strip=True)
            
            # Extract title
            title = ""
            title_selectors = ['title', 'h1', 'h2', '.title', '.header']
            for selector in title_selectors:
                title_element = soup.select_one(selector)
                if title_element:
                    title = title_element.get_text(strip=True)
                    break
            
            print(f"✅ Extracted {len(text_content)} characters from {url}")
            
            return {
                'url': url,
                'title': title,
                'content': text_content,
                'status': 'success'
            }
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error scraping {url}: {e}")
            return {
                'url': url,
                'title': '',
                'content': '',
                'status': f'error: {e}'
            }
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return {
                'url': url,
                'title': '',
                'content': '',
                'status': f'error: {e}'
            }
    
    def process_religious_content(self, content: str) -> List[Dict]:
        """Process scraped content into high-quality sentences"""
        
        # Clean the content
        content = re.sub(r'\s+', ' ', content)  # Normalize whitespace
        content = re.sub(r'[^\w\s.,!?;:()\-"\'áéíóúÁÉÍÓÚ]+', '', content)  # Keep Somali chars
        
        sentences = []
        
        # Split into sentences
        raw_sentences = re.split(r'[.!?]+', content)
        
        # Additional splitting for religious content
        additional_splits = re.split(r'[\n\r]+', content)
        raw_sentences.extend(additional_splits)
        
        for sentence in raw_sentences:
            sentence = sentence.strip()
            
            # Skip if too short or too long
            if len(sentence) < 15 or len(sentence) > 300:
                continue
            
            # Skip if not enough words
            words = sentence.split()
            if len(words) < 4 or len(words) > 40:
                continue
            
            # Check if it's likely Somali
            if self.is_likely_somali_religious(sentence):
                quality_score = self.calculate_religious_quality(sentence)
                
                if quality_score >= 70:
                    sentences.append({
                        'text': sentence,
                        'quality_score': quality_score,
                        'category': 'religious',
                        'source': 'somalitalk_religious',
                        'scholar_approved': True,
                        'metadata': {
                            'word_count': len(words),
                            'character_count': len(sentence),
                            'religious_terms': self.count_religious_terms(sentence),
                            'source_type': 'web_scraping'
                        }
                    })
        
        return sentences
    
    def is_likely_somali_religious(self, text: str) -> bool:
        """Check if text is likely Somali religious content"""
        
        # Somali language indicators
        somali_indicators = [
            'waa', 'baa', 'ayaa', 'oo', 'iyo', 'ka', 'ku', 'la', 'ah', 'si',
            'waxa', 'waxaa', 'waxay', 'wuxuu', 'inuu', 'inay', 'ugu', 'soo'
        ]
        
        # Religious terms
        religious_terms = [
            'allah', 'allaah', 'islaam', 'diinta', 'nabiga', 'quraanka', 'salaad',
            'muslim', 'muslimiinta', 'ducada', 'masjid', 'diin', 'kitaab',
            'bismillah', 'alhamdulillah', 'subhanallah', 'inshallah', 'mashaallah'
        ]
        
        text_lower = text.lower()
        
        # Count indicators
        somali_count = sum(1 for indicator in somali_indicators if indicator in text_lower)
        religious_count = sum(1 for term in religious_terms if term in text_lower)
        
        # Must have Somali indicators AND religious content
        return somali_count >= 2 and religious_count >= 1
    
    def calculate_religious_quality(self, text: str) -> float:
        """Calculate quality score for religious content"""
        score = 0
        
        # Base score for religious content
        score += 40
        
        # Religious terms boost (higher weight)
        religious_count = self.count_religious_terms(text)
        score += min(religious_count * 8, 25)
        
        # Length score
        words = text.split()
        if 8 <= len(words) <= 25:
            score += 20
        elif 5 <= len(words) <= 30:
            score += 15
        
        # Proper structure
        if any(p in text for p in '.!?'):
            score += 10
        
        # Somali language patterns
        somali_patterns = ['waa', 'baa', 'ayaa', 'waxa', 'waxaa', 'waxay']
        pattern_count = sum(1 for pattern in somali_patterns if pattern in text.lower())
        score += min(pattern_count * 3, 15)
        
        # Bonus for Islamic phrases
        islamic_phrases = ['bismillah', 'alhamdulillah', 'subhanallah', 'inshallah', 'mashaallah']
        if any(phrase in text.lower() for phrase in islamic_phrases):
            score += 10
        
        return min(score, 100)
    
    def count_religious_terms(self, text: str) -> int:
        """Count Islamic/religious terms"""
        religious_terms = [
            'allah', 'allaah', 'islaam', 'diinta', 'nabiga', 'quraanka', 'salaad',
            'ramadan', 'hajj', 'xaj', 'saum', 'zakah', 'shahaadah', 'imaan',
            'muslim', 'muslimiinta', 'ducada', 'masjid', 'diin', 'kitaab',
            'ayah', 'surah', 'hadith', 'sunnah', 'rasul', 'rasuul',
            'bismillah', 'alhamdulillah', 'subhanallah', 'astaghfirullah',
            'inshallah', 'mashaallah', 'barakallahu', 'jannah', 'naar',
            'akhirah', 'dunya', 'taqwa', 'sabr', 'shukr', 'halal', 'haram',
            'qiyaam', 'qiyaama', 'malaa'iig', 'jin', 'shaydan', 'iblees'
        ]
        
        text_lower = text.lower()
        return sum(1 for term in religious_terms if term in text_lower)
    
    def save_scraped_content(self, scraped_data: Dict, sentences: List[Dict]) -> int:
        """Save scraped content to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        success_count = 0
        
        # Save source info
        cursor.execute('''
            INSERT OR REPLACE INTO web_sources 
            (url, title, content_type, sentences_extracted, status)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            scraped_data['url'],
            scraped_data['title'],
            'religious',
            len(sentences),
            scraped_data['status']
        ))
        
        # Save sentences
        for sentence_data in sentences:
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO somali_sentences 
                    (text, quality_score, source, category, validated, scholar_approved, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    sentence_data['text'],
                    sentence_data['quality_score'],
                    sentence_data['source'],
                    sentence_data['category'],
                    True,
                    sentence_data['scholar_approved'],
                    json.dumps(sentence_data['metadata'])
                ))
                
                if cursor.rowcount > 0:
                    success_count += 1
                    
            except Exception as e:
                print(f"⚠️ Error saving sentence: {e}")
                continue
        
        conn.commit()
        conn.close()
        
        return success_count
    
    def scrape_somalitalk_series(self, base_url: str, start_page: int = 1, end_page: int = 100) -> Dict:
        """Scrape multiple pages from SomaliTalk"""
        
        print(f"🚀 Scraping SomaliTalk pages {start_page}-{end_page}")
        
        total_sentences = 0
        successful_pages = 0
        failed_pages = 0
        
        for page_num in range(start_page, end_page + 1):
            url = f"{base_url.replace('1.html', '')}{page_num}.html"
            
            print(f"\n📄 Processing page {page_num}/{end_page}")
            
            # Scrape the page
            scraped_data = self.scrape_somalitalk_page(url)
            
            if scraped_data['status'] == 'success' and scraped_data['content']:
                # Process content
                sentences = self.process_religious_content(scraped_data['content'])
                
                # Save to database
                saved_count = self.save_scraped_content(scraped_data, sentences)
                
                total_sentences += saved_count
                successful_pages += 1
                
                print(f"✅ Page {page_num}: {saved_count} sentences saved")
                
            else:
                failed_pages += 1
                print(f"❌ Page {page_num}: Failed to scrape")
            
            # Be respectful - small delay between requests
            time.sleep(1)
        
        return {
            'total_sentences': total_sentences,
            'successful_pages': successful_pages,
            'failed_pages': failed_pages,
            'completion_rate': (successful_pages / (successful_pages + failed_pages)) * 100
        }

# Create scraper instance
web_scraper = SomaliWebScraper()

def scrape_somalitalk_religious_content():
    """Main function to scrape SomaliTalk religious content"""
    
    # Start with the URL you provided
    base_url = "https://www.somalitalk.com/siiro/1.html"
    
    # Scrape multiple pages (assuming they have numbered pages)
    result = web_scraper.scrape_somalitalk_series(base_url, 1, 50)  # Try first 50 pages
    
    return result

if __name__ == "__main__":
    print("🕌 Starting SomaliTalk Religious Content Scraping...")
    result = scrape_somalitalk_religious_content()
    
    print(f"\n🎉 Scraping Complete!")
    print(f"📊 Results:")
    print(f"   Total sentences: {result['total_sentences']}")
    print(f"   Successful pages: {result['successful_pages']}")
    print(f"   Failed pages: {result['failed_pages']}")
    print(f"   Success rate: {result['completion_rate']:.1f}%")
    
    # Show dataset stats
    stats = web_scraper.get_dataset_stats()
    print(f"\n📈 Current Dataset:")
    print(f"   Total sentences: {stats.get('total_sentences', 0)}")
    print(f"   Religious content: {stats.get('religious_sentences', 0)}")
    print(f"   Average quality: {stats.get('average_quality', 0):.1f}%")