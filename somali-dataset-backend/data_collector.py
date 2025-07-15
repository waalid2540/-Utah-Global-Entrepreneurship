#!/usr/bin/env python3
"""
Somali Dataset Collection Script
Automatically adds high-quality Somali sentences to the database
"""

import requests
import json
from datetime import datetime

# Sample high-quality Somali sentences with translations
SAMPLE_SOMALI_DATA = [
    {
        "text": "Bismillahi Rahmaani Raheem",
        "translation": "In the name of Allah, the Most Gracious, the Most Merciful",
        "source": "Quran",
        "metadata": {"category": "religious", "verified": True}
    },
    {
        "text": "Waxaan ahay arday Soomaali ah oo wax ka baranaya",
        "translation": "I am a Somali student who is learning",
        "source": "educational",
        "metadata": {"category": "education", "level": "beginner"}
    },
    {
        "text": "Dalka Soomaaliya waa dal qurux badan oo ku yaal Bariga Afrika",
        "translation": "Somalia is a beautiful country located in East Africa",
        "source": "geographic",
        "metadata": {"category": "geography", "region": "Horn of Africa"}
    },
    {
        "text": "Luuqadda Soomaaliga waa luqad aad u qurux badan",
        "translation": "The Somali language is a very beautiful language",
        "source": "linguistic",
        "metadata": {"category": "language", "subject": "linguistics"}
    },
    {
        "text": "Salaada waa tiirka diinta Islaamka",
        "translation": "Prayer is the pillar of the Islamic religion",
        "source": "religious",
        "metadata": {"category": "religious", "topic": "five pillars"}
    },
    {
        "text": "Waxbarashadu waa iftiin, jaahilnimaduna waa mugdi",
        "translation": "Education is light, and ignorance is darkness",
        "source": "proverb",
        "metadata": {"category": "wisdom", "type": "proverb"}
    },
    {
        "text": "Dadka Soomaaliyeed waa dad cafimaad qaba oo jecel tahriibka",
        "translation": "The Somali people are healthy people who love hospitality",
        "source": "cultural",
        "metadata": {"category": "culture", "aspect": "hospitality"}
    },
    {
        "text": "Badda Cas iyo Badda Hindi ayaa Soomaaliya ku wareegsan",
        "translation": "The Red Sea and Indian Ocean surround Somalia",
        "source": "geographic",
        "metadata": {"category": "geography", "feature": "water bodies"}
    },
    {
        "text": "Caano geel ayaa cunto aasaasi ah oo dadka reer miyi cunaan",
        "translation": "Camel milk is a staple food that nomadic people consume",
        "source": "cultural",
        "metadata": {"category": "culture", "aspect": "food"}
    },
    {
        "text": "Gabayga Soomaaliyeed waa mid caan ah oo dunida lagu yaqaan",
        "translation": "Somali poetry is famous and known throughout the world",
        "source": "literary",
        "metadata": {"category": "literature", "type": "poetry"}
    },
    {
        "text": "Qofka wax barata waa qofka guulaysta noloshiisa",
        "translation": "The person who learns is the person who succeeds in life",
        "source": "educational",
        "metadata": {"category": "education", "theme": "success"}
    },
    {
        "text": "Dhulka Soomaaliyeed waa mid hodanka ah xoolaha",
        "translation": "The Somali land is rich in livestock",
        "source": "economic",
        "metadata": {"category": "economics", "sector": "agriculture"}
    },
    {
        "text": "Geeska Afrika waxaa ku nool dad fara badan",
        "translation": "Many people live in the Horn of Africa",
        "source": "demographic",
        "metadata": {"category": "demographics", "region": "Horn of Africa"}
    },
    {
        "text": "Waqtiga waa lacag, marka ha luminin",
        "translation": "Time is money, so don't waste it",
        "source": "proverb",
        "metadata": {"category": "wisdom", "theme": "time management"}
    },
    {
        "text": "Illaahay wuxuu jecelyhay dadka camal wanaagsan sameeya",
        "translation": "Allah loves people who do good deeds",
        "source": "religious",
        "metadata": {"category": "religious", "theme": "good deeds"}
    },
    {
        "text": "Dugsiyada Soomaaliya waxay u baahan yihiin horumar",
        "translation": "Schools in Somalia need development",
        "source": "educational",
        "metadata": {"category": "education", "issue": "development"}
    },
    {
        "text": "Xeebyaha Soomaaliya waa kuwo dhaadheer oo qurux badan",
        "translation": "Somalia's beaches are long and beautiful",
        "source": "geographic",
        "metadata": {"category": "geography", "feature": "coastline"}
    },
    {
        "text": "Saaxiibku waa mid lagu tiirsado wakhtiga dhibaatada",
        "translation": "A friend is someone to rely on during times of trouble",
        "source": "social",
        "metadata": {"category": "relationships", "type": "friendship"}
    },
    {
        "text": "Dhaqanka Soomaaliyeed waa mid taariikh dheer leh",
        "translation": "Somali culture has a long history",
        "source": "cultural",
        "metadata": {"category": "culture", "aspect": "history"}
    },
    {
        "text": "Kalluunka baddu waa maal weyn oo aan la isticmaalin",
        "translation": "Ocean fish are a great resource that is not being utilized",
        "source": "economic",
        "metadata": {"category": "economics", "sector": "fisheries"}
    },
    {
        "text": "Haweenka Soomaaliyeed waxay ka qaybqaataan dhisme bulshada",
        "translation": "Somali women participate in building society",
        "source": "social",
        "metadata": {"category": "gender", "role": "society building"}
    },
    {
        "text": "Dhiiga Soomaaliyeed waa mid isku midaysan",
        "translation": "Somali blood is united",
        "source": "cultural",
        "metadata": {"category": "unity", "theme": "brotherhood"}
    },
    {
        "text": "Barashada luuqadaha kale waa muhiim u ah mustaqbalka",
        "translation": "Learning other languages is important for the future",
        "source": "educational",
        "metadata": {"category": "education", "subject": "multilingualism"}
    },
    {
        "text": "Dhirtii qoraysta ah ayaa u baahan biyo iyo daryeel",
        "translation": "Green plants need water and care",
        "source": "environmental",
        "metadata": {"category": "environment", "topic": "plant care"}
    },
    {
        "text": "Caruurta ayaa ah mustaqbalka ummadda Soomaaliyeed",
        "translation": "Children are the future of the Somali nation",
        "source": "social",
        "metadata": {"category": "future", "demographic": "children"}
    }
]

