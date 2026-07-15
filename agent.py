import os
import time
import asyncio
import feedparser
import requests
from google import genai
from google.genai import errors
import edge_tts

# 1. Fetch Tech Headlines via RSS (Kept in English; Gemini will handle the translation)
def get_headlines():
    print("🔄 Fetching latest tech news...")
    feed = feedparser.parse("https://news.ycombinator.com/rss")
    headlines = [item.title for item in feed.entries[:15]]
    return "\n".join(headlines)

# 2. Generate a Conversational Script in Burmese
def generate_script(raw_news):
    print("🧠 Generating Burmese script with Gemini...")
    client = genai.Client()
    
    # Prompt updated to force conversational, spoken Burmese
    prompt = (
        "You are a professional daily tech news podcast host speaking in Burmese (Myanmar language). "
        "Summarize these English headlines into an engaging, cohesive 1-minute morning news update written entirely in natural, spoken Burmese. "
        "Translate English technical concepts into standard Burmese terms, or phonetically transliterate common terms (like AI, Google, Microsoft, software) "
        "so they flow naturally when read by a Burmese text-to-speech engine. "
        "Avoid all markdown formatting, bullet points, asterisks, or symbols. Output ONLY plain, spoken Burmese text. Content:\n"
        f"{raw_news}"
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

# 3. Convert Text to Natural Speech using a Burmese Voice
async def text_to_speech(text, output_file="morning_briefing.mp3"):
    print("🎙️ Synthesizing voice (Burmese)...")
    # Using 'my-MM-ThihaNeural' (Male). Swap with 'my-MM-NilarNeural' for Female.
    communicate = edge_tts.Communicate(text, "my-MM-ThihaNeural")
    await communicate.save(output_file)
    print(f"✅ Success! Your briefing is saved to {output_file}")

# 4. Send the compiled audio directly to Telegram with localized Burmese caption
def send_to_telegram(file_path="morning_briefing.mp3"):
    print("🚀 Uploading audio briefing to Telegram...")
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    
    if not bot_token or not chat_id:
        print("⚠️ Warning: Telegram tokens missing from environment. Skipping delivery.")
        return

    url = f"https://api.telegram.org/bot{bot_token}/sendAudio"
    # Localized caption
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

    news_data = get_headlines()
    script = generate_script(news_data)
    await text_to_speech(script)
    
    # Fire the uploader after the audio file is generated
    send_to_telegram()

if __name__ == "__main__":
    asyncio.run(main())