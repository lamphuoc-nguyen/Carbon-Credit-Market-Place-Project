import React, { useRef, useEffect, useState } from 'react';
import { Leaf, Zap, Globe, ShieldCheck } from 'lucide-react'; // Các icon cho Core Values
import { Link } from 'react-router-dom';

// Dữ liệu giả cho Core Values (Giá trị Cốt lõi)
const coreValues = [
    {
        icon: <ShieldCheck className="w-10 h-10 text-white" />,
        title: 'Transparency & Trustworthiness',
        description: 'All transactions and project information are audited and made public, building confidence in the carbon market.',
        color: 'bg-green-500'
    },
    {
        icon: <Leaf className="w-10 h-10 text-white" />,
        title: 'Real Impact',
        description: 'Only verified projects are supported, delivering clear, measurable environmental and social benefits.',
        color: 'bg-blue-500'
    },
    {
        icon: <Zap className="w-10 h-10 text-white" />,
        title: 'Technological Innovation',
        description: 'We use advanced technology (like Blockchain/API) to simplify trading, increase efficiency, and enhance accessibility.',
        color: 'bg-blue-500'
    },
    {
        icon: <Globe className="w-10 h-10 text-white" />,
        title: 'Global Marketplace',
        description: 'Connecting buyers and sellers from around the world, driving capital towards global climate solutions.',
        color: 'bg-red-500'
    }
];

// Custom Hook để kiểm tra xem một element có nằm trong viewport không (Dùng cho hiệu ứng cuộn)
const useIsVisible = (threshold = 0.1) => { // Giảm ngưỡng để kích hoạt sớm hơn
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);


    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target); // Ngừng quan sát sau khi thấy
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    return [ref, isVisible];
};

