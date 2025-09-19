//import background from '../../public/websiteBackground.png';
import styles from './Body.module.css';
import Footer from './Footer'; 

function Body()
{
    return (
        <div className={styles.imageContainer}>
            <img className={styles.image} src="/websiteBackgroundd.png" alt="Aroundtheway Home Page Background" />
            <Footer/>
        </div>
    );
}
export default Body;