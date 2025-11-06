# API Documentation

## Functions

### `generateDevisFromEstimate(estimateData, outputPath)`

Generates a PDF from estimate array data (recommended for Scenarios 2 & 3).

**Parameters:**
- `estimateData` (Object): Complete estimate data including company, client, and items
- `outputPath` (String): Path where PDF will be saved (default: 'devis.pdf')

**Returns:** None (generates PDF file)

**Example:**
```javascript
const { generateDevisFromEstimate } = require('./generateDevis');

const data = {
  devisNumber: 'D202500005',
  date: '15/05/2025',
  color2: '#4A90E2',
  company: { /* ... */ },
  client: { /* ... */ },
  title: 'PROJECT TITLE',
  estimate: [ /* ... */ ]
};

generateDevisFromEstimate(data, 'output.pdf');
```

---

### `generateDevis(devisData, outputPath)`

Low-level function for generating PDF from pre-formatted items.

**Parameters:**
- `devisData` (Object): Pre-formatted devis data with items array
- `outputPath` (String): Path where PDF will be saved

**Returns:** None (generates PDF file)

**Note:** Use `generateDevisFromEstimate` instead unless you need custom item formatting.

---

### `transformEstimateToItems(estimate)`

Transforms estimate array into formatted PDF items.

**Parameters:**
- `estimate` (Array): Array of estimate items with L1, L2, L3 structure

**Returns:** Array of formatted items for PDF generation

**Example:**
```javascript
const { transformEstimateToItems } = require('./generateDevis');

const items = transformEstimateToItems([
  {
    L1: "Cuisine",
    L2: "Électricité",
    work: "Installation électrique",
    dimensionsValue: 10,
    dimensionsUnit: "u",
    priceUnit: 50,
    priceTotal: 500,
    description: "Detailed description..."
  }
]);
```

---

### `calculateTotals(items)`

Calculates totals from formatted items array.

**Parameters:**
- `items` (Array): Formatted items array

**Returns:** Object with calculated totals:
```javascript
{
  sousTotalHT: 1000.00,
  remise: 0,
  totalApresRemise: 1000.00,
  tva10: 50.00,
  tva20: 200.00,
  totalTTC: 1250.00
}
```

---

## Data Structures

### EstimateData Object

```javascript
{
  devisNumber: String,        // e.g., 'D202500005'
  date: String,               // e.g., '15/05/2025'
  color2: String,             // Hex color e.g., '#4A90E2'

  company: {
    name: String,
    address: String,
    postalCode: String,
    city: String,
    siret: String,
    tel: String,
    email: String,
    logoPath: String | null   // Path to logo or null
  },

  client: {
    civility: String,         // 'Mr.' or 'Mme.'
    lastName: String,
    address: String,
    postalCode: String,
    city: String,
    clientNumber: String
  },

  title: String,              // Project title (optional)
  estimate: Array,            // Array of estimate items
  footerText: String          // Optional custom footer
}
```

### Estimate Item Object

```javascript
{
  L1: String,                 // Level 1 category
  L2: String,                 // Level 2 subcategory
  work: String,               // Work title
  workMatch: String,          // Work identifier (optional)
  description: String,        // Detailed description
  dimensionsValue: Number,    // Quantity
  dimensionsUnit: String,     // Unit (u, m², ml, etc.)
  priceUnit: Number,          // Unit price
  priceTotal: Number,         // Total (qty × price)
  emplacement: String,        // Location (optional, Scenario 3)
  supply: Boolean,            // Supply flag (optional)
  material: Array             // Materials (optional)
}
```

### Formatted Item Object (Internal)

```javascript
{
  no: String,                 // Item number (e.g., '1.2')
  designation: String,        // Item description
  quantity: Number | null,
  quantityUnit: String,       // Unit suffix
  unitPrice: Number | null,
  tva: String | null,         // TVA percentage
  totalHT: Number | null,
  isHeader: Boolean,
  level: Number,              // 1, 2, or 3
  showTotal: Boolean          // Show total for L1
}
```

---

