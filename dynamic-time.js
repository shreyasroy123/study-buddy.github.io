// Dynamic real-time clock
function updateDateTime() {
    const currentDateElement = document.querySelector('.current-date');
    if (currentDateElement) {
        const now = new Date();
        
        // Format date as YYYY-MM-DD HH:MM:SS
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        
        currentDateElement.innerHTML = `<i class="far fa-calendar-alt"></i> Current Date: ${formattedDateTime} UTC`;
    }
}

// Update clock every second
document.addEventListener('DOMContentLoaded', () => {
    // Initial update
    updateDateTime();
    
    // Set interval to update every second
    setInterval(updateDateTime, 1000);
});