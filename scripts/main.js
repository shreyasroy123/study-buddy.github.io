// Supabase Initialization
const supabaseUrl = 'https://wyyiifksxojppfqhpvgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eWlpZmtzeG9qcHBmcWhwdmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NTM2MzAsImV4cCI6MjA1NjIyOTYzMH0.fBljtE2zY64il7GIOoIqAmupfxXwPFjQRV42x7aZrWw';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Auth Functions
async function signUp() {
  try {
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const username = document.getElementById('signup-username').value;
      const phone = document.getElementById('signup-phone').value;
      const profilePic = document.getElementById('signup-profile-pic').files[0];

      // Check if first user
      const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' });

      // Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
      });

      if (authError) throw authError;

      // Upload profile picture
      let profilePicUrl = '';
      if (profilePic) {
          const filePath = `profiles/${authData.user.id}/${profilePic.name}`;
          const { error: uploadError } = await supabase.storage
              .from('profile-pictures')
              .upload(filePath, profilePic);
          
          if (uploadError) throw uploadError;
          profilePicUrl = `${supabaseUrl}/storage/v1/object/public/profile-pictures/${filePath}`;
      }

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
          user_id: authData.user.id,
          username,
          phone_number: phone,
          profile_picture_url: profilePicUrl,
          is_creator: count === 0
      });

      if (profileError) throw profileError;

      alert('Signup successful! Please check your email for verification.');
      window.location.href = 'index.html';
      
  } catch (error) {
      console.error('Signup Error:', error);
      alert(`Signup failed: ${error.message}`);
  }
}

async function addClass() {
    if (!(await isCreator())) return alert('Only creator can add classes');
    const schoolId = new URLSearchParams(location.search).get('schoolId');
    const { error } = await supabase.from('classes').insert([{
        name: document.getElementById('class-name').value,
        school_id: schoolId
    }]);
    if (error) return alert(error.message);
    loadClasses();
}

async function addSubject() {
    if (!(await isCreator())) return alert('Only creator can add subjects');
    const classId = new URLSearchParams(location.search).get('classId');
    const { error } = await supabase.from('subjects').insert([{
        name: document.getElementById('subject-name').value,
        class_id: classId
    }]);
    if (error) return alert(error.message);
    loadSubjects();
}

// UI Functions
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    const authLink = document.getElementById('auth-link');
    const profileSection = document.getElementById('profile-section');
    
    if (user) {
        const { data: profile } = await supabase.from('profiles')
            .select('username, profile_picture_url')
            .eq('user_id', user.id).single();
            
        authLink.style.display = 'none';
        profileSection.style.display = 'flex';
        document.getElementById('profile-pic').src = profile.profile_picture_url;
        document.getElementById('username').textContent = profile.username;
        
        if (await isCreator()) {
            document.querySelectorAll('.creator-only').forEach(el => el.style.display = 'block');
        }
    } else {
        authLink.style.display = 'block';
        profileSection.style.display = 'none';
    }
}

// File Upload
async function uploadFile(file) {
    const { data, error } = await supabase.storage
        .from('notes')
        .upload(`files/${Date.now()}_${file.name}`, file);
    if (error) throw error;
    return data.Key;
}
// Fetch classes for a school
async function loadClasses() {
    const schoolId = new URLSearchParams(location.search).get('schoolId');
    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId);
  
    // Display classes...
  }
  
  // Fetch subjects for a class
  async function loadSubjects() {
    const classId = new URLSearchParams(location.search).get('classId');
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .eq('class_id', classId);
  
    // Display subjects...
  }
  
  // Post message with file
  async function postMessage() {
    const file = document.getElementById('note-file').files[0];
    let fileUrl = '';
  
    if (file) {
      const { data: uploadData } = await supabase.storage
        .from('notes')
        .upload(`files/${Date.now()}_${file.name}`, file);
      fileUrl = uploadData.Key;
    }
  
    await supabase.from('messages').insert([{
      subject_id: currentSubjectId,
      content: document.getElementById('message-input').value,
      file_url: fileUrl,
      user_id: (await supabase.auth.getUser()).data.user.id
    }]);
  }
  // In main.js
