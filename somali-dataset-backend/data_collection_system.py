"""
Enterprise Data Collection System
Automated collection and validation of Somali language data
"""

import asyncio
import aiohttp
import sqlite3
import json
import re
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import hashlib
from pathlib import Path
import logging
from enterprise_nlp import nlp_engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SomaliDataCollector:
    """Enterprise-grade Somali data collection system"""
    
    def __init__(self, db_path: str = "somali_dataset.db"):
        self.db_path = db_path
        self.init_data_tables()
        
    def init_data_tables(self):
        """Initialize additional tables for data collection"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Sources table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_name TEXT UNIQUE NOT NULL,
                source_type TEXT,
                url TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                last_scraped TIMESTAMP,
                total_collected INTEGER DEFAULT 0,
                success_rate REAL DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Raw data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS raw_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id INTEGER,
                raw_text TEXT NOT NULL,
                language_detected TEXT,
                confidence_score REAL,
                is_processed BOOLEAN DEFAULT FALSE,
                is_valid BOOLEAN DEFAULT NULL,
                collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES data_sources (id)
            )
        ''')
        
        # Validation queue
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS validation_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw_data_id INTEGER,
                text TEXT NOT NULL,
                validation_status TEXT DEFAULT 'pending',
                validator_id INTEGER,
                validation_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                validated_at TIMESTAMP,
                FOREIGN KEY (raw_data_id) REFERENCES raw_data (id)
            )
        ''')
        
        # Scholar validation
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scholar_validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sentence_id INTEGER,
                scholar_email TEXT,
                validation_score INTEGER,
                cultural_score INTEGER,
                grammar_score INTEGER,
                notes TEXT,
                approved BOOLEAN,
                validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sentence_id) REFERENCES somali_sentences (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def add_data_source(self, source_name: str, source_type: str, url: str = None) -> int:
        """Add a new data source"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO data_sources (source_name, source_type, url)
                VALUES (?, ?, ?)
            ''', (source_name, source_type, url))
            
            source_id = cursor.lastrowid
            conn.commit()
            
            logger.info(f"Added data source: {source_name} (ID: {source_id})")
            return source_id
            
        except sqlite3.IntegrityError:
            logger.warning(f"Source {source_name} already exists")
            return None
        finally:
            conn.close()
    
    def collect_from_text_sources(self, text_sources: List[str]) -> Dict:
        """Collect data from provided text sources"""
        
        collected_data = []
        
        for source_text in text_sources:
            # Split into sentences
            sentences = self._extract_sentences(source_text)
            
            for sentence in sentences:
                if self._is_valid_somali_sentence(sentence):
                    # Analyze with enterprise NLP
                    analysis = nlp_engine.analyze_text_enterprise(sentence)
                    
                    # Only keep high-quality sentences
                    if analysis['enterprise_metrics']['overall_enterprise_score'] >= 70:
                        collected_data.append({
                            'text': sentence,
                            'analysis': analysis,
                            'source': 'text_input'
                        })
        
        # Save to database
        self._save_collected_data(collected_data)
        
        return {
            'total_collected': len(collected_data),
            'high_quality_count': len([d for d in collected_data if d['analysis']['enterprise_metrics']['overall_enterprise_score'] >= 80]),
            'average_quality': sum(d['analysis']['enterprise_metrics']['overall_enterprise_score'] for d in collected_data) / len(collected_data) if collected_data else 0
        }
    
    def collect_from_web_sources(self, urls: List[str]) -> Dict:
        """Collect data from web sources"""
        
        # This would implement web scraping
        # For now, return mock data structure
        return {
            'sources_processed': len(urls),
            'total_collected': 0,
            'success_rate': 0.0,
            'note': 'Web scraping to be implemented'
        }
    
    def _extract_sentences(self, text: str) -> List[str]:
        """Extract individual sentences from text"""
        
        # Clean text
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Split by sentence endings
        sentences = re.split(r'[.!?]+', text)
        
        # Clean and filter sentences
        cleaned_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 10 and len(sentence.split()) >= 3:  # Minimum quality threshold
                cleaned_sentences.append(sentence)
        
        return cleaned_sentences
    
    def _is_valid_somali_sentence(self, sentence: str) -> bool:
        """Quick validation if sentence is likely Somali"""
        
        # Check for Somali-specific indicators
        somali_indicators = [
            'waa', 'baa', 'ayaa', 'oo', 'iyo', 'ka', 'ku', 'la', 
            'ah', 'si', 'ugu', 'soo', 'aan', 'waxa', 'waxaa'
        ]
        
        sentence_lower = sentence.lower()
        indicator_count = sum(1 for indicator in somali_indicators if indicator in sentence_lower)
        
        # Must have at least 1 Somali indicator and reasonable length
        return indicator_count >= 1 and 5 <= len(sentence.split()) <= 50
    
    def _save_collected_data(self, data: List[Dict]):
        """Save collected data to database"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for item in data:
            try:
                # Save to raw_data table
                cursor.execute('''
                    INSERT INTO raw_data (source_id, raw_text, language_detected, confidence_score, is_processed, is_valid)
                    VALUES (1, ?, 'somali', ?, TRUE, TRUE)
                ''', (item['text'], item['analysis']['enterprise_metrics']['overall_enterprise_score']))
                
                # Save to main sentences table
                cursor.execute('''
                    INSERT OR IGNORE INTO somali_sentences 
                    (text, dialect, quality_score, source, validated, metadata)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    item['text'],
                    item['analysis']['dialect_analysis']['primary_dialect'],
                    item['analysis']['enterprise_metrics']['overall_enterprise_score'],
                    item['source'],
                    True,
                    json.dumps(item['analysis']['enterprise_metrics'])
                ))
                
            except sqlite3.IntegrityError:
                # Sentence already exists, skip
                continue
        
        conn.commit()
        conn.close()
    
    def generate_sample_data(self, count: int = 1000) -> Dict:
        """Generate sample Somali sentences for testing"""
        
        # Sample Somali sentence templates
        sentence_templates = [
            "Waxaa jira {noun} oo {adjective} ah",
            "Dadka Soomaaliyeed waxay {verb} {object}",
            "Magaalada {city} waxaa ku nool {number} qof",
            "Dhaqanka Soomaaliyeed wuxuu ka kooban yahay {culture_element}",
            "Waxbarashada waa muhiim u {group} oo dhan",
            "Caafimaadka dadka waa mas'uuliyadda {institution}",
            "Dhaqaalaha dalka wuxuu ku tiirsan yahay {economic_sector}",
            "Siyaasadda Soomaaliya waxay u baahan tahay {political_need}",
            "Bulshada Soomaaliyeed waxay door muhiim ah ka ciyaartaa {social_aspect}",
            "Diinta Islaamka waxay baraysaa {islamic_teaching}"
        ]
        
        # Word banks
        word_banks = {
            'noun': ['qof', 'guri', 'magaalo', 'dalka', 'bulshada', 'qoyska', 'shaqo', 'waxbarasho'],
            'adjective': ['weyn', 'yar', 'qurux badan', 'muhiim', 'cusub', 'hore', 'fiican', 'xun'],
            'verb': ['samayn', 'dhis', 'waxbarasho', 'caawin', 'horumar', 'ilaalin', 'kobcin', 'hagaajin'],
            'object': ['dalka', 'bulshada', 'dhaqanka', 'luuqadda', 'waxbarashada', 'caafimaadka'],
            'city': ['Muqdisho', 'Hargeysa', 'Kismaayo', 'Berbera', 'Burco', 'Bosaso', 'Gaalkacyo'],
            'number': ['kun', 'laba kun', 'sadex kun', 'afar kun', 'shan kun', 'lix kun', 'toddobo kun'],
            'culture_element': ['dhaqamada', 'caadadaha', 'hidaha', 'suugaanta', 'heesaha', 'ciyaaraha'],
            'group': ['caruurta', 'dhalinyarada', 'dadka waaweyn', 'haweenka', 'ragga', 'bulshada'],
            'institution': ['dawladda', 'isbitaalada', 'dugsiyada', 'hay\'adaha', 'ururrada'],
            'economic_sector': ['beeraha', 'xoolaha', 'kalluunka', 'ganacsiga', 'warshadaha', 'dhaqaalaha'],
            'political_need': ['midnimo', 'hoggaamin wanaagsan', 'nabadgelyo', 'cadaalad', 'horumarka'],
            'social_aspect': ['waxbarashada', 'caafimaadka', 'dhaqaalaha', 'amniga', 'horumarinta'],
            'islamic_teaching': ['walaaltinimo', 'naxariis', 'cadaalad', 'dulqaad', 'diinta', 'akhlaaq']
        }
        
        import random
        
        generated_sentences = []
        
        for i in range(count):
            template = random.choice(sentence_templates)
            
            # Replace placeholders with random words
            sentence = template
            for placeholder, words in word_banks.items():
                if f'{{{placeholder}}}' in sentence:
                    sentence = sentence.replace(f'{{{placeholder}}}', random.choice(words))
            
            # Add some variation
            if random.random() < 0.3:  # 30% chance to add "si kastaba"
                sentence = f"Si kastaba, {sentence.lower()}"
            
            if random.random() < 0.2:  # 20% chance to add "waa run"
                sentence = f"{sentence}. Waa run."
            
            generated_sentences.append(sentence)
        
        # Process and save generated sentences
        collection_result = self.collect_from_text_sources(generated_sentences)
        
        return {
            'generated_count': count,
            'collected_count': collection_result['total_collected'],
            'high_quality_count': collection_result['high_quality_count'],
            'average_quality': collection_result['average_quality']
        }
    
    def get_collection_stats(self) -> Dict:
        """Get data collection statistics"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total sentences
        cursor.execute("SELECT COUNT(*) FROM somali_sentences")
        total_sentences = cursor.fetchone()[0]
        
        # High quality sentences (score >= 80)
        cursor.execute("SELECT COUNT(*) FROM somali_sentences WHERE quality_score >= 80")
        high_quality = cursor.fetchone()[0]
        
        # Average quality
        cursor.execute("SELECT AVG(quality_score) FROM somali_sentences")
        avg_quality = cursor.fetchone()[0] or 0
        
        # By source
        cursor.execute("SELECT source, COUNT(*) FROM somali_sentences GROUP BY source")
        by_source = dict(cursor.fetchall())
        
        # By dialect
        cursor.execute("SELECT dialect, COUNT(*) FROM somali_sentences GROUP BY dialect")
        by_dialect = dict(cursor.fetchall())
        
        # Recent additions (last 24 hours)
        cursor.execute("SELECT COUNT(*) FROM somali_sentences WHERE created_at > datetime('now', '-1 day')")
        recent_additions = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_sentences': total_sentences,
            'high_quality_sentences': high_quality,
            'average_quality': round(avg_quality, 1),
            'quality_percentage': round((high_quality / total_sentences) * 100, 1) if total_sentences > 0 else 0,
            'by_source': by_source,
            'by_dialect': by_dialect,
            'recent_additions_24h': recent_additions
        }
    
    def bulk_validate_sentences(self, sentences: List[str], validator_id: int = 1) -> Dict:
        """Bulk validate sentences for quality"""
        
        validated_sentences = []
        
        for sentence in sentences:
            if self._is_valid_somali_sentence(sentence):
                analysis = nlp_engine.analyze_text_enterprise(sentence)
                
                validated_sentences.append({
                    'text': sentence,
                    'quality_score': analysis['enterprise_metrics']['overall_enterprise_score'],
                    'is_valid': analysis['enterprise_metrics']['overall_enterprise_score'] >= 70,
                    'analysis': analysis
                })
        
        # Save validation results
        self._save_validation_results(validated_sentences, validator_id)
        
        return {
            'total_validated': len(validated_sentences),
            'valid_sentences': len([s for s in validated_sentences if s['is_valid']]),
            'invalid_sentences': len([s for s in validated_sentences if not s['is_valid']]),
            'average_quality': sum(s['quality_score'] for s in validated_sentences) / len(validated_sentences) if validated_sentences else 0
        }
    
    def _save_validation_results(self, validated_sentences: List[Dict], validator_id: int):
        """Save validation results to database"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for sentence_data in validated_sentences:
            if sentence_data['is_valid']:
                try:
                    cursor.execute('''
                        INSERT OR IGNORE INTO somali_sentences 
                        (text, dialect, quality_score, source, validated, metadata)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        sentence_data['text'],
                        sentence_data['analysis']['dialect_analysis']['primary_dialect'],
                        sentence_data['quality_score'],
                        'bulk_validation',
                        True,
                        json.dumps(sentence_data['analysis']['enterprise_metrics'])
                    ))
                except sqlite3.IntegrityError:
                    continue
        
        conn.commit()
        conn.close()

# Initialize global data collector
data_collector = SomaliDataCollector()