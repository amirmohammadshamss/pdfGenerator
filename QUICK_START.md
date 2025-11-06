# Quick Start Guide

## 1. Installation

```bash
npm install
```

## 2. Basic Usage

Create a new file (e.g., `myDevis.js`):

```javascript
const { generateDevisFromEstimate } = require('./generateDevis');

const data = {
  devisNumber: 'D202500001',
  date: '07/11/2025',
  
  company: {
    name: 'MA SOCIÉTÉ',
    address: '123 Rue Example',
    postalCode: '75001',
    city: 'Paris',
    siret: '123 456 789 00010',
    tel: '01 23 45 67 89',
    email: 'contact@example.fr',
    logoPath: null
  },
  
  client: {
    civility: 'Mr.',
    lastName: 'DUPONT',
    address: '456 Avenue Client',
    postalCode: '75008',
    city: 'Paris',
    clientNumber: 'C001'
  },
  
  title: 'TRAVAUX DE RÉNOVATION',
  
  estimate: [
    {
      L1: "Électricité",
      L2: "Installation",
      work: "Installation prises",
      description: "Installation de 10 prises électriques",
      dimensionsValue: 10,
      dimensionsUnit: "u",
      priceUnit: 50,
      priceTotal: 500
    },
    {
      L1: "Peinture",
      L2: "Murs",
      work: "Peinture murs",
      description: "Application peinture sur murs",
      dimensionsValue: 20,
      dimensionsUnit: "m²",
      priceUnit: 25,
      priceTotal: 500
    }
  ]
};

generateDevisFromEstimate(data, 'my_devis.pdf');
```

## 3. Run

```bash
node myDevis.js
```

## 4. Check Output

Open `my_devis.pdf` in your PDF viewer!

## Examples

- **Simple example**: `node example.js`
- **Scenario 2** (Kitchen/Bathroom): `node testScenario2.js`
- **Scenario 3** (Full apartment with locations): `node testScenario3.js`

## Key Features

### Hierarchy Structure
- **L1**: Main category (shows total)
- **L2**: Subcategory (bold header)
- **L3**: Individual work items (with prices)

### Data Fields
- `dimensionsValue`: Quantity
- `dimensionsUnit`: "u" (unit), "m²" (square meters), "ml" (linear meters)
- `priceUnit`: Price per unit
- `priceTotal`: Total price (quantity × unit price)
- `description`: Detailed work description
- `emplacement`: Location (optional, e.g., "Emplacement: Cuisine")

### Automatic Calculations
- Subtotals per L1 category
- TVA 10% and 20%
- Total TTC

## Documentation

- `README.md` - Full documentation
- `API.md` - API reference
- `QUICK_START.md` - This file

## Need Help?

Check the example files or read the full API documentation!
