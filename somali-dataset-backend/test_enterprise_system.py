#!/usr/bin/env python3
"""
Test Enterprise Somali NLP System
Test the complete enterprise system with real data
"""

import sqlite3
import json
from datetime import datetime
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from enterprise_nlp import nlp_engine
    from data_collection_system import data_collector
    from quick_dataset_builder import init_database, build_enterprise_dataset, save_to_database
    print("✅ All modules imported successfully")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

def test_nlp_engine():
    """Test the enterprise NLP engine"""
    print("\n🧪 Testing Enterprise NLP Engine...")
    
    # Test sentences
    test_sentences = [
        "Bismillahi Rahmaani Raheem",
        "Waxbarashadu waa iftiin, jaahilnimaduna waa mugdi",
        "Dhaqanka Soomaaliyeed waa mid taariikh dheer leh",
        "Shirkadda waa mid horumar leh oo macmiilka u adeegta",
        "Qofka wax barata waa qofka guulaysta noloshiisa",
        "Dadka Soomaaliyeed waa dad cafimaad qaba oo jecel tahriibka"
    ]
    
    results = []
    
    for sentence in test_sentences:
        print(f"\n📝 Testing: '{sentence}'")
        
        try:
            analysis = nlp_engine.analyze_text_enterprise(sentence)
            
            # Extract key metrics
            overall_score = analysis['enterprise_metrics']['overall_enterprise_score']
            accuracy = analysis['enterprise_metrics']['accuracy_score']
            professionalism = analysis['enterprise_metrics']['professionalism_score']
            cultural = analysis['enterprise_metrics']['cultural_appropriateness']
            
            print(f"   Overall Score: {overall_score}%")
            print(f"   Accuracy: {accuracy}%")
            print(f"   Professionalism: {professionalism}%")
            print(f"   Cultural Score: {cultural}%")
            
            results.append({
                "sentence": sentence,
                "overall_score": overall_score,
                "accuracy": accuracy,
                "professionalism": professionalism,
                "cultural": cultural
            })
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append({
                "sentence": sentence,
                "error": str(e)
            })
    
    # Calculate averages
    valid_results = [r for r in results if "error" not in r]
    if valid_results:
        avg_overall = sum(r["overall_score"] for r in valid_results) / len(valid_results)
        avg_accuracy = sum(r["accuracy"] for r in valid_results) / len(valid_results)
        avg_professionalism = sum(r["professionalism"] for r in valid_results) / len(valid_results)
        avg_cultural = sum(r["cultural"] for r in valid_results) / len(valid_results)
        
        print(f"\n📊 Average Scores:")
        print(f"   Overall: {avg_overall:.1f}%")
        print(f"   Accuracy: {avg_accuracy:.1f}%")
        print(f"   Professionalism: {avg_professionalism:.1f}%")
        print(f"   Cultural: {avg_cultural:.1f}%")
        
        return avg_overall >= 75  # Pass if average is 75% or higher
    else:
        print("❌ No valid results")
        return False

def test_data_collection():
    """Test data collection system"""
    print("\n🧪 Testing Data Collection System...")
    
    # Test sample texts
    sample_texts = [
        "Allaahu Akbar, Allaahu Akbar, laa ilaaha illa Allah",
        "Cilmigu waa nuur, jaahilnimaduna waa mugdi",
        "Luuqadda Soomaaliga waa luuqad aad u qurux badan",
        "Macallinku waa qofka dhisa mustaqbalka ardayda",
        "Dadka Soomaaliyeed waxay leeyihiin dhaqan taariikh dheer leh"
    ]
    
    try:
        # Test collection
        result = data_collector.collect_from_text_sources(sample_texts)
        
        print(f"✅ Collection Results:")
        print(f"   Total collected: {result['total_collected']}")
        print(f"   High quality: {result['high_quality_count']}")
        print(f"   Average quality: {result['average_quality']:.1f}%")
        
        return result['total_collected'] > 0
        
    except Exception as e:
        print(f"❌ Collection error: {e}")
        return False

