"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";

interface CardSearchResult {
  name: string;
  version?: string;
  card_image?: string;
}

export default function CardSearch({
  isOpen,
  onClose,
  setInput,
}: {
  isOpen: boolean;
  onClose: () => void;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [results, setResults] = useState<CardSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true);
      fetch(
        `https://api.lorcast.com/v0/cards/search?q=name:${encodeURIComponent(
          debouncedSearchTerm
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results.map((card: any) => ({ name: card.name, version: card.version, card_image: card.image_uris?.digital.small })));
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  if (!isOpen) return null;

  const handleCardClick = (cardName: string, cardVersion?: string) => {
    setInput((prev) => prev + `${cardName}${cardVersion ? ` ${cardVersion}` : ""}`);
    setSearchTerm("");
    onClose();

  };


  return (
    <div className="fixed inset-0 bg-primary bg-opacity-10 z-50 flex justify-center items-start pt-10 sm:pt-20">
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 pb-0 w-full max-w-md relative mx-2">
        <button
          onClick={() => {
            setSearchTerm("");
            onClose();
          }}
          className="absolute -top-2 -right-2 sm:-top-4 sm:-right-6 text-primary p-1 hover:text-white rounded-full bg-accent"
        >
          Close
        </button>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a card..."
          className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-4">
          {loading && <p className="text-gray-400">Loading...</p>}
          <ul className="space-y-2 overscroll-y-auto max-h-80 sm:max-h-100 overflow-y-auto">
            {results.map((card, index) => (
              <li
                key={index}
                onClick={() => handleCardClick(card.name, card.version)}
                className="text-white hover:bg-gray-700 p-2 rounded-md cursor-pointer"
              >
                <img src={card.card_image} alt={card.name} className="inline-block w-12 h-auto mr-2" />
                {card.name} {card.version && `- ${card.version}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
