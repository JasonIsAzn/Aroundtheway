import Footer from './Footer';

function Body() {
    return (
        <div className="relative w-full">
            <img
                className="w-full h-auto block object-cover"
                src="/websiteBackgroundd.png"
                alt="Aroundtheway Home Page Background"
            />
            <Footer/>
        </div>
    );
}

export default Body;