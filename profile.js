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

// Password toggle elements
const togglePasswordElements = document.querySelectorAll('.toggle-password');

// Current user data
let currentUser = null;
let profileData = null;

// Initialize profile page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Update copyright year
        updateCopyrightYear();
        
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
        
        // Initialize the navbar with the current user
        await initializeNavbar();
        
        // Load profile data
        await loadProfileData();
        
        // Check and create necessary tables
        await ensureTablesExist();
        
        // Load notification settings
        await loadNotificationSettings();
        
        // Load user settings
        await loadUserSettings();
        
        // Initialize tab navigation
        initTabs();
        
        // Initialize avatar modal
        initAvatarModal();
        
        // Initialize login history modal
        initLoginHistoryModal();
        
        // Initialize password toggle
        initPasswordToggle();
        
        // Initialize password strength meter
        initPasswordStrengthMeter();
        
        // Initialize two-factor auth
        init2FAToggle();
        
        // Initialize privacy settings
        initPrivacySettings();
        
    } catch (error) {
        console.error('Error initializing profile page:', error);
    }
});

// Ensure necessary tables exist in Supabase
async function ensureTablesExist() {
    try {
        // Check if notification_settings table exists
        const { error: notificationError } = await supabaseClient.rpc('create_notification_settings_if_not_exists');
        
        if (notificationError) {
            console.error('Error creating notification_settings table:', notificationError);
        }
        
        // Check if user_settings table exists
        const { error: settingsError } = await supabaseClient.rpc('create_user_settings_if_not_exists');
        
        if (settingsError) {
            console.error('Error creating user_settings table:', settingsError);
        }
        
        // Check if login_history table exists
        const { error: loginHistoryError } = await supabaseClient.rpc('create_login_history_if_not_exists');
        
        if (loginHistoryError) {
            console.error('Error creating login_history table:', loginHistoryError);
        }
        
    } catch (error) {
        console.error('Error ensuring tables exist:', error);
    }
}

// Initialize the navbar
async function initializeNavbar() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const profilePic = document.getElementById('profilePic');
    const userName = document.getElementById('userName');
    
    if (!authButtons || !userProfile || !profilePic || !userName) {
        console.error('Navbar elements not found');
        return;
    }
    
    try {
        // Get user's profile from Supabase
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            console.error('Error fetching profile for navbar:', error);
            return;
        }
        
        // Update navbar UI
        userName.textContent = data.full_name || currentUser.email.split('@')[0];
        
        if (data.avatar_url) {
            profilePic.src = data.avatar_url;
            profilePic.onerror = () => {
                profilePic.src = 'images/default-avatar.png';
            };
        }
        
        // Show user profile in navbar, hide auth buttons
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
        
    } catch (error) {
        console.error('Error initializing navbar:', error);
    }
}

// Load profile data from Supabase
async function loadProfileData() {
    try {
        // Check if profiles table has the necessary columns
        await supabaseClient.rpc('update_profiles_table_if_needed');
        
        // Get profile data
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
        
        // Record login event (for login history)
        recordLoginEvent();
        
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

// Load notification settings
async function loadNotificationSettings() {
    try {
        // Get notification settings
        const { data, error } = await supabaseClient
            .from('notification_settings')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') { // Not found is ok
            console.error('Error fetching notification settings:', error);
            return;
        }
        
        // Update UI with settings or use defaults
        document.getElementById('notifyStudyReminders').checked = data?.study_reminders ?? true;
        document.getElementById('notifyNewFeatures').checked = data?.new_features ?? true;
        document.getElementById('notifyComments').checked = data?.comments ?? false;
        document.getElementById('notifyUpdates').checked = data?.platform_updates ?? true;
        
    } catch (error) {
        console.error('Error loading notification settings:', error);
    }
}

// Load user settings
async function loadUserSettings() {
    try {
        // Get user settings
        const { data, error } = await supabaseClient
            .from('user_settings')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') { // Not found is ok
            console.error('Error fetching user settings:', error);
            return;
        }
        
        if (data) {
            // Update UI with settings
            document.getElementById('twoFactorAuth').checked = data.two_factor_enabled || false;
            document.getElementById('profileVisibility').value = data.profile_visibility || 'public';
            document.getElementById('notesVisibility').value = data.notes_visibility || 'public';
            
            // Update connection statuses
            updateConnectionStatus('googleConnectionStatus', data.google_connected);
            updateConnectionStatus('microsoftConnectionStatus', data.microsoft_connected);
        }
        
    } catch (error) {
        console.error('Error loading user settings:', error);
    }
}