def test_database_integration():
    """Test database integration"""
    print("\n🧪 Testing Database Integration...")
    
    try:
        # Initialize database
        init_database()
        
        # Build dataset
        sentences = build_enterprise_dataset()
        
        # Save to database
        saved_count = save_to_database(sentences)
        
        # Test database queries
        conn = sqlite3.connect('somali_dataset.db')
        cursor = conn.cursor()
        
        # Count total sentences
        cursor.execute("SELECT COUNT(*) FROM somali_sentences")
        total = cursor.fetchone()[0]
        
        # Average quality
        cursor.execute("SELECT AVG(quality_score) FROM somali_sentences")
        avg_quality = cursor.fetchone()[0] or 0
        
        # High quality count
        cursor.execute("SELECT COUNT(*) FROM somali_sentences WHERE quality_score >= 90")
        high_quality = cursor.fetchone()[0]
        
        conn.close()
        
        print(f"✅ Database Results:")
        print(f"   Total sentences: {total}")
        print(f"   Average quality: {avg_quality:.1f}%")
        print(f"   High quality (≥90%): {high_quality}")
        
        return total >= 1000  # Pass if we have at least 1000 sentences
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def test_enterprise_api_simulation():
    """Simulate enterprise API calls"""
    print("\n🧪 Testing Enterprise API Simulation...")
    
    # Simulate enterprise customer requests
    enterprise_requests = [
        {
            "customer": "Google AI",
            "text": "Dhaqanka Soomaaliyeed waa mid taariikh dheer leh oo ku salaysan hiddo iyo dhaqan",
            "expected_quality": 85
        },
        {
            "customer": "Microsoft Translator",
            "text": "Waxbarashada caruurta waa lagama maarmaan u mustaqbalka bulshada",
            "expected_quality": 80
        },
        {
            "customer": "UN Somalia",
            "text": "Nabadda iyo horumarinta waa ujeedooyinka ugu muhiimsan ee bulshada",
            "expected_quality": 85
        },
        {
            "customer": "BBC Somali",
            "text": "Wararka maanta waxaa ka mid ah horumarinta dhaqaalaha dalka",
            "expected_quality": 80
        }
    ]
    
    success_count = 0
    
    for request in enterprise_requests:
        try:
            analysis = nlp_engine.analyze_text_enterprise(request["text"])
            overall_score = analysis['enterprise_metrics']['overall_enterprise_score']
            
            passed = overall_score >= request["expected_quality"]
            status = "✅ PASS" if passed else "❌ FAIL"
            
            print(f"{status} {request['customer']}: {overall_score:.1f}% (expected: {request['expected_quality']}%)")
            
            if passed:
                success_count += 1
                
        except Exception as e:
            print(f"❌ ERROR {request['customer']}: {e}")
    
    success_rate = (success_count / len(enterprise_requests)) * 100
    print(f"\n📊 Enterprise API Success Rate: {success_rate:.1f}%")
    
    return success_rate >= 75  # Pass if 75% or more requests succeed

def run_full_test_suite():
    """Run complete test suite"""
    print("🚀 Running Complete Enterprise System Test Suite...")
    print("=" * 60)
    
    tests = [
        ("NLP Engine", test_nlp_engine),
        ("Data Collection", test_data_collection),
        ("Database Integration", test_database_integration),
        ("Enterprise API Simulation", test_enterprise_api_simulation)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name} Test...")
        print("-" * 40)
        
        try:
            result = test_func()
            results.append((test_name, result))
            
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"\n{status}: {test_name}")
            
        except Exception as e:
            print(f"\n❌ ERROR in {test_name}: {e}")
            results.append((test_name, False))
    
    # Final summary
    print("\n" + "=" * 60)
    print("🎯 FINAL TEST RESULTS:")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    success_rate = (passed / total) * 100
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n📊 Overall Success Rate: {success_rate:.1f}% ({passed}/{total} tests passed)")
    
    if success_rate >= 75:
        print("\n🎉 ENTERPRISE SYSTEM READY!")
        print("💰 Your system is ready for $2,999+ enterprise customers!")
        print("🚀 Deploy to production and start sales immediately!")
    else:
        print("\n⚠️  SYSTEM NEEDS IMPROVEMENT")
        print("🔧 Fix failing tests before enterprise deployment")
    
    return success_rate >= 75

if __name__ == "__main__":
    # Run the complete test suite
    success = run_full_test_suite()
    
    if success:
        print("\n🎯 NEXT STEPS:")
        print("1. Deploy to production")
        print("2. Start enterprise sales")
        print("3. Contact Google, Microsoft, UN")
        print("4. Set up payment processing")
        print("5. Scale to $1M+ ARR")
    else:
        print("\n🔧 NEXT STEPS:")
        print("1. Fix failing tests")
        print("2. Improve data quality")
        print("3. Enhance NLP algorithms")
        print("4. Re-run test suite")
    
    sys.exit(0 if success else 1)