export const LogoSVG = ({
  className = "",
  fillProgress,
}: {
  className?: string;
  fillProgress?: number;
}) => {
  const isFilling = fillProgress !== undefined;

  return (
    <svg
      viewBox="0 0 200 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {isFilling && (
        <defs>
          <mask
            id="water-mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="200"
            height="120"
          >
            <g
              style={{
                transform: `translateY(${130 - (fillProgress / 100) * 150}px)`,
              }}
              className="transition-transform duration-300 ease-out"
            >
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 0"
                  to="-200 0"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
                <path
                  d="M 0 15 Q 50 -5, 100 15 T 200 15 T 300 15 T 400 15 L 400 150 L 0 150 Z"
                  fill="white"
                  fillOpacity="0.4"
                />
              </g>
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 0"
                  to="-200 0"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
                <path
                  d="M 0 15 Q 50 25, 100 15 T 200 15 T 300 15 T 400 15 L 400 150 L 0 150 Z"
                  fill="white"
                />
              </g>
            </g>
          </mask>
        </defs>
      )}

      <g mask={isFilling ? "url(#water-mask)" : undefined}>
        <ellipse
          cx="100"
          cy="60"
          rx="90"
          ry="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <ellipse
          cx="100"
          cy="60"
          rx="84"
          ry="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <text
          x="100"
          y="55"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontSize="32"
          fill="currentColor"
          textAnchor="middle"
        >
          UD
        </text>
        <text
          x="100"
          y="90"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontSize="26"
          fill="currentColor"
          textAnchor="middle"
          letterSpacing="4"
        >
          group
        </text>
      </g>
    </svg>
  );
};
