// SVG Icon paths for faith experience cards
// Map icon IDs to SVG file paths for easy customization

export const iconMap = {
  worship: "/icons/worship.svg",
  bible: "/icons/bible.svg",
  community: "/icons/community.svg",
  belonging: "/icons/belonging.svg",
  sent: "/icons/sent.svg"
};

// Get icon path by ID
export function getIcon(iconId) {
  return iconMap[iconId] || null;
}

