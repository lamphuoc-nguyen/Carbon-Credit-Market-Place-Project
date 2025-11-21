import CallToAction from "../../Components/CallToAction";
import Footer from "../../Components/Footer";
import MainContent from "../../Components/MainContent";
import Navbar from "../../Components/Navbar";
import ProjectsSection from "../../Components/ProjectsSection";
import AboutSection from "../../Components/AboutSection";
import SubContent from "../../Components/SubContent";
import React from "react";

const HomePage = () => {
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
            
        </>
    )

};

export default HomePage;