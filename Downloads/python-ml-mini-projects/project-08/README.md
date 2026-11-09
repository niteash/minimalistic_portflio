## Quote Web Scraper

### Problem Statement
Collect inspirational quotes, authors, and tags from a public website and save them to a CSV file.

### Dataset
- **Source:** [quotes.toscrape.com](https://quotes.toscrape.com) (pages 1–2)
- **Output:** `quotes.csv` with columns quote, author, tags

### Approach
1. Fetch each page with `requests` and a polite User-Agent header
2. Parse HTML with BeautifulSoup (`div.quote` elements)
3. Extract quote text, author name, and tag list
4. Write all records to CSV

### Result
Typically **20 quotes** scraped across 2 pages, saved to `quotes.csv`. Console shows a sample of 3 quotes.

### How to Run
```bash
cd project-08
pip install -r requirements.txt
python main.py
```

Requires an internet connection.
