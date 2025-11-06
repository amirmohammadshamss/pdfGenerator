const { generateDevisFromEstimate } = require('./generateDevis');

// Scenario 3 - Complete apartment renovation with emplacement
const scenario3Data = {
  devisNumber: 'D202500010',
  date: '20/05/2025',
  color2: '#4A90E2',

  company: {
    name: 'RÉNOVATION TOTALE',
    address: '456 Boulevard Haussmann',
    postalCode: '75009',
    city: 'Paris',
    siret: '987 654 321 00010',
    tel: '01 98 76 54 32',
    email: 'contact@renovation-totale.fr',
    logoPath: null
  },

  client: {
    civility: 'Mme.',
    lastName: 'BERNARD',
    address: '78 Rue de Rivoli',
    postalCode: '75004',
    city: 'Paris',
    clientNumber: 'C54321'
  },

  title: 'RÉNOVATION COMPLÈTE APPARTEMENT 52M²',

  estimate: [
    {
      "L1": "Préparation chantier",
      "L2": "Tout l'appartement",
      "userWork": "Préparation du chantier pour rénovation complète",
      "work": "Préparation du chantier pour rénovation complète",
      "workMatch": "préparation_chantier",
      "supply": false,
      "dimensionsValue": 52,
      "dimensionsUnit": "m²",
      "priceUnit": 15,
      "priceTotal": 780,
      "description": "Préparer le chantier pour une rénovation complète de l'appartement.",
      "emplacement": "Emplacement: Tout l'appartement",
      "material": []
    },
    {
      "L1": "Dépose et démolition",
      "L2": "Cloisonnement",
      "userWork": "Casser la cloison entre la cuisine et le salon pour faire un grand espace ouvert",
      "work": "Démolition de la cloison entre la cuisine et le salon",
      "workMatch": "démolition_cloison",
      "supply": false,
      "dimensionsValue": 1,
      "dimensionsUnit": "u",
      "priceUnit": 800,
      "priceTotal": 800,
      "description": "Démolir la cloison existante entre la cuisine et le salon pour créer un espace ouvert.",
      "emplacement": "Emplacement: Cuisine, Salon",
      "material": []
    },
    {
      "L1": "Construction",
      "L2": "Structure",
      "userWork": "Poser un IPN après démolition de la cloison",
      "work": "Pose d'un IPN pour soutenir la structure après démolition",
      "workMatch": "pose_IPN",
      "supply": false,
      "dimensionsValue": 1,
      "dimensionsUnit": "u",
      "priceUnit": 1500,
      "priceTotal": 1500,
      "description": "Installer un IPN pour soutenir la structure après la démolition de la cloison.",
      "emplacement": "Emplacement: Cuisine, Salon",
      "material": []
    },
    {
      "L1": "Électricité",
      "L2": "Installation générale",
      "userWork": "Refaire toute l'électricité aux normes avec un nouveau tableau électrique",
      "work": "Remplacement de l'installation électrique et pose d'un nouveau tableau",
      "workMatch": "remplacement_installation_électrique",
      "supply": false,
      "dimensionsValue": 52,
      "dimensionsUnit": "m²",
      "priceUnit": 120,
      "priceTotal": 6240,
      "description": "Mettre aux normes l'installation électrique complète avec un nouveau tableau électrique.",
      "emplacement": "Emplacement: Tout l'appartement",
      "material": []
    },
    {
      "L1": "Plomberie",
      "L2": "Installation générale",
      "userWork": "Changer le ballon d'eau chaude",
      "work": "Remplacement du ballon d'eau chaude",
      "workMatch": "remplacement_ballon_eau_chaude",
      "supply": false,
      "dimensionsValue": 1,
      "dimensionsUnit": "u",
      "priceUnit": 800,
      "priceTotal": 800,
      "description": "Remplacer le ballon d'eau chaude existant par un nouveau.",
      "emplacement": "Emplacement: Salle de bain",
      "material": []
    },
    {
      "L1": "Salle de bain",
      "L2": "Sanitaires",
      "userWork": "Refaire la salle de bain avec une nouvelle douche italienne et un nouveau lavabo avec meuble",
      "work": "Installation d'une douche italienne et d'un lavabo avec meuble",
      "workMatch": "installation_douche_italienne_lavabo_meuble",
      "supply": false,
      "dimensionsValue": 1,
      "dimensionsUnit": "u",
      "priceUnit": 2500,
      "priceTotal": 2500,
      "description": "Installer une nouvelle douche italienne et un lavabo avec meuble dans la salle de bain.",
      "emplacement": "Emplacement: Salle de bain",
      "material": []
    },
    {
      "L1": "Cuisine",
      "L2": "Installation générale",
      "userWork": "Installer une cuisine équipée neuve, moderne",
      "work": "Installation d'une cuisine équipée neuve",
      "workMatch": "installation_cuisine_équipée",
      "supply": false,
      "dimensionsValue": 1,
      "dimensionsUnit": "u",
      "priceUnit": 3500,
      "priceTotal": 3500,
      "description": "Installer une nouvelle cuisine équipée moderne.",
      "emplacement": "Emplacement: Cuisine",
      "material": []
    },
    {
      "L1": "Carrelage/Parquet",
      "L2": "Sol",
      "userWork": "Poser du parquet partout sauf dans la salle de bain où ce sera du carrelage",
      "work": "Pose de parquet et carrelage",
      "workMatch": "pose_parquet_carrelage",
      "supply": false,
      "dimensionsValue": 52,
      "dimensionsUnit": "m²",
      "priceUnit": 75,
      "priceTotal": 3900,
      "description": "Poser du parquet dans tout l'appartement sauf dans la salle de bain où du carrelage sera installé.",
      "emplacement": "Emplacement: Tout l'appartement sauf Salle de bain",
      "material": []
    },
    {
      "L1": "Peinture",
      "L2": "Murs et plafonds",
      "userWork": "Repeindre tous les murs et plafonds de l'appartement",
      "work": "Peinture des murs et plafonds",
      "workMatch": "peinture_murs_plafonds",
      "supply": false,
      "dimensionsValue": 52,
      "dimensionsUnit": "m²",
      "priceUnit": 45,
      "priceTotal": 2340,
      "description": "Appliquer une nouvelle peinture sur tous les murs et plafonds de l'appartement.",
      "emplacement": "Emplacement: Tout l'appartement",
      "material": []
    },
    {
      "L1": "Menuiseries",
      "L2": "Fenêtres",
      "userWork": "Changer les fenêtres du salon et de la chambre pour du double vitrage PVC",
      "work": "Remplacement des fenêtres par du double vitrage PVC",
      "workMatch": "remplacement_fenêtres_double_vitrage",
      "supply": false,
      "dimensionsValue": 2,
      "dimensionsUnit": "u",
      "priceUnit": 1200,
      "priceTotal": 2400,
      "description": "Remplacer les fenêtres existantes par des fenêtres en double vitrage PVC.",
      "emplacement": "Emplacement: Salon, Chambre",
      "material": []
    },
    {
      "L1": "Nettoyage fin chantier",
      "L2": "Tout l'appartement",
      "userWork": "Nettoyage après travaux",
      "work": "Nettoyage après travaux",
      "workMatch": "nettoyage_fin_chantier",
      "supply": false,
      "dimensionsValue": 52,
      "dimensionsUnit": "m²",
      "priceUnit": 10,
      "priceTotal": 520,
      "description": "Effectuer un nettoyage complet de l'appartement après la fin des travaux.",
      "emplacement": "Emplacement: Tout l'appartement",
      "material": []
    }
  ]
};

// Generate PDF for Scenario 3
generateDevisFromEstimate(scenario3Data, 'devis_scenario3.pdf');
