import re
import nltk
from nltk.tokenize import word_tokenize

nltk.download('punkt')

# Emergency keywords for detecting urgency
URGENT_KEYWORDS = ['help', 'fire', 'emergency', 'accident', 'urgent', 'panic', 'danger']

# Intent keywords
INTENT_KEYWORDS = {
    'fire': ['fire', 'burning', 'flames', 'smoke'],
    'police': ['robbery', 'theft', 'violence', 'gunshot', 'police'],
    'medical': ['injury', 'sick', 'doctor', 'ambulance', 'medical', 'unconscious'],
    'weather': ['rain', 'storm', 'wind', 'forecast', 'weather']
}

# Example cities
CITIES = ['malabe', 'colombo', 'kandy', 'galle', 'jaffna', 'negombo']

def detect_urgency(message):
    tokens = word_tokenize(message.lower())
    return any(word in tokens for word in URGENT_KEYWORDS)

def classify_intent(message):
    tokens = word_tokenize(message.lower())
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(word in tokens for word in keywords):
            return intent
    return "general"

def extract_city(message):
    for city in CITIES:
        if city in message.lower():
            return city.capitalize()
    return None
