import { City } from '@/contexts/CityContext';

export interface CityBureaucracyInfo {
  questura: {
    name: string;
    address: string;
    website: string;
  };
  agenziaEntrate: {
    name: string;
    address: string;
    hours: string;
  };
  transport: {
    name: string;
    cardName: string;
    website: string;
    studentPrice: string;
    studentPassUrl: string;
  };
  universities: string[];
  esnChapter: {
    name: string;
    url: string;
  };
  neighborhoods: string[];
}

export const cityData: Record<City, CityBureaucracyInfo> = {
  milano: {
    questura: {
      name: "Questura di Milano",
      address: "Via Fatebenefratelli 11, 20121 Milano",
      website: "https://questure.poliziadistato.it/Milano"
    },
    agenziaEntrate: {
      name: "Agenzia delle Entrate Milano 1",
      address: "Via Manin 25, 20121 Milano",
      hours: "Mon-Fri 8:30-13:30"
    },
    transport: {
      name: "ATM Milano",
      cardName: "ATM Card",
      website: "https://www.atm.it/",
      studentPrice: "€200/year (under 27)",
      studentPassUrl: "https://www.atm.it/IT/VIAGGIACONNOI/ABBONAMENTI/Pagine/Tipologie.aspx"
    },
    universities: ["Politecnico di Milano", "Università degli Studi di Milano", "Bocconi University", "Cattolica"],
    esnChapter: {
      name: "ESN Milano",
      url: "https://milanopolitecnico.esn.it/"
    },
    neighborhoods: ["Città Studi", "Navigli", "Porta Romana", "Isola", "Lambrate"]
  },
  roma: {
    questura: {
      name: "Questura di Roma",
      address: "Via di San Vitale 15, 00184 Roma",
      website: "https://questure.poliziadistato.it/Roma"
    },
    agenziaEntrate: {
      name: "Agenzia delle Entrate Roma 1",
      address: "Via Ippolito Nievo 36, 00153 Roma",
      hours: "Mon-Fri 8:30-13:30"
    },
    transport: {
      name: "ATAC Roma",
      cardName: "Metrebus Card",
      website: "https://www.atac.roma.it/",
      studentPrice: "€250/year",
      studentPassUrl: "https://www.atac.roma.it/biglietti-e-abbonamenti/abbonamenti"
    },
    universities: ["Sapienza Università di Roma", "LUISS Guido Carli", "Roma Tre", "Tor Vergata"],
    esnChapter: {
      name: "ESN Roma",
      url: "https://romaase.esn.it/"
    },
    neighborhoods: ["San Lorenzo", "Trastevere", "Pigneto", "Testaccio", "Monteverde"]
  },
  torino: {
    questura: {
      name: "Questura di Torino",
      address: "Corso Vinzaglio 10, 10121 Torino",
      website: "https://questure.poliziadistato.it/Torino"
    },
    agenziaEntrate: {
      name: "Agenzia delle Entrate Torino 1",
      address: "Via Alfieri 11, 10121 Torino",
      hours: "Mon-Fri 8:30-13:30"
    },
    transport: {
      name: "GTT Torino",
      cardName: "GTT Card",
      website: "https://www.gtt.to.it/",
      studentPrice: "€180/year",
      studentPassUrl: "https://www.gtt.to.it/cms/biglietti-abbonamenti/7326-abbonamenti-under-26"
    },
    universities: ["Politecnico di Torino", "Università degli Studi di Torino"],
    esnChapter: {
      name: "ESN Torino",
      url: "https://torino.esn.it/"
    },
    neighborhoods: ["San Salvario", "Vanchiglia", "Crocetta", "Cenisia", "Aurora"]
  },
  pavia: {
    questura: {
      name: "Questura di Pavia",
      address: "Viale Matteotti 63, 27100 Pavia",
      website: "https://questure.poliziadistato.it/Pavia"
    },
    agenziaEntrate: {
      name: "Agenzia delle Entrate Pavia",
      address: "Via Bordoni 16, 27100 Pavia",
      hours: "Mon-Fri 8:30-12:30"
    },
    transport: {
      name: "Line Pavia",
      cardName: "Abbonamento Bus",
      website: "https://www.lineservizi.it/",
      studentPrice: "€150/year",
      studentPassUrl: "https://www.lineservizi.it/abbonamenti"
    },
    universities: ["Università degli Studi di Pavia", "IUSS Pavia"],
    esnChapter: {
      name: "ESN Pavia",
      url: "https://pavia.esn.it/"
    },
    neighborhoods: ["Centro Storico", "Borgo Ticino", "Città Giardino", "Zona Ospedale"]
  }
};

