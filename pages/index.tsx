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
              <p className="text-gray-500">Loading...</p>
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
      
      <main>
        {/* Hero section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">Study Together,</span>
                <span className="block">Succeed Together</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-2xl">
                Join NotesBuddy and connect with fellow students to share study notes, 
                ask questions, and help each other succeed academically.
              </p>
              <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    href="/auth/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/auth/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-lg text-blue-600 font-semibold">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to excel in school
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                NotesBuddy provides all the tools you need to collaborate with classmates 
                and improve your academic performance.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-12 w-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Q&A Platform</h3>
                  <p className="text-base text-gray-500">
                    Ask questions about your assignments or help others by answering their questions.
                    Mark helpful answers as solutions to guide others facing similar issues.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-12 w-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Study Notes Sharing</h3>
                  <p className="text-base text-gray-500">
                    Share your class notes, study guides, and summaries with other students.
                    Upload files in various formats and organize them by subject or grade.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-12 w-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Announcements</h3>
                  <p className="text-base text-gray-500">
                    Stay updated with important school announcements, exam schedules, 
                    and academic events all in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-lg text-blue-600 font-semibold">Testimonials</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                What students are saying
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-blue-800 font-medium">A</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Alex T.</h4>
                    <p className="text-sm text-gray-500">Grade 11</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "NotesBuddy helped me improve my grades by connecting me with classmates 
                  who shared their study notes. The Q&A section is incredibly helpful when 
                  I'm stuck on homework problems."
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                    <span className="text-green-800 font-medium">S</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Sarah K.</h4>
                    <p className="text-sm text-gray-500">Grade 10</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "As a new student, it was hard to catch up with classes. 
                  NotesBuddy made it easy to access study materials shared by 
                  my peers and quickly get up to speed with the curriculum."
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                    <span className="text-purple-800 font-medium">M</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Michael W.</h4>
                    <p className="text-sm text-gray-500">Grade 12</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The platform has been a lifesaver during exam season. 
                  Being able to share study guides and answer each other's 
                  questions has made preparing for finals so much easier."
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="bg-blue-700">
          <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to boost your academic success?
              </h2>
              <p className="mt-4 text-lg leading-6 text-blue-100">
                Join thousands of students who are already using NotesBuddy to 
                collaborate, learn together, and achieve better results.
              </p>
              <Link
                href="/auth/signup"
                className="mt-8 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50"
              >
                Sign up for free
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <h2 className="text-xl font-bold text-white">NotesBuddy</h2>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-base text-gray-400">
                &copy; 2025 NotesBuddy. All rights reserved.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2 justify-center md:justify-start">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">About</span>
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Privacy Policy</span>
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Contact</span>
                Contact Us
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1 text-center md:text-left">
              Last updated: 2025-03-07 20:24:41 UTC
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;