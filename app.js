// Supabase Configuration
const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';
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
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
            // User is logged in
            displayUserProfile(user);
        } else {
            // User is not logged in
            authButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking authentication:', error.message);
    }
});

// Display user profile info
async function displayUserProfile(user) {
    try {
        // Get user profile data from the profiles table
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();
        
        if (error) throw error;
        
        if (data) {
            // Display user profile info
            profilePic.src = data.avatar_url || 'default-avatar.png';
            userName.textContent = data.full_name;
            
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
    }
}

// Add event listener for user profile dropdown
userProfile.addEventListener('click', () => {
    // Implement dropdown functionality if needed
    console.log('Profile clicked');
});

// Check for date for footer
document.addEventListener('DOMContentLoaded', () => {
    const copyright = document.querySelector('.copyright p');
    if (copyright) {
        const currentYear = new Date().getFullYear();
        copyright.innerHTML = `&copy; ${currentYear} NotesBuddy. All Rights Reserved.`;
    }
});