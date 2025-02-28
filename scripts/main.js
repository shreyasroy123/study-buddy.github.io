// 1. INITIALIZE SUPABASE FIRST
const supabaseUrl = 'https://wyyiifksxojppfqhpvgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eWlpZmtzeG9qcHBmcWhwdmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NTM2MzAsImV4cCI6MjA1NjIyOTYzMH0.fBljtE2zY64il7GIOoIqAmupfxXwPFjQRV42x7aZrWw';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. FUNCTION DECLARATIONS
async function checkAuth() {
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
    document.getElementById('username').textContent = profile.username;
    document.getElementById('profile-pic').src = profile.profile_picture_url || 'default-avatar.jpeg';
  } else {
    authLink.style.display = 'block';
    profileSection.style.display = 'none';
  }
}

async function signUp() {
  try {
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
      profile_picture_url: profilePicUrl
    });

    if (profileError) throw profileError;

    alert('Signup successful! Please check your email for verification.');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Signup Error:', error);
    alert(`Signup failed: ${error.message}`);
  }
}

async function login() {
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
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

async function loadSchools() {
  const { data: schools, error } = await supabase.from('schools').select('*');
  const schoolList = document.getElementById('school-list');

  schoolList.innerHTML = schools.map(school => `
    <div class="school-item" onclick="window.location='class.html?schoolId=${school.id}'">
      ${school.name}
    </div>
  `).join('');
}

async function loadClasses() {
  const schoolId = new URLSearchParams(location.search).get('schoolId');
  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', schoolId);

  const classList = document.getElementById('class-list');
  classList.innerHTML = classes.map(cls => `
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

async function loadSubjects() {
  const classId = new URLSearchParams(location.search).get('classId');
  const { data: subjects, error } = await supabase
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

// Call checkAuth() on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});