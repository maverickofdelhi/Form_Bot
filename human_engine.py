import random
from faker import Faker

class Persona:
    def __init__(self, archetype=None):
        fake = Faker()
        self.name = fake.name()
        self.gender = random.choice(["Male", "Female"])
        
        # Define archetypes
        archetypes = {
            "The Enthusiast": {
                "age_range": (18, 30),
                "lean": "extremely positive",
                "style": "Excited, uses exclamation marks, very helpful.",
                "background": "Loves trying new things and sharing positive feedback.",
                "occupations": ["Student", "Marketing Assistant", "Content Creator"]
            },
            "The Skeptic": {
                "age_range": (35, 60),
                "lean": "critically objective",
                "style": "Cynical, brief, looks for flaws.",
                "background": "Value-driven, cautious about marketing claims.",
                "occupations": ["Auditor", "Engineer", "Security Consultant"]
            },
            "The Professional": {
                "age_range": (30, 50),
                "lean": "mostly neutral",
                "style": "Formal, concise, professional tone.",
                "background": "Efficiency-oriented, respects good systems.",
                "occupations": ["Manager", "IT Specialist", "Doctor"]
            },
            "The Minimalist": {
                "age_range": (20, 45),
                "lean": "brief",
                "style": "Uses 1-3 words total. Very fast.",
                "background": "Hates forms, just wants to get it over with.",
                "occupations": ["Designer", "Freelancer", "Artist"]
            },
            "The Senior": {
                "age_range": (60, 80),
                "lean": "mostly positive",
                "style": "Polite, slightly wordy, traditional.",
                "background": "Values respect and clear instructions.",
                "occupations": ["Retired Teacher", "Consultant", "Gardener"]
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
                "The Enthusiast": "2",
                "The Skeptic": "5",
                "The Professional": "2",
                "The Minimalist": "4",
                "The Senior": "2"
            }
        }

    def set_persona(self, persona=None):
        self.current_persona = persona or Persona()
        print(f"Switched to {self.current_persona}")

    def check_ollama(self):
        # We don't need Ollama anymore, so we return True to signal "Ready"
        return True

    def _match_category(self, text):
        """Simple keyword matching to find the question category."""
        text = text.lower()
        if any(kw in text for kw in ["age"]): return "age"
        if any(kw in text for kw in ["gender", "sex"]): return "gender"
        if any(kw in text for kw in ["education", "degree"]): return "education"
        if any(kw in text for kw in ["employment", "status"]): return "employment"
        if any(kw in text for kw in ["income"]): return "income"
        if any(kw in text for kw in ["reason", "choosing bnpl"]): return "bnpl_reason"
        if any(kw in text for kw in ["awareness", "late payment", "credit score", "terms and conditions"]): return "bnpl_awareness"
        if any(kw in text for kw in ["stress", "spontaneously", "spend"]): return "bnpl_stress"
        if any(kw in text for kw in ["control", "helped me", "smartphones", "upgrade", "delayed"]): return "bnpl_impact"
        if any(kw in text for kw in ["satisfied", "satisfaction", "rating", "how happy"]): return "satisfaction"
        if any(kw in text for kw in ["feedback", "comment", "opinion", "improve"]): return "feedback"
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
                if self.current_persona.age < 25: return options[0]
                if self.current_persona.age < 35: return options[1]
                if self.current_persona.age < 45: return options[2]
                if self.current_persona.age < 55: return options[3]
                return options[4]
            
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