## Helper Functions

### `capitalizeFirst(str)`

Capitalizes first letter, lowercases rest.

**Parameters:**
- `str` (String): Input string

**Returns:** Capitalized string

---

### `formatCurrency(amount)`

Formats number as French currency.

**Parameters:**
- `amount` (Number): Amount to format

**Returns:** Formatted string (e.g., "1 234,56 €")

---

### `hexToRgb(hex)`

Converts hex color to RGB object.

**Parameters:**
- `hex` (String): Hex color (e.g., '#4A90E2')

**Returns:** Object `{ r: Number, g: Number, b: Number }`

---

## TVA Calculation

By default, all items use 20% TVA. To customize:

1. Edit `transformEstimateToItems` function (line 84-87)
2. Modify based on `workMatch` or other criteria:

```javascript
let tvaText = null;
if (workItem.priceUnit > 0) {
  // Custom TVA logic
  if (workItem.workMatch === 'some_type') {
    tvaText = '10%';
  } else {
    tvaText = '20%';
  }
}
```

---

## PDF Layout Customization

### Margins
Default: 30pt (≈ 1.06cm) - Reduced for more content space

Change in `generateDevis` function (line 192):
```javascript
const doc = new PDFDocument({
  size: 'A4',
  margin: 30,  // Change this (30pt = more space, 50pt = traditional)
  bufferPages: true
});
```

### Column Widths
Default: `[35, 250, 50, 70, 50, 80]` (Total = 535pt for A4)

Change in `generateDevis` function (line 344):
```javascript
const colWidths = [35, 250, 50, 70, 50, 80];
// IMPORTANT: Total must be ≤ 535pt to fit A4 page with 30pt margins
// If you change margins, recalculate: contentWidth = 595 - (2 × margin)
// Adjust values as needed, but keep sum ≤ contentWidth
```

### Colors
- Header background: `data.color2`
- L1 row background: `data.color2` at 40% opacity
- Table borders: `#CCCCCC`
- Text: `#000000`

### Font Sizes
- Title "DEVIS": 24pt
- L1 designation: 12pt
- L2 designation: 11pt (bold)
- L3 items: 11pt
- Project title: 13pt
- Totals: 11pt (Total TTC: 13pt)

---

## Error Handling

The generator does not throw errors for missing optional fields. It handles:

- Missing logo (shows placeholder)
- Null/undefined values (skips rendering)
- Empty estimate array (generates empty table)
- Long text (auto-wraps and adjusts row height)

---

## Performance

- Typical generation time: < 100ms
- Memory usage: ~10MB per PDF
- File size: 2-6KB (varies with content)
- No external API calls
- Synchronous execution

---

## Limitations

1. **Fonts**: Uses built-in Helvetica (not Verdana)
2. **Language**: French only
3. **Currency**: Euro (€) only
4. **Paper size**: A4 only
5. **Image formats**: PNG, JPEG for logos
6. **Max page size**: Unlimited (auto-pagination)

---

## Best Practices

1. **Always provide prices**: Set `priceUnit` and `priceTotal` for billable items
2. **Use consistent units**: Stick to "u", "m²", "ml" for clarity
3. **Group logically**: Use L1 for major categories, L2 for work types
4. **Detailed descriptions**: Use `description` field for clarity
5. **Test with sample data**: Use provided test files as templates

---

## Troubleshooting

### PDF not generating
- Check file path permissions
- Ensure `pdfkit` is installed
- Verify data structure matches examples

### Wrong formatting
- Check `color2` is valid hex color
- Ensure numbers are actual Number type, not strings
- Verify dates are formatted as 'DD/MM/YYYY'

### Missing totals
- Ensure `priceTotal` is set for items
- Check TVA logic returns valid percentage

### Text overflow
- Descriptions auto-wrap at column width
- Long L1/L2 names may need shortening
- Consider splitting very long descriptions

---

## Support

For issues or questions:
1. Check example files (`example.js`, `testScenario2.js`, `testScenario3.js`)
2. Review README.md
3. Inspect generated PDFs for reference
