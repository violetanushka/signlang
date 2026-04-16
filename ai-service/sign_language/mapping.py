# Mappings for Sign -> Meaning -> Animation

SIGN_MAP = {
    # Alphabets
    "A": {"type": "alphabet", "display": "A", "animation": "A.gif"},
    "B": {"type": "alphabet", "display": "B", "animation": "B.gif"},
    "C": {"type": "alphabet", "display": "C", "animation": "C.gif"},
    
    # Words
    "HELLO": {"type": "word", "display": "Hello", "animation": "hello.gif"},
    "THANK_YOU": {"type": "word", "display": "Thank You", "animation": "thankyou.gif"},
    "THANK YOU": {"type": "word", "display": "Thank You", "animation": "thankyou.gif"},
    
    # Fallback/System
    "nothing": {"type": "system", "display": "Nothing", "animation": None},
}

def get_mapping(sign: str) -> dict:
    """
    Returns the mapping dictionary for a given sign, 
    matching exactly or returning a fallback dict if unknown.
    """
    if not sign:
        return SIGN_MAP["nothing"]
        
    key = sign.upper().replace(" ", "_") if sign.upper().replace(" ", "_") in SIGN_MAP else sign.upper()
    
    return SIGN_MAP.get(key, {
        "type": "alphabet" if len(key) == 1 else "word",
        "display": sign.capitalize() if len(sign) > 1 else sign.upper(),
        "animation": f"{sign.lower().replace(' ', '')}.gif"
    })
