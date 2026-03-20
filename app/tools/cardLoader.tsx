import { CardData } from "../types/cardTypes";

const fetchCardData = async (queryString: string) => {
  const response = await fetch(
    `https://api.lorcast.com/v0/cards/search?q=${encodeURIComponent(queryString)}&unique=cards`,
  );
  if (!response.ok) {
    throw new Error(`Lorcast API error: ${response.status}`);
  }
  const data = await response.json();
  
  const mappedCardData = data.results.map((card: CardData) => ({
    id: card.id,
    name: card.name,
    version: card.version,
    cost: card.cost,
    inkwell: card.inkwell,
    ink: card.ink,
    inks: card.inks,
    type: card.type,
    classifications: card.classifications,
    text: card.text,
    move_cost: card.move_cost,
    strength: card.strength,
    willpower: card.willpower,
    lore: card.lore,
    legalities: card.legalities
  }));
  return mappedCardData as CardData;
};

export default fetchCardData;
