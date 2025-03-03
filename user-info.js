// Function to fetch and display user-specific information from Supabase
async function displayUserInfo() {
    try {
        // Get current logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.log('No user logged in');
            return;
        }
        
        // Fetch user profile from Supabase
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (error) throw error;
        
        // Check if user dashboard exists
        const userDashboardElement = document.getElementById('user-dashboard');
        if (userDashboardElement) {
            // Format user information for display
            userDashboardElement.innerHTML = `
                <div class="user-profile-card">
                    <h2>Welcome, ${data.full_name || 'shreyasroy123'}</h2>
                    <div class="user-info-item">
                        <strong>Email:</strong> ${user.email}
                    </div>
                    <div class="user-info-item">
                        <strong>Phone:</strong> ${data.phone_number || 'Not provided'}
                    </div>
                    <div class="user-info-item">
                        <strong>Account Status:</strong> ${data.is_admin ? 'Administrator' : 'Regular User'}
                    </div>
                </div>
            `;
        }
        
        // Display in navbar
        const userNameElement = document.getElementById('user-name');
        const userAvatarElement = document.getElementById('user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = data.full_name || 'shreyasroy123';
        }
        
        if (userAvatarElement && data.avatar_url) {
            userAvatarElement.src = data.avatar_url;
        }
        
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', displayUserInfo);