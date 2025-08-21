# Digital Twin Mock Data Documentation

## Overview
This directory contains three JSON datasets representing different scenarios for the Digital Twin 3D Graph visualization. Each dataset contains nodes (entities) and links (relationships) with comprehensive metadata.

## Data Structure

### Nodes
Each node represents an entity in the digital twin ecosystem:

```json
{
  "id": "E1",
  "type": "environment|boundary|system", 
  "label": "Human-readable name",
  "metadata": {
    "sourceCount": 5,        // Number of data sources
    "confidence": 0.87,      // Confidence level (0.0-1.0)
    "lastUpdated": "2025-08-05T12:00:00Z"
  }
}
```

### Links  
Each link represents a relationship between nodes:

```json
{
  "source": "E1",
  "target": "B1", 
  "weight": 0.75,           // Influence strength (0.0-1.0)
  "influenceType": "regulatory",
  "metadata": {
    "occurrences": 12,      // Number of mentions
    "sentiment": 0.2,       // Sentiment (-1.0 to +1.0)
    "firstSeen": "2025-07-01T00:00:00Z",
    "lastSeen": "2025-08-01T00:00:00Z"
  }
}
```

## Scenarios

### baseline.json
- **Purpose**: Normal operating conditions
- **Nodes**: 14 total (6 Environment, 3 Boundary, 5 System)
- **Links**: 15 relationships with realistic weight distribution
- **Characteristics**: Balanced influence patterns, moderate confidence levels

### stress.json  
- **Purpose**: Crisis/stress testing scenario
- **Changes from baseline**:
  - E2→B1 weight increased to 1.0 (+18%)
  - E3→B2 weight increased to 1.0 (+47%) 
  - E4→B2 weight increased to 0.78 (+50%)
  - B2→S1 weight increased to 1.0 (+27%)
  - B2→S2 weight increased to 1.0 (+37%)
- **Characteristics**: Higher negative sentiment values, increased occurrences

### relax.json
- **Purpose**: Relaxed/optimized scenario  
- **Changes from baseline**:
  - E2→B1 weight reduced to 0.60 (-29%)
  - E3→B2 weight reduced to 0.48 (-29%)
  - E4→B2 weight reduced to 0.36 (-31%)
  - E5→B3 weight reduced to 0.50 (-30%)
  - B2→S1 weight reduced to 0.55 (-30%)
  - B2→S2 weight reduced to 0.51 (-30%)
  - B3→S3 weight reduced to 0.41 (-29%)
- **Characteristics**: Lower confidence in some nodes, reduced negative sentiment

## Node Types

### Environment (E*)
External factors affecting the system:
- Zinsentwicklung (Interest Rates)
- Regulatorisches Umfeld (Regulatory Environment)  
- Marktvolatilität (Market Volatility)
- Geopolitische Lage (Geopolitical Situation)
- Technologiewandel (Technology Change)
- Klimawandel (Climate Change)

### Boundary (B*)  
Interface/governance layers:
- Compliance Framework
- Risiko-Management (Risk Management)
- Datengovernance (Data Governance)

### System (S*)
Core operational systems:
- Kernbanksystem (Core Banking System)
- Trading Platform
- Customer Portal  
- Analytics Engine
- Payment Gateway

## Influence Types
- **regulatory**: Compliance and regulatory impacts
- **market**: Market-driven influences
- **technical**: Technology and system dependencies
- **operational**: Day-to-day operational relationships

## Visualization Features

### Node Visualization
- **Size**: Based on confidence level (larger = higher confidence)
- **Color**: Automatically assigned by node type
- **Click**: Shows detailed metadata in control panel

### Link Visualization  
- **Width**: Based on weight (thicker = stronger influence)
- **Color**: Based on sentiment
  - Green: Positive sentiment (>0.3)
  - Red: Negative sentiment (<-0.3)  
  - Amber: Neutral sentiment (-0.3 to 0.3)

## Usage in Application
Load scenarios using the dropdown in the control panel. Each scenario demonstrates different stress levels and their impact on the digital twin ecosystem. Use node clicks to explore detailed metadata and observe how relationships change between scenarios.