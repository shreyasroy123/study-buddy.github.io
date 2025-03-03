// Enhanced user authentication check
async function checkUserLoggedIn() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // User is logged in
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();
            
        if (data) {
            // Update UI elements
            const authSection = document.getElementById('auth-section');
            const userSection = document.getElementById('user-section');
            
            if (authSection && userSection) {
                authSection.style.display = 'none';
                userSection.style.display = 'flex';
                
                // Set user name
                const userNameElement = document.getElementById('user-name');
                if (userNameElement) {
                    userNameElement.textContent = data.full_name || 'shreyasroy123';
                }
                
                // Set profile picture
                const userAvatarElement = document.getElementById('user-avatar');
                if (userAvatarElement) {
                    if (data.avatar_url) {
                        userAvatarElement.src = data.avatar_url;
                    } else {
                        // Create initials-based avatar
                        const names = (data.full_name || 'shreyasroy123').split(' ');
                        const initials = names.map(name => name.charAt(0)).join('').toUpperCase();
                        userAvatarElement.src = `https://via.placeholder.com/40/4a86e8/ffffff?text=${initials}`;
                    }
                }
            }
            
            console.log('User logged in:', data.full_name || 'shreyasroy123');
        }
    } else {
        // User is not logged in
        const authSection = document.getElementById('auth-section');
        const userSection = document.getElementById('user-section');
        
        if (authSection && userSection) {
            authSection.style.display = 'flex';
            userSection.style.display = 'none';
        }
    }
}

// Call this function on page load
document.addEventListener('DOMContentLoaded', checkUserLoggedIn);