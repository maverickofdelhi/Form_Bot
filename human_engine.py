import random
from faker import Faker

class Persona:
    def __init__(self, archetype=None):
        fake = Faker()
        self.name = fake.name()
        self.gender = random.choice(["Male", "Female"])
        
        # Define archetypes
        archetypes = {
            "The Deal Hunter": {
                "age_range": (18, 50),
                "lean": "price-sensitive",
                "style": "Always mentions discounts and value for money.",
                "background": "Expert at finding coupons and wait for sales.",
                "occupations": ["Student", "Freelancer", "Home Maker"]
            },
            "The Quality Conscious": {
                "age_range": (25, 60),
                "lean": "premium-oriented",
                "style": "Formal, asks about durability and brand reputation.",
                "background": "Willing to pay more for long-lasting products.",
                "occupations": ["Doctor", "Architect", "Executive"]
            },
            "The Convenience Seeker": {
                "age_range": (20, 55),
                "lean": "efficiency-first",
                "style": "Brief, emphasizes speed and ease of use.",
                "background": "Puts a high price on their time. Loves fast delivery.",
                "occupations": ["Developer", "Single Parent", "Truck Driver"]
            },
            "The Impulse Buyer": {
                "age_range": (18, 35),
                "lean": "emotionally-driven",
                "style": "Spontaneous, excited, uses emoji-like descriptions (using text).",
                "background": "Buys what looks good in the moment.",
                "occupations": ["Student", "Designer", "Social Media Manager"]
            },
            "The Traditionalist": {
                "age_range": (45, 80),
                "lean": "offline-preference",
                "style": "Polite, skeptical of digital-only trends, values physical touch.",
                "background": "Grew up shopping in brick-and-mortar stores.",
                "occupations": ["Retired", "Teacher", "Librarian"]
            }
        }

        self.type = archetype or random.choice(list(archetypes.keys()))
        data = archetypes[self.type]
        self.age = random.randint(*data["age_range"])
        self.occupation = random.choice(data["occupations"])
        self.background = data["background"]
        self.opinion_lean = data["lean"]
        self.style = data["style"]
        
        # BNPL Specific Traits
        self.financial_status = "Stable" if self.type in ["The Professional", "The Senior"] else "Tight" if self.type == "The Minimalist" else "Variable"
        self.risk_appetite = "Low" if self.type in ["The Skeptic", "The Senior"] else "High" if self.type == "The Enthusiast" else "Moderate"

    def __str__(self):
        return f"[{self.type}] {self.name} ({self.gender}), {self.age}, {self.occupation}. Style: {self.style}"

