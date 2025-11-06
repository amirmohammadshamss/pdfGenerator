# Changelog

## Version 2.0.0 - Layout Redesign (2025-11-07)

### Major Changes

#### Layout Restructure
- **BREAKING**: Redesigned header layout to match Flutter/Dart reference implementation
- Split header into two distinct parts with proper spacing

#### Part 1 - Header Row (NEW)
- Left column: DEVIS title + Document N° + Date
- Right column: Logo space (4cm height)
- Horizontal two-column layout

#### Part 2 - Information Section (UPDATED)
- Now positioned 8cm below Part 1 (was directly below header)
- Left column: Company information
- Right column: Client information
- Improved spacing and alignment

#### Part 3 - Content Section (UPDATED)
- Positioned 2cm below Part 2
- Title, table, totals, and footer sections remain unchanged
- Better vertical spacing

### What's New
- Professional French DEVIS layout matching industry standards
- Clear visual separation between sections
- Improved readability with better spacing
- Matches Flutter/Dart PDF generation structure

### Migration Guide

If you're using the old version, no code changes needed! The data structure remains identical. Only the visual layout has improved.

```javascript
// Your existing code still works
generateDevisFromEstimate(data, 'output.pdf');
```

The output PDF will automatically use the new layout.

---

## Version 1.0.0 - Initial Release (2025-11-07)

### Features
- Generate professional French DEVIS PDFs
- Support for Scenario 2 (Kitchen/Bathroom renovations)
- Support for Scenario 3 (Complete apartments with locations)
- Hierarchical structure (L1 > L2 > L3)
- Automatic calculations (TVA 10%, 20%, totals)
- Multi-line item descriptions
- Company logo support
- Auto-pagination
- Customizable colors

### Core Functions
- `generateDevisFromEstimate()` - Main PDF generator
- `transformEstimateToItems()` - Data transformer
- `calculateTotals()` - Automatic calculations
- `generateDevis()` - Core PDF engine

### Documentation
- README.md - User guide
- API.md - API reference
- QUICK_START.md - Quick start guide

### Test Files
- testScenario2.js - Kitchen/Bathroom example
- testScenario3.js - Complete apartment example
- example.js - Simple usage example