// University groups by city
export const universityGroupsByCity: Record<City, Array<{
  university: string;
  groups: Array<{ name: string; url: string; platform: string; members: string }>;
}>> = {
  milano: [
    {
      university: "Politecnico di Milano",
      groups: [
        { name: "PoliNetwork Groups Hub", url: "https://linktr.ee/polinetwork", platform: "Multi-platform", members: "" },
        { name: "ESN Polimi", url: "https://milanopolitecnico.esn.it/", platform: "Website", members: "" },
        { name: "Polimi International", url: "https://www.facebook.com/groups/polimiinternational", platform: "Facebook", members: "" }
      ]
    },
    {
      university: "University of Milano",
      groups: [
        { name: "ESN Milano Statale", url: "https://milanostatale.esn.it/", platform: "Website", members: "" },
        { name: "UniMi International Students", url: "https://www.facebook.com/groups/unimiinternational", platform: "Facebook", members: "" }
      ]
    },
    {
      university: "Bocconi University",
      groups: [
        { name: "ESN Bocconi", url: "https://bocconi.esn.it/", platform: "Website", members: "" },
        { name: "Bocconi Students", url: "https://www.facebook.com/groups/bocconistudents", platform: "Facebook", members: "" }
      ]
    }
  ],
  roma: [
    {
      university: "Sapienza Università di Roma",
      groups: [
        { name: "Sapienza Students Network", url: "https://sapienzastudents.net/", platform: "Multi-platform", members: "" },
        { name: "ESN Roma ASE (Sapienza)", url: "https://romaase.esn.it/", platform: "Website", members: "" },
        { name: "Sapienza International", url: "https://www.facebook.com/groups/sapienzainternational", platform: "Facebook", members: "" }
      ]
    },
    {
      university: "LUISS Guido Carli",
      groups: [
        { name: "ESN Roma LUISS", url: "https://romaluiss.esn.it/", platform: "Website", members: "" }
      ]
    },
    {
      university: "Roma Tre",
      groups: [
        { name: "ESN Roma Tre", url: "https://romatre.esn.it/", platform: "Website", members: "" }
      ]
    }
  ],
  torino: [
    {
      university: "Politecnico di Torino",
      groups: [
        { name: "ESN Torino (PoliTo)", url: "https://torino.esn.it/", platform: "Website", members: "" },
        { name: "PoliTo International Students", url: "https://www.facebook.com/groups/politointernational", platform: "Facebook", members: "" }
      ]
    },
    {
      university: "Università di Torino",
      groups: [
        { name: "ESN Torino", url: "https://torino.esn.it/", platform: "Website", members: "" },
        { name: "UniTo International", url: "https://www.facebook.com/groups/unitointernational", platform: "Facebook", members: "" }
      ]
    }
  ],
  pavia: [
    {
      university: "Università di Pavia",
      groups: [
        { name: "ESN Pavia", url: "https://pavia.esn.it/", platform: "Website", members: "" },
        { name: "UniPV International Students", url: "https://www.facebook.com/groups/unipvinternational", platform: "Facebook", members: "" }
      ]
    }
  ]
};

// Events by city
export const eventsByCity: Record<City, Array<{
  name: string;
  date: string;
  location: string;
  type: string;
  free: boolean;
  url: string;
  description: string;
}>> = {
  milano: [
    {
      name: "ESN Welcome Week Milan",
      date: "Welcome Week (early September each year)",
      location: "Various locations, Milan",
      type: "Social",
      free: true,
      url: "https://milanopolitecnico.esn.it/",
      description: "Welcome activities, city tours, and parties for new international students"
    },
    {
      name: "International Students Aperitivo",
      date: "Every Thursday",
      location: "Navigli, Milan",
      type: "Social",
      free: false,
      url: "https://milanopolitecnico.esn.it/events",
      description: "Weekly social meetup with ESN - €5 includes drink"
    },
    {
      name: "Milan Free Walking Tour",
      date: "Daily",
      location: "Piazza Duomo, Milan",
      type: "Cultural",
      free: true,
      url: "https://www.neweuropetours.eu/milan-walking-tours/",
      description: "Discover Milan's history and landmarks with local guides"
    }
  ],
  roma: [
    {
      name: "ESN Roma Welcome Week",
      date: "Welcome Week (early September each year)",
      location: "Various locations, Rome",
      type: "Social",
      free: true,
      url: "https://romaase.esn.it/",
      description: "Welcome activities and orientation for new students in Rome"
    },
    {
      name: "Rome Free Walking Tour",
      date: "Daily",
      location: "Piazza Navona, Rome",
      type: "Cultural",
      free: true,
      url: "https://www.neweuropetours.eu/sandemans-tours/rome/rome-city-centre-free-tour/",
      description: "Explore ancient Rome with expert local guides"
    }
  ],
  torino: [
    {
      name: "ESN Torino Welcome Week",
      date: "Welcome Week (early September each year)",
      location: "Various locations, Turin",
      type: "Social",
      free: true,
      url: "https://torino.esn.it/",
      description: "Welcome activities for international students in Turin"
    },
    {
      name: "Turin Free Walking Tour",
      date: "Weekends",
      location: "Piazza Castello, Turin",
      type: "Cultural",
      free: true,
      url: "https://www.freetourturin.com/",
      description: "Discover Turin's royal history and architecture"
    }
  ],
  pavia: [
    {
      name: "ESN Pavia Welcome Week",
      date: "Welcome Week (early September each year)",
      location: "Università di Pavia",
      type: "Social",
      free: true,
      url: "https://pavia.esn.it/",
      description: "Welcome activities for new international students in Pavia"
    },
    {
      name: "Pavia Walking Tour",
      date: "Monthly",
      location: "Piazza della Vittoria, Pavia",
      type: "Cultural",
      free: true,
      url: "https://pavia.esn.it/events",
      description: "Explore medieval Pavia and its famous university"
    }
  ]
};
