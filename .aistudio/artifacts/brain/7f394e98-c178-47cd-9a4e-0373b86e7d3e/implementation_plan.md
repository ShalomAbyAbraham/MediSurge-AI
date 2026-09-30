# MediSurge Final Refined 5-Minute Demo Video Script & Guide

## Overview & Structure
This fully polished, comprehensive 5-minute speech and screen walkthrough script incorporates verified login credentials (`kl_dhs` for Kerala State DHS, `national_admin`, `cmo_wayanad`), real-time PHC receipt acknowledgment sync for PHC-042, strict hierarchical approval tiers (Intra-District CMO vs Inter-District State DHS vs Inter-State National Admin), and the conversational Ask Swasthya AI assistant.

---

## Detailed Minute-by-Minute Speech & Walkthrough Script

### Part 1: Introduction & Unified Role-Based Login Architecture (0:00 - 0:50)
* **What to Show on Screen:** 
  * The clean landing page and **Unified Login Screen**. Click the **Admin Command Portal** toggle and log in using **Kerala State DHS Admin** credentials (`kl_dhs` / password: `kl_dhs`) to demonstrate regional multi-district visibility.
* **Speech Script:**
  > "Good judges, every year across India's National Health Mission, 28% of primary health centers face sudden, avoidable stockouts of life-saving emergency drugs due to fragmented supply chains. Today, we present **MediSurge**: an autonomous, AI-powered predictive emergency supply chain mesh built on Google Cloud and Gemini 3.8 Flash. 
  > 
  > Notice right here on our landing page our **Unified Login Screen**. Every stakeholder has a dedicated, secure portal. For instance, if we log into the **Kerala State DHS Admin Portal** using `kl_dhs`, this regional dashboard grants state health officers complete oversight across all districts in Kerala—from Wayanad and Ernakulam to Thiruvananthapuram—allowing them to coordinate regional distribution seamlessly."

---

### Part 2: Admin Command Center, Criticality Detection & Real-Time PHC Receipt Sync (0:50 - 2:20)
* **What to Show on Screen:**
  * Log in as **National Admin** (`national_admin` / `national_admin`).
  * Walk through the **Admin Command Center UI**: Telemetry ticker, interactive map, macro metric cards, and the right-hand **Facility Risk Prioritization Feed**.
  * Select **PHC-042 (Pipraich Sugarbelt PHC, Gorakhpur)** flagged with critical ORS depletion (1.2 days remaining).
  * Open the **Gemini 3.8 Flash Causal XAI Solver** modal. Highlight the causal breakdown and the **3 Mitigation Options** (Lateral Transfer from Bansgaon CHC, Buffer Stock Rationing, Direct Vendor Procurement).
  * Select **Lateral Redistribution** and click **"Deploy Emergency Resupply Corridor"**.
  * *Real-Time Sync Point:* Instantly switch tab or log in to the **PHC-042 Frontline Portal** (`phc-042` / `phc-042`) to show the live inventory updating in real time and the local nurse clicking **"Acknowledge & Confirm Receipt"**.
* **Speech Script:**
  > "Let's examine how our macro admin system handles critical alerts. Logging into the **National Admin Command Center**, our risk feed flags an imminent crisis at **PHC-042 Pipraich Sugarbelt** in Gorakhpur—facing critical ORS stock depletion with only 1.2 days remaining. **Gemini 3.8 Flash** performs instant Causal XAI analysis, correlating weather floods and OPD footfall spikes. 
  > 
  > MediSurge provides administrators with **three clear mitigation options**: Lateral Transfer from a neighboring warehouse, Buffer Stock Rationing, or Direct Vendor Procurement. We select Lateral Redistribution and deploy the resupply corridor. 
  > 
  > Watch what happens next in real time: switching instantly to the **PHC-042 Frontline Portal**, the local nurse sees the incoming shipment update live on her dashboard. She clicks **'Acknowledge & Confirm Receipt'**, immediately restocking the village dispensary with zero latency."

---

### Part 3: Frontline PHC Workstation & Grassroots Emergency Outbreak (2:20 - 3:45)
* **What to Show on Screen:**
  * Log into a **different PHC** (e.g., `phc-028` Meppadi PHC in Wayanad, Kerala).
  * Tour the **PHC Frontline UI**: Local dispensary log, daily patient footfall tracker, and buffer threshold indicators.
  * Simulate a sudden grassroots emergency outbreak: Click **"Raise Emergency Outbreak Requisition"**, select an urgent batch of critical medication, and submit.
* **Speech Script:**
  > "Now, let's transition from administrative intervention to grassroots execution by logging into the **Frontline PHC Workstation** for a completely different facility—**PHC-028 Meppadi Clinic** in Wayanad, Kerala (Login: `phc-028`). 
  > 
  > The PHC UI is engineered specifically for grassroots health workers to track local dispensary inventory and daily patient footfall. Suppose an unexpected emergency outbreak occurs here—such as an acute vector-borne infection spike. The local clinician doesn't wait weeks for offline paperwork. They simply click **'Raise Emergency Outbreak Requisition'** right from their mobile workstation, specify the urgent batch requirement, and submit instantly."

---

### Part 4: Hierarchical Approval Chain & Jurisdictional Routing (3:45 - 4:30)
* **What to Show on Screen:**
  * Explain and show the **Hierarchical Approval Chain**:
    * **Intra-District Supply:** Approved directly by the District CMO (`cmo_wayanad`).
    * **Inter-District Supply:** Requires State DHS approval (`kl_dhs` Kerala State DHS portal).
    * **Inter-State Supply / National Outbreak:** Requires National Admin approval (`national_admin`).
  * Open the respective approval queue, review Gemini's predictive validation, and click **"Approve & Authorize Dispatch"**.
* **Speech Script:**
  > "Once raised, the requisition enters MediSurge's strict **hierarchical approval chain**: 
  > - **Intra-district** supply requests are approved directly by the **District CMO** (`cmo_wayanad`). 
  > - **Inter-district** supply transfers require **State DHS approval** (`kl_dhs` in our Kerala state portal). 
  > - And major **inter-state** crisis outbreaks automatically escalate for **National Admin approval** (`national_admin`). 
  > 
  > Reviewing the request in our regional approval queue, the health officer clicks **'Approve & Authorize Dispatch'**, locking in the supply chain corridor."

---

### Part 5: Ask Swasthya AI Assistant & Conclusion (4:30 - 5:00)
* **What to Show on Screen:**
  * Open the **Ask Swasthya AI** conversational assistant tab. Type or show a natural language query like *"What is the current stock status of ORS across Kerala districts?"* and review the instant AI response.
  * Show architecture summary and click the bottom-right **Reset** button.
* **Speech Script:**
  > "To wrap up, health officers can also query our conversational **Ask Swasthya AI** assistant in natural language anytime to instantly pull real-time inventory statuses, outbreak predictions, and district reports. Powered by Google Cloud Vertex AI, BigQuery, and Cloud Run with strict DISHA compliance, MediSurge transforms emergency health logistics from reactive firefighting into proactive, autonomous resilience. Thank you!"
