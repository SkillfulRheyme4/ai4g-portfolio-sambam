# Who struggles to get by? Model Showdown

**AI for Good · Hackathon 5 · SDG 8 Decent Work and Economic Growth**

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/SkillfulRheyme4/ai4g-portfolio-sambam/blob/main/Term%201/Week%205/hackathon/model_showdown.ipynb)

We predict which Dutch residents find it difficult to live on their household income, so that a municipality's debt-support team can offer help before debts build up. We compare three tuned scikit-learn classifiers (KNN, logistic regression and a decision tree) with two baselines: a model that always says "no", and a simple rule a caseworker could apply by hand.

**Recommendation:** logistic regression, but only for sending a voluntary offer of help, next to the existing payment-arrears signals. It finds 2 out of 3 struggling people, but 3 out of 4 letters go to people who manage fine.

**Slides:** [`presentation.pdf`](presentation.pdf)

---

## The problem

- **Outcome:** a person says it is "difficult" or "very difficult" to live on their present household income (ESS question `hincfel`).
- **Population and setting:** residents of the Netherlands aged 15 and over; the prediction is meant for one Dutch municipality.
- **How big is the problem?** In 2024, 551,000 people in the Netherlands lived in poverty and 1.1 million just above the poverty line; 35% of them say they have trouble making ends meet ([CBS, *Leven in armoede 2025*](https://longreads.cbs.nl/leven-in-armoede-2025/wat-is-de-financiele-situatie-bij-armoede/)). In our data, 10% of people struggle.
- **Why now:** since 2021 the *Wet gemeentelijke schuldhulpverlening* obliges municipalities to contact residents when a landlord, energy supplier, water company or health insurer reports payment arrears ([Rijksoverheid](https://www.rijksoverheid.nl/themas/recht-veiligheid-en-defensie/schulden/gemeenten-sneller-signaleren-van-schulden)). By then a debt already exists. Our question is whether simple facts about a household can point the team to people who struggle earlier.
- **Does the data match the user's population?** Only partly. The ESS is a national sample, while the user is one municipality. People in care homes, homeless people, asylum seekers and people who do not speak Dutch well are missing or under-represented. The data ends in 2023.

## User and decision

- **User:** the debt-support team (*schuldhulpverlening / vroegsignalering*) of a Dutch municipality.
- **Decision:** who receives a letter with a voluntary offer of help (a letter, a phone call or an invitation to a budget workshop).
- **Who is affected:** the residents the model makes predictions about. A **false negative** (someone who struggles gets no letter) is the worst mistake, because their debts can grow. A **false positive** (an unnecessary letter) costs time and money and can feel intrusive, but is less harmful.
- **Who is not in the data:** people in institutions, homeless people, asylum seekers, people who could not do the interview in Dutch, and people who refused to take part.

## Why SDG 8

SDG 8 is about decent work and economic growth that people can live from (target 8.5: decent work for all). Whether a household can live on its income from work, a pension or benefits is a direct measure of economic security. The model predicts this one outcome for one group, so that a public service can act on it.

---

## Dataset card

| | |
|---|---|
| **Name** | European Social Survey (ESS), integrated files rounds 4–11, Netherlands only |
| **Source** | ESS Data Portal, <https://ess.sikt.no> (Datafile Builder: country NL, rounds 4–11, selected variables). The raw download is in this folder (`ESS4e04_6-…-subset.zip`); the same CSV and codebook are in [`data/`](data/). |
| **Collected by** | ESS ERIC, a European research infrastructure; data distributed by Sikt |
| **How** | Standardised interviews (mostly face-to-face) with a new random sample of people aged 15+ in private households, every two years |
| **When** | 2008 (round 4) to 2023 (round 11) |
| **Licence** | [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/): free for non-commercial use with attribution. Our subset is shared under the same licence. |
| **Rows × columns** | 13,890 × 26 (13,740 rows after removing 150 unknown targets) |
| **Target** | `hincfel`: 1 = "difficult" or "very difficult", 0 = "living comfortably" or "coping" |
| **Class balance** | 1,407 struggling (10%) vs 12,333 not struggling (90%) |
| **Features used (8)** | age, household size, working hours, education, type of area, main activity, main source of income, ever unemployed > 3 months |
| **Known limitations** | Self-reported feeling, not a fact from records. Missing values hidden as codes (7/8/9, 77/88/99, 999). `chldhm` not asked in 2018–2023. Survey weights not used. Care homes, homeless people and non-Dutch speakers missing or under-represented. The share struggling changes per round (5–14%). 2 respondents are 14 although the sample is 15+. |

**Citation:** European Social Survey European Research Infrastructure (ESS ERIC). ESS4–ESS11 integrated files. Sikt – Norwegian Agency for Shared Services in Education and Research. Adapted: Netherlands only, subset of variables. DOIs per round: see [`data/readme.md`](data/readme.md).

---

## The pipeline, step by step

1. **Frame the problem.** Positive class = struggling. Main metric = **F2**, which weighs recall twice as heavily as precision: missing a struggling household is worse than an unnecessary letter, and recall alone could be gamed by sending everyone a letter. No accuracy: 90% of the rows are one class.
2. **Explore and clean.** Codebook codes for refusal / don't know (7/8/9, 77/88/99, 999) become missing. Working hours `666` ("no job") becomes 0 hours; 8 working weeks above 100 hours become missing. 150 rows with an unknown target are removed. No duplicate respondents.
3. **Split first.** 80/20, stratified, `random_state=42`, before any imputing, scaling or tuning. Train 10,992 rows, test 2,748 rows (281 struggling).
4. **Pipeline.** `ColumnTransformer` inside a `Pipeline`: numeric columns get median imputation and `StandardScaler` (KNN measures distances, logistic regression trains better on one scale); categorical columns get most-frequent imputation and one-hot encoding. Dropped: the 13 survey-administration columns, `hincfel` (leakage), `hinctnta` (income, unknown to the municipality), `chldhm` (not asked 2018–2023), `gndr` and `brncntr` as inputs (kept for the fairness check).
5. **Baselines.** `DummyClassifier(most_frequent)` and a simple rule: send a letter if the main income is a benefit, or if the person is unemployed or sick/disabled.
6. **Tuning.** `GridSearchCV` on the training set with the same `StratifiedKFold(5, shuffle=True, random_state=42)` folds and the same F2 scorer for all models. All models flag a person when the predicted chance is ≥ 10% (the average share struggling), via `FixedThresholdClassifier`; this threshold is not tuned. Grids: KNN `n_neighbors` 5–501, logistic regression `C` 0.001–100, decision tree `max_depth` 2–10 and None. A check on the training set confirms that 10% is also the best threshold for logistic regression (F2 0.510, against 0.499 at 8% and 0.487 at 15%).
7. **Test once.** Confusion matrices, precision, recall, F1 and F2 for every model and both baselines; train vs CV vs test.
8. **Errors.** Recall and precision per sex, country of birth, main activity and survey year; a proxy check (can our inputs predict country of birth?).
9. **Recommend.** Including a check of what income would have added (CV on the training set only).
10. **Use it.** A made-up resident gets a prediction and a probability.

## Comparison table

Threshold 10% for all models. The notebook writes this table to [`results/comparison_table.csv`](results/comparison_table.csv).

| model | best hyperparameter | train F2 | CV F2 (mean ± spread) | test F2 | test precision | test recall | test F1 | share getting a letter |
|---|---|---|---|---|---|---|---|---|
| Baseline (always no) | – | 0.000 | 0.000 ± 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0% |
| Simple rule | – | 0.442 | 0.442 ± 0.014 | 0.446 | 0.354 | 0.477 | 0.407 | 14% |
| KNN | n_neighbors = 301 | 0.502 | 0.492 ± 0.017 | 0.462 | 0.305 | 0.530 | 0.388 | 18% |
| **Logistic regression** | **C = 10** | **0.518** | **0.510 ± 0.013** | **0.493** | **0.240** | **0.669** | **0.353** | **28%** |
| Decision tree | max_depth = 6 | 0.514 | 0.465 ± 0.017 | 0.501 | 0.311 | 0.591 | 0.408 | 19% |

*KNN's scores can differ in the third decimal between computers and scikit-learn versions, probably because many people have identical answers and KNN then has to break ties between equally distant neighbours (one of our earlier runs gave test F2 0.466). All other numbers are identical in every run.*

## Recommended model and why

We recommend **logistic regression**:
- It misses the fewest people who struggle (93 of 281 in the test set; recall 0.67). For our user that is the worst mistake.
- It beats the simple rule (F2 0.49 vs 0.45; it finds 188 instead of 134 struggling people), so machine learning adds something over a rule a caseworker could apply by hand.
- It has the best and most stable cross-validation score, and train, CV and test scores are close, so it does not overfit.
- The decision tree has a slightly higher test F2, but the difference (0.01) is smaller than the spread over the folds, its CV score is lower (0.47), it overfits more, and it misses 22 more people.
- It is explainable: every answer has one weight, so the municipality can tell a resident why they got a letter.

**The decision we defend hardest:** income, sex and country of birth are not inputs. Income would raise the CV F2 from 0.51 to 0.59, but the municipality does not know every resident's income, and selecting on sex or origin is not allowed.

**Use it only for a voluntary offer of help**, next to existing signals such as payment arrears. About 3 in 4 letters go to people who manage fine, and the model sends a letter to about 28% of residents. If the team cannot handle that, it can raise the threshold: fewer letters, but more people missed.

**Test it on recent data first.** In the most recent survey rounds (2020 and 2023) the model found only about 45% of the struggling people, against 61–79% in 2008–2018 (small groups: 13 and 20 struggling people in the test set). The model knows the past better than the present.

## Ethical reflection

**Who is in the data, and who is missing.** Dutch residents aged 15+ living in private households, interviewed between 2008 and 2023; about 9% were born outside the Netherlands. Missing are people in care homes and other institutions, homeless people, asylum seekers, people who could not do the interview in Dutch and people who refused to take part. These are probably among the people who struggle most. The data ends before the full effect of the 2022–2023 price rises, and we did not use the survey weights.

**Does the model make the same mistakes for every group?** For men and women, yes (recall 0.64 vs 0.68). People born outside NL get a letter more often (43% vs 27%), but they also struggle about 3 times as often (25% vs 9%) and the model finds them better (recall 0.77 vs 0.64). The clearest gaps are by main activity and by year: the model finds only 27% of struggling retired people and 46% of struggling working people, whose problems (rent, debts, health costs) are not in our data. In the most recent rounds (2020 and 2023) it finds only about 45% of all struggling people, against 61–79% before.

**Is a removed column still hiding in another one?** Yes, partly. We did not give sex, country of birth or income to the model, but our input columns still predict "born outside NL" with ROC-AUC 0.68 (0.5 = no information). Source of income, education and unemployment history partly stand in for it.

**What a mistake costs the person.** A false negative means a struggling household gets no early help, and debts can grow until a landlord or energy company reports arrears. A false positive means an unnecessary letter, which can feel intrusive or stigmatising, especially for people born outside NL, who get letters more often and may feel singled out after the childcare-benefits scandal.

**What we did about these risks:**
1. We chose F2 and a low threshold (10%), so that fewer struggling people are missed.
2. We left sex, country of birth and income out of the model.
3. We checked the errors per sex, country of birth, main activity and survey year, and tested whether country of birth hides in the other columns.

---

## How to run

**Google Colab (no extra installs):**
1. Click the **Open in Colab** button at the top.
2. Click **Runtime → Run all**. It takes about 1–2 minutes.

The first code cell uses the local file `data/ess_nl_rounds4-11.csv` when it exists (Jupyter), and otherwise downloads the same file from this repository via `DATA_URL` (Colab). No manual steps are needed.

**Jupyter / VS Code:** open `model_showdown.ipynb` from this folder and choose **Restart and Run All**.

**Packages** (versions of the saved outputs, printed in the last cell of the notebook):

| package | version used | minimum |
|---|---|---|
| Python | 3.13 | 3.10 |
| scikit-learn | 1.9.1 | **1.5** (for `FixedThresholdClassifier`) |
| pandas | 3.0.5 | 2.0 |
| numpy | 2.5.3 | 1.24 |
| matplotlib | 3.11.2 | 3.7 |

All randomness is fixed with `random_state=42`.

## Files

```
model_showdown.ipynb          notebook, run top to bottom with outputs saved
presentation.pdf              slides for the Friday presentation
presentation_notes.md         speaker notes per slide (Dutch)
data/ess_nl_rounds4-11.csv    ESS subset (NL, rounds 4–11), CC BY-NC-SA 4.0
data/ess_codebook.html        codebook: variable labels and missing-value codes
data/readme.md                data citation and DOIs
results/comparison_table.csv  comparison table written by the notebook
ESS4e04_6-…-subset.zip        the raw download from the ESS Data Portal
README.md                     this file
```

## Sources

- European Social Survey Data Portal: <https://ess.sikt.no>
- CBS, *Leven in armoede 2025*: <https://longreads.cbs.nl/leven-in-armoede-2025/wat-is-de-financiele-situatie-bij-armoede/>
- Rijksoverheid, early detection of debts: <https://www.rijksoverheid.nl/themas/recht-veiligheid-en-defensie/schulden/gemeenten-sneller-signaleren-van-schulden>
- scikit-learn: <https://scikit-learn.org/stable/>
