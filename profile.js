const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (typeof window.supabase !== 'undefined') {
    // Check if supabaseClient is already defined globally
    if (typeof window.supabaseClient === 'undefined') {
        const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1[...]';
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Make it available globally
        window.supabaseClient = supabaseClient;
    } else {
        // Use the already defined supabaseClient
        supabaseClient = window.supabaseClient;
    }
} else {
    console.error("Supabase client not available. Make sure to include the Supabase JS library.");
}

// Current page detection
const currentPage = window.location.pathname.split('/').pop();

// DOM Elements - Common for all profile pages
const userProfile = document.getElementById('userProfile');
const authButtons = document.getElementById('authButtons');
const profilePic = document.getElementById('profilePic');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// DOM Elements - Profile page specific
const profileName = document.getElementById('profileName');
const memberSince = document.getElementById('memberSince');
const largeProfilePic = document.getElementById('largeProfilePic');
const avatarOverlay = document.querySelector('.avatar-overlay');
const avatarModal = document.getElementById('avatarModal');

// Current user data
let currentUser = null;
let profileData = null;


// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if user is logged in
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError || !session) {
            // Redirect to login page if not logged in
            window.location.href = 'login.html';
            return;
        }
        
        // Get current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError) {
            console.error('Error getting user:', userError);
            return;
        }
        
        currentUser = user;
        
        // Set demo user values immediately to prevent "Loading..." text
        if (profileName) profileName.textContent = "Shreyas Roy"; // Set default name
        if (memberSince) memberSince.textContent = "Member since: March 2, 2025"; // Set default date
        if (largeProfilePic) {
            largeProfilePic.src = "images/default-avatar.png"; // Set default avatar
            largeProfilePic.onerror = () => {
                largeProfilePic.src = "images/default-avatar.png";
            };
        }
        
        await initializeNavbar();
        
        // Initialize page-specific functionality
        if (currentPage === 'profile.html' || currentPage === '') {
            await initializeProfilePage();
        } else if (currentPage === 'account-settings.html') {
            await initializeAccountSettings();
        } else if (currentPage === 'study-statistics.html') {
            // No specific initialization needed for the under construction page
        }
        
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

