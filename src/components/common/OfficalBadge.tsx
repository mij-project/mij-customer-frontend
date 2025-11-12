export default function OfficalBadge() {
  return (
    <span className="inline-flex items-center justify-center">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        aria-label="verified badge"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="#6ccaf1" />
        <path
          d="M9 12.5l2.2 2.2L16.5 9.4"
          fill="none"
          stroke="#fff"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  );
}
