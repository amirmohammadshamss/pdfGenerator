# PDF Layout Structure

## Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  PAGE TOP (50pt margin)                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ╔═══════════════════════════╦══════════════════════════════╗  │
│  ║ PART 1 - HEADER ROW       ║                              ║  │
│  ║                           ║                              ║  │
│  ║  DEVIS (24pt, blue)       ║      ┌──────────────┐       ║  │
│  ║  N° D202500005            ║      │              │       ║  │
│  ║  Date : 15/05/2025        ║      │     LOGO     │       ║  │
│  ║                           ║      │   (4cm h)    │       ║  │
│  ║                           ║      │              │       ║  │
│  ║                           ║      └──────────────┘       ║  │
│  ╚═══════════════════════════╩══════════════════════════════╝  │
│                                                                  │
│                      ↓ 8cm spacing ↓                            │
│                                                                  │
│  ╔═══════════════════════════╦══════════════════════════════╗  │
│  ║ PART 2 - INFORMATION      ║                              ║  │
│  ║                           ║                              ║  │
│  ║  MA SOCIÉTÉ (bold)        ║  Client :                    ║  │
│  ║  123 Rue de la République ║  Mr. DUPONT (bold)           ║  │
│  ║  75001 Paris              ║  45 Avenue des Champs        ║  │
│  ║  SIRET : 123 456 789...   ║  75008 Paris                 ║  │
│  ║  Tél : 01 23 45 67 89     ║  ─────────────────           ║  │
│  ║  Email : contact@...      ║  N° client : C12345          ║  │
│  ╚═══════════════════════════╩══════════════════════════════╝  │
│                                                                  │
│                      ↓ 2cm spacing ↓                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PART 3 - TITLE (13pt, bold)                              │  │
│  │ RÉNOVATION CUISINE ET SALLE DE BAIN                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ TABLE                                                     │  │
│  ├────┬────────────────────┬─────┬────────┬─────┬──────────┤  │
│  │ N° │ Désignation        │ Qté │ Prix U.│ TVA │ TOTAL HT │  │
│  ╞════╪════════════════════╪═════╪════════╪═════╪══════════╡  │
│  │ 1  │ Cuisine            │     │        │     │ 892,50 € │  │ ← L1 (colored bg, total)
│  ├────┼────────────────────┼─────┼────────┼─────┼──────────┤  │
│  │    │ Électricité        │     │        │     │          │  │ ← L2 (bold)
│  ├────┼────────────────────┼─────┼────────┼─────┼──────────┤  │
│  │1.1 │ Installation...    │ 6u  │100,00€ │ 20% │  600,00€ │  │ ← L3 (regular)
│  │    │ Description...     │     │        │     │          │  │
│  ├────┼────────────────────┼─────┼────────┼─────┼──────────┤  │
│  │    │ Carrelage          │     │        │     │          │  │ ← L2
│  ├────┼────────────────────┼─────┼────────┼─────┼──────────┤  │
│  │1.2 │ Pose carrelage...  │4.5m²│ 65,00€ │ 20% │  292,50€ │  │ ← L3
│  └────┴────────────────────┴─────┴────────┴─────┴──────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ TOTALS (Right aligned)                                    │  │
│  │                                                           │  │
│  │                          Sous-Total HT      2 500,00 EUR  │  │
│  │                          TVA à 10%             55,20 EUR  │  │
│  │                          TVA à 20%             40,00 EUR  │  │
│  │                          ─────────────────────────────   │  │
│  │                          Total TTC          2 595,20 EUR  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FOOTER                                                    │  │
│  │                                                           │  │
│  │ Si ce devis vous convient, veuillez nous le retourner... │  │
│  │ "BON POUR ACCORD ET EXÉCUTION DU DEVIS"                  │  │
│  │                                                           │  │
│  │ Date :                    Signature :                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Measurements

