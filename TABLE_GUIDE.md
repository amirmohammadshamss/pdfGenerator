# Table Width Guide

## Problem: Table Width Overflow

When designing PDF tables, column widths must fit within the available content area.

### A4 Page Dimensions
- **Page width**: 595pt (21cm)
- **Margins**: 50pt left + 50pt right = 100pt total
- **Content width**: 595 - 100 = **495pt available**

## Column Width Optimization

### Previous (WRONG - Overflow)
```javascript
const colWidths = [40, 250, 50, 70, 60, 90];
// Total = 560pt (EXCEEDS 495pt available!) ❌
```

**Result**: Table extends beyond page margins, causing layout issues.

### Current (CORRECT - Fits perfectly)
```javascript
const colWidths = [30, 215, 45, 65, 50, 90];
// Total = 495pt (Fits exactly!) ✅
```

**Result**: Table fits perfectly within page margins.

## Column Breakdown

| Column | Width | Percentage | Content Type |
|--------|-------|------------|--------------|
| N° | 30pt | 6.1% | Short reference (1.1, 1.2, etc.) |
| Désignation | 215pt | 43.4% | Longest text content |
| Qté | 45pt | 9.1% | Quantity + unit (e.g., "10 u", "5.5 m²") |
| Prix U. | 65pt | 13.1% | Unit price with € symbol |
| TVA | 50pt | 10.1% | Tax rate (e.g., "20%") |
| TOTAL HT | 90pt | 18.2% | Total with € symbol |
| **TOTAL** | **495pt** | **100%** | Perfect fit |

## Design Principles

### 1. Prioritize Description Column
The "Désignation" column (215pt) gets the most space because:
- Contains work descriptions
- May have multi-line content
- Most important for user understanding

### 2. Right-Align Numbers
Columns with numbers (Prix U., TOTAL HT) are right-aligned for:
- Better readability
- Professional appearance
- Easy comparison of values

### 3. Center Short Content
Columns with short content (Qté, TVA) are centered:
- Better visual balance
- Easier to scan

### 4. Minimum Widths
Each column has minimum width to display content:
- N°: Must fit "10.10" (sub-sub items)
- Qté: Must fit "999.99 m²"
- Prix U.: Must fit "99 999,99 €"
- TVA: Must fit "20%"
- TOTAL HT: Must fit "999 999,99 €"

## Visual Representation

```
┌─────────────────────────────────────────────────────────────────┐
│ A4 Page Width: 595pt                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Left Margin: 50pt                                           │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Content Width: 495pt                                    │ │ │
│ │ │                                                         │ │ │
│ │ │ ┌──┬──────────────┬────┬──────┬─────┬─────────┐       │ │ │
│ │ │ │30│     215      │ 45 │  65  │ 50  │   90    │       │ │ │
│ │ │ │N°│ Désignation  │Qté │Prix U│ TVA │TOTAL HT │       │ │ │
│ │ │ └──┴──────────────┴────┴──────┴─────┴─────────┘       │ │ │
│ │ │                                                         │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                   50pt     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## How to Calculate Custom Widths

If you need to adjust column widths:

1. **Determine available space**: 595 - (2 × margin) = content width
   - Default margins: 50pt → 495pt available
   - Custom margins: Adjust calculation accordingly

2. **Allocate percentages**: Decide what % each column needs
   ```javascript
   // Example: Custom allocation
   const contentWidth = 495;
   const colWidths = [
     contentWidth * 0.06,  // 6%  = 29.7pt → 30pt
     contentWidth * 0.44,  // 44% = 217.8pt → 215pt
     contentWidth * 0.09,  // 9%  = 44.55pt → 45pt
     contentWidth * 0.13,  // 13% = 64.35pt → 65pt
     contentWidth * 0.10,  // 10% = 49.5pt → 50pt
     contentWidth * 0.18   // 18% = 89.1pt → 90pt
   ];
   ```

3. **Round and verify**: Round to integers, then verify sum ≤ available space
   ```javascript
   const sum = colWidths.reduce((a, b) => a + b, 0);
   console.log(sum <= 495); // Must be true!
   ```

## Common Mistakes

### ❌ DON'T: Exceed content width
```javascript
const colWidths = [50, 300, 60, 80, 70, 100]; // Total = 660 > 495
```
**Result**: Table overflows page, text gets cut off.

### ❌ DON'T: Make columns too small
```javascript
const colWidths = [10, 200, 20, 30, 20, 40]; // Total = 320 < 495
```
**Result**: Wasted space, numbers don't fit, text wraps excessively.

### ✅ DO: Balance between columns
```javascript
const colWidths = [30, 215, 45, 65, 50, 90]; // Total = 495
```
**Result**: Perfect fit, professional appearance, readable content.

## Testing Your Widths

After changing column widths, test with:

1. **Short content**: Single-line descriptions
2. **Long content**: Multi-line descriptions
3. **Large numbers**: "999 999,99 €"
4. **Edge cases**: Very long item numbers, special characters

```javascript
// Test scenarios
const testItems = [
  { designation: "Short", price: 99.99 },
  { designation: "Very long description that wraps multiple lines", price: 12345.67 },
  { designation: "Special chars: €àéè", price: 999999.99 }
];
```

## Responsive Width (Advanced)

For dynamic content width:

```javascript
function calculateColumnWidths(contentWidth) {
  const ratios = [0.06, 0.44, 0.09, 0.13, 0.10, 0.18];
  return ratios.map(r => Math.floor(contentWidth * r));
}

// Usage
const margin = 50;
const pageWidth = 595; // A4
const contentWidth = pageWidth - (2 * margin);
const colWidths = calculateColumnWidths(contentWidth);
```

## Summary

✅ **Total column widths must equal or be less than content width**
✅ **A4 with 50pt margins = 495pt content width**
✅ **Current widths: [30, 215, 45, 65, 50, 90] = 495pt**
✅ **Test with various content lengths**
✅ **Prioritize description column for readability**

Need different page size? Adjust accordingly:
- **Letter**: 612pt width → 512pt content (with 50pt margins)
- **A5**: 420pt width → 320pt content (with 50pt margins)
- **Custom margins**: pageWidth - (2 × margin) = content width
