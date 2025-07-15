// Alpha Set - Building Cards Index
// This file exports all building cards from the Alpha set

import { darkAltar } from "./dark-altar";
import { gignenCountry } from "./gignen-country";

export { darkAltar, gignenCountry };

// Export all building cards as a collection for easier access
export const alphaBuildingCards = {
    "004-gignen_country-Alpha": gignenCountry,
    "010-dark_altar-Alpha": darkAltar,
} as const;

// Export just the card objects as an array
export const alphaBuildingCardsList = [darkAltar, gignenCountry] as const;
