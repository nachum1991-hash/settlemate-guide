import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Calendar, AlertCircle, ExternalLink, Info, Globe, ChevronDown, ChevronUp, Check, X, AlertTriangle, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskChat } from "@/components/TaskChat";
import { TaskFAQ } from "@/components/TaskFAQ";

// Import document images
import passportImg from "@/assets/documents/passport.png";
import admissionImg from "@/assets/documents/admission-letter.png";
import insuranceImg from "@/assets/documents/insurance.png";
import accommodationImg from "@/assets/documents/accommodation.png";
import financialImg from "@/assets/documents/financial.png";
import photosImg from "@/assets/documents/photos.png";
import applicationImg from "@/assets/documents/application-form.png";
import paymentImg from "@/assets/documents/payment.png";

const countries = [
  { 
    value: "israel", 
    label: "Israel", 
    processingWeeks: "4-6", 
    embassyUrl: "https://ambtelaviv.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/isr/en/ita",
    passportRenewalUrl: "https://www.gov.il/en/service/biometric_passport",
    appointmentUrl: "https://prenotaonline.esteri.it/Login.aspx?cidsede=100046",
    apostilleInfo: "Required for sponsor letters - get from Ministry of Justice",
    paymentMethod: "Credit card or bank transfer at embassy"
  },
  { 
    value: "india", 
    label: "India", 
    processingWeeks: "6-8", 
    embassyUrl: "https://ambdelhi.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/ind/en/ita",
    passportRenewalUrl: "https://www.passportindia.gov.in/",
    appointmentUrl: "https://visa.vfsglobal.com/ind/en/ita/book-an-appointment",
    apostilleInfo: "Required - get from MEA (Ministry of External Affairs)",
    paymentMethod: "Cash or demand draft at VFS center"
  },
  { 
    value: "iran", 
    label: "Iran", 
    processingWeeks: "8-12", 
    embassyUrl: "https://ambtehran.esteri.it/", 
    vfsUrl: null,
    passportRenewalUrl: "https://epolice.ir/",
    appointmentUrl: "https://prenotaonline.esteri.it/",
    apostilleInfo: "Required - get from Ministry of Foreign Affairs",
    paymentMethod: "Check with embassy for current payment methods"
  },
  { 
    value: "turkey", 
    label: "Turkey", 
    processingWeeks: "4-6", 
    embassyUrl: "https://ambankara.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/tur/en/ita",
    passportRenewalUrl: "https://www.nvi.gov.tr/",
    appointmentUrl: "https://visa.vfsglobal.com/tur/en/ita/book-an-appointment",
    apostilleInfo: "Required - get from local notary or governorship",
    paymentMethod: "Cash at VFS center (Turkish Lira or Euro)"
  },
  { 
    value: "china", 
    label: "China", 
    processingWeeks: "6-10", 
    embassyUrl: "https://ambpechino.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/chn/en/ita",
    passportRenewalUrl: "https://www.nia.gov.cn/",
    appointmentUrl: "https://visa.vfsglobal.com/chn/en/ita/book-an-appointment",
    apostilleInfo: "Required - get from local notary public office",
    paymentMethod: "Online payment or cash at VFS center (CNY)"
  },
  { 
    value: "brazil", 
    label: "Brazil", 
    processingWeeks: "5-7", 
    embassyUrl: "https://ambbrasilia.esteri.it/", 
    vfsUrl: null,
    passportRenewalUrl: "https://www.gov.br/pt-br/servicos/obter-passaporte-comum",
    appointmentUrl: "https://prenotaonline.esteri.it/",
    apostilleInfo: "Required - get from local cartório (notary office)",
    paymentMethod: "Bank transfer (check embassy website for details)"
  },
  { 
    value: "pakistan", 
    label: "Pakistan", 
    processingWeeks: "8-10", 
    embassyUrl: "https://ambislamabad.esteri.it/", 
    vfsUrl: "https://visa.vfsglobal.com/pak/en/ita",
    passportRenewalUrl: "https://www.dgip.gov.pk/",
    appointmentUrl: "https://visa.vfsglobal.com/pak/en/ita/book-an-appointment",
    apostilleInfo: "Required - get from Ministry of Foreign Affairs",
    paymentMethod: "Cash at VFS center (PKR)"
  },
  { 
    value: "other", 
    label: "Other", 
    processingWeeks: "6-8", 
    embassyUrl: "https://www.esteri.it/en/ministero/la_rete_diplomatica/", 
    vfsUrl: null,
    passportRenewalUrl: null,
    appointmentUrl: "https://prenotaonline.esteri.it/",
    apostilleInfo: "Check with your local authorities for apostille requirements",
    paymentMethod: "Check with your local embassy for payment methods"
  }
];

interface DocumentDetails {
  whatIsIt: string;
  whyRequired: string;
  acceptanceRules: {
    valid: string[];
    invalid: string[];
  };
  commonMistakes: string[];
  howToObtain: string;
  officialLinks: Array<{
    label: string;
    url: string;
    description: string;
  }>;
  tips?: string[];
}

interface VisaDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  image: string;
  details: DocumentDetails;
}

