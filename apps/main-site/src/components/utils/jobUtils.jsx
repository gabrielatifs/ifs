export const generateJobSlug = (job) => {
    if (!job) return '';
    
    const slugify = (text) => {
        return (text || '')
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')        // Replace spaces with -
            .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
            .replace(/\-\-+/g, '-')      // Replace multiple - with single -
            .replace(/^-+/, '')          // Trim - from start
            .replace(/-+$/, '');         // Trim - from end
    };

    const title = slugify(job.title);
    const location = slugify(job.addressLocality || job.location || ''); 
    
    const company = slugify(job.companyName || job.organisation || '');
    const slugParts = [title, location, company].filter(Boolean).join('-');
    return slugParts;
};

export const generateJobPath = (job) => {
    const slug = generateJobSlug(job);
    if (!slug) return '/jobs';
    return `/job/${slug}`;
};
