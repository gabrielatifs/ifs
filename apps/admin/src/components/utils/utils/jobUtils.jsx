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
    
    const slugParts = [title, location].filter(Boolean).join('-');
    
    // Format: ?id=slug-fullID
    // This ensures uniqueness and readability while using a single parameter
    return `?id=${slugParts}-${job.id}`;
};