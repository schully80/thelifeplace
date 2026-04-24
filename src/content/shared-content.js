import { site } from "../../site.config.js";

const address = site.location.address;
const addressLines = Object.values(address).filter(Boolean);
const fullAddress = addressLines.join(", ");

function buildMapsUrl(base) {
  return `${base}${encodeURIComponent(fullAddress)}`;
}

export function getVisitLocation() {
  return {
    venue: site.location.venue,
    address,
    addressLines,
    fullAddress,
    mapsQueryUrl: buildMapsUrl("https://www.google.com/maps?q="),
    mapsEmbedUrl: `${buildMapsUrl("https://www.google.com/maps?q=")}&output=embed`,
    appleMapsUrl: buildMapsUrl("https://maps.apple.com/?q="),
    wazeUrl: `${buildMapsUrl("https://www.waze.com/ul?q=")}&navigate=yes`,
  };
}

export const devotionals = [
  {
    id: "come-see-jesus",
    title: "Come. See. Jesus",
    scripture: "John 1:39",
    body: [
      "When Jesus says, 'Come and you will see,' He invites us into more than information. He offers Himself.",
      "Today, receive His welcome. Let your heart rest in the One who knows you fully and loves you completely.",
    ],
    prayer:
      "Jesus, draw me to Yourself today. Let me see You as You are: true, good, beautiful, and kind.",
    action: "Pause for two minutes. Breathe slowly. Whisper: 'Jesus, I come to You.'",
    reference: "ESV",
  },
  {
    id: "grace-for-the-guilty",
    title: "Grace for the Guilty",
    scripture: "Romans 5:8",
    body: [
      "Grace is not a reward for the worthy; it is the gift of God to the unworthy.",
      "Your failures do not disqualify you. His finished work qualifies you.",
    ],
    prayer: "Thank You, Jesus, for loving me first. Teach me to live from Your grace, not for it.",
    action: "Write one sentence: 'In Christ, I am...' and complete it with truth from Scripture.",
  },
  {
    id: "strength-in-weakness",
    title: "Strength in Weakness",
    scripture: "2 Corinthians 12:9",
    body: [
      "Weakness is not the end of your story. His power is made perfect there.",
      "Boast in Christ, not in your strength.",
    ],
    prayer: "Lord, be strong in my weakness. I choose to rely on You.",
    action: "Identify one burden today and consciously hand it to Jesus in prayer.",
  },
];

export const welcomeContent = {
  title: "Our Welcome",
  lines: [
    "We open wide our doors with a welcome from Jesus,",
    "the Embracer of the outsider,",
    "the Defender of the guilty,",
    "the Justifier of the ungodly,",
    "the Friend of sinners.",
  ],
  slogan: "Come. See. Jesus",
};

export const aboutContent = {
  title: "About Us",
  missionTitle: "Our Mission",
  missionBody:
    "Every time we meet, we see how true, good, beautiful and kind Jesus is.",
  missionSupport:
    "This is what we're about: encountering Jesus together and letting who He is and what He did for us transform everything.",
  values: [
    {
      id: "scripture",
      title: "Seeing Jesus in the Bible",
      body:
        "Just as Jesus taught that everything in the Bible points to Him, we believe every time we open the Bible, we are invited to see and meet with Him.",
    },
    {
      id: "community",
      title: "A Diverse Family",
      body:
        "Rooted in Jesus' finished work, our community seeks to mirror the city of God: every ethnicity, tribe, people, and language.",
    },
    {
      id: "generosity",
      title: "Extravagant Generosity",
      body:
        "Made rich by what Jesus has done, we joyfully give, share, and overflow with generosity.",
    },
    {
      id: "mission",
      title: "Sent Into the World",
      body:
        "The story of Jesus moves through us into our city, our nation, and the world. We are a sent people, carrying His life in words and actions.",
    },
  ],
};

export const ministries = [
  {
    slug: "new-members",
    title: "New @The Life Place",
    summary: "Learn the story, rhythms, and community life of The Life Place.",
    body: [
      "A starting place for people who are new to The Life Place.",
      "Discover our story, values, and how to belong and serve in the life of the church.",
    ],
  },
  {
    slug: "bring-them-to-jesus",
    title: "Bring Them to Jesus",
    summary: "Helping children and families see the kindness and beauty of Jesus.",
    body: [
      "A ministry focused on helping the next generation encounter Jesus.",
      "We serve families through teaching, prayer, and practical care.",
    ],
  },
  {
    slug: "kids",
    title: "Kids Ministry",
    summary: "Building a safe, joyful space where children can come and see Jesus.",
    body: [
      "We do not currently have a full kids' church offering every week.",
      "As Jesus provides, we are preparing a space where our children can grow in His love and truth.",
    ],
  },
  {
    slug: "this-gen",
    title: "ThisGen",
    summary: "A space for the next generation to come, see, and follow Jesus together.",
    body: [
      "ThisGen exists for students and young adults.",
      "We gather for friendship, discipleship, and life shaped by the story of Jesus.",
    ],
  },
  {
    slug: "premarital-counseling",
    title: "Premarital Counseling",
    summary: "Preparing couples for marriage with biblical wisdom and practical care.",
    body: [
      "We are building resources to help couples form Jesus-centred marriages.",
      "The goal is wise preparation, honest conversation, and practical support.",
    ],
  },
  {
    slug: "institute",
    title: "Life Place Institute",
    summary: "Thoughtful discipleship, formation, and theological learning.",
    body: [
      "The Life Place Institute serves people who want to think deeply and live faithfully.",
      "Its focus is theology, discipleship, and formation around the person and work of Jesus.",
    ],
  },
  {
    slug: "faith-and-work",
    title: "Faith & Work",
    summary: "Seeing Jesus shape everyday work, vocation, and public life.",
    body: [
      "Faith & Work helps people live the story of Jesus in offices, homes, studios, schools, and businesses.",
      "We want everyday work to become a place of worship, witness, and service.",
    ],
  },
  {
    slug: "relief-center",
    title: "Relief Center",
    summary: "Practical generosity for people in need.",
    body: [
      "The Relief Center exists to move toward real needs with grace and practical help.",
      "It reflects the generosity and compassion of Jesus in tangible ways.",
    ],
  },
];

export function getBootstrapContent() {
  return {
    brand: site.brand,
    features: site.features,
    site: {
      name: site.name,
      tagline: site.tagline,
      siteUrl: site.links.siteUrl,
    },
    contact: site.contact,
    socials: site.socials,
    location: getVisitLocation(),
    schedule: site.schedule,
    live: site.live,
    giving: site.giving,
    links: site.links,
    app: site.app,
    welcome: welcomeContent,
    about: aboutContent,
    ministries,
    devotionals,
  };
}
