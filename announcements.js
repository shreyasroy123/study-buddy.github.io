// Announcements page functionality

// Initialize announcement modal
function initAnnouncementModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('announcement-modal')) {
        const modal = document.createElement('div');
        modal.id = 'announcement-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Create Announcement</h2>
                <form id="announcement-form">
                    <div class="form-group">
                        <label for="announcement-title">Title</label>
                        <input type="text" id="announcement-title" placeholder="Enter announcement title" required>
                    </div>
                    <div class="form-group">
                        <label for="announcement-school">School</label>
                        <select id="announcement-school" required>
                            <option value="">Select a school</option>
                            <!-- Schools will be loaded from Supabase -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="announcement-category">Category</label>
                        <select id="announcement-category" required>
                            <option value="">Select a category</option>
                            <option value="academic">Academic</option>
                            <option value="administrative">Administrative</option>
                            <option value="event">Events</option>
                            <option value="deadline">Deadlines</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="announcement-content">Announcement Details</label>
                        <textarea id="announcement-content" rows="6" placeholder="Enter the announcement details..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="announcement-attachment">Attachment (Optional)</label>
                        <input type="file" id="announcement-attachment">
                    </div>
                    <button type="submit" class="btn btn-primary">Publish Announcement</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Populate schools dropdown
        loadSchoolsInDropdown('announcement-school');

        // Form submission
        const announcementForm = document.getElementById('announcement-form');
        announcementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Check if user is logged in with admin privileges
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    alert('Please log in to create an announcement');
                    window.location.href = 'login.html';
                    return;
                }

                // Check if user has admin privileges
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();
                    
                if (userError) throw userError;
                
                if (!userData.is_admin) {
                    alert('You do not have permission to create announcements');
                    return;
                }

                // Get form values
                const title = document.getElementById('announcement-title').value;
                const schoolId = document.getElementById('announcement-school').value;
                const category = document.getElementById('announcement-category').value;
                const content = document.getElementById('announcement-content').value;
                const attachmentFile = document.getElementById('announcement-attachment').files[0];

                // Upload attachment if present
                let attachmentUrl = null;
                if (attachmentFile) {
                    const fileName = `${Date.now()}-${attachmentFile.name}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('announcement-attachments')
                        .upload(fileName, attachmentFile);
                        
                    if (uploadError) throw uploadError;
                    
                    attachmentUrl = `${SUPABASE_URL}/storage/v1/object/public/announcement-attachments/${fileName}`;
                }

                // Insert announcement into database
                const { data, error } = await supabase
                    .from('announcements')
                    .insert([
                        {
                            title,
                            school_id: schoolId,
                            category,
                            content,
                            attachment_url: attachmentUrl,
                            created_by: user.id,
                            created_at: new Date().toISOString()
                        }
                    ]);
                    
                if (error) throw error;
                
                alert('Announcement published successfully!');
                modal.style.display = 'none';
                
                // Refresh the announcements list
                loadAnnouncements();
                
            } catch (error) {
                alert('Error publishing announcement: ' + error.message);
            }
        });
    }
}

// Load schools in dropdown
async function loadSchoolsInDropdown(dropdownId) {
    try {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const { data, error } = await supabase
            .from('schools')
            .select('id, name')
            .order('name', { ascending: true });
            
        if (error) throw error;
        
        // Clear existing options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Add schools to the dropdown
        data.forEach(school => {
            const option = document.createElement('option');
            option.value = school.id;
            option.textContent = school.name;
            dropdown.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading schools for dropdown:', error);
    }
}

// Load announcements from Supabase
async function loadAnnouncements() {
    try {
        const announcementsList = document.getElementById('announcements-list');
        if (!announcementsList) return;
        
        announcementsList.innerHTML = '<div class="loading">Loading announcements...</div>';

        // Get filter values
        const schoolFilter = document.getElementById('school-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;

        // Construct query
        let query = supabase
            .from('announcements')
            .select(`
                *,
                schools:school_id (name),
                profiles:created_by (full_name, avatar_url)
            `);
            
        // Apply school filter if selected
        if (schoolFilter) {
            query = query.eq('school_id', schoolFilter);
        }
        
        // Apply category filter if selected
        if (categoryFilter) {
            query = query.eq('category', categoryFilter);
        }
        
        // Sort by creation date
        query = query.order('created_at', { ascending: false });

        // Execute query
        const { data, error } = await query;
            
        if (error) throw error;
        
        announcementsList.innerHTML = '';
        
        if (data.length === 0) {
            announcementsList.innerHTML = '<p>No announcements found</p>';
            return;
        }

        // Render announcements
        data.forEach(announcement => {
            const date = new Date(announcement.created_at).toLocaleDateString();
            
            const announcementCard = document.createElement('div');
            announcementCard.className = `announcement-card ${announcement.category}`;
            announcementCard.innerHTML = `
                <div class="announcement-header">
                    <div class="announcement-meta">
                        <span class="announcement-category">${announcement.category.toUpperCase()}</span>
                        <span class="announcement-date">${date}</span>
                    </div>
                    <h3>${announcement.title}</h3>
                    <p class="announcement-school">From: ${announcement.schools.name}</p>
                </div>
                <div class="announcement-body">
                    <p>${announcement.content}</p>
                    ${announcement.attachment_url ? 
                        `<div class="announcement-attachment">
                            <a href="${announcement.attachment_url}" target="_blank" class="btn">
                                <i class="fas fa-paperclip"></i> View Attachment
                            </a>
                        </div>` : ''
                    }
                </div>
                <div class="announcement-footer">
                    <div class="announcement-author">
                        <img src="${announcement.profiles.avatar_url || 'https://via.placeholder.com/30?text=User'}" alt="Author">
                        <span>Posted by: ${announcement.profiles.full_name}</span>
                    </div>
                </div>
            `;
            
            announcementsList.appendChild(announcementCard);
        });
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        const announcementsList = document.getElementById('announcements-list');
        if (announcementsList) {
            announcementsList.innerHTML = '<p>Error loading announcements. Please try again later.</p>';
        }
    }
}

// Check if user is admin
async function checkAdminStatus() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
            
        if (error) throw error;
        
        return data.is_admin === true;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Load schools into the filter dropdown
async function loadSchoolsFilter() {
    try {
        const dropdown = document.getElementById('school-filter');
        if (!dropdown) return;

        const { data, error } = await supabase
            .from('schools')
            .select('id, name')
            .order('name', { ascending: true });
            
        if (error) throw error;
        
        // Clear existing options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Add schools to the dropdown
        data.forEach(school => {
            const option = document.createElement('option');
            option.value = school.id;
            option.textContent = school.name;
            dropdown.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading schools for filter:', error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Update current date/time display
    const currentDateElement = document.querySelector('.current-date');
    if (currentDateElement) {
        currentDateElement.innerHTML = '<i class="far fa-calendar-alt"></i> Current Date: 2025-03-03 08:13:51 UTC';
    }
    
    // Check user authentication
    checkUserLoggedIn();
    
    // Set current user if logged in
    const userSection = document.getElementById('user-section');
    const authSection = document.getElementById('auth-section');
    
    if (userSection && authSection) {
        userSection.style.display = 'flex';
        authSection.style.display = 'none';
        
        // Set user name
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = 'Shreyas Roy';
        }
        
        // Placeholder avatar until real one is loaded
        const userAvatarElement = document.getElementById('user-avatar');
        if (userAvatarElement) {
            userAvatarElement.src = 'https://cdn4.vectorstock.com/i/1000x1000/52/68/account-icon-vector-48295268.jpg';
        }
    }
    
    // Check if user is admin
    const isAdmin = await checkAdminStatus();
    
    // Show admin panel if user is admin
    if (isAdmin) {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }
    }
    
    // Load schools for filter
    loadSchoolsFilter();
    
    // Load announcements
    loadAnnouncements();
    
    // Initialize filters
    const schoolFilter = document.getElementById('school-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    if (schoolFilter) {
        schoolFilter.addEventListener('change', loadAnnouncements);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadAnnouncements);
    }
    
    // Initialize create announcement button
    const createAnnouncementBtn = document.getElementById('create-announcement');
    if (createAnnouncementBtn) {
        createAnnouncementBtn.addEventListener('click', () => {
            initAnnouncementModal();
            document.getElementById('announcement-modal').style.display = 'block';
        });
    }
});