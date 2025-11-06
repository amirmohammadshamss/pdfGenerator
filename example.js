const { generateDevisFromEstimate } = require('./generateDevis');

/**
 * Example: Simple usage of the devis generator
 *
 * This file demonstrates how to generate a DEVIS PDF from your estimate data
 */

// Your estimate data from your application
const myEstimateData = {
  // Document information
  devisNumber: 'D202500099',
  date: new Date().toLocaleDateString('fr-FR'),
  color2: '#4A90E2', // Blue color for headers

  // Your company information
  company: {
    name: 'VOTRE SOCIÉTÉ',
    address: 'Votre Adresse',
    postalCode: '75000',
    city: 'Paris',
    siret: '000 000 000 00000',
    tel: '01 00 00 00 00',
    email: 'contact@votresociete.fr',
    logoPath: null // Set to './logo.png' if you have a logo
  },

  // Client information
  client: {
    civility: 'Mr.',
    lastName: 'CLIENT',
    address: 'Adresse du client',
    postalCode: '75000',
    city: 'Paris',
    clientNumber: 'C00001'
  },

  // Project title (optional)
  title: 'TITRE DE VOTRE PROJET',

  // Your estimate items
  estimate: [
    // Example 1: Simple item without cost (planning, preparation, etc.)
    {
      L1: "Préparation",
      L2: "Organisation",
      work: "Préparation du chantier",
      description: "Mise en place du chantier et sécurisation",
      dimensionsValue: 1,
      dimensionsUnit: "u",
      priceUnit: 0,
      priceTotal: 0
    },

    // Example 2: Item with cost
    {
      L1: "Électricité",
      L2: "Installation",
      work: "Installation prises électriques",
      description: "Installation de 10 prises électriques aux normes",
      dimensionsValue: 10,
      dimensionsUnit: "u",
      priceUnit: 50,
      priceTotal: 500
    },

    // Example 3: Surface-based item
    {
      L1: "Peinture",
      L2: "Murs",
      work: "Peinture murs",
      description: "Application de deux couches de peinture acrylique",
      dimensionsValue: 25,
      dimensionsUnit: "m²",
      priceUnit: 20,
      priceTotal: 500
    },

    // Example 4: With location (Scenario 3 style)
    {
      L1: "Carrelage",
      L2: "Sol",
      work: "Pose de carrelage",
      description: "Pose de carrelage 60x60 avec joints",
      dimensionsValue: 15,
      dimensionsUnit: "m²",
      priceUnit: 45,
      priceTotal: 675,
      emplacement: "Emplacement: Cuisine, Salle de bain"
    }
  ]
};

// Generate the PDF
console.log('Generating PDF...');
generateDevisFromEstimate(myEstimateData, 'mon_devis.pdf');
console.log('Done! Check mon_devis.pdf');
