import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import CardEnlarge from './CardEnlarge'; 
// Individual card component
const Card = ({ id, url, index, totalCards, onSwipe }) => {

  const [enlargedImage, setEnlargedImage] = useState(null); 
  

  // Motion value to track horizontal drag position
  const x = useMotionValue(0);

  // Transform x position into rotation angle
  // When dragged left (-150px) = rotate -18°, right (150px) = rotate 18°
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);

  // Transform x position into opacity for fade effect
  // At -150px and 150px = opacity 0 (invisible)
  // At 0px = opacity 1 (fully visible)
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  // Check if this is the front card (top of deck)
  const isFront = index === 0;

  // Only show top 5 cards to improve performance
  const isVisible = index < 5;

  // Calculate static rotation for non-front cards to create staggered deck look
  // Front card = 0°, other cards alternate between 6° and -6° based on ID
  const staticRotation = isFront ? 0 : id % 2 ? 6 : -6;

  // Combine drag rotation with static rotation
  const rotate = useTransform(() => {
    return `${rotateRaw.get() + staticRotation}deg`;
  });

  // Handle when user stops dragging
  const handleDragEnd = () => {
    const swipeThreshold = 100;  // Minimum drag distance to count as swipe

    // If dragged more than 100px in either direction, trigger swipe
    if (Math.abs(x.get()) > swipeThreshold) {
      onSwipe(id);  // Call parent's swipe handler
    }
    // If dragged less than 100px, card will animate back to center automatically
  };


  const onClickHandler = (imageToEnlarge) => {
    console.log('clicked'); 
    const enlargedImage = setEnlargedImage(imageToEnlarge); 

  }

  // Don't render cards beyond position 4 (performance optimization)
  if (!isVisible) return null;

  return (
    <>
    <motion.img
      src={url}  // Image source URL
      alt="Placeholder alt"
      // Tailwind classes for styling
      className="absolute h-96 w-72 origin-bottom rounded-lg bg-white object-cover hover:cursor-grab active:cursor-grabbing shadow-xl"

      // Style properties controlled by motion values (change during drag)
      style={{
        x,  // Horizontal position (changes as you drag)
        rotate,  // Rotation angle (combines drag + static rotation)
        opacity,  // Opacity (fades out when dragged far)
        zIndex: totalCards - index,  // Higher index = higher z-index (front cards on top)
        // Only front card gets strong shadow
        boxShadow: isFront
          ? "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)"
          : undefined,
      }}

      // Animated properties (Framer Motion automatically animates to these values)
      animate={{
        scale: isFront ? 1 : 0.98,  // Front card full size, others slightly smaller
        x: 0,  // Always animate back to x=0 (this is KEY for infinite cycling!)
      }}

      // Animation configuration
      transition={{
        type: "spring",  // Spring physics for smooth, natural motion
        stiffness: 300,  // How "tight" the spring is (higher = snappier)
        damping: 30,  // How much the spring bounces (higher = less bounce)
      }}

      // Drag settings
      drag={isFront ? "x" : false}  // Only front card can be dragged, only horizontally
      dragConstraints={{ left: 0, right: 0 }}  // Constrain to horizontal axis
      onDragEnd={handleDragEnd}  // Call this function when drag ends
      onClick={()=>onClickHandler(url)} 
       
    />

    {enlargedImage && (
      <CardEnlarge
        url={enlargedImage} 
        onClose={() => setEnlargedImage(null)}
      />
    )}
    </>
  );
};

export default Card; 



