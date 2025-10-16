import React from 'react';
import { DollarSign, Store, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubContent = () => {
    const cards = [
        {
            icon: <DollarSign className="w-12 h-12 text-green-500" />,
            title: 'For Buyers',
            description: 'Discover and retire a global selection of verified carbon credits with full price transparency and instant settlement—via our open marketplace or API.',
            buttonText: 'Retire Carbon',
            buttonLink: '/login'
        },
        {
            icon: <Store className="w-12 h-12 text-green-500" />,
            title: 'For Sellers',
            description: 'List your carbon credits from supported registries on our marketplace for free and tap into the growing demand from climate-conscious buyers.',
            buttonText: 'Become a Supplier',
            buttonLink: '/login'
        },
        {
            icon: <Code className="w-12 h-12 text-green-500" />,
            title: 'For Software Developers',
            description: 'Enhance the value of your product by integrating automated carbon offsetting into your corporate sustainability software or consumer-facing app using our API.',
            buttonText: 'Build with Purpose',
            buttonLink: '/login'
        }
    ];

    return (
        <section className="py-40 px-4 md:px-8 bg-gray-50 ">
            <div className="max-w-7xl mx-auto">
                {/* Section Title */}
                <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
                    Scale Up Your Positive Impact
                </h2>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                            {/* Icon and Title */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-shrink-0">
                                    {card.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-green-500">
                                    {card.title}
                                </h3>
                            </div>

                            {/* Description */}
                            <p className="text-gray-700 leading-relaxed mb-8 min-h-[120px]">
                                {card.description}
                            </p>

                            {/* Button */}
                            <Link to={card.buttonLink} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-full transition-colors duration-300 shadow-md hover:shadow-lg">
                                {card.buttonText}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SubContent;