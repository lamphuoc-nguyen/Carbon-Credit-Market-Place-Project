import { useEffect, useRef, useState } from 'react';
import windmill1 from '../img/windmill1.png';
import { Link } from 'react-router-dom';
import bgAbout from '../img/bgabout.png';

const AboutSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const currentSection = sectionRef.current;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.2, // Trigger when 20% of the section is visible
                rootMargin: '0px 0px -100px 0px' // Start animation slightly before reaching viewport
            }
        );

        if (currentSection) {
            observer.observe(currentSection);
        }

        return () => {
            if (currentSection) {
                observer.unobserve(currentSection);
            }
        };
    }, []);

    const stats = [
        { value: '10+', label: 'Years of climate impact' },
        { value: '12+', label: 'Trusted registries and auditors' },
        { value: '20+', label: 'Million tonnes CO2e retired' },
        { value: '25+', label: 'Ongoing projects worldwide' }
    ];

    return (
        <section ref={sectionRef} className="relative py-20 px-4 md:px-8 overflow-hidden">
            {/* Background Image */}
            {bgAbout && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={bgAbout}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Title Section at Top - Centered */}
                <div
                    className={`text-center mb-16 transition-all duration-1000 ease-out ${isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-10'
                        }`}
                >
                    <h2 className="text-4xl md:text-5xl  text-gray-900 mb-3">
                        <span className="text-gray-900 font-bold">About</span>{' '}
                        <span className="text-green-500 underline font-semibold decoration-green-600 decoration-4 underline-offset-8">Our Site</span>
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Passionate About Properties, Dedicated to Your Vision
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Image with Animation */}
                    <div
                        className={`relative transition-all duration-1000 ease-out delay-300 ${isVisible
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-20'
                            }`}
                    >

                        {/* Building Image */}
                        <div className="relative rounded-lg overflow-hidden shadow-2xl">
                            <img
                                src={windmill1}
                                alt="Modern Building"
                                className="w-full h-[500px] object-cover"
                            />
                        </div>
                    </div>

                    {/* Right Side - Content with Animation */}
                    <div
                        className={`transition-all duration-1000 ease-out delay-500 ${isVisible
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 translate-x-20'
                            }`}
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className={`transition-all duration-700 ease-out ${isVisible
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-10'
                                        }`}
                                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                                >
                                    <h3 className="text-4xl font-bold text-green-500 mb-1">
                                        {stat.value}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed mb-6">
                            We connect you to projects that protect forests, restore ecosystems, and bring clean energy to communities.
                            Credits are screened for integrity, priced transparently, and retired on your behalf with proof you can share.
                            Buy with confidence and track the change you fund.
                        </p>

                        {/* Learn More Button */}
                        <Link to='/About' className="bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-3 rounded-md transition-colors duration-300 shadow-lg hover:shadow-xl">
                            Learn more
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
