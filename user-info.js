// Function to display user-specific information
async function displayUserInfo() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    try {
        // Get user profile data
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                full_name,
                phone_number,
                avatar_url,
                is_admin,
                questions:questions(count),
                replies:replies(count)
            `)
            .eq('id', user.id)
            .single();
            
        if (error) throw error;
        
        // Update user dashboard if it exists
        const userDashboard = document.getElementById('user-dashboard');
        if (userDashboard) {
            userDashboard.innerHTML = `
                <div class="user-profile-card">
                    <div class="user-avatar-large">
                        <img src="${data.avatar_url || `https://via.placeholder.com/150/4a86e8/ffffff?text=${data.full_name.charAt(0)}`}" alt="${data.full_name}">
                    </div>
                    <h2>${data.full_name || 'shreyasroy123'}</h2>
                    <p><i class="fas fa-phone"></i> ${data.phone_number || 'No phone number'}</p>
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    <p><i class="fas fa-question-circle"></i> Questions: ${data.questions[0].count || 0}</p>
                    <p><i class="fas fa-reply"></i> Replies: ${data.replies[0].count || 0}</p>
                    ${data.is_admin ? '<span class="admin-badge">Admin</span>' : ''}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error displaying user info:', error);
    }
}

// Call this function when needed
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a user dashboard page
    if (document.getElementById('user-dashboard')) {
        displayUserInfo();
    }
});