const AboutPage = () => {
    // Sử dụng hook cho animation từng phần
    const [storyRef, storyIsVisible] = useIsVisible(0.1);
    const [valuesRef, valuesIsVisible] = useIsVisible(0.2); // Ngưỡng cao hơn để bắt animation chính xác hơn
    const [ctaRef, ctaIsVisible] = useIsVisible(0.1);
    const [activeIndex, setActiveIndex] = useState(null); // null: không có thẻ nào được chọn

    const handleCardClick = (index) => {
        // Nếu click vào thẻ đang active, thì tắt (set lại null), ngược lại thì set index mới.
        setActiveIndex(index === activeIndex ? null : index);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* 1. Hero Section - Sứ Mệnh (Không Animation cuộn, luôn hiện) */}
            <header className="bg-green-50 py-24 md:py-36">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-semibold uppercase text-green-600 mb-3 tracking-widest">
                        Who we are
                    </p>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-snug">
                        Democratizing Climate Finance.
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                        We are building the digital infrastructure to connect critical climate projects with global capital, bringing transparency and real impact to the carbon credit market.
                    </p>
                </div>
            </header>

            {/* --- */}

            {/* 2. Our Story / Vision (Animation: Dịch chuyển từ hai bên vào) */}
            <section ref={storyRef} className="py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    {/* Content (Nội dung - Dịch chuyển từ trái sang) */}
                    <div
                        className={`transition-all duration-1000 ease-out ${storyIsVisible
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-10' // Thay đổi: Dịch chuyển ngang (từ trái)
                            }`}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Our Story
                        </h2>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            The traditional carbon market is complex, lacks transparency, and often fails to reach small yet high-impact projects. We founded Carbon Credit Market Place with the mission to break down these barriers.
                        </p>
                        <p className="text-gray-700 mb-6 leading-relaxed border-l-4 border-green-500 pl-4 italic">
                            Carbon Credit MarketPlace To become the world's most trusted platform, driving billions of dollars in investment toward high-quality climate solutions, thus creating a carbon-neutral planet.
                        </p>
                        <Link to="/home" className="inline-block bg-gray-900 text-white font-medium px-8 py-3 rounded-full hover:bg-green-600 transition-colors duration-300">
                            Explore Our Projects
                        </Link>
                    </div>

                    {/* Image Placeholder (Hình ảnh Minh họa - Dịch chuyển từ phải sang, có độ trễ) */}
                    <div
                        className={`rounded-xl overflow-hidden shadow-2xl transition-all duration-1000 ease-out delay-300 ${storyIsVisible
                            ? 'opacity-100 translate-x-0 scale-100'
                            : 'opacity-0 translate-x-10 scale-95' // Thay đổi: Dịch chuyển ngang (từ phải) và zoom nhẹ
                            }`}
                    >
                        <img
                            src="https://worldenergycoe.com/wp-content/uploads/2023/10/199_1676390451.png"
                            alt="Hình ảnh mang tính biểu tượng"
                            className="w-full h-80 object-cover"
                        />

                    </div>
                </div>
            </section>

            {/* --- */}

            {/* 3. Core Values - Giá Trị Cốt Lõi (Animation: Staggered Fade-Up) */}
            <section ref={valuesRef} className="py-20 md:py-28 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    {/* Tiêu đề chính */}
                    <h2
                        className={`text-4xl md:text-5xl font-bold text-gray-900 mb-16 transition-all duration-700 ease-out ${valuesIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                            }`}
                    >
                        Values That Make the Difference
                    </h2>

                    {/* Grid Cards (Animation từng thẻ với độ trễ) */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreValues.map((value, index) => {
                            const isActive = index === activeIndex;

                            // Định nghĩa các class màu dựa trên trạng thái active
                            const cardBgClass = isActive ? 'bg-green-100' : 'bg-white';     //color từng the
                            const cardBorderClass = isActive ? 'border-green-700' : value.color;

                            return (
                                <div
                                    key={index}
                                    // Bổ sung sự kiện onClick để thay đổi trạng thái
                                    onClick={() => handleCardClick(index)}
                                    // Sử dụng các biến class động
                                    className={`p-8 rounded-2xl shadow-xl border-t-4 
                                            transition-all duration-300 ease-out 
                                            cursor-pointer hover:shadow-2xl hover:scale-[1.03] transition-transform
                                            ${cardBgClass} ${cardBorderClass}`}
                                    style={{
                                        transitionDelay: `${index * 150}ms`,
                                        transform: valuesIsVisible ? 'translateY(0)' : 'translateY(30px)',
                                        opacity: valuesIsVisible ? 1 : 0,
                                    }}
                                >
                                    {/* Cần đảm bảo icon vẫn dùng màu gốc của value.color */}
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${value.color}`}>
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                    <p className="text-gray-600 text-sm">{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- */}

            {/* 4. Contact/Join CTA (Animation: Slide-up và Fade-in) */}
            <section ref={ctaRef} className="py-20 md:py-28 px-6">
                {/* Toàn bộ khối CTA sẽ xuất hiện */}
                <div
                    className={`max-w-7xl mx-auto bg-green-500 rounded-2xl p-10 md:p-20 text-center shadow-2xl transition-all duration-1000 ease-out ${ctaIsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                        }`}
                >
                    <h2
                        className={`text-3xl md:text-5xl font-bold text-white mb-6 transition-all duration-700 ease-out ${ctaIsVisible ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        Ready to Collaborate?
                    </h2>
                    <p
                        className={`text-lg text-white/90 mb-10 max-w-3xl mx-auto transition-all duration-700 ease-out delay-200 ${ctaIsVisible ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        Whether you are a company seeking carbon neutrality or a project developer needing funding, we are ready to connect.
                    </p>
                    <div className="flex justify-center gap-6">
                        {/* Các nút (button) dịch chuyển từ dưới lên với độ trễ khác nhau */}
                        <Link
                            to="/Contact"
                            className={`bg-white text-green-500 font-bold text-lg px-10 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md transform hover:scale-105 transition-all duration-700 ease-out delay-400 ${ctaIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                        >
                            Contact Us Now
                        </Link>
                        <Link
                            to="/Register"
                            className={`bg-transparent border-2 border-white text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:text-green-500 transition-all duration-300 shadow-md transform hover:scale-105 transition-all duration-700 ease-out delay-500 ${ctaIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;