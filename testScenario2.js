const { generateDevisFromEstimate } = require('./generateDevis');

// Scenario 2 - Kitchen and Bathroom renovation
const scenario2Data = {
  devisNumber: 'D202500005',
  date: '15/05/2025',
  color2: '#4A90E2',

  company: {
    name: 'RÉNOVATION PRO',
    address: '123 Rue de la République',
    postalCode: '75001',
    city: 'Paris',
    siret: '123 456 789 00010',
    tel: '01 23 45 67 89',
    email: 'contact@renovation-pro.fr',
    logoPath: null
  },

  client: {
    civility: 'Mr.',
    lastName: 'MARTIN',
    address: '45 Avenue des Champs',
    postalCode: '75008',
    city: 'Paris',
    clientNumber: 'C12345'
  },

  title: 'RÉNOVATION CUISINE ET SALLE DE BAIN',

  estimate: [
    {
      "L1": "Cuisine",
      "L2": "Menuiserie",
      "userWork": "Dépose cuisine existante",
      "work": "Dépose de la cuisine existante",
      "workMatch": "dépose_cuisine",
      "supply": false,
      "dimensionsValue": 1,
      "dimensionsUnit": "u",
      "priceUnit": 0,
      "priceTotal": 0,
      "description": "",
      "material": []
    },
    {
      "L1": "Cuisine",
      "L2": "Électricité",
      "userWork": "Électricité complète à refaire: six prises plan de travail, une prise 32A plaques induction, prise four, prise lave-vaisselle, prise réfrigérateur, prise lave-linge. Interrupteur entrée cuisine. Quatre spots LED faux plafond.",
      "work": "Dépose et installation complète de l'électricité avec prises et spots LED",
      "workMatch": "installation_électricité",
      "supply": false,
      "dimensionsValue": 6,
      "dimensionsUnit": "u",
      "priceUnit": 100,
      "priceTotal": 600,
      "description": "Installation de six prises pour plan de travail, une prise 32A pour plaques induction, prises pour four, lave-vaisselle, réfrigérateur, lave-linge, interrupteur à l'entrée, quatre spots LED encastrés dans faux plafond",
      "material": []
    },
    {
      "L1": "Cuisine",
      "L2": "Carrelage",
      "userWork": "Carrelage sol dépose puis pose, format 60x60 grès cérame",
      "work": "Pose de carrelage au sol",
      "workMatch": "pose_carrelage",
      "supply": false,
      "dimensionsValue": 4.5,
      "dimensionsUnit": "m²",
      "priceUnit": 65,
      "priceTotal": 292.50,
      "description": "Dépose du carrelage existant, ragréage du sol, pose de carrelage format 60x60 cm en grès cérame, réalisation des joints, nettoyage",
      "material": []
    },
    {
      "L1": "Salle de bain",
      "L2": "Plomberie",
      "userWork": "Remplacer baignoire par douche italienne",
      "work": "Modification plomberie pour douche",
      "workMatch": "modification_plomberie",
      "supply": false,
      "dimensionsValue": 1,
      "dimensionsUnit": "u",
      "priceUnit": 600,
      "priceTotal": 600,
      "description": "Dépose de la baignoire sabot, modification des arrivées d'eau pour installation d'une douche italienne",
      "material": []
    },
    {
      "L1": "Salle de bain",
      "L2": "Pose Sanitaire",
      "userWork": "Installer meuble vasque",
      "work": "Installation meuble vasque",
      "workMatch": "installation_meuble_vasque",
      "supply": false,
      "dimensionsValue": 1,
      "dimensionsUnit": "u",
      "priceUnit": 500,
      "priceTotal": 500,
      "description": "Dépose du lavabo colonne, pose d'un meuble vasque suspendu 80 cm blanc laqué avec miroir, raccordements",
      "material": []
    },
    {
      "L1": "Salle de bain",
      "L2": "Carrelage",
      "userWork": "Carrelage sol et faïence murale",
      "work": "Pose de carrelage sol et faïence murale",
      "workMatch": "pose_carrelage_faience",
      "supply": false,
      "dimensionsValue": 12,
      "dimensionsUnit": "m²",
      "priceUnit": 65,
      "priceTotal": 780,
      "description": "Dépose du carrelage sol existant, ragréage, pose de carrelage format 30x60 cm au sol, pose de faïence murale toute hauteur format 25x40 cm blanc brillant sur 12 mètres carrés",
      "material": []
    }
  ]
};

// Generate PDF for Scenario 2
generateDevisFromEstimate(scenario2Data, 'devis_scenario2.pdf');
