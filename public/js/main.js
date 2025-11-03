document.addEventListener('DOMContentLoaded', () => {
    // Hide loader
    const loader = document.querySelector('.loader-wrapper');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }

    // Add page transition class to main content
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('page-transition');
    }

    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });
});