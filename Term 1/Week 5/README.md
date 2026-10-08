# Term 1 - Week 5: Machine Learning Basics

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

**Project title:** Who struggles to get by? Model Showdown

**My pair partner:** Yassir Balah

**Tool we had to use:** scikit-learn (KNN, logistic regression and a model of our own choice: a decision tree)

**SDG we had to address:** SDG 8 Decent Work and Economic Growth

**What problem does it solve, and for whom?**
Since 2021 a Dutch municipality must contact residents when a landlord, energy supplier, water company or health insurer reports payment arrears, but by then the debt already exists. Our user is the debt-support and early-detection team of a Dutch municipality. Our model predicts which residents find it (very) difficult to live on their household income, so the team can send them a voluntary offer of help *before* arrears appear.

**What did you build?**
A Jupyter notebook that takes the European Social Survey (Netherlands, 2008–2023, 13,890 people) from raw file to a fair comparison of three tuned classifiers against two baselines, with F2 as the main metric. We recommend logistic regression: it finds 2 out of 3 struggling people (recall 0.67, test F2 0.49) without using income, sex or country of birth. The last cell takes a made-up resident and returns a prediction and a probability.

**Link to the live thing (if any):**
[Open the notebook in Google Colab](https://colab.research.google.com/github/SkillfulRheyme4/ai4g-portfolio-sambam/blob/main/Term%201/Week%205/hackathon/model_showdown.ipynb) · slides: [`hackathon/presentation.pdf`](hackathon/presentation.pdf) · full write-up: [`hackathon/README.md`](hackathon/README.md)

**How do I run it?**
Click the Colab link above and choose **Runtime → Run all** (about 1–2 minutes, no installs needed). In Jupyter: open `hackathon/model_showdown.ipynb` and choose **Restart and Run All**; the data is in `hackathon/data/`.

**Who did what?**
Sam built the notebook step by step (problem framing, cleaning, split, pipeline, baseline, tuning of the three models, test evaluation, group check, recommendation and live prediction), put it on GitHub and made it run in Colab. Yassir checked the notebook against the assignment and completed the submission: the simple-rule baseline, the threshold, proxy, income and per-year checks, the README (dataset card, comparison table, ethical reflection, versions) and the slides. We both used an AI assistant (Claude) to explain the steps and to draft code and text.

**Ethical reflection - what are the risks of your tool? Who could it harm?**
The model makes predictions about people's livelihoods, from a survey that leaves out people in institutions, homeless people, asylum seekers and people who could not do the interview in Dutch, probably the people who struggle most. It misses most struggling retired people (recall 0.27) and many struggling working people (0.46), because rent, debts and health costs are not in the data, and it works worse in the most recent survey rounds (2020 and 2023: about 45% found), so it must be tested on recent local data before anyone uses it. We left sex, country of birth and income out of the model, but country of birth still partly hides in the other columns (ROC-AUC 0.68): people born outside NL get a letter more often (43% vs 27%), which can feel like being singled out, even though they also struggle three times as often and the model finds them better. A missed person gets no early help; a wrong letter can feel intrusive. We therefore chose F2 and a low threshold, checked the errors per group, and wrote a clear warning: only for a voluntary offer of help, next to payment-arrears signals, never for benefit cuts, fraud checks or sanctions. Full reflection in [`hackathon/README.md`](hackathon/README.md#ethical-reflection).

### Checklist
- [x] Prototype code (or export / workflow file) is in `hackathon/`
- [x] This week's slides are in `hackathon/`
- [x] The prototype actually runs, and I wrote down how to run it
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
