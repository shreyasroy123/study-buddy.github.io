// 1. INITIALIZE SUPABASE FIRST
const supabaseUrl = 'https://wyyiifksxojppfqhpvgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eWlpZmtzeG9qcHBmcWhwdmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NTM2MzAsImV4cCI6MjA1NjIyOTYzMH0.fBljtE2zY64il7GIOoIqAmupfxXwPFjQRV42x7aZrWw';
// Fix for initialization error - use the global object
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. FUNCTION DECLARATIONS
async function checkAuth() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const authLink = document.getElementById('auth-link');
    const profileSection = document.getElementById('profile-section');

    if (user) {
      const { data: profile } = await supabase.from('profiles')
        .select('username, profile_picture_url')
        .eq('user_id', user.id)
        .single();

      authLink.style.display = 'none';
      profileSection.style.display = 'flex';
      
      if (profile) {
        document.getElementById('username').textContent = profile.username || 'User';
        document.getElementById('profile-pic').src = profile.profile_picture_url || 'default-avatar.jpeg';
      }
    } else {
      authLink.style.display = 'block';
      profileSection.style.display = 'none';
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
}

// Add a simple delay function to handle rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Track last signup attempt time to prevent rate limiting
let lastSignupAttempt = 0;

async function signUp() {
  try {
    // Check if we need to wait due to rate limiting
    const now = Date.now();
    if (now - lastSignupAttempt < 60000) { // 60 seconds in milliseconds
      const waitTime = Math.ceil((60000 - (now - lastSignupAttempt)) / 1000);
      alert(`Please wait ${waitTime} seconds before trying again (rate limit).`);
      return;
    }
    
    lastSignupAttempt = now;
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const username = document.getElementById('signup-username').value;
    const phone = document.getElementById('signup-phone').value;
    const profilePic = document.getElementById('signup-profile-pic').files[0];

    // Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error('User creation failed. Please try again later.');
    }

    // Wait a moment for the auth to complete before continuing
    await delay(1000);

    // Create profile first (before uploading profile picture)
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      username,
      phone_number: phone,
      profile_picture_url: '' // Initially empty, will update after upload
    });

    if (profileError) throw profileError;

    // Upload profile picture if provided
    let profilePicUrl = '';
    if (profilePic) {
      try {
        // Create a more reliable file name to avoid special characters
        const fileName = `${Date.now()}_${profilePic.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `profiles/${authData.user.id}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, profilePic, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);
          
        profilePicUrl = publicUrl;
        
        // Update the profile with the picture URL
        if (profilePicUrl) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ profile_picture_url: profilePicUrl })
            .eq('user_id', authData.user.id);
            
          if (updateError) console.error('Profile picture update error:', updateError);
        }
      } catch (uploadError) {
        console.error('Profile picture upload failed:', uploadError);
        // Continue with signup even if picture upload fails
      }
    }

    alert('Signup successful! Please check your email for verification.');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Signup Error:', error);
    alert(`Signup failed: ${error.message}`);
  }
}

async function login() {
  try {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert('Login Error: ' + error.message);
      return;
    }
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Login error:', error);
    alert(`Login failed: ${error.message}`);
  }
}

async function logout() {
  try {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error during logout. Please try again.');
  }
}