// Update connection status display
function updateConnectionStatus(elementId, isConnected) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = isConnected ? 'Connected' : 'Not connected';
        element.style.color = isConnected ? '#34a853' : '#777';
        
        // Update button text
        const buttonId = elementId.replace('ConnectionStatus', '');
        const button = document.getElementById('connect' + buttonId.charAt(0).toUpperCase() + buttonId.slice(1));
        if (button) {
            button.textContent = isConnected ? 'Disconnect' : 'Connect';
        }
    }
}

// Record login event
async function recordLoginEvent() {
    try {
        // Get approximate location and device info
        const device = getBrowserInfo();
        
        // Add login record
        await supabaseClient
            .from('login_history')
            .insert({
                user_id: currentUser.id,
                device_info: device,
                ip_address: 'Recorded on login',
                location: 'Location data not available'
            });
        
    } catch (error) {
        console.error('Error recording login event:', error);
    }
}

// Get browser info
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let device = 'Unknown';
    
    if (/Windows/.test(ua)) {
        device = 'Windows';
    } else if (/Macintosh/.test(ua)) {
        device = 'Mac';
    } else if (/Android/.test(ua)) {
        device = 'Android';
    } else if (/iPhone|iPad|iPod/.test(ua)) {
        device = 'iOS';
    } else if (/Linux/.test(ua)) {
        device = 'Linux';
    }
    
    // Add browser info
    if (/Chrome/.test(ua)) {
        device += ' - Chrome';
    } else if (/Firefox/.test(ua)) {
        device += ' - Firefox';
    } else if (/Safari/.test(ua)) {
        device += ' - Safari';
    } else if (/Edge/.test(ua)) {
        device += ' - Edge';
    }
    
    return device;
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

// Initialize password toggle
function initPasswordToggle() {
    togglePasswordElements.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Find the password input field that is a sibling of this toggle
            const input = toggle.previousElementSibling;
            
            // Toggle between password and text type
            if (input.type === 'password') {
                input.type = 'text';
                toggle.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                input.type = 'password';
                toggle.classList.replace('fa-eye', 'fa-eye-slash');
            }
        });
    });
}
// Initialize password strength meter
function initPasswordStrengthMeter() {
    const passwordInput = document.getElementById('newPassword');
    const strengthLevel = document.getElementById('strengthLevel');
    const strengthText = document.getElementById('strengthText');
    
    if (!passwordInput || !strengthLevel || !strengthText) return;
    
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const score = calculatePasswordStrength(password);
        
        // Update strength meter
        strengthLevel.style.width = `${score}%`;
        
        // Update color based on strength
        if (score < 25) {
            strengthLevel.style.backgroundColor = '#ea4335'; // Red
            strengthText.textContent = 'Weak';
        } else if (score < 50) {
            strengthLevel.style.backgroundColor = '#fbbc05'; // Yellow
            strengthText.textContent = 'Fair';
        } else if (score < 75) {
            strengthLevel.style.backgroundColor = '#34a853'; // Green
            strengthText.textContent = 'Good';
        } else {
            strengthLevel.style.backgroundColor = '#4285f4'; // Blue
            strengthText.textContent = 'Strong';
        }
    });
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

