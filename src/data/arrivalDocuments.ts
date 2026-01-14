// Document images
import passportImg from '@/assets/documents/passport.png';
import admissionLetterImg from '@/assets/documents/admission-letter.png';
import applicationFormImg from '@/assets/documents/application-form.png';
import codiceFiscaleImg from '@/assets/documents/codice-fiscale.png';
import insuranceImg from '@/assets/documents/insurance.png';
import accommodationImg from '@/assets/documents/accommodation.png';
import photosImg from '@/assets/documents/photos.png';
import marcaBolloImg from '@/assets/documents/marca-bollo.png';
import { City } from '@/contexts/CityContext';

export interface CitySpecificLink {
  label: string;
  url: string;
  description: string;
}

export interface ArrivalDocument {
  id: string;
  name: string;
  description: string;
  image: string;
  details: {
    keyInfo?: string;
    acceptanceRules?: {
      valid: string[];
      invalid?: string[];
    };
    commonMistakes?: string[];
    howToObtain?: string;
    officialLinks?: Array<{ label: string; url: string; description: string }>;
    citySpecificLinks?: Record<City, CitySpecificLink[]>;
    tips?: string[];
  };
}

// City-specific resources for documents
const cityResources = {
  milano: {
    agenziaEntrate: 'https://www.agenziaentrate.gov.it/portale/web/guest/contatta/uffici-territoriali/lombardia',
    questura: 'https://questure.poliziadistato.it/Milano',
    aslHealth: 'https://www.ats-milano.it/',
    postOffice: 'https://www.poste.it/cerca/uffici-postali.html#/search?regione=LOMBARDIA&citta=MILANO',
    universities: [
      { name: 'Politecnico di Milano - Segreteria', url: 'https://www.polimi.it/studenti-iscritti/segreterie-studenti/', description: 'Student services and certificates' },
      { name: 'Università degli Studi di Milano', url: 'https://www.unimi.it/it/studiare/frequentare-un-corso-di-laurea/iscriversi/segreterie-studenti', description: 'Enrollment certificates' },
      { name: 'Bocconi Student Services', url: 'https://www.unibocconi.it/wps/wcm/connect/bocconi/sitopubblico_it/albero+di+navigazione/home/corsi+di+studio/studenti+iscritti/', description: 'Student desk services' }
    ]
  },
  roma: {
    agenziaEntrate: 'https://www.agenziaentrate.gov.it/portale/web/guest/contatta/uffici-territoriali/lazio',
    questura: 'https://questure.poliziadistato.it/Roma',
    aslHealth: 'https://www.aslroma1.it/',
    postOffice: 'https://www.poste.it/cerca/uffici-postali.html#/search?regione=LAZIO&citta=ROMA',
    universities: [
      { name: 'Sapienza - Student Services', url: 'https://www.uniroma1.it/it/pagina/segreterie-studenti', description: 'Enrollment certificates and student services' },
      { name: 'LUISS Student Office', url: 'https://www.luiss.it/studenti', description: 'Student administration' },
      { name: 'Roma Tre Segreteria', url: 'https://www.uniroma3.it/servizi/segreterie-studenti/', description: 'Student secretariat' }
    ]
  },
  torino: {
    agenziaEntrate: 'https://www.agenziaentrate.gov.it/portale/web/guest/contatta/uffici-territoriali/piemonte',
    questura: 'https://questure.poliziadistato.it/Torino',
    aslHealth: 'https://www.aslcittaditorino.it/',
    postOffice: 'https://www.poste.it/cerca/uffici-postali.html#/search?regione=PIEMONTE&citta=TORINO',
    universities: [
      { name: 'Politecnico di Torino - Segreteria', url: 'https://www.polito.it/didattica/segreteria_studenti', description: 'Student services and certificates' },
      { name: 'Università di Torino', url: 'https://www.unito.it/servizi/lo-studio/segreterie-studenti', description: 'Enrollment certificates' }
    ]
  },
  pavia: {
    agenziaEntrate: 'https://www.agenziaentrate.gov.it/portale/web/guest/contatta/uffici-territoriali/lombardia',
    questura: 'https://questure.poliziadistato.it/Pavia',
    aslHealth: 'https://www.asst-pavia.it/',
    postOffice: 'https://www.poste.it/cerca/uffici-postali.html#/search?regione=LOMBARDIA&citta=PAVIA',
    universities: [
      { name: 'Università di Pavia - Segreteria', url: 'https://portale.unipv.it/it/didattica/segreterie-studenti', description: 'Student services and certificates' }
    ]
  }
};

