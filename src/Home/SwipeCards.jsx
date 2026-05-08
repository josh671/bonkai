import React from "react";
import CardDeck from './CardDeck';

/**
 * SwipeCards Component
 *
 * Container component that manages multiple independent card decks.
 * Receives an array of card deck arrays from the parent component
 * and renders them side by side using flexbox layout.
 *
 * @param {Object} props
 * @param {Array<Array>} props.allDecks - Array of card deck arrays, where each deck contains card objects
 */
const SwipeCards = ({ allDecks }) => {
  return (
    // Container with flexbox layout to arrange card decks side by side
    <div
      className="flex h-[500px] w-full items-center justify-center gap-16 sm-neutral-100"
      style={{
        // SVG pattern for dotted background
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='%23d4d4d4'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
      }}
    >
      {/* Loop through each deck and render a CardDeck component */}
      {allDecks.map((deck, deckIndex) => (
        <CardDeck key={deckIndex} cardDeck={deck} />
      ))}
    </div>
  );
};

export default SwipeCards;
