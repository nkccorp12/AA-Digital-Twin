# Feature: Node Value Calculator System

## Übersicht
Ein System zur Berechnung und Anzeige von Node-Werten basierend auf Link-Gewichtungen, zusätzlich zu den bestehenden Mock-Werten.

## Aktuelle Datenstruktur

### Nodes (Mock-Daten)
```json
{
  "id": "B2",
  "type": "boundary", 
  "label": "Risk Management",
  "stressLevel": 1.4  // Hauptwert (Mock, bleibt unverändert)
}
```

### Links (mit Gewichtungen)
```json
{
  "source": "E3",
  "target": "B2", 
  "weight": 0.68,
  "influenceType": "market_risk"
}
```

## Neue Funktionalität

### 1. NodeCalculator Komponente
**Datei**: `src/components/NodeCalculator.js`

**Aufgaben**:
- Berechnet `incomingValue` (Summe aller eingehenden Link-Gewichte)
- Berechnet `outgoingValue` (Summe aller ausgehenden Link-Gewichte)  
- Behält `mainValue` (aktueller stressLevel) unverändert

**Beispiel-Berechnung**:
```js
// Node "B2" hat:
// Incoming: E3→B2 (0.68) + E4→B2 (0.52) = 1.2
// Outgoing: B2→S1 (0.79) + B2→S2 (0.73) = 1.52

node: {
  mainValue: 1.4,        // Original stressLevel (Mock)
  incomingValue: 1.2,    // Berechnet aus eingehenden Links
  outgoingValue: 1.52    // Berechnet aus ausgehenden Links
}
```

### 2. UI Controls (NodeLegend Erweiterung)

**Button 1**: "Values" 
- Zeigt/verbirgt Hauptwerte (aktuelle stressLevel)
- Immer verfügbar

**Button 2**: "In/Out"
- Zeigt/verbirgt incoming/outgoing Werte unter Hauptwerten  
- **UX-Regel**: Nur klickbar wenn `showBidirectional = false` (Standard-View)
- **Auto-Disable**: Wenn Bidirektional-Modus aktiviert wird → automatisch deaktivieren

### 3. Display Logic (getNodeDisplayValue erweitern)

**Mode 1**: Nur Hauptwerte (Standard)
```
1.4
```

**Mode 2**: Hauptwerte + In/Out (nur im Standard-Modus)
```
1.4
↓1.2 ↑1.5
```

### 4. UX-Interaktionen

**Zustand-Abhängigkeiten**:
- `showBidirectional = false` → In/Out Button verfügbar
- `showBidirectional = true` → In/Out Button deaktiviert + In/Out-Anzeige aus

**Auto-Deaktivierung**:
- Wenn Benutzer Bidirektional-Modus einschaltet
- In/Out-Modus automatisch ausschalten
- Button visuell deaktivieren (grau/disabled)

## Implementation Details

### NodeCalculator.js
```js
export const calculateNodeValues = (nodes, links) => {
  return nodes.map(node => {
    const incoming = links
      .filter(link => link.target === node.id)
      .reduce((sum, link) => sum + link.weight, 0);
    
    const outgoing = links
      .filter(link => link.source === node.id) 
      .reduce((sum, link) => sum + link.weight, 0);
    
    return {
      ...node,
      mainValue: node.stressLevel, // Keep original mock value
      incomingValue: incoming,
      outgoingValue: outgoing
    };
  });
};
```

### State Management (App.jsx)
```js
const [showMainValues, setShowMainValues] = useState(true);
const [showInOutValues, setShowInOutValues] = useState(false);

// Auto-disable In/Out when bidirectional is enabled
useEffect(() => {
  if (showBidirectional && showInOutValues) {
    setShowInOutValues(false);
  }
}, [showBidirectional]);
```

### UI Button States
```js
// In/Out button only enabled in standard mode
const inOutButtonEnabled = !showBidirectional;
const inOutButtonStyle = {
  opacity: inOutButtonEnabled ? 1 : 0.5,
  cursor: inOutButtonEnabled ? 'pointer' : 'not-allowed'
};
```

## Integration Points

1. **App.jsx**: State management für neue Modi
2. **NodeLegend.jsx**: Neue Toggle-Buttons  
3. **getNodeDisplayValue()**: Erweiterte Display-Logic
4. **Graph2D/3D**: Updated Node-Rendering für mehrzeilige Werte
5. **NodeCalculator.js**: Neue Berechnungs-Komponente

## Datenfluß

```
Mock Data (stressLevel) → NodeCalculator → Enhanced Nodes
                     ↓
Links (weights) → calculateNodeValues() → {mainValue, incomingValue, outgoingValue}  
                     ↓
UI Controls (showMainValues, showInOutValues) → getNodeDisplayValue() → Node Display
```

## Status
- **Planned**: Feature dokumentiert und bereit für Implementation
- **Dependencies**: Bestehende Link-Struktur mit weights, toBidirectional() Funktion
- **Priority**: Medium - Erweitert bestehende Value-Anzeige ohne Breaking Changes