| Element | Spacing |
|---------|---------|
| Page margins | 50pt (≈1.76cm) |
| Content width | 495pt (A4 width - margins) |
| Part 1 to Part 2 | 8cm (≈226pt) |
| Part 2 to Part 3 | 2cm (≈56pt) |
| Logo height | 4cm (≈113pt) |
| Title font size | 13pt |
| DEVIS font size | 24pt |
| Body text | 11pt |

## Table Column Widths

The table columns are optimized to fit within the 495pt content width:

| Column | Width | Purpose |
|--------|-------|---------|
| N° | 30pt | Reference number |
| Désignation | 215pt | Description (largest column) |
| Qté | 45pt | Quantity + unit |
| Prix U. | 65pt | Unit price |
| TVA | 50pt | Tax rate % |
| TOTAL HT | 90pt | Total excluding tax |
| **TOTAL** | **495pt** | Fits perfectly in content width |

## Color Scheme

- **Primary color** (header/L1): Customizable via `color2` (default: #4A90E2)
- **L1 background**: Primary color at 40% opacity
- **Text**: Black (#000000)
- **Borders**: Light gray (#CCCCCC)

## Layout Features

### Part 1 - Header Row
- Two-column horizontal layout
- Left column: Document identification
- Right column: Logo/branding
- No separator lines between columns

### Part 2 - Information Section
- Two-column horizontal layout
- Left column: Company credentials
- Right column: Client details with border box
- 8cm spacing from Part 1 ensures clear separation

### Part 3 - Content
- Full-width layout
- Optional title section
- Table with:
  - Header row with colored background
  - L1 rows with semi-transparent background + total
  - L2 rows with bold text
  - L3 rows with full details
- Right-aligned totals section
- Signature footer

## Responsive Behavior

- **Long descriptions**: Auto-wrap within column width
- **Multi-line items**: Row height adjusts automatically
- **Page overflow**: Automatic pagination
- **Empty sections**: Gracefully hidden (e.g., no title shown if empty)

## Typography Hierarchy

1. **DEVIS title**: 24pt, bold, colored
2. **Section titles**: 13pt, bold, black
3. **L1 items**: 12pt, bold, black
4. **L2 items**: 11pt, bold, black
5. **L3 items**: 11pt, regular, black
6. **Body text**: 11pt, regular, black
7. **Totals**: 11pt (Total TTC: 13pt bold)
8. **Footer**: 11pt, regular, black

## Best Practices

1. **Keep descriptions concise**: While multi-line is supported, 2-3 lines work best
2. **Use consistent units**: Stick to "u", "m²", "ml" for clarity
3. **Logo dimensions**: Square or landscape logos work best in 4cm height
4. **Color contrast**: Ensure `color2` has good contrast with white
5. **Client info**: Keep address lines short for better formatting

## Customization Points

You can customize these aspects in `generateDevis.js`:

```javascript
// Line 207: Adjust Part 1 starting position
const part1StartY = yPosition;

// Line 251: Adjust Part 2 spacing (8cm default)
yPosition = part1StartY + 226; // Change 226 for different spacing

// Line 320: Adjust Part 3 spacing (2cm default)
yPosition += 56; // Change 56 for different spacing

// Line 229: Adjust logo height
const logoHeight = 113; // 4cm, change as needed

// Line 344: Adjust table column widths (must total ≤ 495 for A4)
const colWidths = [30, 215, 45, 65, 50, 90]; // Total = 495
```

## Comparison with Flutter Version

This Node.js implementation matches the Flutter/Dart version structure:

| Feature | Flutter | Node.js | Status |
|---------|---------|---------|--------|
| Header layout | ✓ Two columns | ✓ Two columns | ✓ Match |
| 8cm spacing | ✓ | ✓ | ✓ Match |
| Company/Client sections | ✓ Two columns | ✓ Two columns | ✓ Match |
| Table structure | ✓ L1/L2/L3 | ✓ L1/L2/L3 | ✓ Match |
| Colored headers | ✓ | ✓ | ✓ Match |
| Auto-pagination | ✓ | ✓ | ✓ Match |
| Multi-line support | ✓ | ✓ | ✓ Match |
