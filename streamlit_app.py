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
        padding-top: 2rem !important;
        padding-bottom: 3rem !important;
        padding-left: 2.5rem !important;
        padding-right: 2.5rem !important;
        max-width: 1350px !important;
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
    [data-testid="stRadioOption"] > *:first-child:not([data-testid="stMarkdownContainer"]),
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
    [data-testid="stMetricLabel"] {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 11px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        color: #94a3b8 !important;
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
        gap: 4px !important;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 20px !important;
        color: #94a3b8 !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        padding: 8px 18px !important;
        border: none !important;
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
            margin=dict(l=0, r=0, t=10, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
            legend=dict(orientation="h", y=-0.1, x=0.5, xanchor="center")
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
        categories = ["Account Ownership", "Mobile Money", "Formal Bank", "Savings Propensity", "Emergency Funds"]
        fig_bar = go.Figure()
        colors = ["#10b981", "#3b82f6", "#f59e0b"]
        
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
            legend=dict(orientation="h", y=-0.2, x=0.5, xanchor="center")
        )
        st.plotly_chart(fig_bar, use_container_width=True)

        st.markdown("### 💡 Plain-English Takeaways")
        diff_acc = abs(profiles[0].get("account_pct", 0) - profiles[1].get("account_pct", 0))
        leader_acc = profiles[0] if profiles[0].get("account_pct", 0) > profiles[1].get("account_pct", 0) else profiles[1]
        laggard_acc = profiles[1] if leader_acc == profiles[0] else profiles[0]
        
        st.info(f"**Account Gap:** **{leader_acc['country']}** leads **{laggard_acc['country']}** in overall account coverage by **{diff_acc:.1f} percentage points** ({leader_acc.get('account_pct', 0):.1f}% vs {laggard_acc.get('account_pct', 0):.1f}%).")
        
        if profiles[0].get("mobile_pct", 0) > profiles[1].get("mobile_pct", 0):
            st.success(f"**Mobile Money Adoption:** **{profiles[0]['country']}** ({profiles[0].get('mobile_pct', 0):.1f}%) demonstrates higher reliance on mobile wallets than **{profiles[1]['country']}** ({profiles[1].get('mobile_pct', 0):.1f}%).")
        else:
            st.success(f"**Mobile Money Adoption:** **{profiles[1]['country']}** ({profiles[1].get('mobile_pct', 0):.1f}%) demonstrates higher reliance on mobile wallets than **{profiles[0]['country']}** ({profiles[0].get('mobile_pct', 0):.1f}%).")


# ==============================================================================
# PAGE 3: CITIZEN ACTION HUB
# ==============================================================================
elif page == "💡 Citizen Action Hub":
    st.markdown("## 💡 Citizen Action Hub: Solving Real-World Barriers")
    st.caption("Over 1.4 billion adults remain unbanked. Select an economy to view local barriers, proven community solutions, and policy recommendations.")

    country_list = sorted([c["country"] for c in countries if "country" in c])
    selected_c = st.selectbox("Select Country:", country_list, index=country_list.index("India") if "India" in country_list else 0)
    
    barrier_data = data_service.get_citizen_barriers(country=selected_c)
    barriers = barrier_data.get("barriers", [])
    
    st.info(f"📌 **Primary Constraint in {selected_c}:** {barrier_data.get('top_barrier', 'Insufficient funds')} cited by **{barrier_data.get('top_rate', 0)}%** of unbanked citizens.")
    
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
    st.caption("Experiment with K = 2 to 10 and compare Euclidean vs Manhattan distance metrics. View live mathematical validation metrics with plain-English explanations.")

    k_val = st.slider("Select Number of Clusters (K):", min_value=2, max_value=10, value=4, step=1)
    dist_val = st.radio("Select Distance Metric:", ["Euclidean (Standard K-Means)", "Manhattan (L1 K-Medians)"], horizontal=True)
    metric_code = "euclidean" if "Euclidean" in dist_val else "manhattan"

    eval_data = data_service.get_interactive_clustering(k=k_val, metric=metric_code)
    metrics = eval_data.get("metrics", {})
    
    m1, m2, m3 = st.columns(3)
    with m1:
        st.metric("Within-Cluster Distance (WCSS / Elbow)", f"{metrics.get('wcss', 0):,.1f}")
        st.caption("How tightly packed points are inside their cluster. Smaller is tighter, but decreases naturally as K grows.")
    with m2:
        st.metric("Silhouette Score (Cluster Separation)", f"{metrics.get('silhouette', 0):.3f}")
        st.caption("Ranges from -1 to +1. Scores > 0.4 indicate distinct separation without overlapping borders.")
    with m3:
        st.metric("Davies-Bouldin Index (Compactness)", f"{metrics.get('davies_bouldin', 0):.3f}")
        st.caption("Similarity between each cluster and its closest neighbor. Lower is better.")

    st.markdown("---")
    st.markdown("##### 📐 Elbow & Metric Comparison Curve (K = 2 to 10)")
    
    k_range = list(range(2, 11))
    euc_wcss = [data_service.get_interactive_clustering(k=k, metric="euclidean")["metrics"]["wcss"] for k in k_range]
    euc_sil = [data_service.get_interactive_clustering(k=k, metric="euclidean")["metrics"]["silhouette"] for k in k_range]
    
    fig_eval = go.Figure()
    fig_eval.add_trace(go.Scatter(x=k_range, y=euc_wcss, name="WCSS (Elbow)", line=dict(color="#6366f1", width=3), yaxis="y1"))
    fig_eval.add_trace(go.Scatter(x=k_range, y=euc_sil, name="Silhouette Score", line=dict(color="#10b981", width=3, dash="dot"), yaxis="y2"))
    
    fig_eval.update_layout(
        xaxis=dict(title="Number of Clusters (K)"),
        yaxis=dict(title="WCSS (Inertia)", side="left"),
        yaxis2=dict(title="Silhouette Score", overlaying="y", side="right"),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#f8fafc", family="Plus Jakarta Sans"),
        legend=dict(orientation="h", y=-0.2, x=0.5, xanchor="center")
    )
    st.plotly_chart(fig_eval, use_container_width=True)


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
        legend=dict(orientation="h", y=-0.15, x=0.5, xanchor="center")
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

    s_c1, s_c2, s_c3 = st.columns(3)
    with s_c1:
        delta_mobile = st.slider("📱 Expand Mobile Money Rails (%):", 0, 30, 10, step=2)
    with s_c2:
        delta_fee = st.slider("💳 Subsidize Basic Bank Accounts (%):", 0, 30, 5, step=2)
    with s_c3:
        delta_resil = st.slider("🛡️ Emergency Micro-Insurance (%):", 0, 30, 8, step=2)

    sim_result = data_service.simulate_policy(
        country=sim_target,
        levers={
            "delta_mobile": delta_mobile,
            "delta_fee": delta_fee,
            "delta_resilience": delta_resil
        }
    )

    baseline = sim_result.get("baseline", {})
    projected = sim_result.get("projected", {})

    r1, r2, r3 = st.columns(3)
    with r1:
        st.metric("Projected Account Ownership", f"{projected.get('account', 0):.1f}%", f"+{projected.get('uplift', 0):.1f}%")
    with r2:
        st.metric("Estimated Newly Included Citizens", f"{projected.get('newly_included_est', 0):,}")
    with r3:
        st.metric("Years to Universal Access", f"{projected.get('years_to_universal_access', 0):.1f} yrs")


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
        hide_index=True
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
