import { useState } from "react";

const InputField = ({ type, placeholder, icon }) => {
    // State to toggle password visibility
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="h-14 w-full relative mb-6">
            <input
                type={isPasswordShown ? 'text' : type}
                placeholder={placeholder}
                className="w-full h-full outline-none text-lg rounded-md border border-violet-300 pl-12 pr-5 transition-colors duration-200 placeholder-violet-400 focus:border-violet-600"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required
            />
            <i className={`material-symbols-rounded absolute top-1/2 h-full flex items-center -translate-y-1/2 left-4 pointer-events-none transition-colors duration-200 ${isFocused ? 'text-violet-600' : 'text-violet-400'
                }`}>
                {icon}
            </i>
            {type === 'password' && (
                <i onClick={() => setIsPasswordShown(prevState => !prevState)}
                    className="material-symbols-rounded absolute top-1/2 -translate-y-1/2 right-4 text-violet-500 cursor-pointer text-xl flex items-center justify-center">
                    {isPasswordShown ? 'visibility' : 'visibility_off'}
                </i>
            )}
        </div>
    )
}

export default InputField;