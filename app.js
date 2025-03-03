// Initialize Supabase client
document.addEventListener('DOMContentLoaded', function() {
    // Create the Supabase client
    const supabaseUrl = 'https://jncfbkvxbskyhduvcpit.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';
    try {
        const { createClient } = supabase;
        const client = createClient(supabaseUrl, supabaseKey);
        window.supabaseClient = client;
        
        // Check auth status
        checkAuth();
    } catch (error) {
        console.error("Supabase init error:", error);
    }
});

// Check authentication status
async function checkAuth() {
    try {
        const client = window.supabaseClient;
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
            console.error("Session error:", error);
            showAuthButtons();
            return;
        }
        
        if (!session) {
            showAuthButtons();
            return;
        }
        
        // User is logged in
        const { data: { user }, error: userError } = await client.auth.getUser();
        
        if (userError || !user) {
            console.error("User error:", userError);
            showAuthButtons();
            return;
        }
        
        // Get profile data
        const { data: profile, error: profileError } = await client
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (profileError) {
            console.error("Profile error:", profileError);
        }
        
        // Show user info in navbar
        showUserInfo(user, profile || {});
        
        // Setup logout
        setupLogout();
    } catch (err) {
        console.error("Auth check error:", err);
        showAuthButtons();
    }
}

// Show auth buttons (login/signup)
function showAuthButtons() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    
    if (authButtons) authButtons.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
}

// Show user info in navbar
function showUserInfo(user, profile) {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const profilePic = document.getElementById('profilePic');
    
    if (authButtons) authButtons.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    
    // Update username - use profile.username, profile.full_name, or email
    if (userName) {
        const displayName = profile.username || profile.full_name || user.email.split('@')[0];
        userName.textContent = displayName;
    }
    
    // Update profile picture
    if (profilePic) {
        const initial = (user.email || 'U')[0].toUpperCase();
        
        // If profile has avatar_url, use it
        if (profile.avatar_url) {
            // Create image element if needed
            if (profilePic.tagName !== 'IMG') {
                const img = document.createElement('img');
                img.id = 'profilePic';
                img.src = profile.avatar_url;
                img.alt = 'Profile';
                img.style.width = '35px';
                img.style.height = '35px';
                img.style.borderRadius = '50%';
                img.style.marginRight = '10px';
                img.style.objectFit = 'cover';
                
                // Replace text avatar with image
                const parent = profilePic.parentElement;
                if (parent) {
                    parent.replaceChild(img, profilePic);
                }
                
                // Handle image load error
                img.onerror = function() {
                    useInitialAvatar(this, initial);
                };
            } else {
                // Update existing img
                profilePic.src = profile.avatar_url;
                profilePic.onerror = function() {
                    useInitialAvatar(this, initial);
                };
            }
        } else {
            // Use initial-based avatar
            useInitialAvatar(profilePic, initial);
        }
    }
}

// Use initial for avatar
function useInitialAvatar(element, initial) {
    const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9C27B0', '#3F51B5', '#FF5722'];
    const colorIndex = initial.charCodeAt(0) % colors.length;
    
    if (element.tagName === 'IMG') {
        // Replace img with div
        const div = document.createElement('div');
        div.id = 'profilePic';
        div.textContent = initial;
        div.style.width = '35px';
        div.style.height = '35px';
        div.style.borderRadius = '50%';
        div.style.backgroundColor = colors[colorIndex];
        div.style.color = 'white';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.marginRight = '10px';
        div.style.fontWeight = 'bold';
        
        const parent = element.parentElement;
        if (parent) {
            parent.replaceChild(div, element);
        }
    } else {
        // Update existing div
        element.textContent = initial;
        element.style.backgroundColor = colors[colorIndex];
    }
}

// Setup logout button
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.removeEventListener('click', handleLogout);
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle logout action
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        
        if (error) throw error;
        
        // Redirect to home
        window.location.href = 'index.html';
    } catch (err) {
        console.error("Logout error:", err);
        alert("Error signing out. Please try again.");
    }
}

// Mobile menu functions
window.showMenu = function() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.style.right = '0';
};

window.hideMenu = function() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.style.right = '-200px';
};