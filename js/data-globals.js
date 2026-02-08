// ═══════════════════════════════════════════════════════════════
// GLOBAL DATA & CONSTANTS
// ═══════════════════════════════════════════════════════════════

// Data arrays
let productsMaster = [];
let patientRecords = [];
let journalCurrentItems = [];
let salesRecords = [];
let allLeaveRequests = [];
let allSalesRecords = [];
let allPatientAssignments = [];

// Categories and Lab Types
let categories = [
  'IV',
  'TAB/CAPS',
  'BY GALLON',
  'BY BOX',
  'BY PIECE'
];

let labTypes = [
  'Complete Blood Count (CBC)',
  'Urinalysis',
  'Blood Chemistry',
  'X-Ray',
  'ECG'
];

// Journal/Charge Slip Database
const journalDB = {
  Medicine: [
    { name: 'Paracetamol', price: 5 },
    { name: 'Ibuprofen', price: 8 },
    { name: 'Amoxicillin', price: 12 }
  ],
  PPE: [
    { name: 'Face Mask', price: 10 },
    { name: 'Gloves', price: 5 },
    { name: 'Face Shield', price: 15 }
  ],
  Supplies: [
    { name: 'Syringe', price: 8 },
    { name: 'Bandage', price: 15 },
    { name: 'Cotton', price: 5 }
  ],
  Equipment: [
    { name: 'Thermometer', price: 50 },
    { name: 'BP Apparatus', price: 200 }
  ],
  Hygiene: [
    { name: 'Alcohol', price: 20 },
    { name: 'Hand Sanitizer', price: 30 }
  ],
  Other: [
    { name: 'Misc Item', price: 10 }
  ]
};

// Filter states
let currentInventoryFilter = 'all';
let currentLeaveFilter = 'pending';
let currentSalesPeriod = 'today';
let currentAssignmentFilter = 'pending';
let restockFilter = 'all';
let currentJournalQty = 1;



