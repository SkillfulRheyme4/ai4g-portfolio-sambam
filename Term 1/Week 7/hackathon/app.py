"""Hornet Check NL: foto van een insect -> Aziatische hoornaar of look-alike, met advies.

Het Roboflow-model (classificatie, 5 klassen) doet de herkenning; deze app voegt de
zekerheidscontrole, het advies per soort en de meldlink toe.
"""
import base64
import csv
import io
import os
from pathlib import Path

import requests
import streamlit as st
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
API_URL = "https://serverless.roboflow.com"
SURE = 0.70    # vanaf hier een duidelijk antwoord
UNSURE = 0.45  # hieronder: "ik weet het niet"


def setting(name, default=""):
    try:
        return st.secrets.get(name, os.environ.get(name, default))
    except Exception:
        return os.environ.get(name, default)


@st.cache_data
def load_species():
    with open(ROOT / "species.csv", newline="", encoding="utf-8") as f:
        return {r["class"]: r for r in csv.DictReader(f)}


def classify(image, model_id, api_key):
    """Stuur de foto naar het Roboflow-model; geef [(klasse, zekerheid), ...] terug, hoog naar laag."""
    img = image.convert("RGB")
    img.thumbnail((640, 640))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    resp = requests.post(
        f"{API_URL}/{model_id}",
        params={"api_key": api_key},
        data=base64.b64encode(buf.getvalue()).decode("ascii"),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=60,
    )
    resp.raise_for_status()
    preds = resp.json().get("predictions", [])
    if isinstance(preds, dict):  # multi-label formaat
        preds = [{"class": k, "confidence": v["confidence"]} for k, v in preds.items()]
    return sorted(((p["class"], p["confidence"]) for p in preds), key=lambda x: -x[1])


st.set_page_config(page_title="Hornet Check NL", page_icon="🐝")
st.title("🐝 Hornet Check NL")
st.write("Zie je een grote wesp of hoornaar? Maak een foto. De app vertelt of het de "
         "**invasieve Aziatische hoornaar** is, die je moet melden, of een van de inheemse look-alikes.")

api_key = setting("ROBOFLOW_API_KEY")
model_id = setting("ROBOFLOW_MODEL", "hornet-checkv2/1")
if not api_key:
    with st.sidebar:
        api_key = st.text_input("Roboflow API key", type="password")
        model_id = st.text_input("Model-ID", value=model_id)

species = load_species()
tab_upload, tab_camera = st.tabs(["📁 Foto uploaden", "📷 Camera"])
with tab_upload:
    uploaded = st.file_uploader("Kies een foto", type=["jpg", "jpeg", "png"])
with tab_camera:
    camera = st.camera_input("Maak een foto")
source = uploaded or camera

if source and not api_key:
    st.warning("Vul eerst de Roboflow API key in (links in de zijbalk).")
elif source:
    image = ImageOps.exif_transpose(Image.open(source))
    with st.spinner("Insect herkennen..."):
        try:
            ranked = classify(image, model_id, api_key)
        except Exception as e:
            st.error(f"Het model gaf een fout: {e}")
            st.stop()
    st.image(image, width="stretch")

    if not ranked or ranked[0][1] < UNSURE:
        st.info("❓ **Ik weet het niet.** Misschien is het geen van de 5 insecten die ik ken, "
                "of is de foto niet scherp genoeg. Probeer een foto van dichtbij, van boven of opzij. "
                "Twijfel je of het een Aziatische hoornaar is? Meld hem dan toch: een expert kijkt mee.")
        st.link_button("Meld op waarneming.nl", "https://waarneming.nl")
    else:
        cls, conf = ranked[0]
        info = species.get(cls, {"name_nl": cls, "latin": "", "invasive": "no", "why": "", "advice": ""})
        pct = f"{conf:.0%}"
        if conf < SURE:
            st.warning(f"🤔 Waarschijnlijk **{info['name_nl']}** ({pct} zeker), maar ik twijfel. "
                       "Check het zelf voordat je iets doet.")
        elif info["invasive"] == "yes":
            st.error(f"⚠️ **{info['name_nl']}** (*{info['latin']}*), {pct} zeker. Dit is een invasieve exoot!")
        else:
            st.success(f"✅ **{info['name_nl']}** (*{info['latin']}*), {pct} zeker. Inheemse soort.")

        st.write(f"**Waarom het uitmaakt:** {info['why']}")
        st.write(f"**Wat te doen:** {info['advice']}")
        if info["invasive"] == "yes":
            st.link_button("⚠️ Meld deze Aziatische hoornaar op waarneming.nl", "https://waarneming.nl",
                           type="primary")

        if len(ranked) > 1 and ranked[1][1] >= 0.15:
            alt = species.get(ranked[1][0], {}).get("name_nl", ranked[1][0])
            st.caption(f"Tweede keus van het model: {alt} ({ranked[1][1]:.0%}).")

    with st.expander("Alle scores van het model"):
        for c, p in ranked:
            st.progress(min(max(p, 0.0), 1.0), text=f"{species.get(c, {}).get('name_nl', c)}: {p:.0%}")

st.divider()
st.caption("De app kent alleen deze 5 insecten: Aziatische hoornaar, Europese hoornaar, wesp, "
           "hoornaarzweefvlieg en honingbij. Het is een hulpmiddel, geen officiële determinatie. "
           "Het model mist ongeveer de helft van de Aziatische hoornaars als het twijfelt, dus meld bij twijfel altijd. "
           "Getraind in Roboflow op Nederlandse iNaturalist-foto's (zie README en datacard).")
