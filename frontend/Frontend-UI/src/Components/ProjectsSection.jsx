import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';


const ProjectsSection = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock/Example data - Remove this when you have a real backend
    const mockProjects = [
        {
            id: 1,
            title: "Fund Ocean Alkalinity Enhancement in Italy",
            description: "Limenet is an Italian climate tech startup pioneering carbon removal through a patented Ocean Alkalinity Enhancement (OAE) platform. By mimicking natural processes, Limenet permanently stores CO₂ in seawater as calcium bicarbonates.",
            image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
            pricePerTonne: 680.00,
            tonnesAvailable: 15
        },
        {
            id: 2,
            title: "Support Organic Waste Composting in the USA",
            description: "The Black Earth Organic Waste Compost project in Massachusetts, USA, is an organic waste composting initiative operational since December 1, 2021, diverting food waste from landfills to reduce 7,000 tCO2e annually.",
            image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop",
            pricePerTonne: 19.50,
            tonnesAvailable: 5800
        },
        {
            id: 3,
            title: "Drive Paraguay's Reforestation",
            description: "The Forestal Río Aquidabán project is restoring 301 hectares of degraded grasslands in Concepción, northeastern Paraguay, through a silvopastoral agroforestry system that integrates reforestation with sustainable cattle ranching.",
            image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=600&fit=crop",
            pricePerTonne: 20.23,
            tonnesAvailable: 1500
        },
        {
            id: 4,
            title: "Sequester Carbon in Argentina",
            description: "The Urunday Afforestation Project in Corrientes, Argentina, has restored 3,143 hectares of degraded grasslands into FSC-certified eucalyptus forests, set to remove over 1 million tonnes of CO2e.",
            image: "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=600&fit=crop",
            pricePerTonne: 11.05,
            tonnesAvailable: 1000
        }
    ];

    // Fetch projects from backend API
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);

                // OPTION 1: Use mock data (current - for testing)
                // Comment out these 3 lines when you have a real backend
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                setProjects(mockProjects);
                setError(null);

                // OPTION 2: Use real API (uncomment when backend is ready)
                // const response = await fetch('http://localhost:5000/api/projects');
                // if (!response.ok) {
                //     throw new Error('Failed to fetch projects');
                // }
                // const data = await response.json();
                // setProjects(data);
                // setError(null);

            } catch (err) {
                setError(err.message);
                console.error('Error fetching projects:', err);
                // Fallback to mock data on error
                setProjects(mockProjects);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <section className="py-20 px-4 md:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-xl text-gray-600">Loading projects...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-20 px-4 md:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-xl text-red-600">Error: {error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 px-4 md:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-80"
                        >
                            {/* Background Image */}
                            <img
                                src={project.image}
                                alt={project.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-black/50"></div>

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
                                {/* Title */}
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                    {project.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm md:text-base leading-relaxed mb-6 line-clamp-4">
                                    {project.description}
                                </p>

                                {/* Bottom Section */}
                                <div className="flex items-end justify-between">
                                    {/* Price and Availability */}
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-xs text-gray-300 mb-1">Price per tonne:</p>
                                            <p className="text-lg font-bold">${project.pricePerTonne}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-300 mb-1">Tonnes available:</p>
                                            <p className="text-lg font-bold">{project.tonnesAvailable.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Learn More Button */}
                                    <Link to={`/projects/${project.id}`} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg">
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Explore More Button */}
                <div className="text-center">
                    <Link to='/Marketplace' className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Explore More Projects
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProjectsSection;
