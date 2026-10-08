# Who struggles to get by? Model Showdown

**AI for Good · Hackathon 5 · SDG 8 Decent Work and Economic Growth**

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/SkillfulRheyme4/ai4g-portfolio-sambam/blob/main/Term%201/Week%205/hackathon/model_showdown.ipynb)

We predict which Dutch residents find it difficult to live on their household income, so that a municipality's debt-support team can offer help before debts build up. We compare three tuned scikit-learn classifiers (KNN, logistic regression and a decision tree) with a baseline that always says "no".

**Recommendation:** logistic regression, but only for sending a voluntary offer of help.

---

## The problem

- **Outcome:** a person says it is "difficult" or "very difficult" to live on their present household income (ESS question `hincfel`).
- **Population:** residents of the Netherlands aged 15 and over.
- **How big is the problem?** In 2024, 551,000 people in the Netherlands lived in poverty and 1.1 million just above the poverty line ([CBS, *Leven in armoede 2025*](https://longreads.cbs.nl/leven-in-armoede-2025/wat-is-de-financiele-situatie-bij-armoede/)). In our data, 10% of people struggle.
- **Does the data match the user's population?** Only partly. The ESS is a national sample, while the user is one municipality. People in care homes, homeless people and people who do not speak Dutch well are missing or under-represented. The data ends in 2023.

## User and decision

- **User:** the debt-support team of a Dutch municipality.
- **Decision:** who receives a letter with a voluntary offer of help.
- **Who is affected:** the residents the model makes predictions about. A **false negative** (someone who struggles gets no letter) is the worst mistake, because their debts can grow. A **false positive** (an unnecessary letter) costs time and money and can feel intrusive, but is less harmful.
- **Who is not in the data:** see "Does the data match" above.

## Why SDG 8

SDG 8 is about decent work and economic growth that people can live from. Whether a household can live on its income is a direct measure of economic security. The model predicts this one outcome for one group, so that a public service can act on it.

---

## Dataset card

| | |
|---|---|
| **Name** | European Social Survey (ESS), rounds 4–11, Netherlands only |
| **Source** | ESS Data Portal, <https://ess.sikt.no> |
| **Collected by** | ESS ERIC, a European research infrastructure |
| **How** | Interviews with a new random sample of people aged 15+ in private households, every two years |
| **When** | 2008 (round 4) to 2023 (round 11) |
| **Licence** | [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/): free for non-commercial use with attribution |
| **Rows × columns** | 13,890 × 26 (13,740 rows after removing 150 unknown targets) |
| **Target** | `hincfel`: 1 = "difficult" or "very difficult", 0 = "living comfortably" or "coping" |
| **Class balance** | 1,407 struggling (10%) vs 12,333 not struggling (90%) |
| **Features used** | age, household size, working hours, education, type of area, main activity, main source of income, ever unemployed > 3 months |
| **Known limitations** | Self-reported feeling, not a fact from records. Missing values hidden as codes (7/8/9, 77/88/99, 999). `chldhm` not asked in 2018–2023. Survey weights not used. Care homes, homeless people and non-Dutch speakers missing or under-represented. |

---

## Comparison table (test set, threshold 10%)

| model | best hyperparameter | CV F2 (mean ± spread) | test F2 | test precision | test recall | test F1 |
|---|---|---|---|---|---|---|
| Baseline (always no) | – | 0.000 ± 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| KNN | n_neighbors = 301 | 0.492 ± 0.017 | 0.466 | 0.308 | 0.534 | 0.391 |
| **Logistic regression** | **C = 10** | **0.510 ± 0.013** | **0.493** | **0.240** | **0.669** | **0.353** |
| Decision tree | max_depth = 6 | 0.465 ± 0.017 | 0.501 | 0.311 | 0.591 | 0.408 |

## Recommended model and why

We recommend **logistic regression**:
- It misses the fewest people who struggle (93 of 281 in the test set).
- It has the best and most stable cross-validation score, and train, CV and test scores are close, so it does not overfit.
- The decision tree has a slightly higher test F2, but the difference (0.01) is smaller than the spread over the folds, and it misses 22 more people.
- It is explainable: every column has a weight, so the municipality can tell a resident why they got a letter.

**Use it only for a voluntary offer of help**, next to existing signals such as payment arrears. About 3 in 4 letters go to people who manage fine.

## Ethical reflection

*TODO: write this in your own words. Use the points below.*

- Who is in the data and who is missing (see the dataset card).
- We did not use sex or country of birth as inputs, so the model does not select on them. We did check them: men and women are found about equally well (recall 0.64 vs 0.68). People born outside NL get a letter more often (43% vs 27%), but they also struggle almost 3 times as often, and the model finds them better (0.77).
- Country of birth may still be hidden in other columns, such as source of income.
- Retired people who struggle are found worst (recall 0.27), and working people often too (0.46). What would you advise the municipality about them?
- What a false negative and a false positive cost the person.
- What we did about the risks: F2 instead of accuracy, a low threshold so fewer people are missed, a group check, and this warning: **the model must not be used to cut benefits or to check people.**
- The licence allows non-commercial use with attribution; the people in the survey agreed to take part in research.

---

## How to run

1. Open the notebook in Google Colab with the **Open in Colab** button at the top, or open `model_showdown.ipynb` in Jupyter.
2. Click **Runtime → Run all** (Colab) or **Run All** (Jupyter / VS Code).

The notebook downloads the data from this repository (`data/ess_nl_rounds4-11.csv`) via `DATA_URL` in the first code cell, so no manual steps are needed.

**Packages:** Python 3.12, pandas, numpy, scikit-learn, matplotlib. *TODO: fill in the versions (see the last cell of the notebook).*
