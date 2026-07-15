import os
import time
import datetime
import asyncio
import feedparser
import requests
from google import genai
from google.genai import errors
import edge_tts

# 1. Fetch Tech Headlines via RSS
def get_headlines():
    print("🔄 Fetching latest tech news...")
    feed = feedparser.parse("https://news.ycombinator.com/rss")
    headlines = [item.title for item in feed.entries[:15]]
    return "\n".join(headlines)

# 2. Dynamic Burmese Date Generator (Converts to Burmese Script)
def get_burmese_date():
    now = datetime.datetime.now()
    months_burmese = {
        1: "ဇန်နဝါရီ", 2: "ဖေဖော်ဝါရီ", 3: "မတ်", 4: "ဧပြီ", 5: "မေ", 6: "ဇွန်",
        7: "ဇူလိုင်", 8: "ဩဂုတ်", 9: "စက်တင်ဘာ", 10: "အောက်တိုဘာ", 11: "နိုဝင်ဘာ", 12: "ဒီဇင်ဘာ"
    }
    days_burmese = {
        0: "တနင်္လာနေ့", 1: "အင်္ဂါနေ့", 2: "ဗုဒ္ဓဟူးနေ့", 3: "ကြာသပတေးနေ့", 4: "သောကြာနေ့", 5: "စနေနေ့", 6: "တနင်္ဂနွေနေ့"
    }
    
    # Translate numbers to Myanmar script so the TTS engine reads them natively (e.g., 2026 -> ၂၀၂၆)
    en_to_my = str.maketrans("0123456789", "၀၁၂၃၄၅၆၇၈၉")
    year_my = str(now.year).translate(en_to_my)
    day_my = str(now.day).translate(en_to_my)
    
    month_name = months_burmese[now.month]
    day_of_week = days_burmese[now.weekday()]
    
    # Double spaces act as crucial pause markers for the TTS engine
    # Adjust "မင်္ဂလာပါခင်ဗျာ" (Male) to "မင်္ဂလာပါရှင်" if you switch to a female voice.
    date_intro = f"မင်္ဂလာပါခင်ဗျာ။  ဒီကနေ့ {year_my} ခုနှစ်၊  {month_name}လ {day_my} ရက်၊  {day_of_week}  မနက်ခင်း  နည်းပညာသတင်းတွေကို  စတင်တင်ဆက်ပေးပါမယ်။  "
    return date_intro

# 3. Dynamic Burmese Reference Note (Outro)
def get_burmese_reference():
    return "  ယခုသတင်းတွေကိုတော့  ဟက်ကာနယူးစ် အာအက်စ်အက်စ် ဖိဒ် ကနေ  ကိုးကားစုစည်းတင်ဆက်ပေးခဲ့တာ  ဖြစ်ပါတယ်။  အားလုံးပဲ  သာယာအေးချမ်းတဲ့  နေ့ရက်လေး  ဖြစ်ပါစေခင်ဗျာ။"

# 4. Generate a Spaced, Transliterated script
def generate_script(raw_news):
    print("🧠 Generating highly-optimized Burmese script with Gemini...")
    client = genai.Client()
    
    prompt = (
        "You are a professional daily tech news podcast host speaking in Burmese (Myanmar language). "
        "Summarize these English headlines into an engaging, cohesive 1-minute morning news update. "
        "To make the voice text-to-speech engine sound realistic and highly natural, follow these structural formatting rules strictly: "
        "1. Write exclusively in natural, spoken Burmese language (Myanmar script). Use conversational sentence structures rather than formal, rigid book-style Burmese. "
        "2. Do NOT write any English letters or acronyms. If there are English terms (such as Apple, Google, Microsoft, OpenAI, Linux, Python, CPU), "
        "transliterate them phonetically in Burmese script so the voice engine can pronounce them seamlessly without failing. "
        "For example: write 'AI' as 'အေအိုင်', 'API' as 'အေပီအိုင်', 'Google' as 'ဂူဂဲလ်', 'Microsoft' as 'မိုက်ခရိုဆော့ဖ်', 'Linux' as 'လင်းနပ်စ်', 'Python' as 'ပိုင်သွန်'. "
        "3. Insert double spaces or natural punctuation marks ('၊' and '။') between clauses. This is crucial because Burmese script lacks word spaces; "
        "generous spacing tells the TTS engine where to pause and breathe, entirely removing the robotic, rushed tone. "
        "4. Do NOT include any intro (like dates) or outro (like references), as we will append those dynamically in Python. "
        "Do NOT output markdown, asterisks, or bullet points. Just output clean, readable, spaced conversational Burmese. "
        f"Content:\n{raw_news}"
    )
    
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return response.text
        except errors.ServerError as e:
            if attempt < 2:
                print(f"⚠️ Gemini API busy ({e.code}). Retrying in 10 seconds... ({attempt + 1}/3)")
                time.sleep(10)
                continue
            raise e

# 5. Optimized Speech Synthesis
async def text_to_speech(text, output_file="morning_briefing.mp3"):
    print("🎙️ Synthesizing voice (Optimized speed and pitch)...")
    
    # 'my-MM-ThihaNeural' is the best male Burmese voice. 
    # For a female host, swap it with 'my-MM-NilarNeural'.
    communicate = edge_tts.Communicate(text, "my-MM-ThihaNeural", rate="-12%", pitch="-2Hz")
    await communicate.save(output_file)
    print(f"✅ Success! Your briefing is saved to {output_file}")

# 6. Send the compiled audio directly to your Telegram Bot
def send_to_telegram(file_path="morning_briefing.mp3"):
    print("🚀 Uploading audio briefing to Telegram...")
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    
    if not bot_token or not chat_id:
        print("⚠️ Warning: Telegram tokens missing from environment. Skipping delivery.")
        return

    url = f"https://api.telegram.org/bot{bot_token}/sendAudio"
    payload = {"chat_id": chat_id, "caption": "🌅 သင်၏ မနက်ခင်း နည်းပညာ သတင်း အကျဉ်းချုပ် အဆင်သင့်ဖြစ်ပါပြီ!"}
    
    try:
        with open(file_path, "rb") as audio_file:
            files = {"audio": audio_file}
            response = requests.post(url, data=payload, files=files)
            
        if response.status_code == 200:
            print("📬 Audio successfully delivered to your Telegram chat thread!")
        else:
            print(f"❌ Telegram API Error ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"❌ Failed to connect to Telegram API: {e}")

# Main pipeline execution
async def main():
    if not os.environ.get("GEMINI_API_KEY"):
        print("❌ Error: GEMINI_API_KEY environment variable not found.")
        return

    # Gather source headlines
    news_data = get_headlines()
    
    # Generate localized script body
    script_body = generate_script(news_data)
    
    # Build dynamically localized intro and references
    date_intro = get_burmese_date()
    reference_outro = get_burmese_reference()
    
    # Merge intro + body + outro
    final_script = f"{date_intro}{script_body}{reference_outro}"
    
    # Print a console output for you to verify the dynamic spacing before synthesis
    print("\n--- FINAL SPOKEN SCRIPT PREVIEW ---")
    print(final_script)
    print("-----------------------------------\n")
    
    # Render and dispatch
    await text_to_speech(final_script)
    send_to_telegram()

if __name__ == "__main__":
    asyncio.run(main())