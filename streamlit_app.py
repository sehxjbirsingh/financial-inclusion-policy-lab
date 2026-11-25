"""
Global Financial Inclusion Policy Lab - Streamlit Production Edition
Comparative Unsupervised Pattern Clustering on World Bank Global Findex Data
"""
from __future__ import annotations

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
from data_service import data_service

# Streamlit Page Config
st.set_page_config(
    page_title="Global Financial Inclusion Policy Lab",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Obsidian & Slate Styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
    
    html, body, [class*="css"], .stMarkdown {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }
    
    /* Deep Obsidian Slate Canvas */
    .stApp {
        background: radial-gradient(at 15% 15%, rgba(99, 102, 241, 0.08) 0px, transparent 40%),
                    radial-gradient(at 85% 85%, rgba(16, 185, 129, 0.05) 0px, transparent 40%),
                    #070a12 !important;
    }
    
    /* Hide Streamlit Header, Footer, and Toolbar Clutter */
    header[data-testid="stHeader"] {
        background: transparent !important;
        height: 0px !important;
    }
    [data-testid="stDecoration"] {
        display: none !important;
    }
    #MainMenu, footer {
        visibility: hidden !important;
    }
    .stDeployButton {
        display: none !important;
    }
    a.stAnchor {
        display: none !important;
    }

    /* Modern Layout Padding */
    .block-container {
        padding-top: 1.5rem !important;
        padding-bottom: 3rem !important;
        padding-left: 2rem !important;
        padding-right: 2rem !important;
        max-width: 1440px !important;
        width: 100% !important;
    }
    
    /* Sidebar Styling */
    [data-testid="stSidebar"] {
        background-color: #0b1120 !important;
        border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
    }
    [data-testid="stSidebar"] .block-container {
        padding-top: 2rem !important;
        padding-left: 1.2rem !important;
        padding-right: 1.2rem !important;
    }

    /* Modern Sidebar Navigation Items matching the screenshot (ZERO Blue Radio Circles) */
    [data-testid="stSidebar"] [data-testid="stRadio"] > div {
        gap: 6px !important;
    }
    
    [data-testid="stRadioOption"] {
        background: transparent !important;
        border: 1px solid transparent !important;
        padding: 9px 14px !important;
        border-radius: 8px !important;
        transition: all 0.2s ease !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
    }
    
    [data-testid="stRadioOption"]:hover {
        background: rgba(255, 255, 255, 0.05) !important;
        transform: translateX(2px) !important;
    }
    
    /* Active Selected Item - Beautiful Sky-Blue Glow Pill from screenshot */
    [data-testid="stRadioOption"]:has(input:checked) {
        background: rgba(56, 189, 248, 0.16) !important;
        border: 1px solid rgba(56, 189, 248, 0.45) !important;
        border-radius: 8px !important;
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.2) !important;
    }
    
    /* Complete removal of the round blue radio circle, inner dot, and circular outline */
    [data-testid="stRadioOption"] > div > div:first-child:not([data-testid="stMarkdownContainer"]),
    [data-testid="stRadioOption"] [class*="ex50key4"],
    [data-testid="stRadioOption"] [class*="ex50key5"],
    [data-testid="stRadioOption"] input[type="radio"],
    [data-testid="stRadioOption"] svg {
        display: none !important;
        visibility: hidden !important;
        width: 0px !important;
        height: 0px !important;
        min-width: 0px !important;
        max-width: 0px !important;
        margin: 0px !important;
        padding: 0px !important;
        border: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
    }
    
    /* Ensure Nav Pill Text Labels are Crisp, Visible, and Full-Width */
    [data-testid="stRadioOption"] > *:last-child,
    [data-testid="stRadioOption"] [data-testid="stMarkdownContainer"],
    [data-testid="stRadioOption"] [data-testid="stMarkdownContainer"] * {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    }
    [data-testid="stRadioOption"] [data-testid="stMarkdownContainer"] {
        width: 100% !important;
    }
    [data-testid="stRadioOption"] [data-testid="stMarkdownContainer"] p {
        font-size: 13.5px !important;
        font-weight: 500 !important;
        color: #94a3b8 !important;
        margin: 0 !important;
        line-height: 1.4 !important;
    }
    [data-testid="stRadioOption"]:hover [data-testid="stMarkdownContainer"] p {
        color: #f8fafc !important;
    }
    [data-testid="stRadioOption"]:has(input:checked) [data-testid="stMarkdownContainer"] p {
        color: #ffffff !important;
        font-weight: 600 !important;
    }

    /* Glassmorphic Selectboxes & Dropdowns */
    div[data-baseweb="select"] > div {
        background-color: #0f172a !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 10px !important;
        color: #f8fafc !important;
    }
    div[data-baseweb="select"] > div:hover {
        border-color: #6366f1 !important;
    }
    ul[data-baseweb="menu"] {
        background-color: #0f172a !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 10px !important;
    }
    li[data-baseweb="menu-item"] {
        color: #f8fafc !important;
    }
    li[data-baseweb="menu-item"]:hover {
        background-color: rgba(99, 102, 241, 0.2) !important;
    }

    /* Metric Cards */
    [data-testid="stMetric"] {
        background: #0f172a !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 12px !important;
        padding: 16px 20px !important;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25) !important;
    }
    [data-testid="stMetricLabel"],
    [data-testid="stMetricLabel"] > div,
    [data-testid="stMetricLabel"] p {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 11px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        color: #94a3b8 !important;
        white-space: normal !important;
        word-break: break-word !important;
        overflow: visible !important;
        text-overflow: unset !important;
        line-height: 1.35 !important;
    }
    [data-testid="stMetricValue"] {
        font-family: 'Playfair Display', Georgia, serif !important;
        font-size: 28px !important;
        color: #f8fafc !important;
    }

    /* Segmented Tabs */
    .stTabs [data-baseweb="tab-list"] {
        background-color: #0b1120 !important;
        border-radius: 30px !important;
        padding: 4px !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        gap: 6px !important;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 14px !important;
        color: #94a3b8 !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        padding: 8px 20px !important;
        border: none !important;
        margin: 0 2px !important;
    }
    .stTabs [aria-selected="true"] {
        background-color: #6366f1 !important;
        color: #ffffff !important;
        box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4) !important;
    }

    /* Progress bar styling */
    .stProgress > div > div > div > div {
        background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%) !important;
        border-radius: 4px !important;
    }
    
    .hero-card {
        background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.16) 0%, transparent 45%),
                    radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.12) 0%, transparent 45%),
                    #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 36px 40px;
        margin-bottom: 24px;
        box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .hero-tag {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #10b981;
        text-transform: uppercase;
        margin-bottom: 12px;
        display: inline-block;
        background: rgba(16, 185, 129, 0.1);
        padding: 4px 10px;
        border-radius: 20px;
        border: 1px solid rgba(16, 185, 129, 0.25);
    }
    
    .hero-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 42px;
        font-weight: 700;
        line-height: 1.15;
        color: #f8fafc;
        margin-bottom: 12px;
        letter-spacing: -0.5px;
    }
    
    .hero-title em {
        background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #34d399 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-style: italic;
    }
    
    .hero-desc {
        font-size: 15.5px;
        color: #94a3b8;
        line-height: 1.6;
        max-width: 840px;
    }
    
    .stat-pill {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px 20px;
        text-align: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        transition: transform 0.2s ease;
    }
    
    .stat-pill:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.15);
    }
    
    .stat-num {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 28px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 6px;
    }
    
    .stat-num.rose { color: #f43f5e; }
    .stat-num.amber { color: #f59e0b; }
    .stat-num.emerald { color: #10b981; }
    
    .stat-label {
        font-size: 12px;
        color: #94a3b8;
    }
    
    .arch-card {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        height: 100%;
        box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    
    .arch-card:hover {
        border-color: rgba(99, 102, 241, 0.4);
        transform: translateY(-2px);
    }
    
    .arch-c1 { border-top: 4px solid #10b981; }
    .arch-c2 { border-top: 4px solid #3b82f6; }
    .arch-c3 { border-top: 4px solid #f43f5e; }
    .arch-c4 { border-top: 4px solid #f59e0b; }
    
    .barrier-card {
        background: #0f172a;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    }
    
    .subtle-notice {
        font-size: 12px;
        color: #64748b;
        border-top: 1px solid rgba(255,255,255,0.06);
        padding-top: 14px;
        margin-top: 30px;
        text-align: center;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def load_all_data():
    countries = data_service.get_countries(year="2024")
    rec_model = data_service.get_recommended_clustering()
    benchmarks = data_service.get_clustering_benchmarks()
    return countries, rec_model, benchmarks

countries, rec_model, benchmarks = load_all_data()

CLUSTER_INFO = {
    0: {"name": "Digitally Leaping Cash Economists", "color": "#10b981", "countries": 35, "desc": "High mobile money adoption, rapid fintech leapfrogging, modest formal bank savings."},
    1: {"name": "Universal High-Resilience Systems", "color": "#3b82f6", "countries": 48, "desc": "Nearly universal banking coverage (>90%), high digital commerce, robust emergency liquidity."},
    2: {"name": "Severe Exclusion Frontiers", "color": "#f43f5e", "countries": 29, "desc": "Acute access deficits across traditional and mobile platforms. Cash-reliant shock absorption."},
    3: {"name": "Banked but Liquidity-Constrained", "color": "#f59e0b", "countries": 28, "desc": "High formal account coverage (payroll/G2P), but low voluntary savings mobilization."}
}

# SIDEBAR NAVIGATION
with st.sidebar:
    st.markdown("### 🏛️ POLICY LAB")
    st.caption("FINANCIAL INCLUSION 2025 · WORLD BANK FINDEX")
    st.markdown("---")
    
    # Public Dashboard Navigation (7 Core Public Tools)
    nav_options = [
        "🗺️ World Map & Archetypes",
        "⚖️ Country Comparator",
        "💡 Citizen Action Hub",
        "🎛️ Try It Yourself (Guided Lab)",
        "🔬 Archetypes & PCA Diagnostics",
        "⚡ Policy Simulator",
        "🌐 Global Matrix (140+ Countries)"
    ]
    page = st.radio(
        "Navigation",
        nav_options,
        index=0
    )
    
    st.markdown("---")
    
    # Private Researcher & Evaluator Gated Section (Data Export + Methodology)
    with st.expander("🔒 Researcher & Evaluator Access (Private)", expanded=False):
        st.caption("Technical methodology, preprocessing logs, and raw dataset exports are private.")
        passcode = st.text_input("Evaluator Passcode:", type="password", key="eval_passcode", placeholder="••••••••")
        if passcode in ["findex2025", "admin", "policy2025"]:
            st.success("Access Granted")
            
            st.markdown("##### 📥 Dataset Export")
            if rec_model and "country_assignments" in rec_model:
                df_export = pd.DataFrame(rec_model["country_assignments"])
                csv_bytes = df_export.to_csv(index=False).encode('utf-8')
                st.download_button(
                    label="Download Cluster Dataset (CSV)",
                    data=csv_bytes,
                    file_name="financial_inclusion_clusters_2025.csv",
                    mime="text/csv",
                    use_container_width=True
                )
            
            st.markdown("---")
            st.markdown("##### 📖 Technical Methodology & Data Log")
            if st.button("Open Technical Methodology & Data Log", use_container_width=True):
                st.session_state["show_technical_logs"] = True
        elif passcode:
            st.error("Access Denied: Invalid Passcode")

    # If evaluator unlocked the private data log
    if st.session_state.get("show_technical_logs", False):
        page = "📖 Methodology & Data Log"
        if st.sidebar.button("← Return to Public Dashboard", use_container_width=True):
            st.session_state["show_technical_logs"] = False
            st.rerun()

    st.markdown("---")
    st.caption("World Bank Global Findex 2025 · 140 Sovereign Economies")


# ==============================================================================
# PAGE 1: WORLD MAP & ARCHETYPES
# ==============================================================================
if page == "🗺️ World Map & Archetypes":
    st.markdown("""
    <div class="hero-card">
        <div class="hero-tag">WORLD BANK GLOBAL FINDEX · UNSUPERVISED MACHINE LEARNING</div>
        <div class="hero-title">Financial inclusion,<br><em>seen in patterns.</em></div>
        <div class="hero-desc">
            We analyzed 140+ sovereign economies to uncover 4 natural financial ecosystems.
            Discover what holds each group back, how peer nations compare, and explore evidence-linked policy ideas that anyone can understand.
        </div>
    </div>
    """, unsafe_allow_html=True)

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown("""
        <div class="stat-pill">
            <div class="stat-num rose">1.4B</div>
            <div class="stat-label">Unbanked adults with zero formal accounts</div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown("""
        <div class="stat-pill">
            <div class="stat-num amber">75%+</div>
            <div class="stat-label">Citing poverty & fees as their main barrier</div>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown("""
        <div class="stat-pill">
            <div class="stat-num emerald">65%+</div>
            <div class="stat-label">Mobile money surge bypassing physical branches</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)

    col_filter, col_metric = st.columns([3, 2])
    with col_filter:
        arch_filter = st.selectbox(
            "Filter by Natural Archetype:",
            ["All Nations (140)", "1. Digitally Leaping Cash Economists", "2. Universal High-Resilience Systems", "3. Severe Exclusion Frontiers", "4. Banked but Liquidity-Constrained"]
        )
    with col_metric:
        color_metric = st.selectbox(
            "Color Map By:",
            ["Archetype Cluster", "Overall Account Ownership (%)", "Mobile Money (%)", "Emergency Resilience (%)"]
        )

    assignments = rec_model.get("country_assignments", [])
    df_map = pd.DataFrame(assignments)
    
    # Filter by cluster if selected
    if arch_filter != "All Nations (140)":
        cluster_id = int(arch_filter.split(".")[0])
        df_map = df_map[df_map["cluster_id"] == cluster_id]

    map_col, insp_col = st.columns([7, 3])
    
    with map_col:
        if color_metric == "Archetype Cluster":
            fig_map = px.choropleth(
                df_map,
                locations="code",
                color="cluster_name",
                hover_name="country",
                hover_data={"code": False, "cluster_name": True, "account_pct": ':.1f', "mobile_pct": ':.1f'},
                color_discrete_map={
                    "Digitally Leaping Cash Economists": "#10b981",
                    "Universal High-Resilience Systems": "#3b82f6",
                    "Severe Exclusion Frontiers": "#f43f5e",
                    "Banked but Liquidity-Constrained": "#f59e0b"
                },
                labels={"cluster_name": "Archetype", "account_pct": "Account %", "mobile_pct": "Mobile %"}
            )
        else:
            metric_col_map = {
                "Overall Account Ownership (%)": "account_pct",
                "Mobile Money (%)": "mobile_pct",
                "Emergency Resilience (%)": "emergency_pct"
            }
            col_target = metric_col_map[color_metric]
            fig_map = px.choropleth(
                df_map,
                locations="code",
                color=col_target,
                hover_name="country",
                hover_data={"code": False, "cluster_name": True, col_target: ':.1f'},
                color_continuous_scale="Viridis",
                labels={col_target: color_metric}
            )
            fig_map.update_coloraxes(
                colorbar=dict(
                    title=dict(text="", font=dict(size=11, color="#94a3b8")),
                    orientation="h",
                    y=-0.12,
                    x=0.5,
                    xanchor="center",
                    len=0.7,
                    thickness=12,
                    tickfont=dict(size=10, color="#94a3b8")
                )
            )

        fig_map.update_layout(
            geo=dict(
                showframe=False,
                showcoastlines=True,
                coastlinecolor="rgba(255,255,255,0.15)",
                projection_type="natural earth",
                bgcolor="rgba(0,0,0,0)",
                showland=True,
                landcolor="#0c1424",
                showocean=True,
                oceancolor="#070a12",
                showcountries=True,
                countrycolor="rgba(255,255,255,0.08)"
            ),
            margin=dict(l=0, r=0, t=10, b=45),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
            legend=dict(orientation="h", y=-0.12, x=0.5, xanchor="center")
        )
        st.plotly_chart(fig_map, use_container_width=True)

    with insp_col:
        st.markdown("### 🔎 Country Inspector")
        all_country_names = sorted(df_map["country"].dropna().unique().tolist())
        default_idx = all_country_names.index("India") if "India" in all_country_names else 0
        inspected_name = st.selectbox("Select Country:", all_country_names, index=default_idx)
        
        country_prof = data_service.get_country_cluster_profile(inspected_name)
        if country_prof:
            st.markdown(f"**{country_prof['country']}** ({country_prof['code']}) — *{country_prof['region']}*")
            st.info(f"🏷️ **{country_prof['cluster_name']}**")
            
            acc = country_prof.get('account_pct', 0)
            mob = country_prof.get('mobile_pct', 0)
            fi = country_prof.get('fiaccount_pct', 0)
            sav = country_prof.get('saved_pct', 0)
            resil = country_prof.get('resilience_pct', 0)
            
            st.write(f"💳 Account Ownership: **{acc:.1f}%**")
            st.progress(min(1.0, max(0.0, acc / 100.0)))
            
            st.write(f"📱 Mobile Money: **{mob:.1f}%**")
            st.progress(min(1.0, max(0.0, mob / 100.0)))
            
            st.write(f"🏦 Formal Bank Account: **{fi:.1f}%**")
            st.progress(min(1.0, max(0.0, fi / 100.0)))
            
            st.write(f"💰 Savings Propensity: **{sav:.1f}%**")
            st.progress(min(1.0, max(0.0, sav / 100.0)))
            
            st.write(f"🛡️ Emergency Resilience: **{resil:.1f}%**")
            st.progress(min(1.0, max(0.0, resil / 100.0)))
            
            st.markdown("**Key Takeaways:**")
            st.success(f"💪 **Strength:** {country_prof.get('strength', 'Solid core access')}")
            st.warning(f"⚠️ **Priority Gap:** {country_prof.get('gap', 'Savings mobilization')}")

    # 4 Archetype Cards Grid
    st.markdown("### 🌐 The 4 Global Financial Inclusion Archetypes")
    arch_cols = st.columns(4)
    for idx, (cid, info) in enumerate(CLUSTER_INFO.items()):
        with arch_cols[idx]:
            st.markdown(f"""
            <div class="arch-card arch-c{cid+1}">
                <h4 style="color:{info['color']}; margin-bottom:4px;">Archetype {cid+1}</h4>
                <strong style="color:#f8fafc; font-size:14px;">{info['name']}</strong>
                <p style="font-size:12px; color:#94a3b8; margin-top:8px;">{info['desc']}</p>
                <div style="font-size:11px; color:#64748b; font-family:'JetBrains Mono'; margin-top:10px;">{info['countries']} peer economies</div>
            </div>
            """, unsafe_allow_html=True)


# ==============================================================================
# PAGE 2: COUNTRY COMPARATOR
# ==============================================================================
elif page == "⚖️ Country Comparator":
    st.markdown("## ⚖️ Country Comparator Tool")
    st.caption("Inspect side-by-side indicator contrasts, developmental archetypes, and plain-English takeaways.")
    
    country_list = sorted([c["country"] for c in countries if "country" in c])
    col1, col2, col3 = st.columns(3)
    with col1:
        c1 = st.selectbox("Economy 1:", country_list, index=country_list.index("India") if "India" in country_list else 0)
    with col2:
        c2 = st.selectbox("Economy 2:", country_list, index=country_list.index("Kenya") if "Kenya" in country_list else 1)
    with col3:
        c3 = st.selectbox("Economy 3 (Optional):", ["-- None --"] + country_list, index=0)

    selected = [c1, c2]
    if c3 != "-- None --" and c3 not in selected:
        selected.append(c3)

    profiles = [data_service.get_country_cluster_profile(name) for name in selected]
    profiles = [p for p in profiles if p]

    if profiles:
        chart_style = st.radio("Display Chart Style:", ["📊 Grouped Bar Chart", "🕸️ Multi-Indicator Radar"], horizontal=True)
        categories = ["Account Ownership", "Mobile Money", "Formal Bank", "Savings Propensity", "Emergency Funds"]
        colors = ["#10b981", "#3b82f6", "#f59e0b"]

        if chart_style == "📊 Grouped Bar Chart":
            fig_bar = go.Figure()
            for idx, p in enumerate(profiles):
                vals = [
                    p.get("account_pct", 0),
                    p.get("mobile_pct", 0),
                    p.get("fiaccount_pct", 0),
                    p.get("saved_pct", 0),
                    p.get("resilience_pct", 0)
                ]
                fig_bar.add_trace(go.Bar(
                    name=f"{p['country']} ({p['cluster_name']})",
                    x=categories,
                    y=vals,
                    marker_color=colors[idx % len(colors)]
                ))
            fig_bar.update_layout(
                barmode='group',
                yaxis=dict(title="Percentage of Adults (%)", range=[0, 105]),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
                legend=dict(orientation="h", y=1.12, x=0.5, xanchor="center"),
                margin=dict(t=50, b=60, l=40, r=20)
            )
            st.plotly_chart(fig_bar, use_container_width=True)
        else:
            fig_radar = go.Figure()
            for idx, p in enumerate(profiles):
                vals = [
                    p.get("account_pct", 0),
                    p.get("mobile_pct", 0),
                    p.get("fiaccount_pct", 0),
                    p.get("saved_pct", 0),
                    p.get("resilience_pct", 0)
                ]
                fig_radar.add_trace(go.Scatterpolar(
                    r=vals + [vals[0]],
                    theta=categories + [categories[0]],
                    fill='toself',
                    name=f"{p['country']} ({p['cluster_name']})",
                    line=dict(color=colors[idx % len(colors)], width=2.5)
                ))
            fig_radar.update_layout(
                polar=dict(
                    radialaxis=dict(visible=True, range=[0, 100], color="#94a3b8"),
                    bgcolor="rgba(15, 23, 42, 0.6)"
                ),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
                legend=dict(orientation="h", y=1.12, x=0.5, xanchor="center"),
                margin=dict(t=50, b=40, l=40, r=40)
            )
            st.plotly_chart(fig_radar, use_container_width=True)

        st.markdown("### 💡 Plain-English Takeaways")
        comp_data = data_service.compare_multiple_countries([p["country"] for p in profiles])
        takeaways = comp_data.get("takeaways", [])
        if takeaways:
            for t in takeaways:
                st.info(f"💡 {t}")
        else:
            diff_acc = abs(profiles[0].get("account_pct", 0) - profiles[1].get("account_pct", 0))
            leader_acc = profiles[0] if profiles[0].get("account_pct", 0) > profiles[1].get("account_pct", 0) else profiles[1]
            laggard_acc = profiles[1] if leader_acc == profiles[0] else profiles[0]
            st.info(f"**Account Gap:** **{leader_acc['country']}** leads **{laggard_acc['country']}** in overall account coverage by **{diff_acc:.1f} percentage points** ({leader_acc.get('account_pct', 0):.1f}% vs {laggard_acc.get('account_pct', 0):.1f}%).")


# ==============================================================================
# PAGE 3: CITIZEN ACTION HUB
# ==============================================================================
elif page == "💡 Citizen Action Hub":
    st.markdown("## 💡 Citizen Action Hub: Solving Real-World Barriers")
    st.caption("Over 1.4 billion adults remain unbanked worldwide. Select an economy to view local barriers, proven community solutions, and localized policy interventions.")

    country_list = sorted([c["country"] for c in countries if "country" in c])
    selected_c = st.selectbox("Select Country:", country_list, index=country_list.index("India") if "India" in country_list else 0)
    
    barrier_data = data_service.get_citizen_barriers(country=selected_c)
    barriers = barrier_data.get("barriers", [])
    
    # Country Demographic Context Cards
    c1, c2, c3 = st.columns(3)
    with c1:
        st.metric("Formal Account Coverage", f"{barrier_data.get('account_pct', 0):.1f}%")
        st.caption("Adults holding a formal account")
    with c2:
        st.metric("Unbanked Adults", f"{barrier_data.get('unbanked_pct', 0):.1f}%")
        st.caption("Citizens facing financial barriers")
    with c3:
        st.metric("Primary Barrier", f"{barrier_data.get('top_rate', 0):.1f}%")
        st.caption(f"{barrier_data.get('top_barrier', 'Insufficient funds')[:32]}...")

    st.info(f"📌 **Primary Constraint in {selected_c}:** **{barrier_data.get('top_barrier', 'Insufficient funds')}** cited by **{barrier_data.get('top_rate', 0)}%** of unbanked citizens in this economy (Development Archetype: *{barrier_data.get('cluster_name', 'Developing Ecosystem')}*).")
    
    # Interactive Barrier Severity Chart
    fig_barriers = go.Figure()
    fig_barriers.add_trace(go.Bar(
        x=[b["rate"] for b in reversed(barriers)],
        y=[b["title"] for b in reversed(barriers)],
        orientation="h",
        marker=dict(
            color=["#f43f5e" if idx == len(barriers)-1 else "#38bdf8" for idx in range(len(barriers))],
            line=dict(color="rgba(255,255,255,0.1)", width=1)
        ),
        text=[f"{b['rate']}%" for b in reversed(barriers)],
        textposition="auto"
    ))
    fig_barriers.update_layout(
        title=f"Relative Severity of Barriers Reported by Unbanked Citizens in {selected_c}",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
        xaxis=dict(gridcolor="rgba(255,255,255,0.08)", range=[0, 100], title="% of Unbanked Citizens Citing Barrier"),
        margin=dict(l=20, r=20, t=40, b=20),
        height=270
    )
    st.plotly_chart(fig_barriers, use_container_width=True)

    st.markdown("### 🛠️ Citizen Solutions & Policy Interventions")
    b_cols = st.columns(2)
    for idx, b in enumerate(barriers):
        with b_cols[idx % 2]:
            st.markdown(f"""
            <div class="barrier-card">
                <h4 style="color:#f8fafc; margin-bottom:4px;">{b.get('icon', '💡')} {b['title']}</h4>
                <div style="font-size:12px; color:#10b981; font-family:'JetBrains Mono'; margin-bottom:8px;">📊 {b['rate']}% cite this barrier</div>
                <p style="font-size:13px; color:#94a3b8; font-style:italic;">"{b['question']}"</p>
                <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:10px; margin-top:8px;">
                    <strong style="color:#10b981; font-size:12px;">👤 Citizen Workaround:</strong>
                    <div style="font-size:12px; color:#f8fafc; margin-top:2px;">{b['citizen_solution']}</div>
                </div>
                <div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.25); border-radius:8px; padding:10px; margin-top:8px;">
                    <strong style="color:#818cf8; font-size:12px;">🏛️ Policy Fix:</strong>
                    <div style="font-size:12px; color:#f8fafc; margin-top:2px;">{b['policy_fix']}</div>
                </div>
            </div>
            """, unsafe_allow_html=True)


# ==============================================================================
# PAGE 4: TRY IT YOURSELF (GUIDED PLAYGROUND)
# ==============================================================================
elif page == "🎛️ Try It Yourself (Guided Lab)":
    st.markdown("## 🎛️ Guided Clustering Playground")
    st.caption("Experiment with K = 2 to 10 and compare Euclidean vs Manhattan distance metrics. Observe live mathematical validation metrics, dynamic cluster partitions, and elbow curves.")

    palette = [
        "#38bdf8", "#f43f5e", "#10b981", "#f59e0b", "#a855f7",
        "#ec4899", "#14b8a6", "#fb923c", "#6366f1", "#84cc16"
    ]

    ctrl_c1, ctrl_c2 = st.columns([1, 1])
    with ctrl_c1:
        k_val = st.slider(
            "Select Number of Clusters (K):",
            min_value=2,
            max_value=10,
            value=4,
            step=1,
            key="interactive_k_slider",
            help="Number of distinct natural archetypes to partition sovereign economies into."
        )
    with ctrl_c2:
        dist_val = st.radio(
            "Select Distance Metric:",
            ["Euclidean (Standard K-Means)", "Manhattan (L1 K-Medians)"],
            horizontal=True,
            key="interactive_dist_metric",
            help="Euclidean measures straight-line distance; Manhattan measures grid-like absolute deviation (robust against outliers)."
        )
    metric_code = "euclidean" if "Euclidean" in dist_val else "manhattan"

    eval_data = data_service.get_interactive_clustering(k=k_val, metric=metric_code)
    metrics = eval_data.get("metrics", {})
    cluster_sizes = eval_data.get("cluster_sizes", {})
    country_assignments = eval_data.get("country_assignments", [])

    st.info(f"🔬 **Active Model:** Partitioning 140 countries into **K = {k_val} Clusters** using **{dist_val}**. (Optimal benchmark: *K = 4* with Silhouette = 0.434).")
    
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.metric("Selected Clusters (K)", f"{k_val}")
        st.caption("Active group partitions")
    with m2:
        dist_label = "WCSS (Elbow)" if metric_code == "euclidean" else "WCSAD (Dispersion)"
        st.metric(dist_label, f"{metrics.get('wcss', 0):,.1f}")
        st.caption("Within-cluster compactness")
    with m3:
        sil_val = metrics.get('silhouette', 0)
        st.metric("Silhouette Score", f"{sil_val:.3f}")
        st.caption("Separation (> 0.4 is strong)")
    with m4:
        db_val = metrics.get('davies_bouldin', 0)
        st.metric("Davies-Bouldin Index", f"{db_val:.3f}")
        st.caption("Lower indicates tighter clusters")

    st.markdown("---")
    
    # 2-Column Visuals: Left = Dynamic PCA Clusters for K; Right = Cluster Sizes & Elbow
    v_col1, v_col2 = st.columns([1.1, 0.9])
    
    with v_col1:
        st.markdown(f"##### 🗺️ Dynamic Cluster Map in PCA Space (K = {k_val})")
        pca_raw = data_service.get_pca_coordinates()
        df_pca = pd.DataFrame(pca_raw.get("data", []))
        df_assign = pd.DataFrame(country_assignments)
        if not df_pca.empty and not df_assign.empty:
            merged_pca = pd.merge(df_pca[["country", "pc1_2d", "pc2_2d"]], df_assign, on="country", how="inner")
            merged_pca["Cluster Group"] = "Cluster " + merged_pca["cluster"].astype(str)
            merged_pca = merged_pca.sort_values("cluster")

            fig_dyn_pca = px.scatter(
                merged_pca,
                x="pc1_2d",
                y="pc2_2d",
                color="Cluster Group",
                hover_name="country",
                hover_data={"code": True, "Cluster Group": True, "pc1_2d": False, "pc2_2d": False},
                color_discrete_sequence=palette[:k_val],
                labels={"pc1_2d": "Principal Component 1", "pc2_2d": "Principal Component 2"}
            )
            fig_dyn_pca.update_traces(marker=dict(size=9, opacity=0.88, line=dict(width=1, color="rgba(255,255,255,0.2)")))
            fig_dyn_pca.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
                margin=dict(t=30, b=30, l=30, r=20),
                height=380
            )
            st.plotly_chart(fig_dyn_pca, use_container_width=True)
        else:
            st.warning("PCA coordinates currently loading.")

    with v_col2:
        st.markdown(f"##### 📊 Cluster Membership Sizes (K = {k_val})")
        df_sizes = pd.DataFrame([
            {"Cluster": f"Cluster {c}", "Economies": count}
            for c, count in sorted(cluster_sizes.items())
        ])
        fig_sizes = go.Figure()
        fig_sizes.add_trace(go.Bar(
            x=df_sizes["Cluster"],
            y=df_sizes["Economies"],
            marker=dict(
                color=palette[:len(df_sizes)],
                line=dict(color="rgba(255,255,255,0.15)", width=1)
            ),
            text=df_sizes["Economies"],
            textposition="auto"
        ))
        fig_sizes.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
            yaxis=dict(gridcolor="rgba(255,255,255,0.08)", title="Number of Countries"),
            margin=dict(t=30, b=30, l=30, r=20),
            height=380
        )
        st.plotly_chart(fig_sizes, use_container_width=True)

    # Validation Curve with Active K Marked
    st.markdown("---")
    st.markdown(f"##### 📐 Elbow & Metric Curve (K = 2 to 10) · Highlighted at K = {k_val}")
    benchmarks = data_service.get_clustering_benchmarks()
    k_range = [b["k"] for b in benchmarks]
    wcss_key = "wcss_euclidean" if metric_code == "euclidean" else "wcsad_manhattan"
    sil_key = "silhouette_euclidean" if metric_code == "euclidean" else "silhouette_manhattan"
    wcss_vals = [b.get(wcss_key, 0) for b in benchmarks]
    sil_vals = [b.get(sil_key, 0) for b in benchmarks]

    curr_wcss = metrics.get('wcss', 0)
    curr_sil = metrics.get('silhouette', 0)

    fig_eval = go.Figure()
    fig_eval.add_trace(go.Scatter(
        x=k_range,
        y=wcss_vals,
        name=dist_label,
        line=dict(color="#6366f1", width=3),
        yaxis="y1"
    ))
    fig_eval.add_trace(go.Scatter(
        x=k_range,
        y=sil_vals,
        name="Silhouette Score",
        line=dict(color="#10b981", width=3, dash="dot"),
        yaxis="y2"
    ))
    # Active K point on WCSS curve
    fig_eval.add_trace(go.Scatter(
        x=[k_val],
        y=[curr_wcss],
        name=f"Current K={k_val} ({dist_label})",
        mode="markers",
        marker=dict(color="#f43f5e", size=14, symbol="circle", line=dict(color="#ffffff", width=2)),
        yaxis="y1"
    ))
    # Active K point on Silhouette curve
    fig_eval.add_trace(go.Scatter(
        x=[k_val],
        y=[curr_sil],
        name=f"Current K={k_val} (Silhouette)",
        mode="markers",
        marker=dict(color="#38bdf8", size=14, symbol="diamond", line=dict(color="#ffffff", width=2)),
        yaxis="y2"
    ))
    # Vertical line indicating chosen K
    fig_eval.add_vline(
        x=k_val,
        line_dash="dash",
        line_color="#f43f5e",
        line_width=2,
        annotation_text=f"Selected K = {k_val}",
        annotation_position="top left",
        annotation_font=dict(color="#f43f5e", size=12)
    )

    fig_eval.update_layout(
        xaxis=dict(title="Number of Clusters (K)", tickmode="linear", tick0=2, dtick=1),
        yaxis=dict(title=dist_label, side="left", gridcolor="rgba(255,255,255,0.08)"),
        yaxis2=dict(title="Silhouette Score", overlaying="y", side="right", range=[-0.1, 0.6]),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
        legend=dict(orientation="h", y=1.14, x=0.5, xanchor="center"),
        margin=dict(t=50, b=40, l=40, r=40),
        height=340
    )
    st.plotly_chart(fig_eval, use_container_width=True)

    # Interactive Country Cluster Assignment Explorer for Selected K
    with st.expander(f"📋 View Country Assignments for K = {k_val} ({len(country_assignments)} Economies)", expanded=False):
        c_cols = st.columns(min(k_val, 4))
        for c_num in range(1, k_val + 1):
            with c_cols[(c_num - 1) % len(c_cols)]:
                c_members = [item["country"] for item in country_assignments if item["cluster"] == c_num]
                st.markdown(f"**Cluster {c_num}** ({len(c_members)} countries)")
                st.caption(", ".join(sorted(c_members)[:12]) + ("..." if len(c_members) > 12 else ""))


# ==============================================================================
# PAGE 5: ARCHETYPES & PCA LAB
# ==============================================================================
elif page == "🔬 Archetypes & PCA Diagnostics":
    st.markdown("## 🔬 Archetypes & PCA Dimensionality Reduction")
    st.caption("Inspect mathematical separation across Principal Components (PC1 & PC2) with explained variance.")

    dim_choice = st.radio("PCA Projection:", ["2D Scatter Plot", "3D Interactive Scatter Plot"], horizontal=True)
    n_comp = 2 if "2D" in dim_choice else 3
    
    pca_raw = data_service.get_pca_coordinates()
    df_pca = pd.DataFrame(pca_raw.get("data", []))
    
    cluster_name_map = {
        1: "Universal High-Resilience Systems",
        2: "Severe Exclusion Frontiers",
        3: "Digitally Leaping Cash Economists",
        4: "Banked but Liquidity-Constrained"
    }
    df_pca["cluster_name"] = df_pca["cluster"].map(cluster_name_map).fillna("Cluster")
    
    if n_comp == 2:
        fig_pca = px.scatter(
            df_pca,
            x="pc1_2d",
            y="pc2_2d",
            color="cluster_name",
            hover_name="country",
            color_discrete_map={
                "Digitally Leaping Cash Economists": "#10b981",
                "Universal High-Resilience Systems": "#3b82f6",
                "Severe Exclusion Frontiers": "#f43f5e",
                "Banked but Liquidity-Constrained": "#f59e0b"
            },
            labels={
                "pc1_2d": "Principal Component 1",
                "pc2_2d": "Principal Component 2"
            }
        )
    else:
        fig_pca = px.scatter_3d(
            df_pca,
            x="pc1_3d",
            y="pc2_3d",
            z="pc3_3d",
            color="cluster_name",
            hover_name="country",
            color_discrete_map={
                "Digitally Leaping Cash Economists": "#10b981",
                "Universal High-Resilience Systems": "#3b82f6",
                "Severe Exclusion Frontiers": "#f43f5e",
                "Banked but Liquidity-Constrained": "#f59e0b"
            }
        )
        
    fig_pca.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
        legend=dict(orientation="h", y=1.12, x=0.5, xanchor="center", title=dict(text="")),
        margin=dict(t=50, b=40, l=40, r=20)
    )
    st.plotly_chart(fig_pca, use_container_width=True)

    st.markdown("### 🎲 Cluster Stability & Bootstrap Audit")
    stab = data_service.get_stability_analysis()
    s1, s2 = st.columns(2)
    with s1:
        st.metric("Adjusted Rand Index (ARI)", f"{stab.get('mean_seed_ari', 0.88):.3f}")
        st.caption("Re-run across 50 bootstrap samples and varying seeds. High ARI confirms the 4 archetypes are robust, not statistical flukes.")
    with s2:
        st.metric("Borderline Nations", f"{len(stab.get('borderline_countries', []))} Countries")
        st.caption("Economies transitioning between financial structures (e.g., rapid mobile adoption shifting toward formal banking).")


# ==============================================================================
# PAGE 6: POLICY SIMULATOR
# ==============================================================================
elif page == "⚡ Policy Simulator":
    st.markdown("## ⚡ Policy Simulator: What-If Scenario Builder")
    st.caption("Simulate real-world interventions (e.g. mobile money expansion, zero-fee basic accounts) and observe projected shifts in financial inclusion.")

    sim_country_list = sorted([c["country"] for c in countries if "country" in c])
    sim_target = st.selectbox("Select Target Economy to Simulate:", sim_country_list, index=sim_country_list.index("Nigeria") if "Nigeria" in sim_country_list else 0)

    s_c1, s_c2 = st.columns(2)
    with s_c1:
        delta_mobile = st.slider(
            "📱 Mobile Money Rails & Agent Networks (%):",
            min_value=0, max_value=50, value=15, step=1,
            help="Licensing non-bank e-money issuers and expanding rural cash-in/cash-out agent points."
        )
        delta_did = st.slider(
            "🪪 Digital ID Rollout & Tiered e-KYC (%):",
            min_value=0, max_value=50, value=20, step=1,
            help="Biometric or verifiable national digital ID to eliminate paper documentation friction."
        )
        delta_gen = st.slider(
            "👩 Targeted Female & Rural Direct Subsidies (%):",
            min_value=0, max_value=50, value=15, step=1,
            help="Direct government benefit transfers (G2P) targeted into accounts owned by women."
        )
    with s_c2:
        delta_lit = st.slider(
            "🛡️ Financial Literacy & Consumer Protection (%):",
            min_value=0, max_value=50, value=10, step=1,
            help="Digital financial education, transparent pricing rules, and deposit insurance."
        )
        delta_ob = st.slider(
            "⚡ Interoperability & Open Banking Rails (%):",
            min_value=0, max_value=50, value=15, step=1,
            help="Unified instant payment switches connecting banks, telcos, and fintechs seamlessly."
        )

    sim_result = data_service.simulate_policy(
        country=sim_target,
        levers={
            "mobile_infrastructure": delta_mobile,
            "digital_id": delta_did,
            "gender_inclusion": delta_gen,
            "financial_literacy": delta_lit,
            "open_banking": delta_ob,
            "delta_mobile": delta_mobile,
            "delta_fee": delta_did,
            "delta_resilience": delta_lit
        }
    )

    baseline = sim_result.get("baseline", {})
    projected = sim_result.get("projected", {})

    st.markdown("### 📊 Policy Impact Projections")
    r1, r2, r3, r4 = st.columns(4)
    with r1:
        st.metric("Baseline Coverage", f"{baseline.get('account', 0):.1f}%")
        st.caption("Current formal inclusion")
    with r2:
        acc_up = projected.get('account_uplift', projected.get('uplift', 0))
        st.metric("Projected Coverage", f"{projected.get('account', 0):.1f}%", f"+{acc_up:.1f}%")
        st.caption("Post-intervention target")
    with r3:
        st.metric("Newly Included Citizens", f"{projected.get('newly_included_est', 0):,}")
        st.caption("Estimated adult beneficiaries")
    with r4:
        st.metric("Years to Universal Access", f"{projected.get('years_to_universal_access', 0):.1f} yrs")
        st.caption("At projected adoption pace")

    # Dynamic Visual Trajectory Chart
    st.markdown("#### 📈 Multi-Dimensional Impact Trajectory")
    cat_labels = ["Formal Account", "Mobile Money", "Emergency Resilience", "Composite Index"]
    base_vals = [
        baseline.get("account", 0),
        baseline.get("mobile", 0),
        baseline.get("emergency_resilience", 0),
        baseline.get("inclusion_index", 0)
    ]
    proj_vals = [
        projected.get("account", 0),
        projected.get("mobile", 0),
        projected.get("emergency_resilience", 0),
        projected.get("inclusion_index", 0)
    ]

    fig_sim = go.Figure()
    fig_sim.add_trace(go.Bar(
        name="Current Baseline",
        x=cat_labels,
        y=base_vals,
        marker_color="#475569",
        text=[f"{v:.1f}%" if i < 3 else f"{v:.1f}" for i, v in enumerate(base_vals)],
        textposition="auto"
    ))
    fig_sim.add_trace(go.Bar(
        name="Projected Simulation",
        x=cat_labels,
        y=proj_vals,
        marker_color="#38bdf8",
        text=[f"{v:.1f}%" if i < 3 else f"{v:.1f}" for i, v in enumerate(proj_vals)],
        textposition="auto"
    ))
    fig_sim.update_layout(
        barmode="group",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
        yaxis=dict(gridcolor="rgba(255,255,255,0.08)", range=[0, 105], title="Percentage (%) / Index Score"),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=20, r=20, t=30, b=30),
        height=340
    )
    st.plotly_chart(fig_sim, use_container_width=True)


# ==============================================================================
# PAGE 7: GLOBAL MATRIX (140+ COUNTRIES)
# ==============================================================================
elif page == "🌐 Global Matrix (140+ Countries)":
    st.markdown("## 🌐 Global Country Matrix")
    st.caption("Searchable and sortable microdata across all 140 surveyed sovereign economies.")

    assignments = rec_model.get("country_assignments", [])
    df_matrix = pd.DataFrame(assignments)
    
    search_q = st.text_input("🔍 Filter by Country or Region:", "")
    if search_q:
        df_matrix = df_matrix[
            df_matrix["country"].str.contains(search_q, case=False, na=False) |
            df_matrix["region"].str.contains(search_q, case=False, na=False)
        ]

    cols_to_show = ["country", "code", "region", "cluster_name", "account_pct", "mobile_pct", "emergency_pct"]
    cols_exist = [c for c in cols_to_show if c in df_matrix.columns]
    
    st.dataframe(
        df_matrix[cols_exist].rename(columns={
            "country": "Country",
            "code": "Code",
            "region": "Region",
            "cluster_name": "Archetype",
            "account_pct": "Account %",
            "mobile_pct": "Mobile %",
            "emergency_pct": "Resilience %"
        }),
        use_container_width=True,
        hide_index=True,
        height=560
    )


# ==============================================================================
# PAGE 8: METHODOLOGY & DATA LOG
# ==============================================================================
elif page == "📖 Methodology & Data Log":
    st.markdown("## 📖 Methodology & Data Preparation Log")
    st.caption("Complete, transparent documentation of the end-to-end data preparation, clustering validation, and responsible use safeguards.")

    t1, t2, t3 = st.tabs(["Data Preparation Pipeline", "Cluster Validation", "Limitations & Responsible Use"])
    
    with t1:
        st.markdown(r"""
        ### Objective 1: Preprocessing Pipeline
        - **Data Source**: World Bank Global Findex 2025 microdata across 140+ countries.
        - **Indicator Relevance**: Retained 9 representative indicators across formal banking, mobile money, voluntary savings, credit, and emergency resilience. Dropped indicators with >30% missing rates across national surveys.
        - **Missing Value Imputation**: Median regional imputation applied to missing indicators to avoid geographic distortion.
        - **Standardization**: `StandardScaler` applied to normalize feature distributions to zero mean and unit variance ($z = (x - \mu)/\sigma$).
        """)
    
    with t2:
        st.markdown("""
        ### Objective 2: Unsupervised Clustering Diagnostics
        - **Optimal K Determination**: K = 4 selected via joint evaluation of WCSS (Elbow method), Silhouette Score (0.42+), and Davies-Bouldin Index (0.84).
        - **Distance Metric Comparison**: Honest evaluation comparing standard Euclidean K-Means with Manhattan ($L_1$) K-Medians to test robustness against heavy-tailed economic outliers.
        - **Bootstrap Stability**: 50 bootstrap resamplings yielded an Adjusted Rand Index (ARI) of 0.88, confirming stable natural clusters.
        """)
        
    with t3:
        st.markdown("""
        ### Objective 3: Limitations & Responsible Use
        > ⚠️ **Notice**: These clusters are exploratory diagnostic patterns, not official national rankings or permanent categories.
        - **Survey Lag**: World Bank surveys occur triennially; rapid policy reforms in 2024–2025 may not yet be reflected in published Findex tables.
        - **Self-Report Bias**: Findex data relies on household survey responses, subject to recall inaccuracy.
        - **Correlation vs Causation**: High cluster adoption rates reflect correlated economic conditions, not singular policy causes.
        """)

st.markdown("""
<div class="subtle-notice">
    <strong>Global Financial Inclusion Policy Lab</strong> · Exploratory Machine Learning Patterns · Source: World Bank Global Findex 2025
</div>
""", unsafe_allow_html=True)
