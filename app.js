// Supabase Configuration
const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';
// Create Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const navLinks = document.getElementById('navLinks');
const authButtons = document.getElementById('authButtons');
const userProfile = document.getElementById('userProfile');
const profilePic = document.getElementById('profilePic');
const userName = document.getElementById('userName');

// Mobile menu toggle
function showMenu() {
    navLinks.classList.add('active');
}

function hideMenu() {
    navLinks.classList.remove('active');
}

// Check if user is logged in
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Checking auth status...');
    
    try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
            console.error('Session error:', sessionError);
            if (authButtons && userProfile) {
                authButtons.style.display = 'flex';
                userProfile.style.display = 'none';
            }
            return;
        }
        
        if (!session) {
            console.log('No active session');
            if (authButtons && userProfile) {
                authButtons.style.display = 'flex';
                userProfile.style.display = 'none';
            }
            return;
        }
        
        console.log('Session found, loading user data');
        
        // Session exists, get user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError) {
            console.error('Error getting user:', userError);
            if (authButtons && userProfile) {
                authButtons.style.display = 'flex';
                userProfile.style.display = 'none';
            }
            return;
        }
        
        if (user) {
            // User is logged in, display profile
            await displayUserProfile(user);
        } else {
            console.log('No user found despite session');
            if (authButtons && userProfile) {
                authButtons.style.display = 'flex';
                userProfile.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Auth error:', error.message);
        if (authButtons && userProfile) {
            authButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }
});

// Display user profile info
async function displayUserProfile(user) {
    console.log('Loading profile for user:', user.id);
    
    try {
        // Get user profile from the profiles table
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('full_name, avatar_url, phone')
            .eq('id', user.id)
            .single();
        
        if (error) {
            console.error('Error fetching profile:', error);
            if (userName) userName.textContent = user.email.split('@')[0];
            if (profilePic) profilePic.src = 'images/default-avatar.png';
        } else if (data) {
            console.log('Profile loaded:', data);
            
            if (userName) userName.textContent = data.full_name || user.email.split('@')[0];
            
            if (profilePic) {
                if (data.avatar_url) {
                    profilePic.src = data.avatar_url;
                    // Add error handler for image loading
                    profilePic.onerror = () => {
                        profilePic.src = 'images/default-avatar.png';
                    };
                } else {
                    profilePic.src = 'images/default-avatar.png';
                }
            }
        } else {
            console.warn('No profile found');
            if (userName) userName.textContent = user.email.split('@')[0];
            if (profilePic) profilePic.src = 'images/default-avatar.png';
        }
        
        if (authButtons && userProfile) {
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error displaying profile:', error.message);
    }
}

// Add event listener for user profile dropdown if it exists
if (userProfile) {
    userProfile.addEventListener('click', () => {
        // Implement dropdown functionality if needed
        console.log('Profile clicked');
    });
}

// Add logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error.message);
            alert('Failed to sign out. Please try again.');
        }
    });
}

// Update copyright year in footer
document.addEventListener('DOMContentLoaded', () => {
    const copyright = document.querySelector('.copyright p');
    if (copyright) {
        const currentYear = new Date().getFullYear();
        copyright.innerHTML = `&copy; ${currentYear} NotesBuddy. All Rights Reserved.`;
    }
});