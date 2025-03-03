// Supabase Configuration
const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Create the Supabase client
        const { createClient } = supabase;
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Store in window for access across the site
        window.supabaseClient = supabaseClient;
        
        // Check authentication
        await checkAuthStatus(supabaseClient);
    } catch (error) {
        console.error('Supabase initialization error:', error);
        showAuthButtons();
    }
});

// DOM Elements
const authButtons = document.getElementById('authButtons');
const userProfile = document.getElementById('userProfile');
const userName = document.getElementById('userName');
const profilePic = document.getElementById('profilePic');
const logoutBtn = document.getElementById('logoutBtn');

// Check authentication status when page loads
async function checkAuthStatus(supabaseClient) {
    try {
        // Get current session
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) throw error;

        // If no active session - show login/signup buttons
        if (!data.session) {
            showAuthButtons();
            return;
        }

        // Get current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !user) {
            showAuthButtons();
            return;
        }

        // Get user profile data
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
        }

        // User is authenticated - show profile
        showUserProfile(user, profile);
        
        // Set up logout button
        setupLogoutButton(supabaseClient);
        
    } catch (error) {
        console.error('Auth check error:', error);
        showAuthButtons();
    }
}

// Show auth buttons, hide user profile
function showAuthButtons() {
    if (authButtons) authButtons.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
    
    // If on protected page, redirect to login
    const currentPage = window.location.pathname.split('/').pop();
    if (['profile.html', 'account-settings.html', 'study-statistics.html'].includes(currentPage)) {
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 100);
    }
}

// Hide auth buttons, show user profile
function showUserProfile(user, profile) {
    if (authButtons) authButtons.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    
    // Update username
    if (userName) {
        userName.textContent = profile?.name || user.email.split('@')[0];
    }
    
    // Update profile picture
    if (profilePic) {
        if (profile?.avatar_url) {
            // Create image element for avatar
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
            
            // Add error handler
            img.onerror = function() {
                setTextAvatar(this, user);
            };
        } else {
            // Use text avatar with initial
            setTextAvatar(profilePic, user);
        }
    }
}

// Setup logout button
function setupLogoutButton(supabaseClient) {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) throw error;
                
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error signing out. Please try again.');
            }
        });
    }
}

// Create text-based avatar with initial
function setTextAvatar(element, user) {
    const initial = (user.email || 'U')[0].toUpperCase();
    const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9C27B0', '#3F51B5', '#FF5722'];
    const colorIndex = initial.charCodeAt(0) % colors.length;
    
    if (element.tagName === 'IMG') {
        // Convert img to div
        const newDiv = document.createElement('div');
        newDiv.id = 'profilePic';
        newDiv.style.width = '35px';
        newDiv.style.height = '35px';
        newDiv.style.borderRadius = '50%';
        newDiv.style.backgroundColor = colors[colorIndex];
        newDiv.style.color = 'white';
        newDiv.style.display = 'flex';
        newDiv.style.alignItems = 'center';
        newDiv.style.justifyContent = 'center';
        newDiv.style.marginRight = '10px';
        newDiv.style.fontWeight = 'bold';
        newDiv.textContent = initial;
        
        const parent = element.parentElement;
        if (parent) {
            parent.replaceChild(newDiv, element);
        }
    } else {
        // Update div content
        element.textContent = initial;
        element.style.backgroundColor = colors[colorIndex];
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

// Update copyright year
const copyrightElement = document.querySelector('.copyright p');
if (copyrightElement) {
    const currentYear = new Date().getFullYear();
    copyrightElement.textContent = `© ${currentYear} NotesBuddy. All Rights Reserved.`;
}