export interface CardData {
    id: string;
    name: string;
    version: string;
    cost: number;
    inkwell: boolean;
    ink: string | null;
    inks: InkTypes[];
    type: string[];
    classifications: string[];
    text: string;
    move_cost: number | null;
    strength: number | null;
    willpower: number | null;
    lore: number | null;
    legalities: {
        core: string;
    }
}

type InkTypes = 'Amber' | 'Amythest' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel';