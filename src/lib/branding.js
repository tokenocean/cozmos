const BRANDING = {
  projectName: "Cozmos",

  superUserName: "cozmos",

  urls: {
    base: "cozmos.coinos.io",
    www: "www.cozmos.coinos.io",
    protocol: "https://cozmos.coinos.io",
    external: {
      twitter: "https://twitter.com/cozmos",
      telegram: "https://t.me/cozmos",
      discord: "https://discord.com/invite/K393aHGV3M",
    },
  },

  meta: {
    title: "Cozmos",
    keywords: "NFT Experiences",
    description: "Collect NFT Experiences",
    image: "https://cozmos.coinos.io/branding/splash.png",
    url: "https://cozmos.coinos.io/",
    twitter: {
      card: "summary_large_image",
      creator: "@cozmos",
      site: "@cozmos",
    },
    // for art page we use art info in <header> meta
    artwork: (art) => ({
      title: `Cozmos - ${art.title}`,
      image: `/api/ipfs/${art.filename}`,
      url: `https://cozmos.coinos.io/a/${art.slug}`,
    }),
  },

  emails: {
    support: "support@cozmos.coinos.io",
  },
};

export default BRANDING;
