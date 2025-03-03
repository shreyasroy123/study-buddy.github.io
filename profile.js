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

// Profile page initialization with Supabase integration
(function() {
    // Supabase configuration - these should match your app.js values
    const SUPABASE_URL = 'https://your-supabase-project-url.supabase.co';
    const SUPABASE_KEY = 'your-supabase-anon-key';
    
    // Initialize Supabase client
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
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
    
    // Initialize the page
    document.addEventListener('DOMContentLoaded', initializePage);

    async function initializePage() {
        try {
            // Check authentication status
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error || !user) {
                showAuthButtons();
                redirectToLogin();
                return;
            }
            
            // User is authenticated - get full profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (profileError) {
                console.error('Error fetching profile:', profileError);
            }

            // Combine auth user with profile data
            const userData = {
                id: user.id,
                email: user.email,
                name: profile?.name || user.email.split('@')[0],
                createdAt: user.created_at,
                avatarUrl: profile?.avatar_url,
                phone: profile?.phone,
                school: profile?.school,
                grade: profile?.grade,
                bio: profile?.bio,
                notifications: profile?.notifications || {
                    studyReminders: true,
                    newFeatures: true,
                    comments: false,
                    updates: true
                },
                privacy: profile?.privacy || {
                    profileVisibility: 'public',
                    notesVisibility: 'friends'
                }
            };
            
            // Update UI with user data
            showUserProfile(userData);
            
            // Initialize page-specific functionality
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage === 'profile.html' || currentPage === '') {
                initializeProfilePage(userData);
            } else if (currentPage === 'account-settings.html') {
                initializeAccountSettings(userData);
            }
            
            // Set up logout button
            setupLogoutButton();
            
        } catch (error) {
            console.error('Authentication error:', error);
            showAuthButtons();
            redirectToLogin();
        }
    }
    
    function showAuthButtons() {
        if (userProfile) userProfile.style.display = 'none';
        if (authButtons) authButtons.style.display = 'flex';
    }
    
    function showUserProfile(userData) {
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        
        // Update username in navbar
        if (userName) {
            userName.textContent = userData.name || userData.email.split('@')[0];
        }
        
        // Update navbar profile picture
        updateProfilePic(profilePic, userData);
    }
    
    function redirectToLogin() {
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
    
    // Update profile picture element with user data
    function updateProfilePic(element, userData) {
        if (!element) return;
        
        if (userData.avatarUrl) {
            // If user has an avatar URL, convert to image
            if (element.tagName !== 'IMG') {
                const parentElement = element.parentElement;
                const newImg = document.createElement('img');
                newImg.id = element.id;
                newImg.src = userData.avatarUrl;
                newImg.alt = 'User';
                newImg.style.width = element.style.width;
                newImg.style.height = element.style.height;
                newImg.style.borderRadius = '50%';
                newImg.style.marginRight = '10px';
                newImg.style.objectFit = 'cover';
                
                if (parentElement) {
                    parentElement.replaceChild(newImg, element);
                }
                
                // Add error handler in case image fails to load
                newImg.onerror = () => {
                    setTextAvatar(newImg, userData);
                };
            } else {
                // Already an img element
                element.src = userData.avatarUrl;
                element.onerror = () => {
                    setTextAvatar(element, userData);
                };
            }
        } else {
            // No avatar URL, use text avatar
            setTextAvatar(element, userData);
        }
    }
    
    // Set a text-based avatar with user's initial
    function setTextAvatar(element, userData) {
        const initial = (userData.name || userData.email)[0].toUpperCase();
        
        if (element.tagName === 'IMG') {
            // Convert img to div
            const parentElement = element.parentElement;
            const newDiv = document.createElement('div');
            newDiv.id = element.id;
            newDiv.style.width = element.style.width || '35px';
            newDiv.style.height = element.style.height || '35px';
            newDiv.style.borderRadius = '50%';
            newDiv.style.backgroundColor = getColorForLetter(initial);
            newDiv.style.color = 'white';
            newDiv.style.display = 'flex';
            newDiv.style.alignItems = 'center';
            newDiv.style.justifyContent = 'center';
            newDiv.style.marginRight = '10px';
            newDiv.style.fontWeight = 'bold';
            newDiv.textContent = initial;
            
            if (parentElement) {
                parentElement.replaceChild(newDiv, element);
            }
        } else {
            // Just update the div
            element.style.backgroundColor = getColorForLetter(initial);
            element.textContent = initial;
        }
    }
    
    // Get color based on letter
    function getColorForLetter(letter) {
        const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#9C27B0', '#3F51B5', '#FF5722'];
        const index = letter.charCodeAt(0) % colors.length;
        return colors[index];
    }

    // Initialize profile page
    function initializeProfilePage(userData) {
        if (profileName) {
            profileName.textContent = userData.name || userData.email.split('@')[0];
        }
        
        if (memberSince) {
            const createdAt = new Date(userData.createdAt);
            const formattedDate = createdAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            memberSince.textContent = `Member since: ${formattedDate}`;
        }
        
        if (largeProfilePic) {
            // Update large profile picture
            updateProfilePic(largeProfilePic, userData);
        }
        
        // Populate form if it exists
        populateProfileForm(userData);
        
        // Initialize avatar modal
        initAvatarModal(userData);
    }
    
    // Populate profile form with user data
    function populateProfileForm(userData) {
        const editFullName = document.getElementById('editFullName');
        const editEmail = document.getElementById('editEmail');
        const editPhone = document.getElementById('editPhone');
        const editSchool = document.getElementById('editSchool');
        const editGrade = document.getElementById('editGrade');
        const editBio = document.getElementById('editBio');
        const profileForm = document.getElementById('profileForm');
        
        if (!profileForm) return;
        
        if (editFullName) editFullName.value = userData.name || '';
        if (editEmail) editEmail.value = userData.email || '';
        if (editPhone) editPhone.value = userData.phone || '';
        if (editSchool) editSchool.value = userData.school || '';
        if (editGrade) editGrade.value = userData.grade || '';
        if (editBio) editBio.value = userData.bio || '';
        
        // Add form submission handler
        profileForm.addEventListener('submit', (e) => {
            handleProfileFormSubmit(e, userData);
        });
    }
    
    // Handle profile form submission
    async function handleProfileFormSubmit(e, userData) {
        e.preventDefault();
        
        const editFullName = document.getElementById('editFullName');
        const editPhone = document.getElementById('editPhone');
        const editSchool = document.getElementById('editSchool');
        const editGrade = document.getElementById('editGrade');
        const editBio = document.getElementById('editBio');
        
        // Get form data
        const updates = {
            id: userData.id,
            name: editFullName ? editFullName.value : userData.name,
            phone: editPhone ? editPhone.value : userData.phone,
            school: editSchool ? editSchool.value : userData.school,
            grade: editGrade ? editGrade.value : userData.grade,
            bio: editBio ? editBio.value : userData.bio,
            updated_at: new Date().toISOString()
        };
        
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;
        }
        
        try {
            // Update the profile in Supabase
            const { error } = await supabase
                .from('profiles')
                .upsert(updates);
            
            if (error) throw error;
            
            // Update local userData
            Object.assign(userData, updates);
            
            // Update UI
            if (profileName) {
                profileName.textContent = userData.name || userData.email.split('@')[0];
            }
            if (userName) {
                userName.textContent = userData.name || userData.email.split('@')[0];
            }
            
            // Show success message
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.textContent = 'Save Changes';
                submitBtn.disabled = false;
            }
        }
    }
    
    // Initialize avatar modal
    function initAvatarModal(userData) {
        const avatarOverlay = document.querySelector('.avatar-overlay');
        const avatarModal = document.getElementById('avatarModal');
        
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
            if (userData.avatarUrl) {
                avatarPreview.src = userData.avatarUrl;
                avatarPreview.onerror = () => {
                    createAvatarPreview(userData, avatarPreview);
                };
            } else {
                createAvatarPreview(userData, avatarPreview);
            }
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
            
            // Show loading state
            const submitBtn = avatarForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Uploading...';
            submitBtn.disabled = true;
            
            try {
                // Upload the image to Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${userData.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `avatars/${fileName}`;
                
                // Upload to storage
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file);
                
                if (uploadError) throw uploadError;
                
                // Get the public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                
                // Update profile with new avatar URL
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: publicUrl })
                    .eq('id', userData.id);
                
                if (updateError) throw updateError;
                
                // Update local userData
                userData.avatarUrl = publicUrl;
                
                // Update UI
                updateProfilePic(profilePic, userData);
                updateProfilePic(largeProfilePic, userData);
                
                // Close modal and show success
                avatarModal.style.display = 'none';
                alert('Profile picture updated successfully!');
                
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert('Error uploading image. Please try again.');
            } finally {
                // Reset form and button
                avatarForm.reset();
                submitBtn.textContent = 'Upload';
                submitBtn.disabled = false;
            }
        });
    }
    
    // Create avatar preview with initial
    function createAvatarPreview(userData, previewElement) {
        const initial = (userData.name || userData.email)[0].toUpperCase();
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = getColorForLetter(initial);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
               // Draw initial
               ctx.font = 'bold 100px Arial';
               ctx.fillStyle = '#FFFFFF';
               ctx.textAlign = 'center';
               ctx.textBaseline = 'middle';
               ctx.fillText(initial, canvas.width / 2, canvas.height / 2);
               
               // Set as preview
               previewElement.src = canvas.toDataURL('image/png');
           }
           
           // Initialize account settings
           async function initializeAccountSettings(userData) {
               // Initialize password form
               initPasswordForm();
               
               // Initialize notification settings
               initNotificationSettings(userData);
               
               // Initialize privacy settings
               initPrivacySettings(userData);
               
               // Initialize danger zone (delete account)
               initDeleteAccount();
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
                   
                   // Show loading state
                   const submitBtn = passwordForm.querySelector('button[type="submit"]');
                   submitBtn.textContent = 'Updating...';
                   submitBtn.disabled = true;
                   
                   try {
                       // Change password via Supabase
                       const { error } = await supabase.auth.updateUser({
                           password: newPassword
                       });
                       
                       if (error) throw error;
                       
                       // Show success message
                       alert('Password updated successfully');
                       
                       // Reset form
                       passwordForm.reset();
                       
                       // Reset strength meter
                       if (strengthLevel) strengthLevel.style.width = '0';
                       if (strengthText) strengthText.textContent = 'Password strength';
                       
                   } catch (error) {
                       console.error('Error updating password:', error);
                       alert('Error updating password. Please check your current password and try again.');
                   } finally {
                       // Reset button state
                       submitBtn.textContent = 'Update Password';
                       submitBtn.disabled = false;
                   }
               });
           }
           
           // Initialize notification settings
           function initNotificationSettings(userData) {
               const saveNotificationBtn = document.getElementById('saveNotificationSettings');
               if (!saveNotificationBtn) return;
               
               // Set initial checkbox states
               if (userData.notifications) {
                   const studyReminders = document.getElementById('notifyStudyReminders');
                   const newFeatures = document.getElementById('notifyNewFeatures');
                   const comments = document.getElementById('notifyComments');
                   const updates = document.getElementById('notifyUpdates');
                   
                   if (studyReminders) studyReminders.checked = userData.notifications.studyReminders;
                   if (newFeatures) newFeatures.checked = userData.notifications.newFeatures;
                   if (comments) comments.checked = userData.notifications.comments;
                   if (updates) updates.checked = userData.notifications.updates;
               }
               
               // Handle save button
               saveNotificationBtn.addEventListener('click', async () => {
                   const studyReminders = document.getElementById('notifyStudyReminders').checked;
                   const newFeatures = document.getElementById('notifyNewFeatures').checked;
                   const comments = document.getElementById('notifyComments').checked;
                   const updates = document.getElementById('notifyUpdates').checked;
                   
                   // Show loading state
                   saveNotificationBtn.textContent = 'Saving...';
                   saveNotificationBtn.disabled = true;
                   
                   try {
                       // Update notifications in Supabase
                       const { error } = await supabase
                           .from('profiles')
                           .update({
                               notifications: {
                                   studyReminders,
                                   newFeatures,
                                   comments,
                                   updates
                               }
                           })
                           .eq('id', userData.id);
                       
                       if (error) throw error;
                       
                       // Update local userData
                       userData.notifications = {
                           studyReminders,
                           newFeatures,
                           comments,
                           updates
                       };
                       
                       // Show success message
                       alert('Notification settings saved');
                       
                   } catch (error) {
                       console.error('Error updating notifications:', error);
                       alert('Error saving notification settings. Please try again.');
                   } finally {
                       // Reset button state
                       saveNotificationBtn.textContent = 'Save Notification Settings';
                       saveNotificationBtn.disabled = false;
                   }
               });
           }
           
           // Initialize privacy settings
           function initPrivacySettings(userData) {
               const savePrivacyBtn = document.getElementById('savePrivacySettings');
               if (!savePrivacyBtn) return;
               
               // Set initial values
               if (userData.privacy) {
                   const profileVisibility = document.getElementById('profileVisibility');
                   const notesVisibility = document.getElementById('notesVisibility');
                   
                   if (profileVisibility) profileVisibility.value = userData.privacy.profileVisibility || 'public';
                   if (notesVisibility) notesVisibility.value = userData.privacy.notesVisibility || 'public';
               }
               
               // Handle save button
               savePrivacyBtn.addEventListener('click', async () => {
                   const profileVisibility = document.getElementById('profileVisibility').value;
                   const notesVisibility = document.getElementById('notesVisibility').value;
                   
                   // Show loading state
                   savePrivacyBtn.textContent = 'Saving...';
                   savePrivacyBtn.disabled = true;
                   
                   try {
                       // Update privacy settings in Supabase
                       const { error } = await supabase
                           .from('profiles')
                           .update({
                               privacy: {
                                   profileVisibility,
                                   notesVisibility
                               }
                           })
                           .eq('id', userData.id);
                       
                       if (error) throw error;
                       
                       // Update local userData
                       userData.privacy = {
                           profileVisibility,
                           notesVisibility
                       };
                       
                       // Show success message
                       alert('Privacy settings saved');
                       
                   } catch (error) {
                       console.error('Error updating privacy settings:', error);
                       alert('Error saving privacy settings. Please try again.');
                   } finally {
                       // Reset button state
                       savePrivacyBtn.textContent = 'Save Privacy Settings';
                       savePrivacyBtn.disabled = false;
                   }
               });
           }
           
           // Initialize delete account
           function initDeleteAccount() {
               const deleteAccountBtn = document.getElementById('deleteAccount');
               if (!deleteAccountBtn) return;
               
               deleteAccountBtn.addEventListener('click', async () => {
                   // Show confirmation dialog
                   const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
                   
                   if (!confirmed) return;
                   
                   try {
                       // Delete user account via Supabase Auth
                       const { error } = await supabase.auth.admin.deleteUser(
                           (await supabase.auth.getUser()).data.user.id
                       );
                       
                       if (error) throw error;
                       
                       alert('Your account has been deleted. You are now signed out.');
                       window.location.href = 'index.html';
                       
                   } catch (error) {
                       console.error('Error deleting account:', error);
                       
                       if (error.message.includes('Unauthorized') || error.message.includes('Permission denied')) {
                           // If admin deletion fails, sign out user instead
                           await supabase.auth.signOut();
                           alert('You have been logged out. Please contact support to delete your account.');
                           window.location.href = 'index.html';
                       } else {
                           alert('Error deleting account. Please try again or contact support.');
                       }
                   }
               });
           }
           
           // Set up logout button
           function setupLogoutButton() {
               if (!logoutBtn) return;
               
               logoutBtn.addEventListener('click', async (e) => {
                   e.preventDefault();
                   
                   try {
                       // Sign out via Supabase
                       const { error } = await supabase.auth.signOut();
                       
                       if (error) throw error;
                       
                       // Redirect to home page
                       window.location.href = 'index.html';
                       
                   } catch (error) {
                       console.error('Error signing out:', error);
                       alert('Error signing out. Please try again.');
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
           
           // Mobile menu functions
           window.showMenu = function() {
               const navLinks = document.getElementById('navLinks');
               if (navLinks) navLinks.style.right = '0';
           };
           
           window.hideMenu = function() {
               const navLinks = document.getElementById('navLinks');
               if (navLinks) navLinks.style.right = '-200px';
           };
       })();