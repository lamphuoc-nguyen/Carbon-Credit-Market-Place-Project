import React from 'react'
import { FaGoogle, FaFacebook } from 'react-icons/fa';



const LoginPage = () => {

    const handleGoogleLogin = () => {
        // Implement Google OAuth logic here
        console.log('Google login clicked');
    };

    const handleFacebookLogin = () => {
        // Implement Facebook OAuth logic here
        console.log('Facebook login clicked');
    };

    return (

        <div>
            <div className='bg-white border border-black rounded-md p-8 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30 relative'>
                <h1 className='text-4xl font-bold text-center mb-6 text-black'>Login</h1>
                <form>

                    <div className='relative my-4'>
                        <input
                            type="text"
                            id="username"
                            className='block w-72 py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:text-black focus:border-green-600 peer'
                            placeholder=' '
                        />
                        <label
                            htmlFor='username'
                            className='absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                        >
                            Username
                        </label>
                    </div>
                    <div className='relative my-4'>
                        <input
                            type="password"
                            id="password"
                            className='block w-72 py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:text-black focus:border-green-600 peer'
                            placeholder=' '
                        />
                        <label
                            htmlFor='password'
                            className='absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                        >
                            Password
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="text-center w-full mb-4 text-[18px] mt-6 rounded bg-green-500 py-2 hover:bg-green-600 transition-colors duration-300"
                    >
                        Log In
                    </button>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-black"></div>
                        <span className="px-4 text-black text-sm">or continue with</span>
                        <div className="flex-1 border-t border-black"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="flex gap-4 mb-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-200 text-gray-800 py-2.5 rounded hover:bg-gray-100 transition-colors duration-300"
                        >
                            <FaGoogle className="text-xl" />
                            <span className="font-medium">Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleFacebookLogin}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] text-white py-2.5 rounded hover:bg-[#166FE5] transition-colors duration-300"
                        >
                            <FaFacebook className="text-xl" />
                            <span className="font-medium">Facebook</span>
                        </button>
                    </div>

                    <span className="text-center text-[14px] block text-black">
                        Don't have an account? <button type="button" className="font-semibold text-blue-500 hover:text-blue-400 ">Sign Up</button>
                    </span>
                </form>
            </div>
        </div>

    )
}

export default LoginPage