async function loadSchools() {
  try {
    const { data: schools, error } = await supabase.from('schools').select('*');
    
    if (error) throw error;
    
    const schoolList = document.getElementById('school-list');
    if (!schools || schools.length === 0) {
      schoolList.innerHTML = '<p>No schools found</p>';
      return;
    }

    schoolList.innerHTML = schools.map(school => `
      <div class="school-item" onclick="window.location='class.html?schoolId=${school.id}'">
        ${school.name}
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading schools:', error);
  }
}

async function loadClasses() {
  try {
    const schoolId = new URLSearchParams(location.search).get('schoolId');
    if (!schoolId) {
      document.getElementById('class-list').innerHTML = '<p>Invalid school ID</p>';
      return;
    }
    
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);
      
    if (error) throw error;

    const classList = document.getElementById('class-list');
    if (!classes || classes.length === 0) {
      classList.innerHTML = '<p>No classes found</p>';
      return;
    }

    classList.innerHTML = classes.map(cls => `
      <div class="list-item" onclick="window.location='subject.html?classId=${cls.id}'">
        <div class="item-name">${cls.name}</div>
        <div class="item-meta">Subjects: Loading...</div>
      </div>
    `).join('');

    // Add subject counts
    classes.forEach(async cls => {
      try {
        const { count, error } = await supabase
          .from('subjects')
          .select('*', { count: 'exact' })
          .eq('class_id', cls.id);
          
        if (error) throw error;

        const element = document.querySelector(`[onclick*='classId=${cls.id}'] .item-meta`);
        if (element) {
          element.textContent = `Subjects: ${count || 0}`;
        }
      } catch (err) {
        console.error(`Error loading subjects count for class ${cls.id}:`, err);
      }
    });
  } catch (error) {
    console.error('Error loading classes:', error);
  }
}

async function loadSubjects() {
  try {
    const classId = new URLSearchParams(location.search).get('classId');
    if (!classId) {
      document.getElementById('subject-list').innerHTML = '<p>Invalid class ID</p>';
      return;
    }
    
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('class_id', classId);
      
    if (error) throw error;

    const subjectList = document.getElementById('subject-list');
    if (!subjects || subjects.length === 0) {
      subjectList.innerHTML = '<p>No subjects found</p>';
      return;
    }

    subjectList.innerHTML = subjects.map(subject => `
      <div class="subject-item" onclick="window.location='comments.html?subjectId=${subject.id}'">
        ${subject.name}
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading subjects:', error);
  }
}

async function searchSchools() {
  try {
    const searchTerm = document.getElementById('school-search').value;
    if (!searchTerm) {
      loadSchools();
      return;
    }
    
    const { data: schools, error } = await supabase
      .from('schools')
      .select('*')
      .ilike('name', `%${searchTerm}%`);
      
    if (error) throw error;

    const schoolList = document.getElementById('school-list');
    if (!schools || schools.length === 0) {
      schoolList.innerHTML = '<p>No schools matched your search</p>';
      return;
    }

    schoolList.innerHTML = schools.map(school => `
      <div class="school-item" onclick="window.location='class.html?schoolId=${school.id}'">
        ${school.name}
      </div>
    `).join('');
  } catch (error) {
    console.error('Error searching schools:', error);
  }
}

async function loadComments() {
  try {
    const subjectId = new URLSearchParams(location.search).get('subjectId');
    if (!subjectId) return;
    
    // First get subject name
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('name')
      .eq('id', subjectId)
      .single();
      
    if (subjectError) throw subjectError;
      
    if (subject) {
      document.getElementById('subject-name').textContent = subject.name + ' Discussion';
    }
    
    // Then get comments
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*, profiles(username, profile_picture_url)')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true });
      
    if (commentsError) throw commentsError;
      
    const commentsContainer = document.getElementById('comments-container');
    
    if (comments && comments.length > 0) {
      commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment">
          <div class="comment-header">
            <img src="${comment.profiles?.profile_picture_url || 'default-avatar.jpeg'}" class="comment-avatar">
            <div class="comment-user">${comment.profiles?.username || 'Anonymous'}</div>
            <div class="comment-time">${new Date(comment.created_at).toLocaleString()}</div>
          </div>
          <div class="comment-content">${comment.content}</div>
          ${comment.attachment_url ? `<div class="comment-attachment"><a href="${comment.attachment_url}" target="_blank">Attachment</a></div>` : ''}
        </div>
      `).join('');
    } else {
      commentsContainer.innerHTML = '<p>No comments yet. Be the first to post!</p>';
    }
  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

async function postMessage() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      alert('You must be logged in to post comments');
      window.location.href = 'accounts.html';
      return;
    }
    
    const content = document.getElementById('comment-input').value;
    const file = document.getElementById('file-input').files[0];
    const subjectId = new URLSearchParams(location.search).get('subjectId');
    
    if (!content && !file) {
      alert('Please enter a message or attach a file');
      return;
    }
    
    let attachmentUrl = '';
    
    if (file) {
      try {
        // Create a more reliable file name
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `comments/${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('comment-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('comment-attachments')
          .getPublicUrl(filePath);
          
        attachmentUrl = publicUrl;
      } catch (uploadError) {
        console.error('File upload failed:', uploadError);
        alert('File upload failed. Your comment will be posted without the attachment.');
      }
    }
    
    const { error: commentError } = await supabase.from('comments').insert({
      user_id: user.id,
      subject_id: subjectId,
      content,
      attachment_url: attachmentUrl
    });
    
    if (commentError) throw commentError;
    
    document.getElementById('comment-input').value = '';
    document.getElementById('file-input').value = '';
    loadComments(); // Reload comments
    
  } catch (error) {
    console.error('Comment Error:', error);
    alert(`Failed to post comment: ${error.message}`);
  }
}

function toggleAuthForm(formType) {
  const signupFormContainer = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  
  if (formType === 'login') {
    signupFormContainer.style.display = 'none';
    loginForm.style.display = 'block';
  } else {
    signupFormContainer.style.display = 'block';
    loginForm.style.display = 'none';
  }
}