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

## Version 2.1.0 - Table Width Fix (2025-11-07)

### Bug Fixes

#### Table Width Overflow Issue (CRITICAL)
- **Fixed**: Table columns now fit perfectly within A4 page margins
- **Previous**: Column widths totaled 560pt (exceeded 495pt content width)
- **Current**: Column widths total exactly 495pt

#### Updated Column Widths
```javascript
// Before (BROKEN)
const colWidths = [40, 250, 50, 70, 60, 90]; // Total = 560pt ❌

// After (FIXED)
const colWidths = [30, 215, 45, 65, 50, 90]; // Total = 495pt ✅
```

#### Optimized Column Allocation
- N°: 30pt (6.1%) - Reference numbers
- Désignation: 215pt (43.4%) - Main description (largest)
- Qté: 45pt (9.1%) - Quantity + unit
- Prix U.: 65pt (13.1%) - Unit price
- TVA: 50pt (10.1%) - Tax rate
- TOTAL HT: 90pt (18.2%) - Total excluding tax

### Documentation Updates
- Added `TABLE_GUIDE.md` - Comprehensive table width guide
- Updated `LAYOUT.md` with correct measurements
- Updated `API.md` with proper column width documentation

### Impact
- ✅ Tables no longer overflow page boundaries
- ✅ Professional appearance maintained
- ✅ All content fits within margins
- ✅ No visual artifacts or cutting off
- ✅ Backward compatible (no data structure changes)

### Testing
All test scenarios pass with optimized table widths:
- ✅ Scenario 2 (Kitchen/Bathroom): 4.0KB
- ✅ Scenario 3 (Complete apartment): 5.4KB  
- ✅ Example usage: 3.4KB

