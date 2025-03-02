// Supabase Configuration (same as in app.js)
const SUPABASE_URL = 'https://irqmhamkeytbiobbraxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycW1oYW1rZXl0YmlvYmJyYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTAxMjYsImV4cCI6MjA1NjQyNjEyNn0.nnSRe3Z1BiZjSOIgOzg3I8zv7TtUmei-bPAELw7eEl8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const profileName = document.getElementById('profileName');
const memberSince = document.getElementById('memberSince');
const largeProfilePic = document.getElementById('largeProfilePic');
const editFullName = document.getElementById('editFullName');
const editEmail = document.getElementById('editEmail');
const editPhone = document.getElementById('editPhone');
const editSchool = document.getElementById('editSchool');
const editGrade = document.getElementById('editGrade');
const editBio = document.getElementById('editBio');
const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');
const notesCount = document.getElementById('notesCount');
const studyHours = document.getElementById('studyHours');
const completedTasks = document.getElementById('completedTasks');
const achievements = document.getElementById('achievements');

// Modal elements
const avatarModal = document.getElementById('avatarModal');
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const avatarForm = document.getElementById('avatarForm');
const modalClose = document.querySelector('.close');
const avatarOverlay = document.querySelector('.avatar-overlay');

// Current user data
let currentUser = null;
let profileData = null;

// Initialize profile page
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
        
        // Load profile data
        await loadProfileData();
        
        // Load study statistics
        await loadStudyStats();
        
        // Initialize tab navigation
        initTabs();
        
        // Initialize avatar modal
        initAvatarModal();
        
    } catch (error) {
        console.error('Error initializing profile page:', error);
    }
});

// Load profile data from Supabase
async function loadProfileData() {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            console.error('Error fetching profile:', error);
            return;
        }
        
        profileData = data;
        
        // Format creation date
        const createdAt = new Date(currentUser.created_at || Date.now());
        const formattedDate = createdAt.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Update UI with profile data
        profileName.textContent = data.full_name || currentUser.email.split('@')[0];
        memberSince.textContent = `Member since: ${formattedDate}`;
        
        if (data.avatar_url) {
            largeProfilePic.src = data.avatar_url;
            largeProfilePic.onerror = () => {
                largeProfilePic.src = 'images/default-avatar.png';
            };
        }
        
        // Populate form fields
        editFullName.value = data.full_name || '';
        editEmail.value = currentUser.email;
        editPhone.value = data.phone || '';
        editSchool.value = data.school || '';
        editGrade.value = data.grade || '';
        editBio.value = data.bio || '';
        
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

// Load study statistics
async function loadStudyStats() {
    try {
        // Get notes count
        const { count: noteCount, error: noteError } = await supabaseClient
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id);
        
        if (!noteError) {
            notesCount.textContent = noteCount || 0;
        }
        
        // For now, we'll use placeholder data for the other stats
        // In a real app, you would fetch these from their respective tables
        studyHours.textContent = '12';
        completedTasks.textContent = '24';
        achievements.textContent = '5';
        
        // In the future, you can implement:
        // - Study hours tracking from study sessions table
        // - Task completion from tasks table
        // - Achievements from achievements table
        
    } catch (error) {
        console.error('Error loading study stats:', error);
    }
}

// Tab navigation
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show selected tab content, hide others
            tabContents.forEach(content => {
                if (content.id === tabId) {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });
        });
    });
}

// Avatar modal functions
function initAvatarModal() {
    // Open modal when clicking the avatar overlay
    avatarOverlay.addEventListener('click', () => {
        avatarModal.style.display = 'block';
        
        // Set the current avatar as preview
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
            
            if (uploadError) {
                throw uploadError;
            }
            
            // Get public URL
            const { data: { publicUrl } } = supabaseClient.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            // Update profile with new avatar URL
            const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', currentUser.id);
            
            if (updateError) {
                throw updateError;
            }
            
            // Update UI
            largeProfilePic.src = publicUrl;
            
            // Also update the header avatar if it exists
            const headerProfilePic = document.getElementById('profilePic');
            if (headerProfilePic) {
                headerProfilePic.src = publicUrl;
            }
            
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

// Handle profile form submission
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const fullName = editFullName.value;
    const phone = editPhone.value;
    const school = editSchool.value;
    const grade = editGrade.value;
    const bio = editBio.value;
    
    try {
        // Show loading state
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        // Update profile in Supabase
        const { data, error } = await supabaseClient
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
        
        if (error) {
            throw error;
        }
        
        // Update UI
        profileName.textContent = fullName;
        
        // Also update the header username if it exists
        const headerUserName = document.getElementById('userName');
        if (headerUserName) {
            headerUserName.textContent = fullName;
        }
        
        // Show success message
        alert('Profile updated successfully');
        
        // Reset button state
        submitBtn.textContent = 'Save Changes';
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error.message);
        
        // Reset button state
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Save Changes';
        submitBtn.disabled = false;
    }
});

// Handle password form submission
passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        alert('Password must contain at least 8 characters including alphanumeric and special characters.');
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
        
        if (error) {
            throw error;
        }
        
        // Show success message
        alert('Password updated successfully');
        
        // Reset form
        passwordForm.reset();
        
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

// Handle notification settings
const saveNotificationBtn = document.getElementById('saveNotificationSettings');
if (saveNotificationBtn) {
    saveNotificationBtn.addEventListener('click', async () => {
        const studyReminders = document.getElementById('notifyStudyReminders').checked;
        const newFeatures = document.getElementById('notifyNewFeatures').checked;
        const comments = document.getElementById('notifyComments').checked;
        const updates = document.getElementById('notifyUpdates').checked;
        
        try {
            // Show loading state
            saveNotificationBtn.textContent = 'Saving...';
            saveNotificationBtn.disabled = true;
            
            // Update notification settings in Supabase
            const { error } = await supabaseClient
                .from('notification_settings')
                .upsert({
                    user_id: currentUser.id,
                    study_reminders: studyReminders,
                    new_features: newFeatures,
                    comments: comments,
                    platform_updates: updates
                });
            
            if (error) {
                throw error;
            }
            
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
}

// Handle account deletion
const deleteAccountBtn = document.getElementById('deleteAccount');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        
        if (confirmed) {
            // Ask for additional confirmation with account email
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
        // Delete user's data
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .delete()
            .eq('id', currentUser.id);
            
        if (profileError) {
            console.error('Error deleting profile:', profileError);
        }
        
        // Delete user's notes, tasks, etc.
        // You would add more deletions here for any other tables related to the user
        
        // Delete user's avatar from storage
        try {
            await supabaseClient.storage
                .from('avatars')
                .remove([`${currentUser.id}.jpg`, `${currentUser.id}.png`, `${currentUser.id}.jpeg`]);
        } catch (storageError) {
            console.error('Error deleting avatar:', storageError);
        }
        
        // Finally delete the user account
        const { error } = await supabaseClient.auth.admin.deleteUser(currentUser.id);
        
        if (error) {
            throw error;
        }
        
        // Sign out
        await supabaseClient.auth.signOut();
        
        // Show message and redirect
        alert('Your account has been deleted successfully.');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('There was an error deleting your account: ' + error.message + '\nPlease contact support for assistance.');
    }
}