// Initialize navbar for logged-in user
async function initializeNavbar() {
    try {
        // Get user profile data
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', currentUser.id)
            .single();
        
        // Default data if there's an error or no data
        const userData = {
            full_name: "Shreyas Roy",
            avatar_url: "images/default-avatar.png"
        };
        
        if (!error && data) {
            // If we have data from Supabase, use it
            if (data.full_name) userData.full_name = data.full_name;
            if (data.avatar_url) userData.avatar_url = data.avatar_url;
        }
        
        // Show user profile in navbar, hide auth buttons
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        
        // Update profile picture and name
        if (profilePic) {
            profilePic.src = userData.avatar_url;
            profilePic.onerror = () => {
                profilePic.src = 'images/default-avatar.png';
            };
        }
        
        if (userName) {
            userName.textContent = userData.full_name;
        }
        
    } catch (error) {
        console.error('Error initializing navbar:', error);
        
        // Even if there's an error, ensure the navbar is updated
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        
        if (profilePic) {
            profilePic.src = 'images/default-avatar.png';
        }
        
        if (userName) {
            userName.textContent = "Shreyas Roy";
        }
    }
}
// Initialize profile page
async function initializeProfilePage() {
    if (!profileName || !memberSince || !largeProfilePic) return;
    
    try {
        // Load profile data
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            // If there's an error, use default data
            profileData = {
                full_name: "Shreyas Roy",
                phone: "",
                school: "",
                grade: "",
                bio: "",
                avatar_url: "images/default-avatar.png"
            };
        } else {
            profileData = data;
        }
        
        // Format creation date
        const createdAt = new Date(currentUser.created_at || "2025-03-02T18:16:34Z");
        const formattedDate = createdAt.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Update UI with profile data
        profileName.textContent = profileData.full_name || "Shreyas Roy";
        memberSince.textContent = `Member since: ${formattedDate}`;
        
        if (profileData.avatar_url) {
            largeProfilePic.src = profileData.avatar_url;
        } else {
            largeProfilePic.src = 'images/default-avatar.png';
        }
        
        largeProfilePic.onerror = () => {
            largeProfilePic.src = 'images/default-avatar.png';
        };
        
        // Populate form if it exists
        populateProfileForm(profileData);
        
        // Initialize avatar modal
        initAvatarModal();
        
    } catch (error) {
        console.error('Error loading profile data:', error);
        
        // Ensure UI is updated even if there's an error
        profileName.textContent = "Shreyas Roy";
        memberSince.textContent = `Member since: March 2, 2025`;
        largeProfilePic.src = 'images/default-avatar.png';
    }
}
// Populate profile form
function populateProfileForm(data) {
    const editFullName = document.getElementById('editFullName');
    const editEmail = document.getElementById('editEmail');
    const editPhone = document.getElementById('editPhone');
    const editSchool = document.getElementById('editSchool');
    const editGrade = document.getElementById('editGrade');
    const editBio = document.getElementById('editBio');
    const profileForm = document.getElementById('profileForm');
    
    if (!profileForm) return;
    
    if (editFullName) editFullName.value = data.full_name || '';
    if (editEmail) editEmail.value = currentUser.email;
    if (editPhone) editPhone.value = data.phone || '';
    if (editSchool) editSchool.value = data.school || '';
    if (editGrade) editGrade.value = data.grade || '';
    if (editBio) editBio.value = data.bio || '';
    
    // Add form submission handler
    profileForm.addEventListener('submit', handleProfileFormSubmit);
}

// Handle profile form submission
async function handleProfileFormSubmit(e) {
    e.preventDefault();
    
    const editFullName = document.getElementById('editFullName');
    const editPhone = document.getElementById('editPhone');
    const editSchool = document.getElementById('editSchool');
    const editGrade = document.getElementById('editGrade');
    const editBio = document.getElementById('editBio');
    
    // Get form data
    const fullName = editFullName ? editFullName.value : '';
    const phone = editPhone ? editPhone.value : '';
    const school = editSchool ? editSchool.value : '';
    const grade = editGrade ? editGrade.value : '';
    const bio = editBio ? editBio.value : '';
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;
        }
        
        // Update profile in Supabase
        const { error } = await supabaseClient
            .from('profiles')
            .update({
                full_name: fullName,
                phone: phone,
                school: school,
                grade: grade,
                bio: bio,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);
        
        if (error) throw error;
        
        // Update UI if we're on the profile page
        if (profileName) {
            profileName.textContent = fullName;
        }
        
        // Update navbar username
        if (userName) {
            userName.textContent = fullName || currentUser.email.split('@')[0];
        }
        
        // Show success message
        alert('Profile updated successfully');
        
        // Reset button state
        if (submitBtn) {
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error.message);
        
        // Reset button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
        }
    }
}

