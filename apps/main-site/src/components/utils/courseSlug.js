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
  const id =
    typeof courseOrTitle === 'object'
      ? courseOrTitle?.id || courseOrTitle?.courseId
      : null;

  const slug = courseTitleToSlug(title);
  if (slug) {
    return `/training/${slug}`;
  }
  if (id) {
    return `/training?id=${id}`;
  }
  return '/training';
};
