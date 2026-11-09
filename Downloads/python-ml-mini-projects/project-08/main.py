"""
Project 08: Web Scraping — Quote Collection
Scrape quotes and authors from quotes.toscrape.com (first 2 pages).
"""

import csv
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://quotes.toscrape.com/page/{page}/"
HEADERS = {"User-Agent": "python-ml-mini-projects/1.0 (educational)"}


def scrape_page(page_num):
    """Return list of (quote, author, tags) tuples from one page."""
    url = BASE_URL.format(page=page_num)
    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    quotes = []

    for item in soup.select("div.quote"):
        text = item.select_one("span.text").get_text(strip=True)
        author = item.select_one("small.author").get_text(strip=True)
        tags = ", ".join(t.get_text(strip=True) for t in item.select("a.tag"))
        quotes.append((text, author, tags))

    return quotes


def main():
    all_quotes = []
    for page in (1, 2):
        quotes = scrape_page(page)
        all_quotes.extend(quotes)
        print(f"Page {page}: scraped {len(quotes)} quotes")

    # Save to CSV
    output = Path("quotes.csv")
    with output.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["quote", "author", "tags"])
        writer.writerows(all_quotes)

    print(f"\nWeb Scraping — quotes.toscrape.com")
    print("-" * 38)
    print(f"Total quotes saved: {len(all_quotes)} → {output.resolve()}")
    print("\nSample quotes:")
    for text, author, tags in all_quotes[:3]:
        short = text[:70] + "..." if len(text) > 70 else text
        print(f'  "{short}" — {author} [{tags}]')


if __name__ == "__main__":
    main()
