/**
 * Species Database Service
 * 
 * Handles loading and accessing species template data for summon generation.
 */

import { Species } from "../types/index.js";

// Import species data
import gignenData from "../data/cards/global/species/gignen.json" with { type: "json" };
import faeData from "../data/cards/global/species/fae.json" with { type: "json" };
import stoneheartData from "../data/cards/global/species/stoneheart.json" with { type: "json" };
import wilderlingData from "../data/cards/global/species/wilderling.json" with { type: "json" };
import angarData from "../data/cards/global/species/angar.json" with { type: "json" };
import demarData from "../data/cards/global/species/demar.json" with { type: "json" };
import creptilisData from "../data/cards/global/species/creptilis.json" with { type: "json" };

export class SpeciesDatabaseService {
    private speciesDatabase: Record<string, Species> = {};
    private initialized: boolean = false;

    constructor() {
        this.initialize();
    }

    /**
     * Initialize the species database
     */
    private initialize(): void {
        if (this.initialized) return;

        // Convert JSON data to Species objects and store by template ID
        this.speciesDatabase[gignenData.id] = this.convertJsonToSpecies(gignenData);
        this.speciesDatabase[faeData.id] = this.convertJsonToSpecies(faeData);
        this.speciesDatabase[stoneheartData.id] = this.convertJsonToSpecies(stoneheartData);
        this.speciesDatabase[wilderlingData.id] = this.convertJsonToSpecies(wilderlingData);
        this.speciesDatabase[angarData.id] = this.convertJsonToSpecies(angarData);
        this.speciesDatabase[demarData.id] = this.convertJsonToSpecies(demarData);
        this.speciesDatabase[creptilisData.id] = this.convertJsonToSpecies(creptilisData);

        // Also store by species name for convenience
        this.speciesDatabase[gignenData.species] = this.speciesDatabase[gignenData.id];
        this.speciesDatabase[faeData.species] = this.speciesDatabase[faeData.id];
        this.speciesDatabase[stoneheartData.species] = this.speciesDatabase[stoneheartData.id];
        this.speciesDatabase[wilderlingData.species] = this.speciesDatabase[wilderlingData.id];
        this.speciesDatabase[angarData.species] = this.speciesDatabase[angarData.id];
        this.speciesDatabase[demarData.species] = this.speciesDatabase[demarData.id];
        this.speciesDatabase[creptilisData.species] = this.speciesDatabase[creptilisData.id];

        this.initialized = true;
        console.log(`Species database initialized with ${Object.keys(this.speciesDatabase).length} species`);
    }

    /**
     * Convert JSON species data to Species interface
     */
    private convertJsonToSpecies(jsonData: any): Species {
        return {
            id: jsonData.id,
            name: jsonData.name,
            description: jsonData.descrtiption || jsonData.description, // Handle typo in JSON
            baseStatRanges: {
                STR: jsonData.base_stats.STR,
                END: jsonData.base_stats.END,
                DEF: jsonData.base_stats.DEF,
                INT: jsonData.base_stats.INT,
                SPI: jsonData.base_stats.SPI,
                MDF: jsonData.base_stats.MDF,
                SPD: jsonData.base_stats.SPD,
                LCK: jsonData.base_stats.LCK,
                ACC: jsonData.base_stats.ACC,
            },
            // TODO: Add traits when available
            traits: [],
        };
    }

    /**
     * Get species data by species ID or species name
     */
    getSpecies(speciesIdOrName: string): Species | undefined {
        return this.speciesDatabase[speciesIdOrName] || this.speciesDatabase[speciesIdOrName.toLowerCase()];
    }

    /**
     * Get all species
     */
    getAllSpecies(): Record<string, Species> {
        return { ...this.speciesDatabase };
    }

    /**
     * Check if a species exists by ID or name
     */
    hasSpecies(speciesIdOrName: string): boolean {
        return speciesIdOrName in this.speciesDatabase || speciesIdOrName.toLowerCase() in this.speciesDatabase;
    }

    /**
     * Generate random base stats for a species within its ranges
     */
    generateBaseStats(speciesIdOrName: string): import("../types/index.js").BaseStats | undefined {
        const species = this.getSpecies(speciesIdOrName);
        if (!species) return undefined;

        const baseStats: import("../types/index.js").BaseStats = {
            STR: this.randomInRange(species.baseStatRanges.STR.min, species.baseStatRanges.STR.max),
            END: this.randomInRange(species.baseStatRanges.END.min, species.baseStatRanges.END.max),
            DEF: this.randomInRange(species.baseStatRanges.DEF.min, species.baseStatRanges.DEF.max),
            INT: this.randomInRange(species.baseStatRanges.INT.min, species.baseStatRanges.INT.max),
            SPI: this.randomInRange(species.baseStatRanges.SPI.min, species.baseStatRanges.SPI.max),
            MDF: this.randomInRange(species.baseStatRanges.MDF.min, species.baseStatRanges.MDF.max),
            SPD: this.randomInRange(species.baseStatRanges.SPD.min, species.baseStatRanges.SPD.max),
            LCK: this.randomInRange(species.baseStatRanges.LCK.min, species.baseStatRanges.LCK.max),
            ACC: this.randomInRange(species.baseStatRanges.ACC.min, species.baseStatRanges.ACC.max),
        };

        return baseStats;
    }

    /**
     * Generate random integer within range (inclusive)
     */
    private randomInRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// Export singleton instance
export const speciesDatabase = new SpeciesDatabaseService();
