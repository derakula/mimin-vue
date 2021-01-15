export const API_BASE_PATH = 'http://localhost:3000';

/**
  * System Configuration
  * @type {{systemTile: string}}
  */
export const SYSTEM_CONFIG = {
  appBarBgSrc: {},
  appBarColor: "#fff",
  //Breadcrumbs
  breadcrumb: true,
  menuDark: false,
  menuBgSrc: require("../assets/navbarbg.svg"),
  menuLogoSrc: require("../assets/logo.png"),
  menuTitle: "MiminVue",
  menuColor: "#fff",
  menuTextColor: "#204e97",
  // systemTitle: "Vast Furniture",

  // The title is in the main tool bar
  toolbarTitle: false,
  systemImageSrc: require("../assets/text.png"),
  // systemImageSrc: "",

  /**
   * Allow routes that do not require permission to access
   */
  permitUrls: ["/login"],
};