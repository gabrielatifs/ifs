export const fastLogout = () => {
    console.log('FASTLOGOUT CALLED');
    alert('fastLogout called - clicking OK will redirect');

    // Clear all auth-related storage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect immediately
    window.location.href = 'https://www.join-ifs.org';
};
