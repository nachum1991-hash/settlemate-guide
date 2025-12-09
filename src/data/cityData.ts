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
      studentPrice: "€200/year (under 27)"
    },
    universities: ["Politecnico di Milano", "Università degli Studi di Milano", "Bocconi University", "Cattolica"],
    esnChapter: {
      name: "ESN Milano",
      url: "https://milan.esn.it/"
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
      studentPrice: "€250/year"
    },
    universities: ["Sapienza Università di Roma", "LUISS Guido Carli", "Roma Tre", "Tor Vergata"],
    esnChapter: {
      name: "ESN Roma",
      url: "https://roma.esn.it/"
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
      studentPrice: "€180/year"
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
      studentPrice: "€150/year"
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
        { name: "Polimi International Students", url: "https://t.me/polimiinternational", platform: "Telegram", members: "5k+" },
        { name: "Polimi Housing", url: "https://www.facebook.com/groups/polimihousing", platform: "Facebook", members: "12k+" },
        { name: "Polimi Erasmus", url: "https://t.me/polimierasmus", platform: "Telegram", members: "2k+" }
      ]
    },
    {
      university: "University of Milano",
      groups: [
        { name: "UniMi International", url: "https://t.me/unimiinternational", platform: "Telegram", members: "3k+" },
        { name: "UniMi Students", url: "https://www.facebook.com/groups/unimistudents", platform: "Facebook", members: "8k+" }
      ]
    },
    {
      university: "Bocconi University",
      groups: [
        { name: "Bocconi International", url: "https://t.me/bocconiint", platform: "Telegram", members: "4k+" },
        { name: "Bocconi Housing", url: "https://www.facebook.com/groups/bocconihousing", platform: "Facebook", members: "6k+" }
      ]
    }
  ],
  roma: [
    {
      university: "Sapienza Università di Roma",
      groups: [
        { name: "Sapienza International", url: "https://t.me/sapienzainternational", platform: "Telegram", members: "6k+" },
        { name: "Sapienza Housing", url: "https://www.facebook.com/groups/sapienzahousing", platform: "Facebook", members: "10k+" }
      ]
    },
    {
      university: "LUISS Guido Carli",
      groups: [
        { name: "LUISS International", url: "https://t.me/luissinternational", platform: "Telegram", members: "2k+" }
      ]
    },
    {
      university: "Roma Tre",
      groups: [
        { name: "Roma Tre Students", url: "https://t.me/romatrestudents", platform: "Telegram", members: "3k+" }
      ]
    }
  ],
  torino: [
    {
      university: "Politecnico di Torino",
      groups: [
        { name: "PoliTo International", url: "https://t.me/politointernational", platform: "Telegram", members: "4k+" },
        { name: "PoliTo Housing", url: "https://www.facebook.com/groups/politohousing", platform: "Facebook", members: "7k+" }
      ]
    },
    {
      university: "Università di Torino",
      groups: [
        { name: "UniTo International", url: "https://t.me/unitointernational", platform: "Telegram", members: "3k+" }
      ]
    }
  ],
  pavia: [
    {
      university: "Università di Pavia",
      groups: [
        { name: "UniPV International", url: "https://t.me/unipvinternational", platform: "Telegram", members: "2k+" },
        { name: "Pavia Student Housing", url: "https://www.facebook.com/groups/paviastudenthousing", platform: "Facebook", members: "4k+" }
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
      date: "September 2024",
      location: "Various locations, Milan",
      type: "Social",
      free: true,
      url: "https://milan.esn.it/",
      description: "Welcome activities, city tours, and parties for new international students"
    },
    {
      name: "International Students Aperitivo",
      date: "Every Thursday",
      location: "Navigli, Milan",
      type: "Social",
      free: false,
      url: "https://milan.esn.it/events",
      description: "Weekly social meetup with ESN - €5 includes drink"
    },
    {
      name: "Milan Free Walking Tour",
      date: "Daily",
      location: "Piazza Duomo, Milan",
      type: "Cultural",
      free: true,
      url: "https://www.neweuropetours.eu/milan/",
      description: "Discover Milan's history and landmarks with local guides"
    }
  ],
  roma: [
    {
      name: "ESN Roma Welcome Week",
      date: "September 2024",
      location: "Various locations, Rome",
      type: "Social",
      free: true,
      url: "https://roma.esn.it/",
      description: "Welcome activities and orientation for new students in Rome"
    },
    {
      name: "Rome Free Walking Tour",
      date: "Daily",
      location: "Piazza Navona, Rome",
      type: "Cultural",
      free: true,
      url: "https://www.neweuropetours.eu/rome/",
      description: "Explore ancient Rome with expert local guides"
    }
  ],
  torino: [
    {
      name: "ESN Torino Welcome Week",
      date: "September 2024",
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
      url: "https://www.neweuropetours.eu/turin/",
      description: "Discover Turin's royal history and architecture"
    }
  ],
  pavia: [
    {
      name: "ESN Pavia Welcome Week",
      date: "September 2024",
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
