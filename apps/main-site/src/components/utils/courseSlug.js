// Utility helpers for building course slugs and paths
export const courseTitleToSlug = (title = '') => {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
};

export const coursePath = (courseOrTitle) => {
  const title =
    typeof courseOrTitle === 'string'
      ? courseOrTitle
      : courseOrTitle?.title || '';

  const slug = courseTitleToSlug(title);
  return slug ? `/course/${slug}` : '/Training';
};
