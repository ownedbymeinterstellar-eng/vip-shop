import { Link } from 'react-router-dom';

interface EasterEgg {
  type: 'silvester' | 'birthday';
  emoji: string;
  link: string;
  label: string;
  animationDuration: number;
  animationDelay: number;
}

const HiddenEasterEgg = () => {
  // Always show both eggs for testing
  const eggs: EasterEgg[] = [
    {
      type: 'silvester',
      emoji: '🎆',
      link: '/silvester',
      label: 'Silvester Überraschung',
      animationDuration: 15 + Math.random() * 5,
      animationDelay: Math.random() * 5,
    },
    {
      type: 'birthday',
      emoji: '🎁',
      link: '/geburtstag',
      label: 'Geburtstags Überraschung',
      animationDuration: 15 + Math.random() * 5,
      animationDelay: Math.random() * 5,
    },
  ];

  if (eggs.length === 0) return null;

  return (
    <>
      {eggs.map((egg, index) => (
        <Link
          key={egg.type}
          to={egg.link}
          className="fixed z-50 animate-float-around easter-egg-hover"
          style={{
            top: `${20 + index * 30}%`,
            left: `${10 + index * 20}%`,
            animationDuration: `${egg.animationDuration}s`,
            animationDelay: `${egg.animationDelay}s`,
          }}
          aria-label={egg.label}
          title={egg.label}
        >
          <span className="text-4xl md:text-5xl opacity-40 hover:opacity-100 hover:scale-125 transition-all duration-300 cursor-pointer easter-egg-glow">
            {egg.emoji}
          </span>
        </Link>
      ))}
    </>
  );
};

export default HiddenEasterEgg;
