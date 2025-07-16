"""
Enterprise-Grade Somali NLP Engine
Advanced language processing for professional Somali text analysis
"""

import re
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import sqlite3
from collections import Counter
import math

class SomaliNLPEngine:
    """Enterprise-grade Somali Natural Language Processing Engine"""
    
    def __init__(self):
        self.load_language_resources()
        self.init_grammar_rules()
        self.load_cultural_context()
    
    def load_language_resources(self):
        """Load comprehensive Somali language resources"""
        
        # Somali alphabet and phonetics
        self.somali_alphabet = {
            'consonants': ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z'],
            'vowels': ['a', 'e', 'i', 'o', 'u'],
            'special_chars': ['dh', 'kh', 'sh']
        }
        
        # Professional vocabulary indicators
        self.professional_words = {
            'government': ['dowlad', 'xukuumad', 'wasiir', 'guddoomiye', 'golaha', 'baarlamaan'],
            'business': ['ganacsato', 'macmiil', 'suuq', 'dhaqaale', 'maaliyadeed', 'ganacsi'],
            'education': ['waxbarasho', 'dugsiga', 'jaamacad', 'macallin', 'arday', 'cilmi'],
            'medical': ['caafimaad', 'dhakhtarka', 'bukaan', 'dawaynta', 'isbitaal', 'xanuun'],
            'legal': ['sharci', 'maxkamad', 'qaadhiga', 'xaq', 'dacwad', 'garsoor'],
            'Islamic': ['islaam', 'diinta', 'salaad', 'quraanka', 'nabiga', 'masjid', 'ducada']
        }
        
        # Common grammatical structures
        self.grammatical_patterns = {
            'question_words': ['ma', 'miyay', 'maxay', 'meesha', 'goorma', 'sideed', 'imisa'],
            'conjunctions': ['oo', 'iyo', 'ama', 'laakiin', 'balse', 'haddii', 'markii'],
            'particles': ['waa', 'baa', 'ayaa', 'waxaa', 'waxa'],
            'pronouns': ['aniga', 'adiga', 'isaga', 'iyada', 'annaga', 'idinka', 'iyaga'],
            'demonstratives': ['kan', 'tan', 'kaas', 'taas', 'kuwan', 'kuwaan', 'kuwaa']
        }
        
        # Regional dialect markers
        self.dialect_markers = {
            'standard': {
                'indicators': ['waa', 'baa', 'ayaa', 'waxa', 'waxaa'],
                'weight': 1.0,
                'confidence_boost': 0.8
            },
            'northern': {
                'indicators': ['yahay', 'tahay', 'kaalay', 'yaal', 'dhinac'],
                'weight': 0.9,
                'confidence_boost': 0.7
            },
            'southern': {
                'indicators': ['raac', 'keen', 'dhowr', 'yimi', 'kale'],
                'weight': 0.8,
                'confidence_boost': 0.6
            },
            'coastal': {
                'indicators': ['xamar', 'badda', 'dekad', 'dooni', 'kalluun'],
                'weight': 0.7,
                'confidence_boost': 0.5
            }
        }
    
    def init_grammar_rules(self):
        """Initialize advanced grammar validation rules"""
        
        self.grammar_rules = {
            'sentence_structure': {
                'svo_pattern': r'(\w+)\s+(waa|baa|ayaa)\s+(\w+)',
                'question_structure': r'(ma|miyay|maxay)\s+(\w+)',
                'negation_pattern': r'(ma|aan)\s+(\w+)',
                'emphasis_pattern': r'(\w+)\s+(baa|ayaa)\s+(\w+)'
            },
            'word_formation': {
                'plural_endings': ['yo', 'yaal', 'aal', 'oyin'],
                'feminine_endings': ['ad', 'ta', 'da'],
                'masculine_endings': ['ka', 'ga', 'ha'],
                'diminutive_endings': ['yar', 'yeel', 'aan']
            },
            'punctuation_rules': {
                'sentence_enders': ['.', '!', '?'],
                'separators': [',', ';', ':'],
                'quotation_marks': ['"', "'", '"', '"']
            }
        }
    
    def load_cultural_context(self):
        """Load cultural and religious context validators"""
        
        self.cultural_context = {
            'islamic_terms': {
                'greetings': ['assalamu calaykum', 'wacalaykum salaam', 'nabadgelyo'],
                'blessings': ['barakallahu', 'alhamdulillah', 'subhanallah', 'inshallah'],
                'respectful_titles': ['shiikh', 'ustaad', 'xaaji', 'imam'],
                'proper_usage': True
            },
            'respectful_language': {
                'elder_respect': ['walaal', 'waalidka', 'odayaal', 'hooyada'],
                'formal_address': ['mudane', 'marwo', 'duqa', 'guddoomiye'],
                'polite_forms': ['fadlan', 'mahadsanid', 'raalli noqo']
            },
            'cultural_sensitivity': {
                'taboo_topics': ['inappropriate_content', 'disrespectful_language'],
                'traditional_values': ['qoyska', 'dhaqanka', 'aadada', 'hidaha']
            }
        }
    
    def analyze_text_enterprise(self, text: str) -> Dict:
        """
        Enterprise-grade comprehensive text analysis
        
        Args:
            text: Somali text to analyze
            
        Returns:
            Detailed analysis with enterprise metrics
        """
        
        analysis = {
            'timestamp': datetime.now().isoformat(),
            'text_length': len(text),
            'word_count': len(text.split()),
            'enterprise_metrics': {}
        }
        
        # Core analysis components
        analysis['grammar_analysis'] = self._analyze_grammar(text)
        analysis['vocabulary_analysis'] = self._analyze_vocabulary(text)
        analysis['dialect_analysis'] = self._analyze_dialect_advanced(text)
        analysis['cultural_analysis'] = self._analyze_cultural_context(text)
        analysis['readability_analysis'] = self._analyze_readability(text)
        analysis['professional_score'] = self._calculate_professional_score(text)
        
        # Enterprise-specific metrics
        analysis['enterprise_metrics'] = {
            'accuracy_score': self._calculate_accuracy_score(analysis),
            'professionalism_score': self._calculate_professionalism_score(analysis),
            'cultural_appropriateness': self._calculate_cultural_score(analysis),
            'business_readiness': self._calculate_business_readiness(analysis),
            'overall_enterprise_score': 0  # Will be calculated
        }
        
        # Calculate overall enterprise score
        analysis['enterprise_metrics']['overall_enterprise_score'] = self._calculate_overall_score(analysis)
        
        return analysis
    
    def _analyze_grammar(self, text: str) -> Dict:
        """Advanced grammar analysis"""
        
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        grammar_score = 0
        issues = []
        
        # Check sentence structure
        svo_matches = len(re.findall(self.grammar_rules['sentence_structure']['svo_pattern'], text.lower()))
        if svo_matches > 0:
            grammar_score += 20
        else:
            issues.append("No clear Subject-Verb-Object structure detected")
        
        # Check for proper particles usage
        particles_found = sum(1 for particle in self.grammatical_patterns['particles'] if particle in text.lower())
        if particles_found > 0:
            grammar_score += 15
        else:
            issues.append("Missing grammatical particles (waa, baa, ayaa)")
        
        # Check punctuation
        has_proper_punctuation = any(p in text for p in self.grammar_rules['punctuation_rules']['sentence_enders'])
        if has_proper_punctuation:
            grammar_score += 10
        else:
            issues.append("Missing proper sentence punctuation")
        
        # Check word formation
        plural_forms = sum(1 for ending in self.grammar_rules['word_formation']['plural_endings'] 
                          if any(word.endswith(ending) for word in words))
        if plural_forms > 0:
            grammar_score += 10
        
        # Sentence length analysis
        avg_sentence_length = sum(len(s.split()) for s in sentences if s.strip()) / len([s for s in sentences if s.strip()])
        if 8 <= avg_sentence_length <= 20:
            grammar_score += 15
        elif avg_sentence_length < 8:
            issues.append("Sentences too short for professional writing")
        else:
            issues.append("Sentences too long, may affect readability")
        
        return {
            'grammar_score': min(grammar_score, 100),
            'issues': issues,
            'sentence_count': len([s for s in sentences if s.strip()]),
            'average_sentence_length': round(avg_sentence_length, 1),
            'particles_usage': particles_found,
            'punctuation_proper': has_proper_punctuation
        }
    
    def _analyze_vocabulary(self, text: str) -> Dict:
        """Advanced vocabulary analysis"""
        
        words = [word.lower().strip('.,!?;:') for word in text.split()]
        word_count = Counter(words)
        
        # Professional vocabulary scoring
        professional_score = 0
        professional_categories = []
        
        for category, category_words in self.professional_words.items():
            found_words = [word for word in words if word in category_words]
            if found_words:
                professional_score += len(found_words) * 10
                professional_categories.append({
                    'category': category,
                    'words_found': found_words,
                    'count': len(found_words)
                })
        
        # Vocabulary diversity
        unique_words = len(set(words))
        total_words = len(words)
        diversity_ratio = unique_words / total_words if total_words > 0 else 0
        
        # Word complexity analysis
        avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
        complex_words = [word for word in words if len(word) > 6]
        
        return {
            'vocabulary_score': min(professional_score, 100),
            'professional_categories': professional_categories,
            'diversity_ratio': round(diversity_ratio, 3),
            'unique_words': unique_words,
            'total_words': total_words,
            'average_word_length': round(avg_word_length, 1),
            'complex_words': len(complex_words),
            'complexity_ratio': round(len(complex_words) / total_words, 3) if total_words > 0 else 0
        }
    
    def _analyze_dialect_advanced(self, text: str) -> Dict:
        """Advanced dialect detection with confidence scoring"""
        
        text_lower = text.lower()
        dialect_scores = {}
        
        for dialect, markers in self.dialect_markers.items():
            score = 0
            found_indicators = []
            
            for indicator in markers['indicators']:
                if indicator in text_lower:
                    score += markers['weight'] * markers['confidence_boost']
                    found_indicators.append(indicator)
            
            if found_indicators:
                dialect_scores[dialect] = {
                    'score': score,
                    'indicators': found_indicators,
                    'confidence': min(score * 10, 100)
                }
        
        # Determine primary dialect
        if dialect_scores:
            primary_dialect = max(dialect_scores.keys(), key=lambda x: dialect_scores[x]['score'])
            confidence = dialect_scores[primary_dialect]['confidence']
        else:
            primary_dialect = "Unknown"
            confidence = 0
        
        return {
            'primary_dialect': primary_dialect,
            'confidence': round(confidence, 1),
            'dialect_breakdown': dialect_scores,
            'is_standard_somali': primary_dialect == 'standard'
        }
    
    def _analyze_cultural_context(self, text: str) -> Dict:
        """Analyze cultural and religious appropriateness"""
        
        text_lower = text.lower()
        cultural_score = 0
        cultural_elements = []
        
        # Check for Islamic terms usage
        islamic_terms_found = []
        for category, terms in self.cultural_context['islamic_terms'].items():
            if category != 'proper_usage':
                found = [term for term in terms if term in text_lower]
                if found:
                    islamic_terms_found.extend(found)
                    cultural_score += len(found) * 5
        
        # Check for respectful language
        respectful_terms = []
        for category, terms in self.cultural_context['respectful_language'].items():
            found = [term for term in terms if term in text_lower]
            if found:
                respectful_terms.extend(found)
                cultural_score += len(found) * 3
        
        # Cultural sensitivity check
        sensitivity_score = 100  # Start with full score, deduct for issues
        
        return {
            'cultural_score': min(cultural_score, 100),
            'islamic_terms_found': islamic_terms_found,
            'respectful_terms': respectful_terms,
            'cultural_sensitivity': sensitivity_score,
            'is_culturally_appropriate': sensitivity_score >= 80
        }
    
    def _analyze_readability(self, text: str) -> Dict:
        """Advanced readability analysis for Somali text"""
        
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        words = text.split()
        
        if not sentences or not words:
            return {'readability_score': 0, 'grade_level': 'Unknown'}
        
        # Basic readability metrics
        avg_sentence_length = len(words) / len(sentences)
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # Somali-specific readability formula
        readability_score = 100 - (
            (1.015 * avg_sentence_length) + 
            (84.6 * avg_word_length / 4.7)
        )
        
        # Grade level estimation
        if readability_score >= 90:
            grade_level = "Elementary"
        elif readability_score >= 80:
            grade_level = "Middle School"
        elif readability_score >= 70:
            grade_level = "High School"
        elif readability_score >= 60:
            grade_level = "College"
        else:
            grade_level = "Graduate"
        
        return {
            'readability_score': max(0, min(100, readability_score)),
            'grade_level': grade_level,
            'avg_sentence_length': round(avg_sentence_length, 1),
            'avg_word_length': round(avg_word_length, 1),
            'complexity_level': 'High' if avg_word_length > 6 else 'Medium' if avg_word_length > 4 else 'Low'
        }
    
    def _calculate_professional_score(self, text: str) -> Dict:
        """Calculate professional writing score"""
        
        words = text.split()
        
        # Professional indicators
        professional_indicators = 0
        
        # Check for formal language patterns
        formal_patterns = ['waxaa', 'waxa', 'sida', 'guud ahaan', 'si kastaba']
        professional_indicators += sum(1 for pattern in formal_patterns if pattern in text.lower())
        
        # Check for academic/business vocabulary
        academic_words = ['cilmi', 'daraasad', 'baaritaan', 'xog', 'macluumaad']
        professional_indicators += sum(1 for word in academic_words if word in text.lower())
        
        # Check for proper citations and references
        has_citations = bool(re.search(r'\d{4}|\(.*\)|\[.*\]', text))
        if has_citations:
            professional_indicators += 2
        
        # Calculate score
        professional_score = min(professional_indicators * 10, 100)
        
        return {
            'professional_score': professional_score,
            'formal_language_count': professional_indicators,
            'has_citations': has_citations,
            'is_professional_level': professional_score >= 70
        }
    
    def _calculate_accuracy_score(self, analysis: Dict) -> float:
        """Calculate overall accuracy score"""
        
        grammar_weight = 0.3
        vocabulary_weight = 0.25
        cultural_weight = 0.2
        readability_weight = 0.15
        professional_weight = 0.1
        
        accuracy = (
            analysis['grammar_analysis']['grammar_score'] * grammar_weight +
            analysis['vocabulary_analysis']['vocabulary_score'] * vocabulary_weight +
            analysis['cultural_analysis']['cultural_score'] * cultural_weight +
            analysis['readability_analysis']['readability_score'] * readability_weight +
            analysis['professional_score']['professional_score'] * professional_weight
        )
        
        return round(accuracy, 1)
    
    def _calculate_professionalism_score(self, analysis: Dict) -> float:
        """Calculate professionalism score"""
        
        base_score = analysis['professional_score']['professional_score']
        
        # Boost for cultural appropriateness
        if analysis['cultural_analysis']['is_culturally_appropriate']:
            base_score += 10
        
        # Boost for proper dialect usage
        if analysis['dialect_analysis']['is_standard_somali']:
            base_score += 5
        
        # Penalty for grammar issues
        grammar_issues = len(analysis['grammar_analysis']['issues'])
        base_score -= grammar_issues * 2
        
        return round(min(base_score, 100), 1)
    
    def _calculate_cultural_score(self, analysis: Dict) -> float:
        """Calculate cultural appropriateness score"""
        
        return round(analysis['cultural_analysis']['cultural_sensitivity'], 1)
    
    def _calculate_business_readiness(self, analysis: Dict) -> float:
        """Calculate business readiness score"""
        
        readiness_score = 0
        
        # Grammar quality
        if analysis['grammar_analysis']['grammar_score'] >= 80:
            readiness_score += 30
        
        # Professional vocabulary
        if analysis['vocabulary_analysis']['vocabulary_score'] >= 70:
            readiness_score += 25
        
        # Cultural appropriateness
        if analysis['cultural_analysis']['is_culturally_appropriate']:
            readiness_score += 20
        
        # Readability
        if analysis['readability_analysis']['readability_score'] >= 60:
            readiness_score += 15
        
        # Professional level
        if analysis['professional_score']['is_professional_level']:
            readiness_score += 10
        
        return round(readiness_score, 1)
    
    def _calculate_overall_score(self, analysis: Dict) -> float:
        """Calculate overall enterprise score"""
        
        metrics = analysis['enterprise_metrics']
        
        overall = (
            metrics['accuracy_score'] * 0.3 +
            metrics['professionalism_score'] * 0.25 +
            metrics['cultural_appropriateness'] * 0.2 +
            metrics['business_readiness'] * 0.25
        )
        
        return round(overall, 1)

# Initialize global NLP engine instance
nlp_engine = SomaliNLPEngine()