// Initialize avatar modal
function initAvatarModal() {
    if (!avatarOverlay || !avatarModal) return;
    
    const modalClose = document.querySelector('#avatarModal .close');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarForm = document.getElementById('avatarForm');
    
    if (!modalClose || !avatarInput || !avatarPreview || !avatarForm) return;
    
    // Open modal when clicking the avatar overlay
    avatarOverlay.addEventListener('click', () => {
        avatarModal.style.display = 'block';
        
        // Set current avatar as preview
        avatarPreview.src = largeProfilePic.src;
    });
    
    // Close modal when clicking the X
    modalClose.addEventListener('click', () => {
        avatarModal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === avatarModal) {
            avatarModal.style.display = 'none';
        }
    });
    
    // Preview selected image
    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle avatar form submission
    avatarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = avatarInput.files[0];
        if (!file) {
            alert('Please select an image');
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = avatarForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Uploading...';
            submitBtn.disabled = true;
            
            // Upload avatar to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}.${fileExt}`;
            
            const { error: uploadError } = await supabaseClient.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });
            
            if (uploadError) throw uploadError;
            
            // Get public URL
            const { data: { publicUrl } } = supabaseClient.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            // Update profile with new avatar URL
            const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', currentUser.id);
            
            if (updateError) throw updateError;
            
            // Update UI
            largeProfilePic.src = publicUrl;
            profilePic.src = publicUrl;
            
            // Close modal
            avatarModal.style.display = 'none';
            
            // Reset form
            submitBtn.textContent = 'Upload';
            submitBtn.disabled = false;
            
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar: ' + error.message);
            
            // Reset button state
            const submitBtn = avatarForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Upload';
            submitBtn.disabled = false;
        }
    });
}

// Initialize account settings page
async function initializeAccountSettings() {
    try {
        // Initialize password form
        initPasswordForm();
        
        // Initialize notification settings
        await initNotificationSettings();
        
        // Initialize privacy settings
        await initPrivacySettings();
        
        // Initialize danger zone (delete account)
        initDeleteAccount();
        
    } catch (error) {
        console.error('Error initializing account settings:', error);
    }
}

// Initialize password form
function initPasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    if (!passwordForm) return;
    
    // Initialize password toggles
    const togglePasswordElements = document.querySelectorAll('.toggle-password');
    togglePasswordElements.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            }
        });
    });
    
    // Initialize password strength meter
    const newPassword = document.getElementById('newPassword');
    const strengthLevel = document.getElementById('strengthLevel');
    const strengthText = document.getElementById('strengthText');
    
    if (newPassword && strengthLevel && strengthText) {
        newPassword.addEventListener('input', () => {
            const score = calculatePasswordStrength(newPassword.value);
            
            // Update strength meter
            strengthLevel.style.width = `${score}%`;
            
            // Update color based on strength
            if (score < 25) {
                strengthLevel.style.backgroundColor = '#db4437'; // Red
                strengthText.textContent = 'Weak password';
            } else if (score < 50) {
                strengthLevel.style.backgroundColor = '#f4b400'; // Yellow
                strengthText.textContent = 'Fair password';
            } else if (score < 75) {
                strengthLevel.style.backgroundColor = '#0f9d58'; // Green
                strengthText.textContent = 'Good password';
            } else {
                strengthLevel.style.backgroundColor = '#4285f4'; // Blue
                strengthText.textContent = 'Strong password';
            }
        });
    }
    
    // Handle form submission
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Updating...';
            submitBtn.disabled = true;
            
            // Update password in Supabase
            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });
            
            if (error) throw error;
            
            // Show success message
            alert('Password updated successfully');
            
            // Reset form
            passwordForm.reset();
            
            // Reset strength meter
            if (strengthLevel && strengthText) {
                strengthLevel.style.width = '0';
                strengthText.textContent = 'Password strength';
            }
            
            // Reset button state
            submitBtn.textContent = 'Update Password';
            submitBtn.disabled = false;
            
        } catch (error) {
            console.error('Error updating password:', error);
            alert('Error updating password: ' + error.message);
            
            // Reset button state
            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Password';
            submitBtn.disabled = false;
        }
    });
}

