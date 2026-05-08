import React, { useState } from "react";
import Card from './Cards';

/**
 * CardDeck Component
 *
 * Manages a single deck of swipeable cards with independent state.
 * Each deck maintains its own card order and handles swipe interactions.
 * When a card is swiped, it moves to the back of the deck for infinite cycling.
 *
 * @param {Object} props
 * @param {Array} props.cardDeck - Array of card objects with id and url properties
 */
const CardDeck = ({ cardDeck }) => {
  // State to track the current order of cards in this specific deck
  const [cards, setCards] = useState(cardDeck);

  /**
   * Handles card swipe events
   * Moves the swiped card to the back of the deck for infinite cycling
   *
   * @param {number} id - The unique identifier of the swiped card
   */
  const handleSwipe = (id) => {
    setCards((prev) => {
      // Find the card that was just swiped
      const swiped = prev.find((c) => c.id === id);
      // Remove the swiped card from the array
      const filtered = prev.filter((c) => c.id !== id);
      // Return new array with swiped card moved to the end (back of deck)
      return [...filtered, swiped];
    });
  };

  return (
    // Card container - positioned relative so cards can stack absolutely
    <div className="relative h-96 w-72">
      {/* Loop through all cards in this deck and render each one */}
      {cards.map((card, index) => (
        <Card
          key={card.id}  // Unique key for React rendering
          {...card}  // Spread card properties (id, url)
          index={index}  // Position in the deck (0 = front)
          totalCards={cards.length}  // Total number of cards
          onSwipe={handleSwipe}  // Callback when card is swiped
        />
      ))}
    </div>
  );
};

export default CardDeck;
