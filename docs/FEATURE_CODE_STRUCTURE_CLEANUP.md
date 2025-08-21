# Feature: Code-Struktur Aufräumen und Organisieren

## Status
🔄 **Feature-Idee** - Zur späteren Implementierung

## Problem
Die aktuelle Code-Struktur ist inkonsistent und enthält unbenutzte Dateien:

- `Graph3D.jsx` liegt in `src/` statt in `src/components/`
- `Graph2D.jsx` liegt bereits korrekt in `src/components/`
- Unbenutzte Index-Dateien existieren:
  - `src/graph2d/index.jsx` (wird nicht importiert)
  - `src/graph3d/index.jsx` (wird nicht importiert)

## Aktuelle Import-Struktur
```javascript
// App.jsx
import Graph2D from './components/Graph2D.jsx';  // ✅ konsistent
import Graph3D from './Graph3D.jsx';             // ❌ inkonsistent

// GraphContainer.jsx
import Graph2D from './Graph2D.jsx';             // ✅ korrekt
import Graph3D from './Graph3D.jsx';             // ❌ würde nach Verschiebung brechen
```

## Vorgeschlagene Lösung

### 1. Dateien verschieben
- `src/Graph3D.jsx` → `src/components/Graph3D.jsx`

### 2. Import-Pfade anpassen
- **App.jsx**: `'./Graph3D.jsx'` → `'./components/Graph3D.jsx'`
- **GraphContainer.jsx**: Import bleibt `'./Graph3D.jsx'` (beide in components/)

### 3. Unbenutzte Dateien entfernen
- Löschen: `src/graph2d/` Ordner komplett
- Löschen: `src/graph3d/` Ordner komplett

## Erwartete Struktur nach Cleanup
```
src/
├── components/
│   ├── Graph2D.jsx      ✅ bereits vorhanden
│   ├── Graph3D.jsx      🔄 hierhin verschieben
│   ├── Header.jsx       ✅ bereits vorhanden
│   ├── NodeLegend.jsx   ✅ bereits vorhanden
│   └── ...
├── App.jsx
└── ...
```

## Vorteile
- **Konsistenz**: Alle Graph-Komponenten zentral in `components/`
- **Wartbarkeit**: Keine verwirrenden unbenutzten Dateien
- **Klarheit**: Eindeutige Import-Pfade
- **Sauberkeit**: Reduzierte Code-Duplikation

## Implementierungsschritte
1. [ ] `Graph3D.jsx` nach `src/components/` verschieben
2. [ ] Import in `App.jsx` anpassen
3. [ ] Sicherstellen dass `GraphContainer.jsx` weiterhin funktioniert
4. [ ] Unbenutzte Ordner `src/graph2d/` und `src/graph3d/` löschen
5. [ ] Tests ausführen um sicherzustellen dass alles funktioniert

## Aufwand
- **Geschätzte Zeit**: 15-20 Minuten
- **Risiko**: Niedrig (nur Dateiverschiebung und Import-Anpassungen)
- **Tests erforderlich**: Ja, um sicherzustellen dass alle Imports korrekt sind

## Anhang
**Entdeckt am**: 2025-08-19  
**Grund**: Code-Analyse zur Identifikation unbenutzter Index-Dateien