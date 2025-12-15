# MISP Integration & Usage Plan for InSoctor Environment

## 1. Overview: What is MISP?
**MISP (Malware Information Sharing Platform)** is an open-source Threat Intelligence Platform (TIP). It allows you to store, share, and correlate Indicators of Compromise (IOCs) like malicious IPs, domains, hashes, and URLs.

In your **InSoctor** environment (Wazuh + IRIS + Custom UI), MISP acts as the **Brain of Threat Intelligence**.

## 2. Integration Architecture

```mermaid
graph TD
    MISP[MISP (Threat Intel)]
    Wazuh[Wazuh (Detection)]
    IRIS[IRIS (Incident Response)]
    InSoctor[InSoctor UI (Dashboard)]
    External[External Feeds (AlienVault, etc.)]

    External -->|Feeds| MISP
    MISP -->|IOCs for Detection| Wazuh
    Wazuh -->|Alerts on IOC Match| InSoctor
    Wazuh -->|Alerts| IRIS
    IRIS <-->|Enrichment & Sharing| MISP
    InSoctor <-->|Query & Visualize| MISP
```

## 3. Detailed Integration Strategies

### A. Wazuh + MISP (Automated Detection)
**Goal**: Automatically detect when a file or connection matches a known malicious indicator from MISP.

**How to Implement**:
1.  **Wazuh Integrator Module**: Configure Wazuh to query MISP API.
2.  **Workflow**:
    *   Wazuh agent scans a file (FIM) or monitors network logs.
    *   Wazuh Manager sends the hash/IP to a custom Python script (`custom-misp.py`).
    *   Script queries MISP: "Is this hash malicious?"
    *   If **Yes**: Wazuh generates a **Critical Alert**.
    *   **InSoctor** displays this as a "Threat Intel Match".

### B. IRIS + MISP (Incident Response & Enrichment)
**Goal**: Help analysts investigate cases by checking if evidence is known-bad, and share new findings back to the community.

**How to Implement**:
1.  **IRIS Modules**: Enable the `MISP` module in IRIS.
2.  **Workflow**:
    *   Analyst opens a Case in IRIS (from InSoctor/Wazuh).
    *   Analyst adds an "Observable" (e.g., suspicious IP).
    *   IRIS automatically queries MISP: "Do we know this IP?"
    *   **Enrichment**: MISP returns context (e.g., "Linked to APT29").
    *   **Sharing**: If the analyst confirms it's malicious, they can "Push to MISP" to update the database.

### C. InSoctor + MISP (Unified Visualization)
**Goal**: Give the SOC team a view of the Threat Landscape directly in the InSoctor dashboard.

**Proposed Features for InSoctor**:
1.  **Threat Intel Dashboard**:
    *   "Latest IOCs" feed.
    *   "Top Threat Groups" active in your sector.
2.  **Global Search**:
    *   Search bar in InSoctor that queries Wazuh (past events) AND MISP (intelligence) simultaneously.
    *   *Example*: "Search IP 1.2.3.4" -> Shows if it was seen in your network (Wazuh) AND if it's a known bad actor (MISP).

## 4. Implementation Roadmap

### Phase 1: Connection & Feeds (Day 1-2)
- [ ] Ensure MISP is running and accessible.
- [ ] Configure **Feeds** in MISP (enable default feeds like CIRCL, AlienVault).
- [ ] Generate API Keys for Wazuh and InSoctor.

### Phase 2: Wazuh Detection (Day 3-4)
- [ ] Install `misp` python library on Wazuh Manager.
- [ ] Deploy the Wazuh-MISP integration script.
- [ ] Configure `ossec.conf` to enable the integration.
- [ ] Test by simulating a malicious file access (using a safe EICAR-like test hash).

### Phase 3: InSoctor UI Integration (Day 5-7)
- [ ] Create a new `ThreatIntelService` in InSoctor backend.
- [ ] Add a "Threat Intelligence" tab in the frontend.
- [ ] Display "Recent Events" from MISP.

### Phase 4: IRIS Integration (Day 8)
- [ ] Configure MISP API key in IRIS.
- [ ] Test the "Enrich" and "Push" workflows.

## 5. Value Proposition
*   **Proactive**: You stop threats *before* they cause damage because you know the bad IPs/Hashes.
*   **Context**: Alerts aren't just "Suspicious file" anymore; they become "File linked to Ransomware X".
*   **Community**: You leverage knowledge from the global security community.
