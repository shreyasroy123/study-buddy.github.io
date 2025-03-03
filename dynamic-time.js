// Dynamic real-time clock updating every second
function updateDateTime() {
    const currentDateElements = document.querySelectorAll('.current-date');
    if (currentDateElements.length === 0) return;
    
    const now = new Date();
    
    // Format date as YYYY-MM-DD HH:MM:SS
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    currentDateElements.forEach(element => {
        element.innerHTML = `<i class="far fa-calendar-alt"></i> Current Date: ${formattedDateTime} UTC`;
    });
}

// Initialize clock on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initial update
    updateDateTime();
    
    // Update every second
    setInterval(updateDateTime, 1000);
});