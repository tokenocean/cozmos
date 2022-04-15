const config = require("./config");

const defaultConst = {
  projectName: "Cozmos",
  urls: {
    protocol: "https://cozmos.coinos.io",
  },
  emails: {
    support: "support@cozmos.io",
  },
};

module.exports = { ...defaultConst, ...config };