// Initialize notification settings
async function initNotificationSettings() {
    const saveNotificationBtn = document.getElementById('saveNotificationSettings');
    if (!saveNotificationBtn) return;
    
    try {
        // Get notification settings from Supabase
        const { data, error } = await supabaseClient
            .from('notification_settings')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching notification settings:', error);
        }
        
        // Update checkbox states
        document.getElementById('notifyStudyReminders').checked = data?.study_reminders ?? true;
        document.getElementById('notifyNewFeatures').checked = data?.new_features ?? true;
        document.getElementById('notifyComments').checked = data?.comments ?? false;
        document.getElementById('notifyUpdates').checked = data?.platform_updates ?? true;
        
        // Handle save button click
        saveNotificationBtn.addEventListener('click', async () => {
            const studyReminders = document.getElementById('notifyStudyReminders').checked;
            const newFeatures = document.getElementById('notifyNewFeatures').checked;
            const comments = document.getElementById('notifyComments').checked;
            const updates = document.getElementById('notifyUpdates').checked;
            
            try {
                // Show loading state
                saveNotificationBtn.textContent = 'Saving...';
                saveNotificationBtn.disabled = true;
                
                // Ensure the notification_settings table exists
                await ensureNotificationSettingsTable();
                
                // Update or insert notification settings
                const { error } = await supabaseClient
                    .from('notification_settings')
                    .upsert({
                        user_id: currentUser.id,
                        study_reminders: studyReminders,
                        new_features: newFeatures,
                        comments: comments,
                        platform_updates: updates,
                        updated_at: new Date().toISOString()
                    });
                
                if (error) throw error;
                
                // Show success message
                alert('Notification settings saved');
                
                // Reset button state
                saveNotificationBtn.textContent = 'Save Notification Settings';
                saveNotificationBtn.disabled = false;
                
            } catch (error) {
                console.error('Error saving notification settings:', error);
                alert('Error saving settings: ' + error.message);
                
                // Reset button state
                saveNotificationBtn.textContent = 'Save Notification Settings';
                saveNotificationBtn.disabled = false;
            }
        });
        
    } catch (error) {
        console.error('Error initializing notification settings:', error);
    }
}

// Initialize privacy settings
async function initPrivacySettings() {
    const savePrivacyBtn = document.getElementById('savePrivacySettings');
    if (!savePrivacyBtn) return;
    
    try {
        // Get user settings from Supabase
        const { data, error } = await supabaseClient
            .from('user_settings')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user settings:', error);
        }
        
        // Update select values
        document.getElementById('profileVisibility').value = data?.profile_visibility || 'public';
        document.getElementById('notesVisibility').value = data?.notes_visibility || 'public';
        
        // Handle save button click
        savePrivacyBtn.addEventListener('click', async () => {
            const profileVisibility = document.getElementById('profileVisibility').value;
            const notesVisibility = document.getElementById('notesVisibility').value;
            
            try {
                // Show loading state
                savePrivacyBtn.textContent = 'Saving...';
                savePrivacyBtn.disabled = true;
                
                // Ensure the user_settings table exists
                await ensureUserSettingsTable();
                
                // Update or insert user settings
                const { error } = await supabaseClient
                    .from('user_settings')
                    .upsert({
                        user_id: currentUser.id,
                        profile_visibility: profileVisibility,
                        notes_visibility: notesVisibility,
                        updated_at: new Date().toISOString()
                    });
                
                if (error) throw error;
                
                // Show success message
                alert('Privacy settings saved');
                
                // Reset button state
                savePrivacyBtn.textContent = 'Save Privacy Settings';
                savePrivacyBtn.disabled = false;
                
            } catch (error) {
                console.error('Error saving privacy settings:', error);
                alert('Error saving settings: ' + error.message);
                
                // Reset button state
                savePrivacyBtn.textContent = 'Save Privacy Settings';
                savePrivacyBtn.disabled = false;
            }
        });
        
    } catch (error) {
        console.error('Error initializing privacy settings:', error);
    }
}

// Initialize delete account functionality
function initDeleteAccount() {
    const deleteAccountBtn = document.getElementById('deleteAccount');
    if (!deleteAccountBtn) return;
    
    deleteAccountBtn.addEventListener('click', () => {
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        
        if (confirmed) {
            // Ask for email confirmation
            const emailConfirmation = prompt(`To confirm deletion, please type your email address (${currentUser.email}):`);
            
            if (emailConfirmation === currentUser.email) {
                deleteAccount();
            } else {
                alert('Email address does not match. Account deletion cancelled.');
            }
        }
    });
}

