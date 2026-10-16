# Term 1 - Week 6: Language Models

---

## 1. Homework & workshop assignments -> [`homework/`](homework/)

**What was the assignment?**

**What did I hand in?**
_List the files, or link to them. Notebook exports, screenshots, scripts._

**What did I find difficult, and how did I solve it?**

### Checklist
- [ ] My workshop / homework files are in `homework/`
- [ ] Everything runs without errors, or I explained what does not and why

---


## 2. Hackathon prototype -> [`hackathon/`](hackathon/)

> Your tool and your SDG for this hackathon are announced at the **start of Friday's class**.
> Write them down here once you know them.

**Project title: LogisticsPulse**

**My pair partner: Alex Wrobel**

**Tool we had to use:**
A pre-trained Hugging Face sentiment transformer, run locally with the `transformers` library (no chat-model API). We used `cardiffnlp/twitter-roberta-base-sentiment-latest` (pre-trained on about 124M tweets, three labels: negative, neutral, positive), hooked to a real live data stream.

**SDG we had to address:**
SDG 9: Industry, Innovation and Infrastructure (target 9.1: reliable, resilient infrastructure). We focused on parcel logistics and postal sorting networks.

**What problem does it solve, and for whom?**
Our user is a **regional logistics operations dispatcher / hub site reliability coordinator** who manages parcel intake, trailer dispatch and delivery windows across several facilities. Sorting hubs suffer conveyor jams, scanner crashes and yard gridlock, but central telemetry can take 2 to 4 hours to show a local bottleneck. Frontline sorters and drivers often post about these breakdowns on Reddit much earlier. LogisticsPulse gives the dispatcher that early signal, so they can reroute incoming trucks away from a jammed depot or send an on-call mechanic before the shift ends. It is not meant for customers tracking a package, and not for HR.

**What did you build?**
A collector that runs unattended, listens to new posts and comments in `r/UPSers`, `r/Fedexers` and `r/USPS`, classifies each one as negative, neutral or positive, and stores only the text, time, subreddit and sentiment in SQLite. A Streamlit dashboard shows the hourly net sentiment (from -1 to +1) and post volume, switches to a **RISK** status when net sentiment drops below -0.40 with more than 5 posts in the hour, and lets the user filter the posts behind the chart by sentiment. It ran for 51.5 hours and collected 542 live items; on 50 hand-labelled items the model agreed with us 82% of the time, against 64% for DistilBERT-SST-2 and 56% for the VADER word list.

**Link to the live thing (if any):**
Code: https://github.com/alex24106429/hackathon-week6

**How do I run it?**
_Short instructions so someone else can start it._
1. `pip install -r requirements.txt` (plotly, streamlit, torch, transformers, praw)
2. Add your own Reddit API app credentials in `collector.py`.
3. `python collector.py` and leave it running; it fills `reddit.db`.
4. In a second terminal: `streamlit run dashboard.py` and open the page in your browser.

**Who did what?**
_Be honest about the split of work between you and your partner._
[TODO: fill in yourself, e.g. who wrote the collector, the dashboard, the 50-item test and the slides]

**Ethical reflection - what are the risks of your tool? Who could it harm?**
_Every hackathon requires this. One honest paragraph beats three vague ones._
The biggest risk is that a tool reading workers' posts becomes a surveillance tool: management could use it to find and punish vocal employees. We mitigate this by never storing usernames, user IDs or profile links, only the text, time, subreddit and sentiment, and by stating that the tool may never trigger discipline, route cuts or HR reviews; a human dispatcher always reads the posts and decides. A second risk is venting bias: people post mostly when things go wrong, so the stream leans negative and could cause false alarms. That is why an alert needs both a strong drop (below -0.40) and a volume surge (more than 5 posts an hour). The model also misreads sarcasm, union jargon and mixed sentences, and it only hears English-speaking workers who are active on Reddit, so offline rural drivers, gig drivers and older employees are invisible to it.

### Checklist
- [ ] Prototype code (or export / workflow file) is in `hackathon/`
- [ ] This week's slides are in `hackathon/`
- [ ] The prototype actually runs, and I wrote down how to run it
- [x] Ethical reflection written above


---

## 3. Presentation -> [`presentation/`](presentation/)

*Only fill this in for the week your group was selected to present. You need at least **one** of these across the whole term.*

- [ ] My group presented in this week
- [ ] Slides are in `presentation/`
- [ ] Proof of the live demo is in `presentation/` (recording, screenshots, or link)

**How did it go? What would I do differently next time?**

---

## 4. Reflection

**What is the most important thing I learned this week?**

**Where does this connect to "AI for Good"?**
_One concrete link to ethics, sustainability or social impact._