// Documents for Codice Fiscale application
export const codiceFiscaleDocuments: ArrivalDocument[] = [
  {
    id: 'cf-passport',
    name: 'Valid Passport',
    description: 'Your original passport with valid student visa',
    image: passportImg,
    details: {
      keyInfo: 'You MUST bring the ORIGINAL passport - photocopies alone will not be accepted. The passport must contain your valid Italian student visa (Type D).',
      acceptanceRules: {
        valid: [
          'Original passport with at least 6 months validity',
          'Passport with Type D student visa inside',
          'Passport with clear, legible data page'
        ],
        invalid: [
          'Expired passport',
          'Passport copy without original',
          'Passport without Italian student visa'
        ]
      },
      commonMistakes: [
        'Bringing only a photocopy instead of the original',
        'Forgetting to bring the passport entirely',
        'Not having a copy of the visa page ready'
      ],
      howToObtain: 'You should already have this from your visa application. Bring the original passport that contains your Italian student visa.',
      tips: [
        'Make 2-3 photocopies of your passport data page and visa page before going',
        'Keep the original passport with you at all times during the first weeks in Italy',
        'Take photos of all passport pages on your phone as backup'
      ]
    }
  },
  {
    id: 'cf-admission-letter',
    name: 'University Admission Letter',
    description: 'Official letter confirming your admission to an Italian university',
    image: admissionLetterImg,
    details: {
      keyInfo: 'This proves you are a legitimate student in Italy. The original letter is preferred, but a certified copy from your university is also accepted.',
      acceptanceRules: {
        valid: [
          'Original university admission letter',
          'Official enrollment certificate from university',
          'UNIVERSITALY confirmation printout (if applicable)',
          'Letter on official university letterhead with stamp'
        ],
        invalid: [
          'Email printout without official stamp',
          'Conditional offer letter (must be unconditional)',
          'Application confirmation (not the same as admission)'
        ]
      },
      commonMistakes: [
        'Bringing the offer letter instead of the final admission letter',
        'Not having the document translated to Italian if required',
        'Forgetting to get the university stamp on the document'
      ],
      howToObtain: 'Request from your university\'s international office (Ufficio Relazioni Internazionali) or student secretariat (Segreteria Studenti). Most universities provide this automatically after enrollment.',
      officialLinks: [
        {
          label: 'UNIVERSITALY Portal',
          url: 'https://www.universitaly.it/',
          description: 'Official platform for international student applications'
        }
      ],
      citySpecificLinks: {
        milano: [
          { label: 'Politecnico di Milano - Segreteria', url: cityResources.milano.universities[0].url, description: cityResources.milano.universities[0].description },
          { label: 'UniMi Student Services', url: cityResources.milano.universities[1].url, description: cityResources.milano.universities[1].description },
          { label: 'Bocconi Student Desk', url: cityResources.milano.universities[2].url, description: cityResources.milano.universities[2].description }
        ],
        roma: [
          { label: 'Sapienza Segreteria', url: cityResources.roma.universities[0].url, description: cityResources.roma.universities[0].description },
          { label: 'LUISS Student Office', url: cityResources.roma.universities[1].url, description: cityResources.roma.universities[1].description },
          { label: 'Roma Tre Services', url: cityResources.roma.universities[2].url, description: cityResources.roma.universities[2].description }
        ],
        torino: [
          { label: 'PoliTo Segreteria', url: cityResources.torino.universities[0].url, description: cityResources.torino.universities[0].description },
          { label: 'UniTo Student Services', url: cityResources.torino.universities[1].url, description: cityResources.torino.universities[1].description }
        ],
        pavia: [
          { label: 'UniPV Segreteria', url: cityResources.pavia.universities[0].url, description: cityResources.pavia.universities[0].description }
        ]
      },
      tips: [
        'Get multiple certified copies from your university',
        'If your letter is in English, some offices may request an Italian translation',
        'Ask your university for a letter specifically mentioning "Codice Fiscale" if possible'
      ]
    }
  }
];

