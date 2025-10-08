import SocialLogin from "./components/SocialLogin";
import InputField from "./components/InputField";

const App = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-violet-600 p-2.5">
      <div className="mx-auto max-w-md w-full p-8 rounded-lg bg-white shadow-xl">
        <h2 className="text-center text-xl font-semibold mb-7">Log in with</h2>
        <SocialLogin />

        <div className="relative my-6 text-center bg-white">
          <span className="relative z-10 bg-white text-lg font-medium text-violet-700 px-3.5">or</span>
          <div className="absolute left-0 top-1/2 h-px w-full bg-violet-300"></div>
        </div>

        <form action="#" className="space-y-6">
          <InputField type="email" placeholder="Email address" icon="mail" />
          <InputField type="password" placeholder="Password" icon="lock" />

          <a href="#" className="block w-fit -mt-2 text-violet-600 font-medium hover:underline">Forgot password?</a>
          <button type="submit" className="w-full h-14 text-white text-lg font-medium cursor-pointer mt-8 rounded-md bg-violet-600 hover:bg-violet-700 transition-colors duration-300">Log In</button>
        </form>

        <p className="text-center text-lg font-medium mt-7 mb-1">
          Don&apos;t have an account? <a href="#" className="text-violet-600 font-medium hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  )
}

export default App;
