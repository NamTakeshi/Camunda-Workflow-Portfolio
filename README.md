# Camunda Workflow Portfolio

Dieses Repository enthält mehrere vollständig modellierte Geschäftsprozesse,
erstellt mit Camunda BPMN.

Die Workflows zeigen praxisnahe End-to-End-Prozesse mit:
- User Tasks
- Gateways (Entscheidungslogik)
- Subprozessen
- Script Tasks
- External Tasks (z. B. REST APIs (OpenStreetMap & Twitter) und RPA)
- Timer-Events
- Formularintegration

Ziel dieses Repositories ist es, Prozessverständnis, Strukturierung
und Automatisierungskompetenz zu demonstrieren.

---

## Enthaltene Workflows

### 📦 Auftragsprozess
Abbildung der internen Bearbeitung eines Kundenauftrags, von der
Erfassung über Prüfung bis zur Weiterleitung an nachgelagerte Prozesse.

### 🔧 Wertschöpfungsprozess
Planung, Durchführung und Nachbereitung eines technischen Serviceauftrags
inklusive Materialprüfung, Terminfindung und Einsatzsteuerung.

### 🛠 Serviceprozess
Bearbeitung von Kundenfeedback nach einem Einsatz, inklusive Validierung
und automatisierter Übertragung in interne Systeme (RPA-Logik).

### 👩‍💼 Recruitingprozess
Kompletter HR-Recruiting-Workflow:
- Bewerbung erfassen
- Automatische Vorfilterung
- Vollständigkeitsprüfung
- Fachliche Bewertung
- Interviewplanung
- Zu- oder Absage
- Vertragserstellung & Onboarding

---

## Verwendete Technologien
- Camunda Platform 7
- BPMN 2.0
- Embedded Forms
- JavaScript Script Tasks
- External Tasks (REST APIS, Worker-Prinzip)
- RPA Bots mit UIPath
- Timer Events
- Datenobjekte & Datenstores
