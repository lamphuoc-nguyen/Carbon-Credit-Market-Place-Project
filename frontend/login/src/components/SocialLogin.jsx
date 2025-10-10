const SocialLogin = () => {
    return (
        <div className="flex gap-5 mb-6">
            <button className="flex gap-3 w-full text-base font-medium cursor-pointer py-3 rounded-md items-center justify-center bg-violet-50 border border-violet-300 hover:border-violet-600 hover:bg-violet-100 transition-all duration-300">
                <img src="google.svg" alt="Google" className="w-6" />
                Google
            </button>
            <button className="flex gap-3 w-full text-base font-medium cursor-pointer py-3 rounded-md items-center justify-center bg-violet-50 border border-violet-300 hover:border-violet-600 hover:bg-violet-100 transition-all duration-300">
                <img src="facebook.svg" alt="Facebook" className="w-6" />
                Facebook
            </button>
        </div>
    )
}

export default SocialLogin;