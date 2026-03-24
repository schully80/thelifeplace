const address = {
  line1: "51 Villa Monte Catini, 1 Elm Avenue",
  line2: "Craigavon AH, 2191",
  line3: "Sandton",
  line4: "South Africa",
};

const serviceSchedule = [
  {
    id: "sunday-service",
    day: "Sunday",
    label: "Sunday 9:00-11:00 AM SAST",
    startTime: "09:00",
    endTime: "11:00",
    timezone: "Africa/Johannesburg",
    description: "Join us for worship, prayer, and community every Sunday morning.",
  },
];

const youtubeChannelId = "UC2f4d_FFU4HiTT_DiPhZwvw";
const youtubeChannelUrl = `https://www.youtube.com/channel/${youtubeChannelId}`;

export const site = {
  name: "The Life Place",
  tagline: "Come. See. Jesus.",
  features: {
    ministriesEnabled: false,
    messagesEnabled: false,
  },
  brand: {
    primary: "#B3282D",
    accent: "#F3EDE2",
    text: "#2F2F2F",
    font: "Montserrat",
  },
  contact: {
    email: "hello@thelifeplace.org",
    whatsapp: "https://wa.me/27XXXXXXXXX",
    address,
  },
  location: {
    address,
    venue: "The Life Place",
    directionsLabel: "Get Directions",
  },
  schedule: {
    timezone: "Africa/Johannesburg",
    services: serviceSchedule,
  },
  socials: {
    youtube: "https://youtube.com/@thelifeplacesa",
    instagram: "https://instagram.com/thelifeplacesa",
    facebook: "https://facebook.com/thelifeplacesa",
    spotify:
      "https://open.spotify.com/show/31hbtgq5cvmqr4tyzs2faygvrzaa?si=61b073370e034f21",
    applePodcasts: "https://podcasts.apple.com/us/podcast/the-life-place/id1816955719",
  },
  live: {
    youtubeChannelId,
    youtubeChannelUrl,
    youtubeChannelLiveUrl: `${youtubeChannelUrl}/live`,
    youtubeEmbedUrl: `https://www.youtube.com/embed/live_stream?channel=${youtubeChannelId}`,
    scheduleId: "sunday-service",
  },
  giving: {
    bank: {
      accountName: "The Life Place",
      bankName: "Standard Bank",
      accountNumber: "301524351",
      branchCode: "051001",
      accountType: "Current",
      swift: "SBZAZAJJ",
      referenceHint: "Tithe / Offering / Your name",
    },
    snapscan: {
      url: "https://pos.snapscan.io/qr/VISFNLkM",
      qrImagePath: "/snapscan.png",
    },
    paypal: {
      donateUrl: "https://www.paypal.com/donate?hosted_button_id=4L3NWWAZ9PPV6",
      hostedButtonId: "4L3NWWAZ9PPV6",
    },
    annualReport: {
      pagePath: "/annual-report",
      pdfPath: "/files/AnnualReport2024.pdf",
      label: "Annual Financial Report 2024",
    },
  },
  links: {
    siteUrl: "https://thelifeplace.org",
    blogUrl: "https://schulteretyang.substack.com",
    visitPath: "/visit/",
    givePath: "/give/",
    livePath: "/live",
    messagesPath: "/messages",
    appPath: "/app",
    prayerPath: "/prayer",
    eventsPath: "/events",
    devotionalsPath: "/devotionals",
    privacyPath: "/privacy-policy/",
    termsPath: "/terms/",
    beliefsPath: "/what-we-believe/",
    annualReportPath: "/annual-report",
  },
  app: {
    contentApiBaseUrl: "https://thelifeplace.org",
    iosUrl: "",
    androidUrl: "",
  },
  integrations: {
    icsCalendarUrl: process.env.ICS_CALENDAR_URL || "",
  },
};
