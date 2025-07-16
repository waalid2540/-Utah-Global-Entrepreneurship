#!/usr/bin/env python3
"""
PDF Processor for Authentic Somali Religious Content
Extract and process billions of sentences from PDFs
"""

import sqlite3
import json
import re
from datetime import datetime
from typing import List, Dict
import hashlib

# For PDF processing (install with: pip install PyPDF2 pdfplumber)
try:
    import PyPDF2
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("📋 To process PDFs, install: pip install PyPDF2 pdfplumber")

class SomaliPDFProcessor:
    """Process authentic Somali religious PDFs into high-quality dataset"""
    
    def __init__(self, db_path: str = "somali_dataset.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database for religious content"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Enhanced table for religious content
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
        
        # Religious content tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS religious_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pdf_name TEXT UNIQUE NOT NULL,
                content_type TEXT,
                sentences_extracted INTEGER DEFAULT 0,
                processing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                imam_approved BOOLEAN DEFAULT TRUE
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized for religious content")
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        if not PDF_AVAILABLE:
            print("❌ PDF libraries not installed. Install: pip install PyPDF2 pdfplumber")
            return ""
        
        try:
            # Try pdfplumber first (better for complex layouts)
            with pdfplumber.open(pdf_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                if text.strip():
                    print(f"✅ Extracted {len(text)} characters with pdfplumber")
                    return text
        
        except Exception as e:
            print(f"⚠️ pdfplumber failed: {e}")
        
        try:
            # Fallback to PyPDF2
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                print(f"✅ Extracted {len(text)} characters with PyPDF2")
                return text
        
        except Exception as e:
            print(f"❌ PDF extraction failed: {e}")
            return ""
    
    def process_religious_text(self, text: str) -> List[Dict]:
        """Process religious text into high-quality sentences"""
        
        # Clean the text
        text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
        text = re.sub(r'[^\w\s.,!?;:()\-"\']+', '', text)  # Remove weird characters
        
        # Split into sentences (multiple methods for religious text)
        sentences = []
        
        # Method 1: Split by periods, exclamation marks, question marks
        basic_sentences = re.split(r'[.!?]+', text)
        
        # Method 2: Split by verse markers and religious punctuation
        verse_patterns = [
            r'(?<=\))\s+(?=[A-Z])',  # After parentheses
            r'(?<=\.)\s+(?=[A-Z])',  # After period
            r'(?<=\:)\s+(?=[A-Z])',  # After colon
            r'(?<=\;)\s+(?=[A-Z])',  # After semicolon
        ]
        
        for pattern in verse_patterns:
            additional_sentences = re.split(pattern, text)
            basic_sentences.extend(additional_sentences)
        
        # Process each sentence
        for sentence in basic_sentences:
            sentence = sentence.strip()
            
            # Skip if too short or too long
            if len(sentence) < 10 or len(sentence) > 500:
                continue
            
            # Skip if not enough words
            words = sentence.split()
            if len(words) < 3 or len(words) > 50:
                continue
            
            # Basic Somali validation
            if self.is_likely_somali(sentence):
                # Calculate quality score for religious content
                quality_score = self.calculate_religious_quality(sentence)
                
                if quality_score >= 70:  # High quality threshold
                    sentences.append({
                        'text': sentence,
                        'quality_score': quality_score,
                        'category': 'religious',
                        'source': 'imam_approved_pdf',
                        'scholar_approved': True,
                        'metadata': {
                            'word_count': len(words),
                            'character_count': len(sentence),
                            'religious_terms': self.count_religious_terms(sentence)
                        }
                    })
        
        return sentences
    
    def is_likely_somali(self, text: str) -> bool:
        """Check if text is likely Somali"""
        somali_indicators = [
            # Common Somali words
            'waa', 'baa', 'ayaa', 'oo', 'iyo', 'ka', 'ku', 'la', 'ah', 'si',
            # Religious terms
            'allah', 'allaah', 'islaam', 'diinta', 'nabiga', 'quraanka', 'salaad',
            # Common particles
            'waxa', 'waxaa', 'waxay', 'wuxuu', 'inuu', 'inay'
        ]
        
        text_lower = text.lower()
        indicator_count = sum(1 for indicator in somali_indicators if indicator in text_lower)
        
        return indicator_count >= 2  # At least 2 Somali indicators
    
    def calculate_religious_quality(self, text: str) -> float:
        """Calculate quality score for religious content"""
        score = 0
        
        # Base score for religious content
        score += 30
        
        # Religious terms boost
        religious_terms = self.count_religious_terms(text)
        score += min(religious_terms * 5, 20)
        
        # Length score
        words = text.split()
        if 5 <= len(words) <= 25:
            score += 20
        elif 3 <= len(words) <= 30:
            score += 15
        
        # Proper punctuation
        if any(p in text for p in '.!?'):
            score += 10
        
        # Capitalization (proper names)
        if any(word[0].isupper() for word in words if len(word) > 1):
            score += 10
        
        # Somali language patterns
        somali_patterns = ['waa', 'baa', 'ayaa', 'waxa', 'waxaa']
        if any(pattern in text.lower() for pattern in somali_patterns):
            score += 15
        
        return min(score, 100)
    
    def count_religious_terms(self, text: str) -> int:
        """Count Islamic/religious terms in text"""
        religious_terms = [
            'allah', 'allaah', 'islaam', 'diinta', 'nabiga', 'quraanka', 'salaad',
            'ramadan', 'hajj', 'xaj', 'saum', 'zakah', 'shahaadah', 'imaan',
            'muslim', 'muslimiinta', 'ducada', 'masjid', 'diin', 'kitaab',
            'ayah', 'surah', 'hadith', 'sunnah', 'rasul', 'rasuul',
            'bismillah', 'alhamdulillah', 'subhanallah', 'astaghfirullah',
            'inshallah', 'mashaallah', 'barakallahu', 'jannah', 'naar',
            'akhirah', 'dunya', 'taqwa', 'sabr', 'shukr', 'halal', 'haram'
        ]
        
        text_lower = text.lower()
        return sum(1 for term in religious_terms if term in text_lower)
    
    def save_sentences_to_db(self, sentences: List[Dict], pdf_name: str):
        """Save processed sentences to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        success_count = 0
        
        # Record the PDF source
        cursor.execute('''
            INSERT OR REPLACE INTO religious_sources 
            (pdf_name, content_type, sentences_extracted, imam_approved)
            VALUES (?, ?, ?, ?)
        ''', (pdf_name, 'religious', len(sentences), True))
        
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
        
        print(f"✅ Saved {success_count} sentences from {pdf_name}")
        return success_count
    
    def process_pdf_file(self, pdf_path: str, pdf_name: str = None) -> Dict:
        """Process a single PDF file"""
        if pdf_name is None:
            pdf_name = pdf_path.split('/')[-1]
        
        print(f"\n🕌 Processing religious PDF: {pdf_name}")
        
        # Extract text
        text = self.extract_text_from_pdf(pdf_path)
        if not text:
            return {"error": "Failed to extract text from PDF"}
        
        # Process into sentences
        sentences = self.process_religious_text(text)
        
        # Save to database
        saved_count = self.save_sentences_to_db(sentences, pdf_name)
        
        return {
            "pdf_name": pdf_name,
            "text_length": len(text),
            "sentences_extracted": len(sentences),
            "sentences_saved": saved_count,
            "average_quality": sum(s['quality_score'] for s in sentences) / len(sentences) if sentences else 0
        }
    
    def get_dataset_stats(self) -> Dict:
        """Get current dataset statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total sentences
        cursor.execute("SELECT COUNT(*) FROM somali_sentences")
        total = cursor.fetchone()[0]
        
        # Religious sentences
        cursor.execute("SELECT COUNT(*) FROM somali_sentences WHERE category = 'religious'")
        religious = cursor.fetchone()[0]
        
        # High quality sentences
        cursor.execute("SELECT COUNT(*) FROM somali_sentences WHERE quality_score >= 90")
        high_quality = cursor.fetchone()[0]
        
        # Average quality
        cursor.execute("SELECT AVG(quality_score) FROM somali_sentences")
        avg_quality = cursor.fetchone()[0] or 0
        
        # Sources processed
        cursor.execute("SELECT COUNT(*) FROM religious_sources")
        sources = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "total_sentences": total,
            "religious_sentences": religious,
            "high_quality_sentences": high_quality,
            "average_quality": round(avg_quality, 1),
            "sources_processed": sources,
            "ready_for_production": total >= 1000
        }

# Create processor instance
pdf_processor = SomaliPDFProcessor()

def process_religious_pdf(pdf_path: str):
    """Helper function to process a religious PDF"""
    return pdf_processor.process_pdf_file(pdf_path)

if __name__ == "__main__":
    print("🕌 Somali Religious PDF Processor Ready!")
    print("📋 To process PDFs, install: pip install PyPDF2 pdfplumber")
    print("🎯 Usage: python pdf_processor.py")
    
    # Example usage
    print("\n📊 Current Dataset Stats:")
    stats = pdf_processor.get_dataset_stats()
    for key, value in stats.items():
        print(f"   {key}: {value}")