// Avatar modal functions
function initAvatarModal() {
    const avatarModal = document.getElementById('avatarModal');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarForm = document.getElementById('avatarForm');
    const modalClose = document.querySelector('#avatarModal .close');
    const avatarOverlay = document.querySelector('.avatar-overlay');
    
    if (!avatarModal || !avatarInput || !avatarPreview || !avatarForm || !modalClose || !avatarOverlay) return;
    
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

// Login history modal functions
function initLoginHistoryModal() {
    const loginHistoryModal = document.getElementById('loginHistoryModal');
    const modalClose = document.querySelector('#loginHistoryModal .close');
    const viewHistoryBtn = document.getElementById('viewLoginHistory');
    
    if (!loginHistoryModal || !modalClose || !viewHistoryBtn) return;
    
    // Open modal when clicking the view history button
    viewHistoryBtn.addEventListener('click', async () => {
        loginHistoryModal.style.display = 'block';
        await loadLoginHistory();
    });
    
    // Close modal when clicking the X
    modalClose.addEventListener('click', () => {
        loginHistoryModal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === loginHistoryModal) {
            loginHistoryModal.style.display = 'none';
        }
    });
}

// Load login history
async function loadLoginHistory() {
    try {
        const loginHistoryTable = document.getElementById('loginHistoryTable');
        if (!loginHistoryTable) return;
        
        // Show loading state
        loginHistoryTable.innerHTML = '<tr><td colspan="4">Loading login history...</td></tr>';
        
        // Get login history from Supabase
        const { data, error } = await supabaseClient
            .from('login_history')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) {
            throw error;
        }
        
        if (!data || data.length === 0) {
            loginHistoryTable.innerHTML = '<tr><td colspan="4">No login history found</td></tr>';
            return;
        }
        
        // Build table rows
        let html = '';
        data.forEach(entry => {
            const date = new Date(entry.created_at).toLocaleString();
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${entry.device_info || 'Unknown'}</td>
                    <td>${entry.ip_address || 'N/A'}</td>
                    <td>${entry.location || 'Unknown'}</td>
                </tr>
            `;
        });
        
        loginHistoryTable.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading login history:', error);
        const loginHistoryTable = document.getElementById('loginHistoryTable');
        if (loginHistoryTable) {
            loginHistoryTable.innerHTML = '<tr><td colspan="4">Error loading login history</td></tr>';
        }
    }
}

// Initialize two-factor authentication toggle
function init2FAToggle() {
    const twoFactorToggle = document.getElementById('twoFactorAuth');
    if (!twoFactorToggle) return;
    
    twoFactorToggle.addEventListener('change', async () => {
        const isEnabled = twoFactorToggle.checked;
        
        if (isEnabled) {
            // Show setup message
            alert('Two-factor authentication setup would be shown here. This feature is currently under development.');
            
            // For now, just update the database
            await updateUserSettings({ two_factor_enabled: isEnabled });
        } else {
            // Confirm disabling 2FA
            const confirmed = confirm('Are you sure you want to disable two-factor authentication? This will reduce your account security.');
            
            if (confirmed) {
                await updateUserSettings({ two_factor_enabled: false });
            } else {
                // Revert toggle if canceled
                twoFactorToggle.checked = true;
            }
        }
    });
}

// Initialize privacy settings
function initPrivacySettings() {
    const savePrivacyBtn = document.getElementById('savePrivacySettings');
    if (!savePrivacyBtn) return;
    
    savePrivacyBtn.addEventListener('click', async () => {
        const profileVisibility = document.getElementById('profileVisibility').value;
        const notesVisibility = document.getElementById('notesVisibility').value;
        
        try {
            // Show loading state
            savePrivacyBtn.textContent = 'Saving...';
            savePrivacyBtn.disabled = true;
            
            // Update settings in database
            await updateUserSettings({
                profile_visibility: profileVisibility,
                notes_visibility: notesVisibility
            });
            
            // Show success message
            alert('Privacy settings saved successfully');
            
            // Reset button state
            savePrivacyBtn.textContent = 'Save Privacy Settings';
            savePrivacyBtn.disabled = false;
            
        } catch (error) {
            console.error('Error saving privacy settings:', error);
            alert('Error saving privacy settings: ' + error.message);
            
            // Reset button state
            savePrivacyBtn.textContent = 'Save Privacy Settings';
            savePrivacyBtn.disabled = false;
        }
    });
}

// Update user settings in Supabase
async function updateUserSettings(settings) {
    try {
        const { error } = await supabaseClient
            .from('user_settings')
            .upsert({
                user_id: currentUser.id,
                ...settings,
                updated_at: new Date().toISOString()
            });
        
        if (error) {
            throw error;
        }
        
    } catch (error) {
        console.error('Error updating user settings:', error);
        throw error;
    }
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
    
    if (calculatePasswordStrength(newPassword) < 50) {
        const confirmed = confirm('Your password is not very strong. Are you sure you want to use it?');
        if (!confirmed) return;
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
        
        // Reset password strength meter
        const strengthLevel = document.getElementById('strengthLevel');
        const strengthText = document.getElementById('strengthText');
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

// Handle notification settings
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
                    platform_updates: updates,
                    updated_at: new Date().toISOString()
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

// Handle connected accounts
const connectGoogleBtn = document.getElementById('connectGoogle');
const connectMicrosoftBtn = document.getElementById('connectMicrosoft');

if (connectGoogleBtn) {
    connectGoogleBtn.addEventListener('click', async () => {
        const isConnected = connectGoogleBtn.textContent === 'Disconnect';
        
        try {
            if (isConnected) {
                // Disconnect Google account
                await updateUserSettings({ google_connected: false });
                updateConnectionStatus('googleConnectionStatus', false);
                connectGoogleBtn.textContent = 'Connect';
                alert('Google account disconnected');
            } else {
                // This would normally trigger OAuth, but we'll simulate it
                alert('This would connect your Google account via OAuth. Feature coming soon!');
                await updateUserSettings({ google_connected: true });
                updateConnectionStatus('googleConnectionStatus', true);
                connectGoogleBtn.textContent = 'Disconnect';
            }
        } catch (error) {
            console.error('Error with Google connection:', error);
            alert('Error: ' + error.message);
        }
    });
}

if (connectMicrosoftBtn) {
    connectMicrosoftBtn.addEventListener('click', async () => {
        const isConnected = connectMicrosoftBtn.textContent === 'Disconnect';
        
        try {
            if (isConnected) {
                // Disconnect Microsoft account
                await updateUserSettings({ microsoft_connected: false });
                updateConnectionStatus('microsoftConnectionStatus', false);
                connectMicrosoftBtn.textContent = 'Connect';
                alert('Microsoft account disconnected');
            } else {
                // This would normally trigger OAuth, but we'll simulate it
                alert('This would connect your Microsoft account via OAuth. Feature coming soon!');
                await updateUserSettings({ microsoft_connected: true });
                updateConnectionStatus('microsoftConnectionStatus', true);
                connectMicrosoftBtn.textContent = 'Disconnect';
            }
        } catch (error) {
            console.error('Error with Microsoft connection:', error);
            alert('Error: ' + error.message);
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
        // Delete user's data from various tables
        
        // Delete from notification_settings
        await supabaseClient
            .from('notification_settings')
            .delete()
            .eq('user_id', currentUser.id);
            
        // Delete from user_settings
        await supabaseClient
            .from('user_settings')
            .delete()
            .eq('user_id', currentUser.id);
            
        // Delete from login_history
        await supabaseClient
            .from('login_history')
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
        
        // Delete notes if they exist
        try {
            await supabaseClient
                .from('notes')
                .delete()
                .eq('user_id', currentUser.id);
        } catch (notesError) {
            console.error('Error deleting notes:', notesError);
        }
        
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
            // If admin API fails, sign out user and advise them to contact support
            await supabaseClient.auth.signOut();
            alert('We could not completely delete your account due to a system limitation. Please contact support to complete account deletion. You have been signed out.');
            window.location.href = 'index.html';
            return;
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

// Update copyright year
function updateCopyrightYear() {
    const copyrightElement = document.getElementById('copyrightYear');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `© ${currentYear} NotesBuddy. All Rights Reserved.`;
    }
}

// Navbar menu toggle functions
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
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            const { error } = await supabaseClient.auth.signOut();
            
            if (error) {
                throw error;
            }
            
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out: ' + error.message);
        }
    });
}