import React from 'react';
import CallToAction from "../../Components/CallToAction";
import Footer from "../../Components/Footer";
import MainContent from "../../Components/MainContent";
import Navbar from "../../Components/Navbar";
import ProjectsSection from "../../Components/ProjectsSection";
import AboutSection from "../../Components/AboutSection";
import SubContent from "../../Components/SubContent";
import CreateTestNotification from "../../Components/CreateTestNotification";
import { getValidToken } from "../../utils/tokenUtils";

const HomePage = () => {
    // Debug authentication status
    React.useEffect(() => {
        const token = getValidToken();
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        console.log('HomePage - Auth Debug:', {
            hasToken: !!token,
            hasUser: !!user,
            tokenSnippet: token ? token.substring(0, 20) + '...' : 'none'
        });
    }, []);

    return (
        <>
            <div>
                <MainContent />
            </div>

            <div>
                <AboutSection />
            </div>
            <div>
                <SubContent />
            </div>
            <div className="text-5xl bg-green-500 text-white pl-10 font-bold py-10">

                Choose From Diverse Carbon Projects
            </div>
            <div>
                <ProjectsSection />
            </div>
            <div>
                <CallToAction />
            </div>

            {/* Add test component for debugging notifications */}
            <CreateTestNotification />
        </>
    )

};

export default HomePage;