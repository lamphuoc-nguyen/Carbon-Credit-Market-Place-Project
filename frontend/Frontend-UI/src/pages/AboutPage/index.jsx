import React from 'react'
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'

const AboutPage = () => {
  return (
      <>
      
      <div className="min-h-screen bg-gray-50">

          {/* Hero Section */}
          <section id="home" className="bg-gradient-to-r from-green-600 to-cyan-700 text-white py-20">
              <div className="container mx-auto px-4 text-center">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                      ABOUT OUR COMPANY
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                      Your Trusted Partner in Carbon Solutions and Environmental Services
                  </p>                 
              </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-16 bg-white">
              <div className="container mx-auto px-4">
                  <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                          Our History
                      </h2>
                      <div className="w-20 h-1 bg-green-600 mx-auto"></div>
                  </div>

                  <div className="max-w-4xl mx-auto">
                      <p className="text-gray-700 text-lg leading-relaxed mb-6">
                          Carbon Credit Vietnam was established with a mission to provide high-quality carbon
                          and environmental solutions for the Vietnamese market. From the early days, we have
                          continuously improved our technology and expanded our operations to meet the growing
                          demands of our customers.
                      </p>
                      <p className="text-gray-700 text-lg leading-relaxed">
                          With a team of experienced experts and modern equipment, we are proud to be a pioneer
                          in delivering premium carbon products that are environmentally friendly and sustainable.
                      </p>
                  </div>
              </div>
          </section>

          {/* Mission & Vision */}
          <section className="py-16 bg-gray-100">
              <div className="container mx-auto px-4">
                  <div className="grid md:grid-cols-2 gap-8">
                      {/* Mission */}
                      <div className="bg-white p-8 rounded-lg shadow-lg">
                          <div className="text-green-600 mb-4">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                          <p className="text-gray-700 leading-relaxed">
                              To deliver high-quality, eco-friendly carbon products that serve industrial needs
                              while protecting community health. We are committed to partnering with our clients
                              to build a greener, more sustainable future.
                          </p>
                      </div>

                      {/* Vision */}
                      <div className="bg-white p-8 rounded-lg shadow-lg">
                          <div className="text-blue-600 mb-4">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
                          <p className="text-gray-700 leading-relaxed">
                              To become the leading provider of carbon and environmental solutions in Vietnam
                              and Southeast Asia. We aim for sustainable development and creating long-term
                              value for our customers.
                          </p>
                      </div>
                  </div>
              </div>
          </section>

          {/* Core Values */}
          <section className="py-16 bg-white">
              <div className="container mx-auto px-4">
                  <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                          Core Values
                      </h2>
                      <div className="w-20 h-1 bg-green-600 mx-auto"></div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                      {[
                          {
                              title: "Premium Quality",
                              icon: "🧩",
                              description: "Committed to products meeting international standards"
                          },
                          {
                              title: "Customer-Centric",
                              icon: "𓆩💚𓆪",
                              description: "Always listening and meeting customer needs"
                          },
                          {
                              title: "Innovation",
                              icon: "🪴",
                              description: "Continuous research and technology improvement"
                          },
                          {
                              title: "Social Responsibility",
                              icon: "♻️",
                              description: "Environmental protection and sustainable development"
                          }
                      ].map((value, index) => (
                          <div key={index} className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-xl transition-shadow">
                              <div className="text-4xl mb-4">{value.icon}</div>
                              <h4 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h4>
                              <p className="text-gray-600">{value.description}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </section>

          {/* Products/Services */}
          <section id="products" className="py-16 bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="container mx-auto px-4">
                  <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                          Products & Services
                      </h2>
                      <div className="w-20 h-1 bg-green-600 mx-auto"></div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                      {[
                          {
                              title: "Activated Carbon",
                              description: "High-quality water and air filtration materials",
                              features: ["High adsorption capacity", "Various sizes available", "Competitive pricing"]
                          },
                          {
                              title: "Environmental Treatment",
                              description: "Industrial wastewater and air treatment solutions",
                              features: ["Advanced technology", "High efficiency", "Eco-friendly"]
                          },
                          {
                              title: "Consulting & Installation",
                              description: "Professional consulting and system installation services",
                              features: ["Expert team", "Long-term warranty", "24/7 support"]
                          }
                      ].map((product, index) => (
                          <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow">
                              <h3 className="text-2xl font-bold text-gray-800 mb-4">{product.title}</h3>
                              <p className="text-gray-600 mb-6">{product.description}</p>
                              <ul className="space-y-2">
                                  {product.features.map((feature, idx) => (
                                      <li key={idx} className="flex items-center text-gray-700">
                                          <span className="text-green-600 mr-2">✓</span>
                                          {feature}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      ))}
                  </div>
              </div>
          </section>

          {/* Commitment */}
          <section className="py-16 bg-green-700 text-white">
              <div className="container mx-auto px-4 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                      Our Commitment
                  </h2>
                  <p className="text-xl max-w-3xl mx-auto leading-relaxed">
                      Carbon Credit Vietnam is committed to providing high-quality products, professional
                      services, and partnering with our clients for mutual growth. We continuously strive
                      to deliver optimal solutions for the environment and society.
                  </p>
              </div>
          </section>
         
      </div>
      
      </>
  )
}

export default AboutPage