const baseDocuments: VisaDocument[] = [
  {
    id: "passport",
    name: "Valid Passport",
    description: "Must be valid for at least 3 months after visa expiry date",
    required: true,
    image: passportImg,
    details: {
      whatIsIt: "Your passport is the government-issued travel document that proves your identity and citizenship. It's the most important document for your visa application.",
      whyRequired: "The Italian embassy needs your passport to issue the visa sticker and verify your identity. Without a valid passport, your application cannot proceed.",
      acceptanceRules: {
        valid: [
          "Valid for at least 3 months AFTER your visa expiry date (not entry date)",
          "At least 2 blank pages available for visa stamps",
          "Clean and undamaged condition",
          "Original passport (not a copy)"
        ],
        invalid: [
          "Expired or expiring within 3 months of visa end date",
          "Damaged, torn, or heavily worn passports",
          "Passports with no blank pages",
          "Temporary or emergency travel documents (usually rejected)"
        ]
      },
      commonMistakes: [
        "Not checking expiry date early enough - passport renewal takes 4-8 weeks in most countries",
        "Forgetting that validity must extend AFTER the visa ends, not just after arrival",
        "Not counting blank pages correctly (some stamps use full pages)",
        "Submitting a passport with water damage or torn pages"
      ],
      howToObtain: "Contact your country's passport authority at least 3 months before your intended travel. Many countries offer expedited processing for an additional fee. Check if your country allows passport renewal online.",
      officialLinks: [
        {
          label: "MAECI Visa Requirements",
          url: "https://vistoperitalia.esteri.it/home/en",
          description: "Official Italian visa portal with passport requirements"
        }
      ],
      tips: [
        "Make 2 color photocopies of your passport's main page",
        "Take a photo of your passport and store it securely online",
        "If your passport is close to expiry, renew it BEFORE starting the visa process"
      ]
    }
  },
  {
    id: "admission",
    name: "University Acceptance Letter",
    description: "Official acceptance from your Italian university",
    required: true,
    image: admissionImg,
    details: {
      whatIsIt: "The university acceptance letter (also called enrollment letter or admission letter) is an official document from your Italian university confirming your enrollment in a degree program.",
      whyRequired: "This letter proves you have a legitimate study purpose in Italy. The embassy uses it to verify your enrollment and understand the duration of your studies.",
      acceptanceRules: {
        valid: [
          "Final (unconditional) acceptance on official university letterhead",
          "Shows your full legal name exactly as in passport",
          "Includes program name, start date, and expected end date",
          "Contains official university stamp and/or authorized signature",
          "Dated within the last 3-6 months"
        ],
        invalid: [
          "Conditional offers (pending language test, pending documents)",
          "Letters without official university stamp or signature",
          "Pre-enrollment confirmations from UNIVERSITALY only (need university letter too)",
          "Letters with incorrect personal details",
          "Outdated letters from previous application cycles"
        ]
      },
      commonMistakes: [
        "Submitting a conditional acceptance instead of the final enrollment letter",
        "Letter missing program duration or exact dates",
        "Using an old letter from initial application instead of updated enrollment confirmation",
        "Not including both UNIVERSITALY confirmation AND university acceptance letter",
        "Name mismatch between passport and acceptance letter"
      ],
      howToObtain: "Download from your university's online portal. For Politecnico di Milano: Online Services → Career → Enrollment Status → Download Documents. For other universities, check your student portal under 'Documents' or 'Certificates' section.",
      officialLinks: [
        {
          label: "UNIVERSITALY Portal",
          url: "https://www.universitaly.it/",
          description: "Official pre-enrollment platform for international students"
        },
        {
          label: "Politecnico di Milano Services",
          url: "https://www.polimi.it/en/online-services/",
          description: "Access your enrollment documents"
        }
      ],
      tips: [
        "Request an English version if available (Italian is also accepted)",
        "If your name has changed, ensure all documents match",
        "Download multiple copies and save digitally",
        "Some universities provide a specific 'visa letter' - request this if available"
      ]
    }
  },
  {
    id: "application",
    name: "Visa Application Form",
    description: "Fill out the national D-visa application form for Italy",
    required: true,
    image: applicationImg,
    details: {
      whatIsIt: "The visa application form is the official document where you provide your personal information, travel details, and purpose of stay. For studies in Italy lasting more than 90 days, you need the Type D (National) visa form.",
      whyRequired: "This standardized form captures all information the embassy needs to process your visa application. Incomplete or incorrect forms are the most common cause of delays.",
      acceptanceRules: {
        valid: [
          "Completed entirely in CAPITAL LETTERS or typed",
          "All sections filled in (use 'N/A' for non-applicable fields)",
          "Signed and dated in ink (not digital signature)",
          "Using the current/latest form version",
          "Visa type selected: D (National) for Study/Studio"
        ],
        invalid: [
          "Handwritten in lowercase or illegible writing",
          "Blank fields left empty (must write N/A)",
          "Using outdated form versions",
          "Missing signature or date",
          "Wrong visa type selected (Schengen C instead of National D)"
        ]
      },
      commonMistakes: [
        "Selecting wrong visa type - must be 'D' (National), not 'C' (Schengen/tourist)",
        "Putting wrong dates - visa start should align with semester/program start",
        "Leaving 'Address in Italy' blank - use university address or temporary accommodation",
        "Writing 'tourism' or vague purposes instead of 'Study/Studio' in purpose field",
        "Forgetting to sign EVERY required signature field",
        "Using a form downloaded months ago (forms get updated)"
      ],
      howToObtain: "Download the latest form from the official Italian visa portal. Print clearly on A4 paper. Fill it out carefully, checking each field twice.",
      officialLinks: [
        {
          label: "Official MAECI Visa Portal",
          url: "https://vistoperitalia.esteri.it/home/en",
          description: "Download the official Type D visa application form"
        },
        {
          label: "Form Filling Guide",
          url: "https://vistoperitalia.esteri.it/Moduli/en/A_Application_Form_EN.pdf",
          description: "English version of the application form"
        }
      ],
      tips: [
        "Type of visa: Select 'D' (National/Long-stay)",
        "Number of entries: Select 'Multiple'",
        "Duration of stay: Match your program length (e.g., '365 days' for 1 year)",
        "Purpose: Write 'Studio' (Italian) or 'Study'",
        "Print 2 copies and keep one unsigned as backup"
      ]
    }
  },
  {
    id: "insurance",
    name: "Health Insurance",
    description: "Coverage for entire visa period (minimum €30,000)",
    required: true,
    image: insuranceImg,
    details: {
      whatIsIt: "Health insurance is a policy that covers medical expenses, hospitalization, and emergency repatriation during your stay in Italy. This protects both you and the Italian healthcare system.",
      whyRequired: "Italy requires proof that you won't burden the public healthcare system. This insurance ensures you can receive medical care without financial issues during your studies.",
      acceptanceRules: {
        valid: [
          "Minimum coverage of €30,000 (medical treatment + hospitalization)",
          "Covers the ENTIRE visa validity period (from entry to expiry)",
          "Valid in Italy and all Schengen countries",
          "Includes emergency medical repatriation",
          "Policy document in English or Italian (or with certified translation)"
        ],
        invalid: [
          "Basic travel insurance without medical coverage",
          "Coverage below €30,000",
          "Policy that doesn't cover Italy specifically",
          "Insurance starting AFTER your visa start date",
          "Coverage ending BEFORE your visa expiry date",
          "Policies that exclude pre-existing conditions (some embassies reject these)"
        ]
      },
      commonMistakes: [
        "Buying cheap travel insurance that only covers trip cancellation, not medical",
        "Coverage dates not matching visa dates exactly",
        "Not including emergency repatriation coverage",
        "Buying insurance from non-recognized providers",
        "Forgetting that coverage must start from day 1, not from arrival in Italy"
      ],
      howToObtain: "Purchase from embassy-approved insurance providers or international student insurers. Compare policies online and ensure they meet all Italian visa requirements. Get the policy certificate immediately after purchase.",
      officialLinks: [
        {
          label: "SWISSCARE Insurance",
          url: "https://www.swisscare.com/",
          description: "Commonly accepted for Italian student visas"
        },
        {
          label: "DR-WALTER EDUCARE24",
          url: "https://www.dr-walter.com/en/educare24.html",
          description: "Popular choice among international students"
        },
        {
          label: "ING Student Insurance",
          url: "https://www.ingstudent.com/",
          description: "Designed specifically for students in Italy"
        }
      ],
      tips: [
        "After arriving in Italy, you can enroll in SSN (Italian National Health Service) for €149.77/year",
        "Keep digital and printed copies of your insurance policy",
        "Save the 24-hour emergency contact number in your phone",
        "Check if your insurance offers direct billing to hospitals (avoids out-of-pocket payments)"
      ]
    }
  },
  {
    id: "financial",
    name: "Proof of Financial Means",
    description: "Bank statements showing €506/month or sponsorship letter",
    required: true,
    image: financialImg,
    details: {
      whatIsIt: "Financial proof demonstrates you have sufficient funds to support yourself during your studies in Italy without needing public assistance or illegal employment.",
      whyRequired: "Italy needs assurance that you can afford tuition, rent, food, and daily expenses. This is a key factor in visa approval decisions.",
      acceptanceRules: {
        valid: [
          "Minimum €6,079.45/year (€506.62/month × 12 months) - 2024/2025 rates",
          "Bank statements from last 3-6 months showing consistent balance",
          "Scholarship letter covering full amount (if applicable)",
          "Parent/sponsor bank statement WITH notarized sponsorship letter",
          "Official bank letterhead with stamps and authorized signatures"
        ],
        invalid: [
          "Screenshots of banking apps or online banking",
          "Cryptocurrency holdings or investments",
          "Bank statements showing insufficient funds",
          "Sponsor letter without accompanying bank proof",
          "Statements older than 3 months",
          "Handwritten or unofficial financial documents"
        ]
      },
      commonMistakes: [
        "Showing only current balance instead of consistent savings over months",
        "Sponsor letter not notarized or apostilled (required in many countries)",
        "Not accounting for full academic year (must show 12 months of support)",
        "Mixing multiple currencies without conversion",
        "Bank statement not translated when required",
        "Forgetting to include proof of scholarship if claiming one"
      ],
      howToObtain: "Request official bank statements from your bank (stamped and signed). If using a sponsor, they need to provide: their bank statements + a formal sponsorship letter + proof of relationship (if family member). Have sponsorship letters notarized at a public notary.",
      officialLinks: [
        {
          label: "MAECI Financial Requirements",
          url: "https://vistoperitalia.esteri.it/home/en",
          description: "Official guidelines on financial proof"
        }
      ],
      tips: [
        "The €506.62/month is a MINIMUM - showing more improves your application",
        "If sponsored, include relationship proof (birth certificate for parents)",
        "Scholarship holders: include official scholarship award letter",
        "Some embassies accept blocked bank accounts as proof",
        "Keep funds accessible until visa is approved (don't invest them)"
      ]
    }
  },
  {
    id: "accommodation",
    name: "Proof of Accommodation",
    description: "Rental contract, university housing letter, or declaration of hospitality",
    required: true,
    image: accommodationImg,
    details: {
      whatIsIt: "Accommodation proof is a document showing you have a confirmed place to stay in Italy. This can be permanent housing or temporary accommodation while you search for long-term options.",
      whyRequired: "The embassy needs to confirm you won't be homeless upon arrival. This also helps verify your declared address in Italy matches your application.",
      acceptanceRules: {
        valid: [
          "Signed rental contract with landlord details and property address",
          "University dormitory assignment/confirmation letter",
          "Dichiarazione di Ospitalità (hospitality declaration from Italian resident host)",
          "Hotel/Airbnb booking for first 2-4 weeks + statement of intent to find housing",
          "Letter from accommodation provider on official letterhead"
        ],
        invalid: [
          "Verbal agreements or promises",
          "Unverifiable 'promised' housing",
          "Screenshots of rental listings or searches",
          "Contracts missing landlord signature or property details",
          "Expired reservations or old contracts"
        ]
      },
      commonMistakes: [
        "Signing contracts with scammers - NEVER pay before seeing the property or verifying the landlord",
        "Contract missing landlord's full name, ID number, or signature",
        "Temporary booking without any plan for permanent housing",
        "Using fake accommodation letters (embassies verify these)",
        "Not having the landlord's codice fiscale (Italian tax code) on the contract"
      ],
      howToObtain: "University housing: Apply through your university's housing office. Private rentals: Use trusted platforms like Spotahome, HousingAnywhere, Immobiliare.it. For hospitality declaration: Your Italian host must submit this at their local police station (Questura).",
      officialLinks: [
        {
          label: "Politecnico di Milano Housing",
          url: "https://www.residenze.polimi.it/",
          description: "Official university housing service"
        },
        {
          label: "Spotahome",
          url: "https://www.spotahome.com/",
          description: "Verified rentals with virtual viewings"
        },
        {
          label: "HousingAnywhere",
          url: "https://housinganywhere.com/",
          description: "Student-focused accommodation platform"
        }
      ],
      tips: [
        "SCAM WARNING: Never wire money abroad before arrival or without verification",
        "University housing is safest but limited - apply early (deadlines are often in May/June)",
        "Temporary accommodation for first month is acceptable - mention you'll find permanent housing",
        "If staying with someone in Italy, they need to submit the hospitality declaration BEFORE your visa appointment"
      ]
    }
  },
  {
    id: "photos",
    name: "Passport Photos",
    description: "2 recent passport-sized photos (35x45mm, white background)",
    required: true,
    image: photosImg,
    details: {
      whatIsIt: "Biometric-style passport photographs that will be used on your visa sticker and official records. These must meet specific Italian/Schengen standards.",
      whyRequired: "Photos are attached to your visa application and used for identification purposes. Non-compliant photos can delay your application.",
      acceptanceRules: {
        valid: [
          "Size: 35mm × 45mm (Italian standard) or 35mm × 40mm",
          "Taken within the last 6 months",
          "White or light gray/cream background",
          "Face clearly visible, centered, looking directly at camera",
          "Neutral expression (mouth closed)",
          "No glasses, hats, or head coverings (religious exceptions with face fully visible)",
          "Printed on high-quality photo paper"
        ],
        invalid: [
          "Selfies or home-printed photos",
          "Smiling with teeth showing",
          "Photos older than 6 months",
          "Dark or colored backgrounds",
          "Shadows on face or background",
          "Photos where face takes less than 70% of frame",
          "Wearing glasses (even clear ones - new rule in many embassies)"
        ]
      },
      commonMistakes: [
        "Using photos from previous visa applications (must be recent)",
        "Wrong dimensions - check your embassy's specific requirements",
        "Wearing glasses - most embassies now require photos without any eyewear",
        "Background not pure white or light enough",
        "Photo quality too low (pixelated when printed)"
      ],
      howToObtain: "Visit a professional photo studio or passport photo booth. Many pharmacies offer this service. Specify 'Italian visa photo' or 'Schengen visa photo' requirements. Some embassies take photos on-site.",
      officialLinks: [
        {
          label: "ICAO Photo Guidelines",
          url: "https://www.icao.int/Security/FAL/TRIP/Documents/TR%20-%20Portrait%20Quality.pdf",
          description: "International standards for travel document photos"
        }
      ],
      tips: [
        "Bring 4 photos (embassy keeps 2, keep extras for other documents)",
        "Ask the photo studio to confirm Schengen/Italian visa specifications",
        "Keep photos in an envelope to prevent damage",
        "If you wear glasses daily, bring them but remove for the photo"
      ]
    }
  },
  {
    id: "fee",
    name: "Visa Fee Payment",
    description: "€116 national visa fee (payment method varies by embassy)",
    required: true,
    image: paymentImg,
    details: {
      whatIsIt: "The visa processing fee that covers administrative costs of reviewing your application. This is a mandatory government fee.",
      whyRequired: "No visa application is processed without payment of the required fee. This is non-refundable even if your visa is denied.",
      acceptanceRules: {
        valid: [
          "€116 for National (D) visa - standard fee for most embassies",
          "Payment in accepted currency (usually local currency or EUR)",
          "Payment method as specified by your embassy (cash, card, bank transfer)",
          "Payment receipt kept as proof"
        ],
        invalid: [
          "Insufficient payment amount",
          "Payment in wrong currency",
          "Using payment methods not accepted by specific embassy"
        ]
      },
      commonMistakes: [
        "Not checking your specific embassy's accepted payment methods",
        "Bringing only card when embassy requires cash (or vice versa)",
        "Not having exact change when cash is required",
        "Confusing Schengen (C) visa fee with National (D) visa fee"
      ],
      howToObtain: "Check your embassy's website for exact fee and payment methods. Some embassies require bank transfer before appointment; others accept payment on the day. VFS Global centers may have additional service fees.",
      officialLinks: [
        {
          label: "Check Your Embassy",
          url: "https://www.esteri.it/en/ministero/la_rete_diplomatica/",
          description: "Find your embassy and specific payment requirements"
        }
      ],
      tips: [
        "Fee is NON-REFUNDABLE even if visa is denied - prepare documents carefully",
        "VFS Global adds service fees (usually €20-30) on top of visa fee",
        "Some embassies offer reduced fees for scholarship holders - ask in advance",
        "Keep payment receipt with your documents"
      ]
    }
  },
  {
    id: "embassy-appointment",
    name: "Embassy Appointment",
    description: "Schedule and prepare for your visa submission appointment",
    required: true,
    image: applicationImg,
    details: {
      whatIsIt: "Your scheduled appointment at the Italian embassy, consulate, or VFS Global center where you submit your application, documents, and provide biometrics (fingerprints and photo).",
      whyRequired: "In-person submission is mandatory for student visas. The embassy needs to verify your identity and collect biometric data for the visa.",
      acceptanceRules: {
        valid: [
          "Confirmed appointment at correct embassy/consulate for your region",
          "Appointment scheduled when all documents are ready",
          "Appointment time allows for processing before your intended travel date",
          "Booking confirmation email/SMS printed"
        ],
        invalid: [
          "Appointment at embassy in wrong jurisdiction",
          "Showing up without confirmed appointment",
          "Appointment too close to travel date (no time for processing)"
        ]
      },
      commonMistakes: [
        "Waiting too long to book - appointment slots fill up fast during June-August peak season",
        "Booking at wrong embassy/consulate (must be in your region of residence)",
        "Forgetting to bring ALL required documents on appointment day",
        "Arriving late - most embassies cancel appointments if you're late",
        "Not bringing the appointment confirmation printout"
      ],
      howToObtain: "Book through VFS Global (most countries) or directly through the embassy website. Check which booking system your embassy uses. Set calendar reminders for appointment opening dates.",
      officialLinks: [
        {
          label: "VFS Global Italy",
          url: "https://visa.vfsglobal.com/",
          description: "Primary appointment booking for most countries"
        },
        {
          label: "Prenota Online",
          url: "https://prenotaonline.esteri.it/",
          description: "Direct embassy booking system"
        },
        {
          label: "Find Your Embassy",
          url: "https://www.esteri.it/en/ministero/la_rete_diplomatica/",
          description: "Italian diplomatic network worldwide"
        }
      ],
      tips: [
        "Book as soon as all documents are ready - don't wait!",
        "Peak season (June-August): Book 4-6 weeks in advance minimum",
        "Arrive 15-30 minutes early on appointment day",
        "Dress professionally and be polite - first impressions matter",
        "Bring ALL original documents + 2 photocopies of each",
        "Prepare for basic questions about your studies and plans",
        "Your passport will be kept during processing - plan accordingly"
      ]
    }
  },
  {
    id: "final-check",
    name: "Final Document Check",
    description: "Pre-submission checklist to ensure everything is ready",
    required: true,
    image: paymentImg,
    details: {
      whatIsIt: "A final verification step before your embassy appointment to ensure all documents are complete, organized, and ready for submission.",
      whyRequired: "Missing or incomplete documents are the #1 cause of visa delays and rejections. This final check prevents last-minute problems.",
      acceptanceRules: {
        valid: [
          "All required documents present and complete",
          "All photocopies made (originals + 2 copies of each)",
          "Documents organized in logical order",
          "Translations completed and certified where required",
          "All documents within validity dates"
        ],
        invalid: [
          "Missing any required document",
          "Documents not translated when required",
          "Expired documents or outdated information",
          "Messy or disorganized document folder"
        ]
      },
      commonMistakes: [
        "Forgetting photocopies of documents",
        "Not organizing documents in order",
        "Missing translations of documents not in Italian/English",
        "Bringing expired bank statements or insurance",
        "Forgetting appointment confirmation printout"
      ],
      howToObtain: "Use the checklist below to verify every item before your appointment. Check off each item and double-check anything you're unsure about.",
      officialLinks: [
        {
          label: "MAECI Visa Requirements",
          url: "https://vistoperitalia.esteri.it/home/en",
          description: "Official requirements reference"
        }
      ],
      tips: [
        "Check: Passport valid 3+ months after visa ends, 2+ blank pages",
        "Check: Visa application form complete, signed, dated",
        "Check: University acceptance letter (final, with dates)",
        "Check: Health insurance (€30,000+, matching visa dates)",
        "Check: Financial proof (€506+/month for study duration)",
        "Check: Accommodation proof (contract, letter, or declaration)",
        "Check: 4 passport photos (35×45mm, recent)",
        "Check: Visa fee ready (check payment method with embassy)",
        "Check: All foreign documents translated to Italian/English",
        "Check: Originals + 2 photocopies of everything",
        "Check: Embassy appointment confirmation printed",
        "Organization tip: Use a folder with labeled sections for each document type"
      ]
    }
  }
];

const VisaWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    university: "polimi",
    intendedArrival: ""
  });
  const [documentStatus, setDocumentStatus] = useState<Record<string, boolean>>({});
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);

  const totalSteps = 5;
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

  const documents = baseDocuments;
  const completedDocs = Object.values(documentStatus).filter(Boolean).length;
  const selectedCountryData = countries.find(c => c.value === formData.country);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const toggleDocument = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocumentStatus(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const toggleExpanded = (docId: string) => {
    setExpandedDocument(prev => prev === docId ? null : docId);
  };

  // Generate country-specific links for each document
  const getCountrySpecificLinks = (documentId: string) => {
    if (!selectedCountryData) return [];
    
    const countryLinks: Array<{ label: string; url: string; description: string }> = [];
    
    switch (documentId) {
      case "passport":
        if (selectedCountryData.passportRenewalUrl) {
          countryLinks.push({
            label: `${selectedCountryData.label} Passport Services`,
            url: selectedCountryData.passportRenewalUrl,
            description: `Official passport renewal for ${selectedCountryData.label}`
          });
        }
        break;
      case "embassy-appointment":
        countryLinks.push({
          label: `Italian Embassy in ${selectedCountryData.label}`,
          url: selectedCountryData.embassyUrl,
          description: "Official embassy website"
        });
        if (selectedCountryData.vfsUrl) {
          countryLinks.push({
            label: `VFS Global ${selectedCountryData.label}`,
            url: selectedCountryData.vfsUrl,
            description: "Book your visa appointment"
          });
        }
        if (selectedCountryData.appointmentUrl) {
          countryLinks.push({
            label: "Book Appointment",
            url: selectedCountryData.appointmentUrl,
            description: "Direct appointment booking link"
          });
        }
        break;
      case "fee":
        countryLinks.push({
          label: `Embassy in ${selectedCountryData.label}`,
          url: selectedCountryData.embassyUrl,
          description: `Payment: ${selectedCountryData.paymentMethod}`
        });
        break;
      case "financial":
        if (selectedCountryData.apostilleInfo) {
          countryLinks.push({
            label: `Apostille in ${selectedCountryData.label}`,
            url: selectedCountryData.embassyUrl,
            description: selectedCountryData.apostilleInfo
          });
        }
        break;
    }
    
    return countryLinks;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return formData.fullName && formData.email;
      case 2:
        return formData.country;
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary py-4 sm:py-6 px-4 shadow-elevated">
        <div className="container mx-auto max-w-4xl">
          <Link to="/">
            <Button
              variant="ghost"
              className="mb-3 sm:mb-4 text-primary-foreground hover:bg-primary-foreground/10 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
            Italian Student Visa Wizard
          </h1>
          <p className="text-sm sm:text-base text-primary-foreground/90 mt-1 sm:mt-2">
            Step-by-step guidance for your D-Visa application
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-muted/50 py-4 sm:py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {currentStep === 0 ? "Overview" : `Step ${currentStep} of ${totalSteps - 1}`}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1.5 sm:h-2" />
          
          {/* Step indicators */}
          <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-4 sm:mt-6">
            {[
              { num: 0, label: "Overview" },
              { num: 1, label: "Personal Info" },
              { num: 2, label: "Country" },
              { num: 3, label: "Documents" },
              { num: 4, label: "Timeline" }
            ].map((step) => (
              <div
                key={step.num}
                className={cn(
                  "flex flex-col items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-lg transition-all min-h-[44px]",
                  currentStep === step.num && "bg-primary/10",
                  currentStep > step.num && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
                    currentStep === step.num && "bg-primary text-primary-foreground",
                    currentStep > step.num && "bg-success text-success-foreground",
                    currentStep < step.num && "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.num ? <CheckCircle2 className="w-4 h-4 sm:w-4 sm:h-4" /> : step.num === 0 ? <Info className="w-4 h-4" /> : step.num}
                </div>
                <span className="text-[10px] sm:text-xs text-center font-medium leading-tight">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 sm:py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-4 sm:p-6 md:p-8 shadow-elevated">
            {/* Step 0: Overview */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Understanding the Italian Student Visa</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Before we start your application, here's what you need to know about the D-Visa process.
                  </p>
                </div>

                {/* Visa Overview */}
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    What is the Italian Student Visa (D-Visa)?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Type D (National) visa is required for non-EU students planning to study in Italy for more than 90 days. 
                    This visa allows you to:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Stay in Italy for the duration of your studies
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Work part-time (up to 20 hours/week during semester)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Travel within the Schengen Area
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Apply for a Residence Permit (Permesso di Soggiorno) upon arrival
                    </li>
                  </ul>
                </Card>

                {/* Process Overview */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">The Application Process</h3>
                  <div className="space-y-3">
                    {[
                      { step: 1, title: "Gather Documents", desc: "Collect all required documents (admission letter, passport, insurance, etc.)" },
                      { step: 2, title: "Book Embassy Appointment", desc: "Schedule your visa appointment at the Italian embassy/consulate" },
                      { step: 3, title: "Attend Interview", desc: "Submit documents and provide biometrics at your appointment" },
                      { step: 4, title: "Wait for Processing", desc: "Typical processing time is 4-12 weeks depending on your country" },
                      { step: 5, title: "Receive Visa", desc: "Collect your passport with the visa stamp and book your flight!" }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{item.step}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Resources */}
                <Card className="p-6 bg-secondary/5 border-secondary/20">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-secondary" />
                    Official Resources
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="https://vistoperitalia.esteri.it/home/en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                    >
                      <Globe className="w-4 h-4 text-secondary" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground group-hover:text-secondary">Official Visa Portal</span>
                        <p className="text-xs text-muted-foreground">vistoperitalia.esteri.it</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                    <a
                      href="https://www.esteri.it/en/ministero/la_rete_diplomatica/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                    >
                      <Globe className="w-4 h-4 text-secondary" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground group-hover:text-secondary">Find Your Embassy</span>
                        <p className="text-xs text-muted-foreground">Italian diplomatic network</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  </div>
                </Card>

                <Button onClick={handleNext} className="w-full" size="lg">
                  Start Application Wizard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Personal Information</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Let's start with your basic details</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name (as in passport)</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">Italian University</Label>
                    <Select value={formData.university} onValueChange={(value) => setFormData({ ...formData, university: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="polimi">Politecnico di Milano</SelectItem>
                        <SelectItem value="unimi">University of Milano</SelectItem>
                        <SelectItem value="bocconi">Bocconi University</SelectItem>
                        <SelectItem value="sapienza">Sapienza University of Rome</SelectItem>
                        <SelectItem value="polito">Politecnico di Torino</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrival">Intended Arrival Date</Label>
                    <Input
                      id="arrival"
                      type="date"
                      value={formData.intendedArrival}
                      onChange={(e) => setFormData({ ...formData, intendedArrival: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Country Selection */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Country of Residence</h2>
                  <p className="text-muted-foreground">
                    Select where you'll be applying from - this determines embassy processing times
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Select Your Country</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.country && selectedCountryData && (
                  <>
                    <Card className="p-6 bg-primary/5 border-primary/20 animate-in fade-in duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">Processing Time for {selectedCountryData.label}</h3>
                          <p className="text-2xl font-bold text-primary mb-2">{selectedCountryData.processingWeeks} weeks</p>
                          <p className="text-sm text-muted-foreground">
                            This is the typical processing time at the Italian embassy/consulate in {selectedCountryData.label}.
                            We recommend applying at least 2 months before your intended travel date.
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Embassy Links */}
                    <Card className="p-6 bg-secondary/5 border-secondary/20">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-secondary" />
                        Embassy & Appointment Links
                      </h3>
                      <div className="space-y-3">
                        <a
                          href={selectedCountryData.embassyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                        >
                          <ExternalLink className="w-4 h-4 text-secondary" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground group-hover:text-secondary">
                              Italian Embassy in {selectedCountryData.label}
                            </span>
                            <p className="text-xs text-muted-foreground">Official embassy website</p>
                          </div>
                        </a>
                        {selectedCountryData.vfsUrl && (
                          <a
                            href={selectedCountryData.vfsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                          >
                            <ExternalLink className="w-4 h-4 text-secondary" />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-foreground group-hover:text-secondary">
                                VFS Global - Book Appointment
                              </span>
                              <p className="text-xs text-muted-foreground">Schedule your visa appointment</p>
                            </div>
                          </a>
                        )}
                        <a
                          href="https://prenotaonline.esteri.it/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-secondary/10 transition-colors group"
                        >
                          <ExternalLink className="w-4 h-4 text-secondary" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground group-hover:text-secondary">
                              Prenota Online
                            </span>
                            <p className="text-xs text-muted-foreground">Alternative appointment booking system</p>
                          </div>
                        </a>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Document Checklist */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Document Checklist</h2>
                  <p className="text-muted-foreground">
                    Click on each document to see detailed instructions and requirements
                  </p>
                  <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">
                      {completedDocs} of {documents.length} documents ready
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card
                      key={doc.id}
                      className={cn(
                        "transition-all",
                        documentStatus[doc.id] && "bg-success/5 border-success/30",
                        expandedDocument === doc.id && "ring-2 ring-primary/20"
                      )}
                    >
                      {/* Card Header - Always visible */}
                      <div
                        className="p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleExpanded(doc.id)}
                      >
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          {/* Document Image */}
                          <div className="w-full sm:w-16 h-40 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30">
                            <img 
                              src={doc.image} 
                              alt={doc.name}
                              className="w-full h-full object-contain sm:object-cover"
                            />
                          </div>

                          <div className="flex items-start gap-3 w-full">
                            <div 
                              className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                              onClick={(e) => toggleDocument(doc.id, e)}
                            >
                              <Checkbox
                                checked={documentStatus[doc.id] || false}
                                onCheckedChange={() => {}}
                                className="flex-shrink-0"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-semibold text-sm sm:text-base text-foreground">{doc.name}</h4>
                                {doc.required && (
                                  <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full font-medium whitespace-nowrap">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground">{doc.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {documentStatus[doc.id] ? (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                              {expandedDocument === doc.id ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedDocument === doc.id && (
                        <div className="px-4 pb-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                          <div className="pt-4 space-y-4">
                            {/* What is it */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                What is this document?
                              </h5>
                              <p className="text-sm text-muted-foreground pl-6">
                                {doc.details.whatIsIt}
                              </p>
                            </div>

                            {/* Why required */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Info className="w-4 h-4 text-secondary" />
                                Why is it required?
                              </h5>
                              <p className="text-sm text-muted-foreground pl-6">
                                {doc.details.whyRequired}
                              </p>
                            </div>

                            {/* Acceptance Rules */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Valid */}
                              <div className="space-y-2 p-3 bg-success/5 rounded-lg border border-success/20">
                                <h5 className="text-sm font-semibold text-success flex items-center gap-2">
                                  <Check className="w-4 h-4" />
                                  What's Accepted
                                </h5>
                                <ul className="space-y-1.5">
                                  {doc.details.acceptanceRules.valid.map((rule, idx) => (
                                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <Check className="w-3 h-3 text-success flex-shrink-0 mt-0.5" />
                                      {rule}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Invalid */}
                              <div className="space-y-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                                <h5 className="text-sm font-semibold text-destructive flex items-center gap-2">
                                  <X className="w-4 h-4" />
                                  What's NOT Accepted
                                </h5>
                                <ul className="space-y-1.5">
                                  {doc.details.acceptanceRules.invalid.map((rule, idx) => (
                                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <X className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
                                      {rule}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Common Mistakes */}
                            <div className="space-y-2 p-3 bg-warning/5 rounded-lg border border-warning/20">
                              <h5 className="text-sm font-semibold text-warning flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Common Mistakes to Avoid
                              </h5>
                              <ul className="space-y-1.5">
                                {doc.details.commonMistakes.map((mistake, idx) => (
                                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
                                    {mistake}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* How to Obtain */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                How to Obtain
                              </h5>
                              <p className="text-sm text-muted-foreground pl-6">
                                {doc.details.howToObtain}
                              </p>
                            </div>

                            {/* Official Links */}
                            {(() => {
                              const countryLinks = getCountrySpecificLinks(doc.id);
                              const allLinks = [...countryLinks, ...doc.details.officialLinks];
                              
                              if (allLinks.length === 0) return null;
                              
                              return (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-secondary" />
                                    Official Links & Resources
                                    {countryLinks.length > 0 && selectedCountryData && (
                                      <span className="text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        {selectedCountryData.label}
                                      </span>
                                    )}
                                  </h5>
                                  {!formData.country && (
                                    <p className="text-xs text-muted-foreground pl-6 italic">
                                      Select your country in Step 2 to see country-specific links
                                    </p>
                                  )}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                                    {allLinks.map((link, idx) => (
                                      <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                          "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-xs",
                                          idx < countryLinks.length ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                                        )}
                                      >
                                        <ExternalLink className={cn(
                                          "w-3 h-3 flex-shrink-0",
                                          idx < countryLinks.length ? "text-primary" : "text-secondary"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                          <span className="font-medium text-foreground group-hover:text-secondary block truncate">
                                            {link.label}
                                          </span>
                                          <span className="text-muted-foreground truncate block">
                                            {link.description}
                                          </span>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Tips */}
                            {doc.details.tips && doc.details.tips.length > 0 && (
                              <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                <h5 className="text-sm font-semibold text-primary flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Pro Tips
                                </h5>
                                <ul className="space-y-1.5">
                                  {doc.details.tips.map((tip, idx) => (
                                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <Lightbulb className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Mark as Ready Button */}
                            <div className="pt-2">
                              <Button
                                variant={documentStatus[doc.id] ? "outline" : "default"}
                                size="sm"
                                onClick={(e) => toggleDocument(doc.id, e)}
                                className="w-full sm:w-auto"
                              >
                                {documentStatus[doc.id] ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Marked as Ready
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-4 h-4 mr-2" />
                                    Mark as Ready
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                <Card className="p-6 bg-accent/5 border-accent/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Important Tips</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Make copies of all documents - bring both originals and copies to your appointment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>All documents in foreign languages must be officially translated to Italian or English</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Book your embassy appointment as soon as you have all required documents</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 4: Timeline & Next Steps */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Your Visa Timeline</h2>
                  <p className="text-muted-foreground">
                    Here's what to expect and when
                  </p>
                </div>

                {/* Timeline visualization */}
                <div className="space-y-4">
                  <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Now: Prepare Documents</h3>
                      <p className="text-sm text-muted-foreground">
                        Gather all required documents. Most students need 1-2 weeks for this step.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Week 2: Book Embassy Appointment</h3>
                      <p className="text-sm text-muted-foreground">
                        Once documents are ready, book your appointment at the Italian embassy/consulate.
                        Appointment slots can fill up quickly during peak season (June-August).
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Week 3-4: Attend Appointment</h3>
                      <p className="text-sm text-muted-foreground">
                        Submit your application, documents, and biometrics at the embassy.
                        Your passport will be kept during processing.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-success" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">
                        Week {selectedCountryData ? selectedCountryData.processingWeeks.split('-')[0] : '6'}-
                        {selectedCountryData ? selectedCountryData.processingWeeks.split('-')[1] : '8'}: Receive Visa
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        After {selectedCountryData?.processingWeeks || '6-8'} weeks, collect your passport with the visa stamp.
                        You can then book your flight to Italy!
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="p-6 bg-success/5 border-success/30">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">You're All Set!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You now have a complete understanding of the visa process. Remember to start early and
                        keep copies of everything you submit.
                      </p>
                      
                      {/* FAQ and Chat Tabs */}
                      <Tabs defaultValue="faq" className="w-full mt-6">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="faq">FAQs</TabsTrigger>
                          <TabsTrigger value="chat">Community Chat</TabsTrigger>
                        </TabsList>
                        <TabsContent value="faq" className="mt-4">
                          <TaskFAQ taskId="visa" phase="phase-1" />
                        </TabsContent>
                        <TabsContent value="chat" className="mt-4">
                          <TaskChat taskId="visa" phase="phase-1" />
                        </TabsContent>
                      </Tabs>
                      
                      <Link to="/" className="block mt-6">
                        <Button className="w-full">
                          Return to Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 sm:mt-8 pt-6 sm:pt-8 border-t gap-3">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="text-sm sm:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Back</span>
              </Button>

              {currentStep < totalSteps - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">{currentStep === 0 ? "Start" : "Next Step"}</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Button>
              ) : (
                <Link to="/">
                  <Button className="text-sm sm:text-base">
                    Finish
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisaWizard;
