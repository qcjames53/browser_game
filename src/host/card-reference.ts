import cards from '../../assets/cards.json';

const RESOURCE_COST_TYPES = ["brick", "coin", "glass", "ore", "paper", "stone", "textile", "wood"];
const RESOURCE_REWARD_TYPES = ["brick", "glass", "glassOrPaperOrTextile", "ore", "oreOrBrick", "paper", "stone", "stoneOrBrick", "stoneOrOre", "textile", "wood", "woodOrBrick", "woodOrOre", "woodOrStone", "woodOrStoneOrOreOrBrick"];

export default class CardReference {

    // Returns a list of strings representing resources awarded by a card in
    // the format ["brick", "glass", "glassOrPaperOrTextile", "ore", 
    // "oreOrBrick", "paper", "stone", "stoneOrBrick", "stoneOrOre", 
    // "textile", "wood", "woodOrBrick", "woodOrOre", "woodOrStone", 
    // "woodOrStoneOrOreOrBrick"]
    getRewardResources(card: number): number[] {
        let output: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (let r = 0; r < cards[card]["reward"].length; r++) {
            let reward_index = RESOURCE_REWARD_TYPES.indexOf(cards[card]["reward"][r]);
            if (reward_index != -1) {
                output[reward_index]++;
            }
        }

        return output;
    }

    // Return an array representing the resources required by a card in the format
    // [brick, coin, glass, ore, paper, stone, textile, wood]
    getRequiredResources(card: number): number[] {
        let output = [0, 0, 0, 0, 0, 0, 0, 0];

        for (let c = 0; c < cards[card]["cost"].length; c++) {
            output[RESOURCE_COST_TYPES.indexOf(cards[card]["cost"][c])]++;
        }

        return output;
    }
}