def add_sentence_to_api(sentence_data, api_url="http://localhost:8000"):
    """Add a sentence to the API"""
    try:
        response = requests.post(
            f"{api_url}/sentences",
            json=sentence_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Added: '{sentence_data['text'][:50]}...' (Quality: {result['quality_score']:.1f}%)")
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def populate_database():
    """Populate the database with sample Somali data"""
    print("🚀 Starting Somali Dataset Population...")
    print(f"📊 Adding {len(SAMPLE_SOMALI_DATA)} high-quality sentences...")
    
    success_count = 0
    
    for i, sentence in enumerate(SAMPLE_SOMALI_DATA, 1):
        print(f"\n[{i}/{len(SAMPLE_SOMALI_DATA)}] Processing...")
        
        if add_sentence_to_api(sentence):
            success_count += 1
    
    print(f"\n🎉 Dataset population complete!")
    print(f"✅ Successfully added: {success_count}/{len(SAMPLE_SOMALI_DATA)} sentences")
    
    # Get final stats
    try:
        response = requests.get("http://localhost:8000/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"\n📈 Final Dataset Stats:")
            print(f"   Total sentences: {stats['total_sentences']}")
            print(f"   Average quality: {stats['average_quality']:.1f}%")
            print(f"   Dialects: {stats['dialects']}")
        
    except Exception as e:
        print(f"❌ Could not fetch final stats: {e}")

if __name__ == "__main__":
    populate_database()