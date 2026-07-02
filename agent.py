import os
import time
import asyncio
import feedparser
from google import genai
from google.genai import errors
import edge_tts

# 1. Fetch Tech Headlines via RSS
def get_headlines():
    print("🔄 Fetching latest tech news...")
    # Hacker News RSS feed as a highly reliable tech source
    feed = feedparser.parse("https://news.ycombinator.com/rss")
    headlines = [item.title for item in feed.entries[:15]]
    return "\n".join(headlines)

# 2. Generate a Conversational Script using Free Gemini API with Retry Logic
def generate_script(raw_news):
    print("🧠 Generating script with Gemini...")
    # The client automatically picks up the GEMINI_API_KEY environment variable
    client = genai.Client()
    
    prompt = f"You are a professional daily tech news podcast host. Summarize these headlines into an engaging, cohesive 1-minute morning news update. Use clear transitions. Avoid all markdown formatting, bullet points, asterisks, or symbols, as this text will be read directly by a text-to-speech engine. Content:\n{raw_news}"
    
    # Retry loop (up to 3 attempts) to handle temporary 503/500 backend traffic spikes smoothly
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return response.text
        except errors.ServerError as e:
            # If it's a server error and we have attempts remaining, wait and try again
            if attempt < 2:
                print(f"⚠️ Gemini API reported a server issue ({e.code}). Retrying in 10 seconds... (Attempt {attempt + 1}/3)")
                time.sleep(10)
                continue
            # If all attempts fail, raise the original exception to notify the workflow
            raise e

# 3. Convert Text to Natural Speech
async def text_to_speech(text, output_file="morning_briefing.mp3"):
    print("🎙️ Synthesizing voice...")
    # Using 'en-US-AndrewNeural' for a crisp, professional male news voice
    communicate = edge_tts.Communicate(text, "en-US-AndrewNeural")
    await communicate.save(output_file)
    print(f"✅ Success! Your briefing is saved to {output_file}")

# Main pipeline execution
async def main():
    if not os.environ.get("GEMINI_API_KEY"):
        print("❌ Error: GEMINI_API_KEY environment variable not found.")
        return

    news_data = get_headlines()
    script = generate_script(news_data)
    await text_to_speech(script)

if __name__ == "__main__":
    asyncio.run(main())