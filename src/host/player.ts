import CardReference from "./card-reference";

// How many resources do we need to calculate for? What is the maximum amount
// of a single resource required on a single card?
const RESOURCE_COST_CALC_DEPTH = 4;

enum MoveType {
    Play = "P",
    Sacrifice = "S",
    Discard = "D",
    Unset = "U",
}

export default class Player {
    hand: number[] = [];
    playerIndex: number;
    playedCards: number[] = [];
    coins: number = 0;
    cardReference: CardReference;
    validPlays: number[][] = [];
    nextMove: [MoveType, number] = [MoveType.Unset, -1];

    // The available free resources in the format ["brick", "glass", 
    // "glassOrPaperOrTextile", "ore", "oreOrBrick", "paper", "stone", 
    // "stoneOrBrick", "stoneOrOre", "textile", "wood", "woodOrBrick", 
    // "woodOrOre", "woodOrStone", "woodOrStoneOrOreOrBrick"]
    freeResources: number[] = [];

    // The available paid resources in the format ["brick", "glass", 
    // "glassOrPaperOrTextile", "ore", "oreOrBrick", "paper", "stone", 
    // "stoneOrBrick", "stoneOrOre", "textile", "wood", "woodOrBrick", 
    // "woodOrOre", "woodOrStone", "woodOrStoneOrOreOrBrick"]
    paidResources: number[] = [];

    constructor(playerIndex: number, cardReference: CardReference) {
        this.playerIndex = playerIndex;
        this.cardReference = cardReference;
    }

    determineValidPlays(): void {
        let output: number[][] = [];

        // re-determine the free and purchasable resources
        this.freeResources = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < this.playedCards.length; i++) {
            let cardRewards = this.cardReference.getRewardResources(this.playedCards[i]);
            for (let j = 0; j < cardRewards.length; j++) {
                this.freeResources[j] += cardRewards[j];
            }

        }

        // Find the resources of the neighboring players
        // TODO
        this.paidResources = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // For every card, determine its proper action and add it to the output
        // Follows the order of the player's hand
        for (let c = 0; c < this.hand.length; c++) {
            let card: number = this.hand[c];

            // Determine if this card can be played
            let playCost = this.playCardCost(card);

            // Determine if it can be sacrificed
            let sacrificeCost = -1;

            // Determine if it can be discarded
            let discardCost = 0;

            // Get the appropriate card action
            output.push([playCost, sacrificeCost, discardCost]);
        }

        // Save the output to the object
        this.validPlays = output;
    }

    // Returns the cost to play this card. -1 is returned if this action is 
    // impossible.
    playCardCost(card: number): number {
        // Get the resources required to play the card
        // Format: [brick, coin, glass, ore, paper, stone, textile, wood]
        let cost: number[] = this.cardReference.getRequiredResources(card);

        // Check coins. If not enough, return failure.
        if (cost[1] > this.coins) {
            return -1;
        }
        let currentCost = cost[1];

        // Start modifying remaining cost. Subtract all available free single
        // resources.
        cost[0] -= this.freeResources[0]; // brick
        cost[2] -= this.freeResources[1]; // glass
        cost[3] -= this.freeResources[3]; // ore
        cost[4] -= this.freeResources[5]; // paper
        cost[5] -= this.freeResources[6]; // stone
        cost[6] -= this.freeResources[9]; // textile
        cost[7] -= this.freeResources[10]; // wood

        // Apply any multi-use resources if they apply to only one category at
        // this point
        if (cost[0] <= 0) { // brick
            cost[3] -= this.freeResources[4]; // oreOrBrick
            cost[5] -= this.freeResources[7]; // stoneOrBrick
            cost[7] -= this.freeResources[11]; // woodOrBrick
        }
        if (cost[3] <= 0) { // ore
            cost[0] -= this.freeResources[4]; // oreOrBrick
            cost[5] -= this.freeResources[8]; // stoneOrOre
            cost[7] -= this.freeResources[12]; // woodOrOre
        }
        if (cost[5] <= 0) { // stone
            cost[0] -= this.freeResources[7]; // stoneOrBrick
            cost[3] -= this.freeResources[8]; // stoneOrOre
            cost[7] -= this.freeResources[13]; // woodOrStone
        }
        if (cost[7] <= 0) { // wood
            cost[0] -= this.freeResources[11]; // woodOrBrick
            cost[3] -= this.freeResources[12]; // woodOrOre
            cost[5] -= this.freeResources[13]; // woodOrStone
        }

        // Check if we've met the resource requirements. If so, return a free
        // cost (+ coins cost)
        if (cost.every(item => item <= 0)) {
            return currentCost;
        }

        // We can't buy this card. Return -1.
        return -1;
    }
}