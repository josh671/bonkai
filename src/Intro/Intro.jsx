import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'

// Import all WebP images from IntroPhotos folder (optimized for faster loading)
const imageModules = import.meta.glob('./IntroPhotos/*.webp', { eager: true })
const images = Object.values(imageModules).map(module => module.default)

// Shuffle array function
const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

const Intro = () => {
    const navigate = useNavigate()
    const buttonRef = useRef(null)
    const titleRef = useRef(null)
    const cardsRef = useRef([])
    const overlayRef = useRef(null)

    // Shuffle images once when component mounts
    const shuffledImages = useRef(shuffleArray(images)).current

    useEffect(() => {
        // Animate button
        gsap.fromTo(buttonRef.current,
            {
                opacity: 0,
                scale: 0
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.7)"
            }
        )

        // Mouse move parallax effect with throttle for performance
        let rafId = null
        const handleMouseMove = (e) => {
            if (rafId) return

            rafId = requestAnimationFrame(() => {
                const { clientX } = e
                const centerX = window.innerWidth / 2
                const offsetX = (clientX - centerX) / centerX // -1 to 1

                // Move each card individually
                cardsRef.current.forEach((card) => {
                    if (card) {
                        // All rows move in the same direction (with the mouse)
                        gsap.to(card, {
                            x: offsetX * 200,
                            duration: 1,
                            ease: "power3.out",
                            force3D: true,
                            overwrite: 'auto'
                        })
                    }
                })

                rafId = null
            })
        }

        window.addEventListener('mousemove', handleMouseMove)

        // Listen for Enter key press
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                handleEnter()
            }
        }

        window.addEventListener('keydown', handleKeyPress)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('keydown', handleKeyPress)
        }
    }, [])

    const handleEnter = () => {
        console.log('clicked')
        // Fade out button only
        gsap.to(buttonRef.current, {
            opacity: 0,
            scale: 2,
            duration: 2,
            ease: "power2.in"
        })
        // Fade out Bonkai before navigating
        gsap.to(overlayRef.current, {
            opacity: 1,
            duration: 2,
            ease: "power2.in",
            onComplete: () => {
                //After fade out black, fade in bonkai 
                gsap.to(titleRef.current, {
                    opacity: 1, 
                    duration: 2, 
                    ease: "power2.in", 
                    onComplete: ()=>{
                        //Wait 2 seconds then navigate 
                        gsap.to(titleRef.current,{
                            opacity: 0, 
                            duration: 2, 
                            ease: "power2.out",
                            onComplete:()=> navigate('/home')
                        })
                    }

                })
            }
        })
         
    }

    // Create cards for each row
    // Use a shared counter to assign shuffled images sequentially
    let imageCounter = 0
    const createCards = (count, rowIndex) => {
        return Array.from({ length: count }, (_, i) => {
            const cardIndex = rowIndex * 7 + i
            // Use shuffled images sequentially (no duplicates)
            const imageUrl = shuffledImages[imageCounter % shuffledImages.length]
            imageCounter++
            return (
                <div
                    key={i}
                    ref={(el) => (cardsRef.current[cardIndex] = el)}
                    className="min-w-[1100px] h-[500px] rounded-lg mx-1 shadow-xl overflow-hidden will-change-transform"
                >
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover pointer-events-none"
                        loading="eager"
                        style={{ imageRendering: 'auto' }}
                    />
                </div>
            )
        })
    }

    return (
        <div className="min-h-screen bg-black overflow-hidden relative">
            {/* BONKAI - hidden behind cards */}
             {/* BONKAI - appears above the black overlay */}
                <h1
                
                    ref={titleRef}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] text-7xl font-bold text-white tracking-wide opacity-0 pointer-events-none"
                >
                    BONKAI
                </h1>

            {/* Animated card rows - covering BONKAI */}
            <div className="absolute inset-0 opacity-40 space-y-10 -top-109 -left-0 z-5" style={{ backfaceVisibility: 'hidden', willChange: 'transform' }}>
                {/* Row 1 */}
                <div className="flex justify-center -rotate-[18deg]">
                    {createCards(5, 0)}
                </div>

                {/* Row 2 */}
                <div className="flex justify-center -rotate-[18deg]">
                    {createCards(4, 1)}
                </div>

                {/* Row 3 */}
                <div className="flex justify-center -rotate-[18deg]">
                    {createCards(4, 2)}
                </div>

                {/* Row 4 */}
                <div className="flex justify-center -rotate-[18deg]">
                    {createCards(5, 3)}
                </div>
            </div>

            {/* Center content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center">
                <div className="text-center">

                    <button
                        ref={buttonRef}
                        onClick={handleEnter}
                        className="px-12 py-6 bg-white text-black text-2xl font-bold rounded-full hover:bg-gray-200 hover:scale-110 transition-all duration-300 shadow-2xl"
                    >
                        ENTER
                    </button>
                </div>
                {/* Black fade overlay for smooth transition */}
                <div
                    ref={overlayRef}
                    className='fixed inset-0 bg-black opacity-0 pointer-events-none z-50'
                />
            </div>
        </div>
    )
}

export default Intro
