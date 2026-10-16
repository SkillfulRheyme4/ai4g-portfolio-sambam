# LogisticsPulse
### Continuous Infrastructure Sentiment Radar for Freight & Postal Supply Chains
**Alex Wrobel, Sam Kempers**

---

## Overview & Assignment Alignment

* **Assigned SDG:** SDG 9 — Industry, Innovation, and Infrastructure (Target 9.1: Resilient Infrastructure)
* **Domain:** National supply chain, parcel logistics, and postal sorting networks (`r/UPSers`, `r/Fedexers`, `r/USPS`)
* **AI Tool (K1):** `cardiffnlp/twitter-roberta-base-sentiment-latest` via local Hugging Face `transformers.pipeline`
* **Architecture Style:** Autonomous background ingestion and monitoring radar
* **Pipeline Status (K3):** 51.5 hours continuous uptime, 542 real live items collected, stored in SQL

---

## Problem Definition

* **The Failure:** Automated parcel sorting hubs and ground fleets suffer mechanical failures, scanner crashes, and yard gridlock.
* **The Gap:** Central telemetry (SCADA, automated scan logs) has a 2- to 4-hour delay before surfacing localized facility bottlenecks.
* **The Scale:** Over 60 million packages process daily across US logistics networks; unscheduled hub downtime costs thousands of dollars per minute in cascade delays and missed delivery SLAs.
* **The Signal:** Frontline sorting workers and delivery drivers post about equipment breakdowns on Reddit hours before internal systems register the issue.
* **Evidence:** Documented by Bureau of Transportation Statistics dwell-time data and Council of Supply Chain Management Professionals (CSCMP) logistics reports.

---

## Target User & Operational Scope

| Primary User | Concrete Decisions Enabled | Who Is NOT the User |
| :--- | :--- | :--- |
| **Regional Logistics Operations Dispatcher / Hub Site Reliability Coordinator**<br><br>Managing multi-facility parcel intake, trailer dispatch schedules, and contracted delivery windows | • **Dynamic trailer rerouting:** Divert incoming line-haul trucks away from a jammed depot before yard access blocks completely.<br><br>• **Rapid maintenance triage:** Dispatch on-call facility mechanics to specific conveyor spurs before morning sorting shifts end. | **Retail end-consumers** tracking individual packages; **HR** conducting personnel management.<br><br>**Explicitly Excluded Groups:**<br>• Non-English speaking couriers and sorters<br>• Offline delivery drivers on rural routes with no cellular connectivity<br>• Contracted gig-economy drivers and older employees not active on social forums |

---

## System Architecture (Rebuildable Pipeline)

$$\text{Stream Ingestion} \longrightarrow \text{Preprocessing \& Sanitization} \longrightarrow \text{Transformer Inference} \longrightarrow \text{Persistent Storage} \longrightarrow \text{Operations View}$$

1. **Stream Ingestion**
   * Listen to `r/UPSers` + `r/Fedexers` + `r/USPS` live comment and submission streams.
   * Operates continuously in the background without user intervention.

2. **Preprocessing & Sanitization**
   * Strips URLs, markdown syntax, and image/sticker tags.
   * Drops low-information noise (<15 characters).

3. **Transformer Inference**
   * **Model:** `cardiffnlp/twitter-roberta-base-sentiment-latest`
   * Pre-trained on 124M social media posts.
   * Outputs 3 classes (*negative, neutral, positive*) with confidence scores.

4. **Persistent Storage**
   * Stored in SQLite with schema: `(id, timestamp, subreddit, text, sentiment, confidence)`.

5. **Operations View**
   * Dashboard built with Streamlit; visualizes rolling hourly sentiment and raw post volume via Plotly.
   * Computes Net Sentiment.
   * Triggers an automated **RISK** status when:
     $$\text{Net Sentiment} < -0.40 \quad \text{and} \quad \text{Hourly Volume} > 5$$

---

## Model Validation & Comparison

* **Validation Set:** 50 hand-labeled items taken directly from the live Reddit stream.

### Benchmark Comparison

| Model | Accuracy | Macro F1 | Notes |
| :--- | :--- | :--- | :--- |
| **CardiffNLP RoBERTa** *(Selected)* | **82.0%** (41/50) | **0.804** | Reliably separates neutral operations talk from genuine negative disruption. |
| **DistilBERT-SST-2** *(Baseline)* | **64.0%** (32/50) | **0.588** | Strictly binary (positive/negative); cannot represent neutral text. Misclassified 100% of routine shift questions and announcements. |
| **VADER** *(Lexical Baseline)* | **56.0%** (28/50) | **0.531** | Flagged standard operational terms ("heavy", "overtime", "delay") as negative, even in routine scheduling contexts. |

> **Conclusion:** CardiffNLP RoBERTa’s native 3-class detection reliably separates neutral operations talk from genuine negative disruption.

---

## Error Analysis & Key Model Failure

### Failure 1: Workplace Sarcasm / Irony
* **Text:** *"Management gave us lukewarm 8oz water bottles in a 105-degree hub today. True heroes!"*
* **Ground Truth:** Negative | **RoBERTa Prediction:** Positive (0.89 confidence)
* **Root Cause:** Attention heads weighted heavily on "heroes" and "true", missing the sarcastic mismatch with "105-degree hub".

### Failure 2: Specialized Contractual Jargon
* **Text:** *"Filed a 9.5 grievance because dispatch cut my route bid."*
* **Ground Truth:** Negative | **RoBERTa Prediction:** Neutral (0.74 confidence)
* **Root Cause:** "9.5" refers to a union overtime clause not found in general pre-training data.

### Failure 3: Mixed-Valence Sentences
* **Text:** *"The primary sorting line jammed twice, but our unloader crew cleared the entire backlog before cutoff."*
* **Ground Truth:** Positive/Relieved | **RoBERTa Prediction:** Negative (0.68 confidence)
* **Root Cause:** High volume of negative words ("jammed", "backlog") overpowered the positive resolution.

---

## Prototype & Incident Demonstration

* **Dataset Scale:** 542 verified records collected over 51.5 hours of uninterrupted ingestion.
* **Normal Operating Baseline:** Net sentiment hovers between -0.10 and +0.15; volume runs at 3–5 posts/hour.
* **Incident Detection:** We did not detect any incidents in the timespan.

---

## Ethical Reasoning & Governance Safeguards

### Venting Bias vs. True Outages
* **Risk:** Posts lean negative by default; workers rarely post about uneventful shifts.
* **Mitigation:** We measure relative deviation from the running baseline, requiring both a drop below $-0.40$ and a volume surge ($>5\text{ items/hour}$) to trigger an alert.

### Worker Privacy & Surveillance Protection
* **Risk:** Risk of management targeting individual vocal employees.
* **Mitigation:** The database stores only the message text, timestamp, and subreddit. Usernames, user IDs, and profile links are intentionally discarded.

### Decision Limits (Human-in-the-Loop)
* The tool serves strictly as an operational warning radar.
* Explicitly prohibited from triggering automated worker discipline, route cutbacks, or HR reviews.