class HumanEngine:
    def __init__(self):
        self.current_persona = Persona()
        self.faker = Faker()
        
        # Response Bank mapping keywords to persona-types to responses
        self.response_bank = {
            "gender": {
                "Male": ["Male", "Man", "M"],
                "Female": ["Female", "Woman", "W"]
            },
            "satisfaction": {
                "The Enthusiast": ["Extremely satisfied", "5", "Very happy with the service!"],
                "The Skeptic": ["Neutral", "3", "It was okay, could be better."],
                "The Professional": ["Satisfied", "4", "Met expectations."],
                "The Minimalist": ["Good", "4", "Fine."],
                "The Senior": ["Very satisfied", "5", "Wonderful service, thank you."]
            },
            "reason": {
                "The Enthusiast": ["I've always wanted to try this and I'm so glad I did!", "Recommendation from a friend!", "Best decision ever!"],
                "The Skeptic": ["Need-based.", "Looking for a reliable solution.", "Comparing options."],
                "The Professional": ["For professional development.", "Process optimization.", "Streamlining workflow."],
                "The Minimalist": ["Need it.", "Tool for work.", "Utility."],
                "The Senior": ["Taking your advice.", "Searching for good quality.", "Supportive of the brand."]
            },
            "feedback": {
                "The Enthusiast": ["Keep up the great work! Everything is amazing!", "I love the user interface, it's so vibrant!", "Five stars!"],
                "The Skeptic": ["The loading speed could be improved.", "UI is a bit cluttered.", "Make it more intuitive."],
                "The Professional": ["Integration with existing tools would be beneficial.", "Stable and reliable.", "A bit more documentation needed."],
                "The Minimalist": ["N/A", "None.", "Good."],
                "The Senior": ["A very pleasant experience indeed.", "Thank you for the help.", "Very respectful staff."]
            },
            # BNPL / MRA Specifics
            "education": ["High school or less", "Bachelor's degree", "Master's degree", "Doctoral degree"],
            "employment": ["Government Service", "Private Service", "Home Maker", "Student", "Entrepreneur"],
            "income": ["Below ₹3 Lakh", "₹3,00,001 – 6 Lakh", "₹6,00,001 – 10 Lakh", "₹10,00,001 – 15 Lakh", "₹15,00,001 – 25 Lakh", "Above ₹25 Lakh"],
            "bnpl_reason": ["Could not afford full payment", "Easy and quick approval", "No interest offer", "Recommended by others", "Other"],
            "bnpl_impact": {
                "The Enthusiast": "5",
                "The Skeptic": "1",
                "The Professional": "4",
                "The Minimalist": "2",
                "The Senior": "3"
            },
            "bnpl_awareness": {
                "The Enthusiast": "4",
                "The Skeptic": "5",
                "The Professional": "5",
                "The Minimalist": "2",
                "The Senior": "3"
            },
            "bnpl_stress": {
                "The Deal Hunter": "2",
                "The Quality Conscious": "1",
                "The Convenience Seeker": "3",
                "The Impulse Buyer": "5",
                "The Traditionalist": "4"
            },
            "frequency": {
                "The Deal Hunter": ["Monthly", "Weekly"],
                "The Quality Conscious": ["Once every 2-3 months", "Monthly"],
                "The Convenience Seeker": ["Weekly", "Monthly"],
                "The Impulse Buyer": ["Weekly"],
                "The Traditionalist": ["Rarely", "Once every 2-3 months"]
            },
            "preferences": {
                "The Deal Hunter": ["Price", "Discounts"],
                "The Quality Conscious": ["Product Quality", "Brand Reputation"],
                "The Convenience Seeker": ["Convenience", "Delivery Speed"],
                "The Impulse Buyer": ["Product Variety", "Convenience"],
                "The Traditionalist": ["Product Quality", "Brand Reputation"]
            },
            "satisfaction_overall": {
                "The Deal Hunter": ["Online", "Both equally"],
                "The Quality Conscious": ["Offline", "Both equally"],
                "The Convenience Seeker": ["Online"],
                "The Impulse Buyer": ["Online"],
                "The Traditionalist": ["Offline"]
            },
            "future_intent": {
                "The Deal Hunter": ["Yes", "Maybe"],
                "The Quality Conscious": ["Maybe"],
                "The Convenience Seeker": ["Yes"],
                "The Impulse Buyer": ["Yes"],
                "The Traditionalist": ["No", "Maybe"]
            },
            "matters_most": {
                "The Deal Hunter": ["Price", "Savings", "Value"],
                "The Quality Conscious": ["Quality", "Durability", "Trust"],
                "The Convenience Seeker": ["Speed", "Ease", "Time"],
                "The Impulse Buyer": ["Style", "Newness", "Trend"],
                "The Traditionalist": ["Touch", "Honesty", "Service"]
            }
        }

    def set_persona(self, persona=None):
        self.current_persona = persona or Persona()
        print(f"Switched to {self.current_persona}")

    def check_ollama(self):
        # We don't need Ollama anymore, so we return True to signal "Ready"
        return True

    def _match_category(self, text):
        """Robust keyword matching to find the question category."""
        text = text.lower()
        if any(kw in text for kw in ["age", "old are you"]): return "age"
        if any(kw in text for kw in ["gender", "sex", "identify as"]): return "gender"
        if any(kw in text for kw in ["education", "degree", "qualification", "study"]): return "education"
        if any(kw in text for kw in ["employment", "status", "work", "job", "occupat"]): return "employment"
        if any(kw in text for kw in ["income", "earn", "salary", "money"]): return "income"
        if any(kw in text for kw in ["reason", "choosing bnpl", "why use"]): return "bnpl_reason"
        if any(kw in text for kw in ["awareness", "late payment", "credit score", "terms and conditions", "hidden fee"]): return "bnpl_awareness"
        if any(kw in text for kw in ["stress", "spontaneously", "spend", "impulse", "worry"]): return "bnpl_stress"
        if any(kw in text for kw in ["control", "helped me", "smartphones", "upgrade", "delayed", "management"]): return "bnpl_impact"
        if any(kw in text for kw in ["satisfied", "satisfaction", "rating", "how happy", "quality"]): return "satisfaction"
        if any(kw in text for kw in ["feedback", "comment", "opinion", "improve", "suggestion"]): return "feedback"
        if any(kw in text for kw in ["how often", "frequency"]): return "frequency"
        if any(kw in text for kw in ["factor", "influence", "choose"]): return "preferences"
        if any(kw in text for kw in ["satisfaction", "overall happy"]): return "satisfaction_overall"
        if any(kw in text for kw in ["one word", "matters most"]): return "matters_most"
        if any(kw in text for kw in ["future", "increase", "see yourself"]): return "future_intent"
        return None

    def generate_response(self, question_text, context="", options=None):
        """
        Generates a human-like response by looking up the persona's style in the bank.
        """
        cat = self._match_category(question_text)
        
        # Handle Choice Questions (Options provided)
        if options:
            if cat == "gender":
                # Only pick Male or Female
                male_terms = ["male", "man", "^m$"]
                female_terms = ["female", "woman", "^f$"]
                
                selected_gender_terms = male_terms if self.current_persona.gender == "Male" else female_terms
                
                import re
                for opt in options:
                    for term in selected_gender_terms:
                        if re.search(term, opt.lower()):
                            return opt
                
                # Fallback to the first available of Male/Female if current persona gender not found
                for opt in options:
                    if any(re.search(t, opt.lower()) for t in male_terms + female_terms):
                        return opt
                        
                return random.choice(options)
            
            # Match persona style for Likert scales
            if cat in ["satisfaction", "bnpl_impact", "bnpl_awareness", "bnpl_stress"]:
                target_score = self.response_bank.get(cat, {}).get(self.current_persona.type, "3")
                # Try to find the number in options
                for opt in options:
                    if str(target_score) in opt:
                        return opt
                return random.choice(options)
            
            # Map demographic selections
            if cat == "age":
                if "18" in options[0]: # Range check
                    if self.current_persona.age < 25: return options[0]
                    if self.current_persona.age < 35: return options[1]
                    if self.current_persona.age < 45: return options[2]
                    if self.current_persona.age < 55: return options[3]
                    return options[4]
                else: # Numeric fallback
                    return str(self.current_persona.age)
            
            if cat == "income":
                if self.financial_status == "Stable": return options[4] if random.random() > 0.5 else options[5]
                if self.financial_status == "Tight": return options[0] if random.random() > 0.5 else options[1]
                return random.choice(options[:3])

            if cat == "bnpl_reason":
                if self.current_persona.type == "The Enthusiast": return "No interest offer"
                if self.current_persona.type == "The Minimalist": return "Easy and quick approval"
                if self.current_persona.type == "The Skeptic": return "Recommended by others"
                return random.choice(options)

            # Default: Pick random
            return random.choice(options)

        # Handle Text Questions
        if cat and cat in self.response_bank:
            responses = self.response_bank[cat].get(self.current_persona.type, ["Yes.", "Good."])
            return random.choice(responses)

        # Final Fallback: use Faker but with persona style
        sentence = self.faker.sentence()
        if self.current_persona.type == "The Minimalist":
            return sentence.split()[0] + "."
        if self.current_persona.type == "The Enthusiast":
            return sentence.replace(".", "!") + " Love it!"
        if self.current_persona.type == "The Senior":
            return "In my opinion, " + sentence.lower()
        
        return sentence

if __name__ == "__main__":
    # Quick Test
    engine = HumanEngine()
    for _ in range(3):
        engine.set_persona()
        print(f"Choice Test (Rating): {engine.generate_response('How satisfied are you?', options=['1', '2', '3', '4', '5'])}")
        print(f"Text Test (Feedback): {engine.generate_response('Any feedback for us?')}")
        print("-" * 20)