// Delete account function
async function deleteAccount() {
    try {
        // Delete user's data from tables
        await supabaseClient
            .from('notification_settings')
            .delete()
            .eq('user_id', currentUser.id);
            
        await supabaseClient
            .from('user_settings')
            .delete()
            .eq('user_id', currentUser.id);
        
        // Delete from profiles
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .delete()
            .eq('id', currentUser.id);
            
        if (profileError) {
            console.error('Error deleting profile:', profileError);
        }
        
        // Delete user's avatar from storage
        try {
            await supabaseClient.storage
                .from('avatars')
                .remove([`${currentUser.id}.jpg`, `${currentUser.id}.png`, `${currentUser.id}.jpeg`]);
        } catch (storageError) {
            console.error('Error deleting avatar:', storageError);
        }
        
        // Sign out the user
        await supabaseClient.auth.signOut();
        
        // Show message and redirect
        alert('Your account has been deleted. You are now signed out.');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('There was an error deleting your account: ' + error.message);
    }
}

// Ensure notification_settings table exists
async function ensureNotificationSettingsTable() {
    try {
        await supabaseClient.rpc('create_notification_settings_if_not_exists');
    } catch (error) {
        console.error('Error ensuring notification settings table exists:', error);
    }
}

// Ensure user_settings table exists
async function ensureUserSettingsTable() {
    try {
        await supabaseClient.rpc('create_user_settings_if_not_exists');
    } catch (error) {
        console.error('Error ensuring user settings table exists:', error);
    }
}

// Calculate password strength score (0-100)
function calculatePasswordStrength(password) {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    score += Math.min(password.length * 5, 30);
    
    // Character variety
    if (/[A-Z]/.test(password)) score += 10; // Uppercase
    if (/[a-z]/.test(password)) score += 10; // Lowercase
    if (/[0-9]/.test(password)) score += 10; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 15; // Special chars
    
    // Pattern variety
    if (/[A-Z].*[A-Z]/.test(password)) score += 5; // Multiple uppercase
    if (/[a-z].*[a-z]/.test(password)) score += 5; // Multiple lowercase
    if (/[0-9].*[0-9]/.test(password)) score += 5; // Multiple numbers
    if (/[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 10; // Multiple special chars
    
    return Math.min(score, 100); // Cap at 100
}

// Navbar menu toggle functions for mobile view
function showMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.style.right = '0';
    }
}

function hideMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.style.right = '-200px';
    }
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            const { error } = await supabaseClient.auth.signOut();
            
            if (error) {
                throw error;
            }
            
            // Redirect to home page
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out: ' + error.message);
        }
    });
}

// Create the SQL functions to set up tables
async function createRequiredTables() {
    const createNotificationSettingsTable = `
        CREATE TABLE IF NOT EXISTS notification_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            study_reminders BOOLEAN DEFAULT TRUE,
            new_features BOOLEAN DEFAULT TRUE,
            comments BOOLEAN DEFAULT FALSE,
            platform_updates BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            UNIQUE(user_id)
        );
    `;
    
    const createUserSettingsTable = `
        CREATE TABLE IF NOT EXISTS user_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            profile_visibility TEXT DEFAULT 'public',
            notes_visibility TEXT DEFAULT 'public',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            UNIQUE(user_id)
        );
    `;
    
    // These SQL statements should be executed in your Supabase SQL Editor
    console.log("SQL to create tables (run in Supabase SQL Editor):");
    console.log(createNotificationSettingsTable);
    console.log(createUserSettingsTable);
}

// Set current date in footer copyright
document.addEventListener('DOMContentLoaded', function() {
    const copyrightElement = document.querySelector('.copyright p');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `© ${currentYear} NotesBuddy. All Rights Reserved.`;
    }
});