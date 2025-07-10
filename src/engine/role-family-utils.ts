import { RoleCard } from "@types";

/**
 * Role Family Resolution Utilities
 *
 * These utilities allow the game engine to dynamically determine role relationships
 * without requiring hardcoded lists in card definitions.
 */

// Type for role family queries
export interface RoleFamilyQuery {
    family: string;
    includeTier?: number[]; // Optional: only include specific tiers
    excludeRoles?: string[]; // Optional: exclude specific role IDs
}

/**
 * Determines if a role belongs to a specific family
 */
export function isRoleInFamily(role: RoleCard, targetFamily: string): boolean {
    return role.roleFamily === targetFamily;
}

/**
 * Finds all roles that belong to a specific family from a collection
 */
export function getRolesInFamily(
    allRoles: RoleCard[],
    familyQuery: RoleFamilyQuery
): RoleCard[] {
    return allRoles.filter((role) => {
        // Check if role belongs to the family
        if (role.roleFamily !== familyQuery.family) {
            return false;
        }

        // Check tier restrictions if specified
        if (
            familyQuery.includeTier &&
            !familyQuery.includeTier.includes(role.tier)
        ) {
            return false;
        }

        // Check exclusions if specified
        if (
            familyQuery.excludeRoles &&
            familyQuery.excludeRoles.includes(role.id)
        ) {
            return false;
        }

        return true;
    });
}

/**
 * Gets the root/base role for any role in a family
 */
export function getBaseRole(role: RoleCard, allRoles: RoleCard[]): RoleCard {
    // If this role has no baseRole, it IS the base role
    if (!role.baseRole) {
        return role;
    }

    // Find the base role and recursively check if it has a base role
    const baseRole = allRoles.find((r) => r.id === role.baseRole);
    if (!baseRole) {
        throw new Error(
            `Base role ${role.baseRole} not found for role ${role.id}`
        );
    }

    return getBaseRole(baseRole, allRoles);
}

/**
 * Gets all roles that can advance to a specific role (reverse lookup)
 */
export function getRoleAdvancementSources(
    targetRole: RoleCard,
    allRoles: RoleCard[]
): RoleCard[] {
    return allRoles.filter((role) =>
        role.advancements?.some(
            (advancement) => advancement.toRole === targetRole.id
        )
    );
}

/**
 * Gets all possible advancement paths from a role (forward lookup)
 */
export function getRoleAdvancementTargets(
    sourceRole: RoleCard,
    allRoles: RoleCard[]
): RoleCard[] {
    if (!sourceRole.advancements) {
        return [];
    }

    return sourceRole.advancements
        .map((advancement) =>
            allRoles.find((role) => role.id === advancement.toRole)
        )
        .filter((role): role is RoleCard => role !== undefined);
}

/**
 * Engine utility: Check if a summon's current role satisfies a family requirement
 * This is what the game engine would call when evaluating card requirements
 */
export function doesSummonSatisfyRoleFamilyRequirement(
    summonCurrentRoleId: string,
    requiredFamily: string,
    allRoles: RoleCard[]
): boolean {
    const currentRole = allRoles.find(
        (role) => role.id === summonCurrentRoleId
    );
    if (!currentRole) {
        return false;
    }

    return isRoleInFamily(currentRole, requiredFamily);
}

// Example usage in game engine:
/*
// When evaluating Sharpened Blade's requirements:
const requirement = {
    type: "controlsRoleFamilyWithEquipment",
    parameters: {
        roleFamily: "warrior",
        minimumCount: 1,
        requiredEquipment: { slot: "weapon", mustBeEquipped: true }
    }
};

// Engine checks each controlled summon:
const controlledSummons = getControlledSummons(playerId);
const validSummons = controlledSummons.filter(summon => {
    // Check role family
    const hasWarriorRole = doesSummonSatisfyRoleFamilyRequirement(
        summon.currentRole, 
        requirement.parameters.roleFamily,
        allRoles
    );
    
    // Check equipment requirement
    const hasWeapon = summon.equipment.weapon !== null;
    
    return hasWarriorRole && hasWeapon;
});

const requirementMet = validSummons.length >= requirement.parameters.minimumCount;
*/
