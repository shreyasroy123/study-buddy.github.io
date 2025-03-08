import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';

const Home: NextPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <>
        <Head>
          <title>NotesBuddy - Study Together, Succeed Together</title>
        </Head>
        <Navbar />
        {loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
              <p style={{color: "#333"}}>Loading...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Head>
        <title>NotesBuddy - Study Together, Succeed Together</title>
        <meta 
          name="description" 
          content="NotesBuddy is a collaborative learning platform for students to share notes, ask questions, and help each other succeed academically." 
        />
      </Head>
      
      <Navbar />
      
      <main style={{backgroundColor: "white", color: "#333"}}>
        {/* Hero section */}
        <div style={{backgroundColor: '#3B82F6'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                <span className="block">Study Together,</span>
                <span className="block">Succeed Together</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-white sm:text-lg md:mt-5 md:text-xl md:max-w-2xl">
                Join NotesBuddy and connect with fellow students to share study notes, 
                ask questions, and help each other succeed academically.
              </p>
              <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    href="/auth/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    style={{backgroundColor: "white", color: "#1D4ED8"}}
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/auth/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 md:py-4 md:text-lg md:px-10"
                    style={{backgroundColor: "#1E40AF", color: "white"}}
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div style={{backgroundColor: "#F9FAFB", padding: "64px 0"}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 style={{color: "#3B82F6", fontSize: "18px", fontWeight: "600"}}>Features</h2>
              <p style={{color: "#111827", fontSize: "30px", fontWeight: "800", marginTop: "8px"}}>
                Everything you need to excel in school
              </p>
              <p style={{color: "#6B7280", fontSize: "20px", marginTop: "16px", maxWidth: "672px", marginLeft: "auto", marginRight: "auto"}}>
                NotesBuddy provides all the tools you need to collaborate with classmates 
                and improve your academic performance.
              </p>
            </div>

            <div style={{marginTop: "64px"}}>
              <div style={{display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "32px"}}>
                <div style={{backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"}}>
                  <h3 style={{fontSize: "18px", fontWeight: "500", color: "#111827", marginBottom: "8px"}}>Q&A Platform</h3>
                  <p style={{color: "#6B7280"}}>
                    Ask questions about your assignments or help others by answering their questions.
                    Mark helpful answers as solutions to guide others facing similar issues.
                  </p>
                </div>

                <div style={{backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"}}>
                  <h3 style={{fontSize: "18px", fontWeight: "500", color: "#111827", marginBottom: "8px"}}>Study Notes Sharing</h3>
                  <p style={{color: "#6B7280"}}>
                    Share your class notes, study guides, and summaries with other students.
                    Upload files in various formats and organize them by subject or grade.
                  </p>
                </div>

                <div style={{backgroundColor: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"}}>
                  <h3 style={{fontSize: "18px", fontWeight: "500", color: "#111827", marginBottom: "8px"}}>Announcements</h3>
                  <p style={{color: "#6B7280"}}>
                    Stay updated with important school announcements, exam schedules, 
                    and academic events all in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div style={{backgroundColor: "#1D4ED8", padding: "64px 0"}}>
          <div style={{maxWidth: "896px", margin: "0 auto", padding: "0 16px"}}>
            <div className="text-center">
              <h2 style={{fontSize: "30px", fontWeight: "800", color: "white"}}>
                Ready to boost your academic success?
              </h2>
              <p style={{marginTop: "16px", fontSize: "18px", color: "#BFDBFE"}}>
                Join thousands of students who are already using NotesBuddy to 
                collaborate, learn together, and achieve better results.
              </p>
              <Link
                href="/auth/signup"
                style={{
                  display: "inline-flex", 
                  marginTop: "32px", 
                  padding: "12px 20px", 
                  backgroundColor: "white", 
                  color: "#1D4ED8",
                  borderRadius: "6px",
                  fontWeight: "500"
                }}
              >
                Sign up for free
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{backgroundColor: "#1F2937", color: "white", padding: "48px 0"}}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div>
              <h2 style={{fontSize: "20px", fontWeight: "700", color: "white"}}>NotesBuddy</h2>
            </div>
            <div style={{marginTop: "32px"}}>
              <p style={{color: "#9CA3AF", textAlign: "center"}}>
                &copy; 2025 NotesBuddy. All rights reserved.
              </p>
            </div>
          </div>
          <div style={{marginTop: "32px", borderTop: "1px solid #374151", paddingTop: "32px", textAlign: "center"}}>
            <div style={{display: "flex", justifyContent: "center", gap: "24px"}}>
              <a href="#" style={{color: "#9CA3AF"}}>Terms of Service</a>
              <a href="#" style={{color: "#9CA3AF"}}>Privacy Policy</a>
              <a href="#" style={{color: "#9CA3AF"}}>Contact Us</a>
            </div>
            <p style={{marginTop: "32px", color: "#9CA3AF"}}>
              Last updated: 2025-03-08 19:18:30 UTC
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;