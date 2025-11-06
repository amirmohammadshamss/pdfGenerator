# PDF Devis Generator

Generate professional French "DEVIS" (quote/estimate) PDFs from JSON data.

## Installation

```bash
npm install
```

## Features

- ✅ Professional French DEVIS format
- ✅ Hierarchical structure (L1, L2, L3 levels)
- ✅ Automatic calculations (subtotals, TVA, totals)
- ✅ Multi-line item descriptions
- ✅ Location information (emplacement)
- ✅ Company logo support
- ✅ Customizable colors and styling
- ✅ Auto-pagination for long documents

## Usage

### Scenario 2 & 3: Generate from Estimate Array

Use this for renovation projects with hierarchical structure (L1 > L2 > L3):

```javascript
const { generateDevisFromEstimate } = require('./generateDevis');

const data = {
  devisNumber: 'D202500005',
  date: '15/05/2025',
  color2: '#4A90E2', // Header color

  company: {
    name: 'MA SOCIÉTÉ',
    address: '123 Rue de la République',
    postalCode: '75001',
    city: 'Paris',
    siret: '123 456 789 00010',
    tel: '01 23 45 67 89',
    email: 'contact@masociete.fr',
    logoPath: null // or 'path/to/logo.png'
  },

  client: {
    civility: 'Mr.', // or 'Mme.'
    lastName: 'DUPONT',
    address: '45 Avenue des Champs',
    postalCode: '75008',
    city: 'Paris',
    clientNumber: 'C12345'
  },

  title: 'RÉNOVATION CUISINE ET SALLE DE BAIN',

  estimate: [
    {
      L1: "Cuisine",
      L2: "Électricité",
      work: "Installation électrique complète",
      dimensionsValue: 6,
      dimensionsUnit: "u",
      priceUnit: 100,
      priceTotal: 600,
      description: "Installation de six prises pour plan de travail...",
      emplacement: "Emplacement: Cuisine" // Optional (Scenario 3)
    }
    // ... more items
  ]
};

generateDevisFromEstimate(data, 'output.pdf');
```

## Data Structure

### Estimate Item Properties

| Property | Type | Description |
|----------|------|-------------|
| `L1` | string | Level 1 category (e.g., "Cuisine", "Salle de bain") |
| `L2` | string | Level 2 subcategory (e.g., "Électricité", "Plomberie") |
| `work` | string | Work title |
| `description` | string | Detailed description (used in PDF) |
| `dimensionsValue` | number | Quantity |
| `dimensionsUnit` | string | Unit (e.g., "u", "m²", "ml") |
| `priceUnit` | number | Unit price |
| `priceTotal` | number | Total price (quantity × unit price) |
| `emplacement` | string | Location (optional, Scenario 3) |

### PDF Layout

The generated PDF follows a professional French DEVIS structure:

**Part 1 - Header Row (Horizontal)**:
- Left: DEVIS title (24pt, colored), Document N°, Date
- Right: Logo space (4cm height, centered)

**Part 2 - Information Section (8cm below Part 1)**:
- Left: Company information (name, address, SIRET, tel, email)
- Right: Client information (with client number)

**Part 3 - Content (2cm below Part 2)**:
1. **Title**: Project title (13pt, bold, optional)
2. **Table**:
   - **L1**: Colored background (40% opacity) with total
   - **L2**: Bold subcategory header
   - **L3**: Regular items with quantity, unit price, TVA, total
3. **Totals**: Subtotal HT, TVA (10% & 20%), Total TTC
4. **Footer**: Standard acceptance text and signature area

## Examples

### Run Test Scenarios

```bash
# Scenario 2: Kitchen and bathroom renovation
node testScenario2.js

# Scenario 3: Complete apartment renovation with locations
node testScenario3.js
```

## Key Differences Between Scenarios

### Scenario 2
- Standard renovation project
- No location information
- Basic hierarchy (L1 > L2 > L3)

### Scenario 3
- Complex renovation project
- Includes `emplacement` field
- Location added to end of description
- Useful for multi-room projects

## Customization

### Change Header Color

```javascript
color2: '#FF5733' // Your custom color
```

### Add Company Logo

```javascript
company: {
  // ... other fields
  logoPath: './path/to/logo.png'
}
```

### Custom TVA Rates

Modify in `generateDevis.js`:

```javascript
// Line 84-87
let tvaText = null;
if (workItem.priceUnit > 0) {
  tvaText = '10%'; // Change default TVA
}
```

## Output

Generated PDFs are professional French DEVIS documents following standard formatting:
- A4 size
- 50pt margins
- Verdana-like font (Helvetica in PDF)
- 11px default font size
- Properly formatted currency (1 234,56 €)

## Files

- `generateDevis.js` - Main generator with all functions
- `testScenario2.js` - Test for Scenario 2
- `testScenario3.js` - Test for Scenario 3
- `package.json` - Dependencies

## License

ISC