// Documents for Residence Permit (Permesso di Soggiorno) application
export const residencePermitDocuments: ArrivalDocument[] = [
  {
    id: 'rp-modulo1',
    name: 'Modulo 1 Application Form',
    description: 'The official residence permit application form from the Yellow Kit',
    image: applicationFormImg,
    details: {
      keyInfo: 'This form is included in the "Kit Postale" (Yellow Kit) available at post offices. You MUST fill it out in BLACK INK using CAPITAL LETTERS only.',
      acceptanceRules: {
        valid: [
          'Original Modulo 1 form from official Yellow Kit',
          'Form filled in BLACK ink only',
          'Form filled in CAPITAL LETTERS',
          'All required fields completed'
        ],
        invalid: [
          'Form filled in blue ink',
          'Form with corrections or white-out',
          'Lowercase handwriting',
          'Photocopied form (must be from official kit)'
        ]
      },
      commonMistakes: [
        'Using blue ink instead of black ink',
        'Writing in lowercase letters',
        'Making mistakes and using correction fluid (start over if you make an error)',
        'Not filling out all required sections',
        'Confusing Modulo 1 with other forms in the kit'
      ],
      howToObtain: 'Go to any Italian post office (Poste Italiane) and ask for the "Kit per Permesso di Soggiorno" or "Kit Giallo". It costs around €30-40 and includes all necessary forms and a prepaid envelope.',
      officialLinks: [
        {
          label: 'Poste Italiane Kit Info',
          url: 'https://www.poste.it/prodotti/permesso-di-soggiorno.html',
          description: 'Official information about the residence permit kit'
        }
      ],
      citySpecificLinks: {
        milano: [
          { label: 'Find Post Offices in Milano', url: cityResources.milano.postOffice, description: 'Locate nearest Sportello Amico in Milan' }
        ],
        roma: [
          { label: 'Find Post Offices in Roma', url: cityResources.roma.postOffice, description: 'Locate nearest Sportello Amico in Rome' }
        ],
        torino: [
          { label: 'Find Post Offices in Torino', url: cityResources.torino.postOffice, description: 'Locate nearest Sportello Amico in Turin' }
        ],
        pavia: [
          { label: 'Find Post Offices in Pavia', url: cityResources.pavia.postOffice, description: 'Locate nearest Sportello Amico in Pavia' }
        ]
      },
      tips: [
        'Practice filling out a draft version first before the official form',
        'Ask the post office staff for help if unsure about any sections',
        'The kit includes instructions - read them carefully before filling',
        'Bring an extra black pen in case yours runs out'
      ]
    }
  },
  {
    id: 'rp-passport-copies',
    name: 'Passport Copies',
    description: 'Photocopies of specific passport pages',
    image: passportImg,
    details: {
      keyInfo: 'You need copies of THREE specific pages: the data page (photo page), the visa page with your Italian student visa, and the page with your Schengen entry stamp.',
      acceptanceRules: {
        valid: [
          'Clear, legible photocopy of passport data page',
          'Copy of the page containing Italian student visa',
          'Copy of page with Schengen entry stamp',
          'All copies on A4 paper'
        ],
        invalid: [
          'Blurry or unreadable copies',
          'Missing any of the three required pages',
          'Color not required but must be clearly legible'
        ]
      },
      commonMistakes: [
        'Forgetting to copy the entry stamp page',
        'Not realizing the entry stamp might be on a different page than expected',
        'Making copies that are too dark or light to read'
      ],
      howToObtain: 'Make photocopies at any copy shop (copisteria), library, or some tobacco shops. Many post offices also have copy services.',
      tips: [
        'Make extra copies - you\'ll need them for other procedures too',
        'If you entered via another Schengen country, you need THAT entry stamp',
        'Some questuras may ask for copies of ALL passport pages - bring extras'
      ]
    }
  },
  {
    id: 'rp-codice-fiscale',
    name: 'Codice Fiscale Copy',
    description: 'Copy of your Italian tax code card or certificate',
    image: codiceFiscaleImg,
    details: {
      keyInfo: 'You need a copy of your Codice Fiscale. This can be the physical green card (tessera) or a printout of the certificate from Agenzia delle Entrate.',
      acceptanceRules: {
        valid: [
          'Photocopy of the physical Codice Fiscale card',
          'Printout of the certificate from Agenzia delle Entrate',
          'Document clearly showing your 16-character fiscal code'
        ],
        invalid: [
          'Handwritten fiscal code number',
          'Unclear or partial code'
        ]
      },
      commonMistakes: [
        'Not getting the Codice Fiscale before applying for residence permit',
        'Confusing the temporary certificate with the final card (both are valid)',
        'Not making copies before the appointment'
      ],
      howToObtain: 'You should have obtained this already from Agenzia delle Entrate. If you only have the temporary paper certificate, that works. The physical card arrives by mail later.',
      officialLinks: [
        {
          label: 'Agenzia delle Entrate',
          url: 'https://www.agenziaentrate.gov.it/portale/web/guest/servizi/istanze-e-richieste/richiesta-di-attribuzione-del-codice-fiscale',
          description: 'Official tax agency - request Codice Fiscale online'
        }
      ],
      citySpecificLinks: {
        milano: [
          { label: 'Milano Tax Offices', url: cityResources.milano.agenziaEntrate, description: 'Find Agenzia delle Entrate offices in Milano' }
        ],
        roma: [
          { label: 'Roma Tax Offices', url: cityResources.roma.agenziaEntrate, description: 'Find Agenzia delle Entrate offices in Roma' }
        ],
        torino: [
          { label: 'Torino Tax Offices', url: cityResources.torino.agenziaEntrate, description: 'Find Agenzia delle Entrate offices in Torino' }
        ],
        pavia: [
          { label: 'Pavia Tax Offices', url: cityResources.pavia.agenziaEntrate, description: 'Find Agenzia delle Entrate offices in Pavia' }
        ]
      },
      tips: [
        'Apply for the Codice Fiscale FIRST before the residence permit',
        'The paper certificate is equally valid as the plastic card',
        'Keep the original safe and use copies for applications'
      ]
    }
  },
  {
    id: 'rp-enrollment',
    name: 'University Enrollment Certificate',
    description: 'Official certificate proving you are currently enrolled',
    image: admissionLetterImg,
    details: {
      keyInfo: 'This is different from the admission letter - it proves you are CURRENTLY ENROLLED as a student. It must be recent (within last 3 months) and on official letterhead.',
      acceptanceRules: {
        valid: [
          'Official enrollment certificate (Certificato di Iscrizione)',
          'Document on university letterhead with official stamp',
          'Recent certificate (issued within last 3 months)',
          'Certificate stating current academic year enrollment'
        ],
        invalid: [
          'Admission letter (this is not enrollment proof)',
          'Student ID card alone',
          'Email confirmation without official stamp',
          'Certificate from previous academic year'
        ]
      },
      commonMistakes: [
        'Using the admission letter instead of enrollment certificate',
        'Getting a certificate that doesn\'t mention the current academic year',
        'Forgetting to request the official stamp and signature'
      ],
      howToObtain: 'Request from your university\'s Segreteria Studenti (Student Secretariat). Many universities allow you to download this from your student portal. Make sure it has the official stamp.',
      citySpecificLinks: {
        milano: [
          { label: 'Politecnico di Milano - Segreteria', url: cityResources.milano.universities[0].url, description: 'Get enrollment certificate from PoliMi' },
          { label: 'UniMi Student Services', url: cityResources.milano.universities[1].url, description: 'UniMi enrollment certificates' },
          { label: 'Bocconi Student Desk', url: cityResources.milano.universities[2].url, description: 'Bocconi enrollment services' }
        ],
        roma: [
          { label: 'Sapienza Segreteria', url: cityResources.roma.universities[0].url, description: 'Sapienza enrollment certificates' },
          { label: 'LUISS Student Office', url: cityResources.roma.universities[1].url, description: 'LUISS enrollment services' },
          { label: 'Roma Tre Services', url: cityResources.roma.universities[2].url, description: 'Roma Tre enrollment certificates' }
        ],
        torino: [
          { label: 'PoliTo Segreteria', url: cityResources.torino.universities[0].url, description: 'PoliTo enrollment certificates' },
          { label: 'UniTo Student Services', url: cityResources.torino.universities[1].url, description: 'UniTo enrollment services' }
        ],
        pavia: [
          { label: 'UniPV Segreteria', url: cityResources.pavia.universities[0].url, description: 'UniPV enrollment certificates' }
        ]
      },
      tips: [
        'Some universities charge a small fee for certified copies',
        'Request it in Italian - some offices require Italian documents',
        'Get multiple copies - you\'ll need them for other procedures',
        'Check if your university has an online portal to download certificates'
      ]
    }
  },
  {
    id: 'rp-insurance',
    name: 'Health Insurance Proof',
    description: 'Valid health insurance coverage for Italy',
    image: insuranceImg,
    details: {
      keyInfo: 'You need proof of health insurance valid in Italy. You can use private insurance OR enroll in the Italian National Health Service (SSN) - the SSN enrollment receipt is accepted.',
      acceptanceRules: {
        valid: [
          'Private health insurance policy valid in Italy',
          'SSN (Servizio Sanitario Nazionale) enrollment receipt',
          'European Health Insurance Card (EHIC) for EU citizens',
          'Insurance covering the entire stay period'
        ],
        invalid: [
          'Travel insurance with limited coverage',
          'Insurance that doesn\'t cover Italy specifically',
          'Expired insurance policy',
          'Insurance application (must be confirmed policy)'
        ]
      },
      commonMistakes: [
        'Using travel insurance instead of proper health insurance',
        'Not checking if the insurance is valid for student stays',
        'Waiting too long to enroll in SSN (do it early!)',
        'Not having the policy document in Italian or English'
      ],
      howToObtain: 'Option 1: Use your existing private insurance (check Italy coverage). Option 2: Enroll in Italian SSN at your local ASL office - costs around €150/year for students and provides full coverage.',
      officialLinks: [
        {
          label: 'Ministry of Health - SSN Info',
          url: 'https://www.salute.gov.it/portale/home.html',
          description: 'Official information on Italian healthcare system'
        }
      ],
      citySpecificLinks: {
        milano: [
          { label: 'ATS Milano - SSN Enrollment', url: cityResources.milano.aslHealth, description: 'Enroll in SSN in Milano region' }
        ],
        roma: [
          { label: 'ASL Roma - SSN Enrollment', url: cityResources.roma.aslHealth, description: 'Enroll in SSN in Roma' }
        ],
        torino: [
          { label: 'ASL Torino - SSN Enrollment', url: cityResources.torino.aslHealth, description: 'Enroll in SSN in Torino' }
        ],
        pavia: [
          { label: 'ASST Pavia - SSN Enrollment', url: cityResources.pavia.aslHealth, description: 'Enroll in SSN in Pavia region' }
        ]
      },
      tips: [
        'SSN enrollment takes 1-2 weeks to process - plan ahead',
        'The SSN enrollment receipt is valid proof while waiting for the health card',
        'SSN is often better value than private insurance for long stays',
        'Ask your university\'s international office for recommended insurance options'
      ]
    }
  },
  {
    id: 'rp-accommodation',
    name: 'Accommodation Proof',
    description: 'Document proving where you are living in Italy',
    image: accommodationImg,
    details: {
      keyInfo: 'You must prove where you are living. The most common proof is a rental contract (contratto di affitto) that includes the landlord\'s Codice Fiscale. Alternative: Cessione di fabbricato form.',
      acceptanceRules: {
        valid: [
          'Registered rental contract (contratto registrato)',
          'Cessione di fabbricato form signed by landlord',
          'Declaration of hospitality (dichiarazione di ospitalità)',
          'University dormitory confirmation letter'
        ],
        invalid: [
          'Unregistered rental agreement',
          'Airbnb or hotel booking (short-term stays)',
          'Informal arrangement without documentation',
          'Contract without landlord\'s fiscal code'
        ]
      },
      commonMistakes: [
        'Having an unregistered rental contract (must be registered with Agenzia delle Entrate)',
        'Not asking landlord to complete Cessione di fabbricato',
        'Not having the landlord\'s Codice Fiscale on the document',
        'Using a sublet without proper documentation'
      ],
      howToObtain: 'Ask your landlord for a copy of the registered rental contract. If staying with someone, ask them to complete the Cessione di fabbricato or Dichiarazione di ospitalità at their local police station.',
      citySpecificLinks: {
        milano: [
          { label: 'Questura di Milano', url: cityResources.milano.questura, description: 'Submit Cessione di fabbricato here' }
        ],
        roma: [
          { label: 'Questura di Roma', url: cityResources.roma.questura, description: 'Submit Cessione di fabbricato here' }
        ],
        torino: [
          { label: 'Questura di Torino', url: cityResources.torino.questura, description: 'Submit Cessione di fabbricato here' }
        ],
        pavia: [
          { label: 'Questura di Pavia', url: cityResources.pavia.questura, description: 'Submit Cessione di fabbricato here' }
        ]
      },
      tips: [
        'The landlord MUST complete Cessione di fabbricato within 48 hours of your arrival',
        'For university housing, request an official letter from the housing office',
        'Keep copies of all accommodation documents - you\'ll need them multiple times',
        'If your landlord is hesitant, explain it\'s a legal requirement'
      ]
    }
  },
  {
    id: 'rp-photos',
    name: 'Passport Photos',
    description: '4 recent passport-style photographs',
    image: photosImg,
    details: {
      keyInfo: 'You need 4 identical passport photos. They must be 35mm x 45mm, with white background, taken recently (within last 6 months), and showing your face clearly.',
      acceptanceRules: {
        valid: [
          '35mm x 45mm size',
          'White or light gray background',
          'Recent photo (within 6 months)',
          'Face clearly visible, neutral expression',
          'No glasses (unless prescribed for medical reasons)'
        ],
        invalid: [
          'Photos with colored or dark background',
          'Selfies or home-printed photos',
          'Old photos that don\'t match current appearance',
          'Photos with sunglasses or heavy shadows'
        ]
      },
      commonMistakes: [
        'Using photos with blue background (must be white)',
        'Bringing only 2 photos instead of 4',
        'Using photos from visa application that are now too old',
        'Photos where face is too small or too large in frame'
      ],
      howToObtain: 'Get photos at any photo shop (studio fotografico), many tobacco shops (tabaccheria), or photo booths in metro stations. Cost is usually €5-10 for 4 photos.',
      tips: [
        'Photo booths in metro stations are cheapest but quality varies',
        'Professional photo shops ensure correct specifications',
        'Bring extra photos - other bureaucratic processes will need them too',
        'Some questuras have photo services on-site but they\'re more expensive'
      ]
    }
  },
  {
    id: 'rp-marca-bollo',
    name: 'Marca da Bollo (Revenue Stamp)',
    description: 'Official revenue stamp required for the application',
    image: marcaBolloImg,
    details: {
      keyInfo: 'You need a €16.00 revenue stamp (marca da bollo). This is a physical stamp that you attach to your application. It must be exactly €16.00 face value.',
      acceptanceRules: {
        valid: [
          '€16.00 marca da bollo from authorized seller',
          'Stamp must not be expired',
          'Original stamp (not photocopy)'
        ],
        invalid: [
          'Wrong denomination (must be exactly €16.00)',
          'Used or cancelled stamps',
          'Foreign revenue stamps'
        ]
      },
      commonMistakes: [
        'Buying the wrong value stamp',
        'Attaching the stamp before being told where to put it',
        'Losing the stamp before the appointment',
        'Not knowing where to buy it'
      ],
      howToObtain: 'Buy at any tobacco shop (Tabaccheria - look for the "T" sign). Simply ask for "una marca da bollo da sedici euro" (a sixteen euro revenue stamp).',
      tips: [
        'Tabaccherie are the easiest place to find these',
        'Don\'t attach the stamp until instructed - they\'ll tell you where',
        'Buy it the day before your appointment to avoid last-minute stress',
        'Keep the receipt in case there are any issues'
      ]
    }
  }
];

// Export a helper to get documents by step ID
export const getDocumentsForStep = (stepId: string): ArrivalDocument[] => {
  switch (stepId) {
    case 'codice-fiscale':
      return codiceFiscaleDocuments;
    case 'residence-permit':
      return residencePermitDocuments;
    default:
      return [];
  }
};
