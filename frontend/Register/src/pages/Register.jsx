import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import RegisterForm from '../Components/RegisterForm';
import Footer from '../Components/Footer';

const Register = () => {

    return (
        <>
            <title>
                Register
            </title>

            <div>
                <Navbar />
            </div>

            <div>
                <RegisterForm />
            </div>

            <div>
                <Footer />
            </div>
        </>
    );
}

export default Register;