async function loadSchools() {
    const { data: schools, error } = await supabase.from('schools').select('*');
    const schoolList = document.getElementById('school-list');
    
    schoolList.innerHTML = schools.map(school => `
      <div class="school-item" onclick="window.location='class.html?schoolId=${school.id}'">
        ${school.name}
      </div>
    `).join('');
  }
  // In main.js
async function loadSubjects() {
    const classId = new URLSearchParams(location.search).get('classId');
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .eq('class_id', classId);
  
    const subjectList = document.getElementById('subject-list');
    subjectList.innerHTML = subjects.map(subject => `
      <div class="subject-item" onclick="window.location='comments.html?subjectId=${subject.id}'">
        ${subject.name}
      </div>
    `).join('');
  }
  // In main.js
async function searchSchools() {
    const searchTerm = document.getElementById('school-search').value;
    const { data: schools } = await supabase
      .from('schools')
      .select('*')
      .ilike('name', `%${searchTerm}%`);
  
    const schoolList = document.getElementById('school-list');
    schoolList.innerHTML = schools.map(school => `
      <div class="school-item" onclick="window.location='class.html?schoolId=${school.id}'">
        ${school.name}
      </div>
    `).join('');
  }
  // In main.js
async function deleteMessage(messageId) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', (await supabase.auth.getUser()).data.user.id);
  
    if (!error) loadComments();
  }
  // Load classes for selected school
async function loadClasses() {
    const urlParams = new URLSearchParams(window.location.search);
    const schoolId = urlParams.get('schoolId');
    
    // Get school name
    const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', schoolId)
        .single();

    document.getElementById('school-name').textContent = school?.name || 'Classes';

    // Get classes
    const { data: classes, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId);

    const classList = document.getElementById('class-list');
    classList.innerHTML = classes?.map(cls => `
        <div class="list-item" onclick="window.location='subject.html?classId=${cls.id}'">
            <div class="item-name">${cls.name}</div>
            <div class="item-meta">Subjects: Loading...</div>
        </div>
    `).join('') || '<p>No classes found</p>';

    // Add subject counts
    classes?.forEach(async cls => {
        const { count } = await supabase
            .from('subjects')
            .select('*', { count: 'exact' })
            .eq('class_id', cls.id);

        document.querySelector(`[onclick*='classId=${cls.id}'] .item-meta`).textContent = 
            `Subjects: ${count}`;
    });
}

// Add new class (creator only)
async function addClass() {
    if (!(await isCreator())) return alert('Only creator can add classes');
    
    const className = document.getElementById('class-name').value;
    const schoolId = new URLSearchParams(window.location.search).get('schoolId');
    
    const { error } = await supabase
        .from('classes')
        .insert([{
            name: className,
            school_id: schoolId,
            created_by: (await supabase.auth.getUser()).data.user.id
        }]);

    if (error) return alert('Error adding class: ' + error.message);
    
    loadClasses();
    document.getElementById('class-name').value = '';
}
// Auth Check for All Pages
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    const authLink = document.getElementById('auth-link');
    const profileSection = document.getElementById('profile-section');

    if (user) {
        // Fetch profile data
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, profile_picture_url')
            .eq('user_id', user.id)
            .single();

        // Update DOM
        authLink.style.display = 'none';
        profileSection.style.display = 'flex';
        document.getElementById('username').textContent = profile.username;
        document.getElementById('profile-pic').src = profile.profile_picture_url || 'default-avatar.png';
    } else {
        authLink.style.display = 'block';
        profileSection.style.display = 'none';
    }
}

// Add to all pages' onload
// Example for index.html:
// <body onload="checkAuth(); loadSchools()">
async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}