const BRANDING = {
  projectName: "Cozmos",

  superUserName: "cozmos",

  urls: {
    base: "cozmos.io",
    www: "www.cozmos.io",
    protocol: "https://cozmos.io",
    external: {
      twitter: "https://twitter.com/cozmosnft",
      telegram: "https://t.me/cozmos",
      discord: "https://discord.com/invite/K393aHGV3M",
      instagram: "https://instagram.com/cozmosnft",
    },
  },

  meta: {
    title: "Cozmos",
    keywords: "NFT Experiences",
    description: "Collect NFT Experiences",
    image: "https://cozmos.io/branding/splash.png",
    url: "https://cozmos.io/",
    twitter: {
      card: "summary_large_image",
      creator: "@cozmos",
      site: "@cozmos",
    },
    // for art page we use art info in <header> meta
    artwork: (art) => ({
      title: `Cozmos - ${art.title}`,
      image: `/api/ipfs/${art.filename}`,
      url: `https://cozmos.io/a/${art.slug}`,
    }),
  },

  emails: {
    support: "support@cozmos.io",
  },
};

export default BRANDING;
